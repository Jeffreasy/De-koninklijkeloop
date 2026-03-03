import type { APIRoute } from 'astro';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";

/**
 * Dedicated POST /api/auth/logout handler.
 * Takes precedence over [...path].ts catch-all.
 * Always returns 200 — even if Go backend invalidation fails (non-blocking).
 */
export const POST: APIRoute = async ({ cookies }) => {
    const token = cookies.get("access_token")?.value || cookies.get("dkl_auth_token")?.value;

    // Fire-and-forget: notify Go backend to revoke token
    // We do NOT let its response affect our 200 — a 403 from Go (expired token)
    // must never prevent the frontend cookie from being cleared.
    if (token) {
        fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': import.meta.env.PUBLIC_TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5"
            }
        }).catch(() => { /* non-blocking */ });
    }

    // Always clear cookies — this is the critical part
    cookies.delete('dkl_auth_token', { path: '/' });
    cookies.delete('access_token', { path: '/' });

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

// Allow OPTIONS for CORS preflight
export const OPTIONS: APIRoute = () => new Response(null, { status: 204 });
