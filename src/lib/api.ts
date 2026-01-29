import { $accessToken } from "./auth";

// Use local proxy to avoid CORS
const API_URL = "/api";
const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = $accessToken.get();

    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");
    headers.set("X-Tenant-ID", TENANT_ID);

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Ensure cookies are sent/received
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Er is een onbekende fout opgetreden." }));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }

    return res.json();
}
