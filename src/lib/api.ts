import { $accessToken } from "./auth";

// Use local proxy to avoid CORS
const API_URL = "/api";
// Multi-tenant configuration
const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");
    headers.set("X-Tenant-ID", TENANT_ID);

    // Initial Request
    let res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Ensure cookies are sent/received
    });

    // 401 Interceptor: Token likely expired
    // EXCEPTION: Don't refresh if we're trying to login (401 means wrong password)
    if (res.status === 401 && !endpoint.includes("/auth/login")) {
        if (import.meta.env.DEV) console.warn("[API] 401 Unauthorized - Attempting Refresh...");

        try {
            // Attempt Silent Refresh
            const refreshRes = await fetch("/api/auth/refresh", {
                method: "POST",
                headers: { "X-Tenant-ID": TENANT_ID },
                credentials: "include"
            });

            if (refreshRes.ok) {
                if (import.meta.env.DEV) console.log("[API] Refresh Successful. Retrying original request.");
                // Retry Original Request
                res = await fetch(`${API_URL}${endpoint}`, {
                    ...options,
                    headers,
                    credentials: "include",
                });
            } else {
                if (import.meta.env.DEV) console.error("[API] Refresh Failed. Redirecting to login.");
                throw new ApiError("Session expired", 401);
            }
        } catch (e) {
            // Force Logout on Refresh Failure
            if (!(e instanceof ApiError)) {
                window.location.href = "/login?expired=true";
            }
            throw e;
        }
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Er is een onbekende fout opgetreden." }));
        throw new ApiError(errorData.error || `Request failed with status ${res.status}`, res.status);
    }

    // Handle empty JSON bodies gracefully
    const text = await res.text();
    return text ? JSON.parse(text) : {};
}
