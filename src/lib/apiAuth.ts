/**
 * API Auth Helper — Verifies admin/editor from cookies for API routes.
 * The Astro middleware skips /api/ paths, so API endpoints must verify auth themselves.
 */

interface ApiAuthUser {
    email: string;
    role: string;
    id?: string;
    name?: string;
}

/**
 * Verify admin/editor identity from request cookies.
 * Returns the user object or null if unauthorized.
 */
export async function verifyApiAdmin(request: Request): Promise<ApiAuthUser | null> {
    // Extract token from cookie header (same cookies the middleware uses)
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/(?:dkl_auth_token|access_token)=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) return null;

    try {
        const API_URL = import.meta.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
        const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";

        const res = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `access_token=${token}`,
                "X-Tenant-ID": TENANT_ID,
            },
        });

        if (!res.ok) return null;

        let user = await res.json();
        if (user.data) user = user.data;
        if (user.user) user = user.user;

        const role = (user.Role || user.role || "").toLowerCase();
        if (role !== "admin" && role !== "editor") return null;

        return {
            email: user.Email || user.email,
            role,
            id: user.ID || user.id,
            name: user.Name || user.name,
        };
    } catch {
        return null;
    }
}
