import { $accessToken } from "./auth";

// Use local proxy to avoid CORS
const API_URL = "/api";
// Multi-tenant configuration
const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";

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
    if (res.status === 401) {
        console.warn("[API] 401 Unauthorized - Attempting Refresh...");

        try {
            // Attempt Silent Refresh
            const refreshRes = await fetch("/api/auth/refresh", {
                method: "POST",
                headers: { "X-Tenant-ID": TENANT_ID },
                credentials: "include"
            });

            if (refreshRes.ok) {
                console.log("[API] Refresh Successful. Retrying original request.");
                // Retry Original Request
                res = await fetch(`${API_URL}${endpoint}`, {
                    ...options,
                    headers,
                    credentials: "include",
                });
            } else {
                console.error("[API] Refresh Failed. Redirecting to login.");
                throw new Error("Session expired");
            }
        } catch (e) {
            // Force Logout on Refresh Failure
            window.location.href = "/login?expired=true";
            throw e;
        }
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Er is een onbekende fout opgetreden." }));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }

    // Handle empty JSON bodies gracefully
    const text = await res.text();
    return text ? JSON.parse(text) : {};
}
