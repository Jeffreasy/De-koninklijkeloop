/**
 * Auth Helpers — Shared authentication utilities for Convex actions.
 * Centralizes token verification and tenant configuration.
 */

// ─── Constants ────────────────────────────────────────────────
export const TENANT_ID = process.env.TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";
export const AUTH_API_URL = process.env.LAVENTECARE_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";

// ─── Types ────────────────────────────────────────────────────
export interface AuthUser {
    email: string;
    id: string;
    role: string;
    name?: string;
}

// ─── Core Auth ────────────────────────────────────────────────

/**
 * Verify an auth token against the LaventeCare auth backend.
 * Returns the authenticated user or throws.
 *
 * @param token     Access token (Bearer or cookie-based)
 * @param options   Optional config: requiredRoles to enforce RBAC, tenantId override
 */
export async function verifyAuth(
    token: string,
    options?: {
        requiredRoles?: string[];
        tenantId?: string;
        useBearerAuth?: boolean;
    }
): Promise<AuthUser> {
    const tenantId = options?.tenantId || TENANT_ID;
    const useBearerAuth = options?.useBearerAuth ?? false;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Tenant-ID": tenantId,
    };

    if (useBearerAuth) {
        headers["Authorization"] = `Bearer ${token}`;
    } else {
        headers["Cookie"] = `access_token=${token}`;
    }

    const res = await fetch(`${AUTH_API_URL}/auth/me`, {
        method: "GET",
        headers,
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Auth] Verification failed: ${res.status} - ${errorText}`);
        throw new Error(`Unauthorized: Invalid Token (${res.status})`);
    }

    const data = await res.json();

    // Normalize response shape (Go backend returns PascalCase or flat)
    const raw = data.User || data.user || data.data || data;
    const email = raw.Email || raw.email;
    const id = raw.ID || raw.id;
    const role = (raw.Role || raw.role || "").toLowerCase();
    const name = raw.Name || raw.name || raw.FullName || raw.full_name;

    if (!email) {
        throw new Error("Auth response missing email");
    }

    // RBAC check
    if (options?.requiredRoles && !options.requiredRoles.includes(role)) {
        console.warn(`[Auth] Forbidden. Role "${role}" not in [${options.requiredRoles.join(", ")}]`);
        throw new Error("Forbidden: Insufficient Permissions");
    }

    return { email, id, role, name };
}
