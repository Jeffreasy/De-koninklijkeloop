import { $accessToken } from "./auth";

// Use local proxy to avoid CORS
const API_URL = "/api";
const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID || "c3888c7e-44cf-4827-9a7d-adaae2a1a095";

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
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Er is een onbekende fout opgetreden." }));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }

    return res.json();
}
