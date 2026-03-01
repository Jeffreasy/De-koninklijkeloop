// Shared BFF proxy utilities for email API routes
// Eliminates duplication between [...path].ts and email-stats.ts

/** Minimal cookie interface matching Astro's AstroCookies.get() */
interface CookieStore {
    get(name: string): { value: string } | undefined;
}

const API_URL_DEFAULT = 'https://laventecareauthsystems.onrender.com/api/v1';

interface AuthResult {
    token: string;
    tenantID: string;
    headers: Headers;
}

/**
 * Extract auth credentials from cookies and build proxy headers.
 * Returns null if no valid auth token is found.
 */
export function getAuthContext(cookies: CookieStore): AuthResult | null {
    const token = cookies.get('access_token')?.value || cookies.get('dkl_auth_token')?.value;
    if (!token) return null;

    const tenantID = import.meta.env.PUBLIC_TENANT_ID;
    if (!tenantID && import.meta.env.DEV) {
        console.warn('[Email Proxy] PUBLIC_TENANT_ID not set — using hardcoded fallback UUID');
    }
    const effectiveTenantID = tenantID || 'b2727666-7230-4689-b58b-ceab8c2898d5';

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('X-Tenant-ID', effectiveTenantID);
    headers.set('X-Requested-With', 'XMLHttpRequest');
    headers.set('Content-Type', 'application/json');

    const apiUrl = import.meta.env.PUBLIC_API_URL || API_URL_DEFAULT;
    headers.set('Host', new URL(apiUrl).host);

    return { token, tenantID: effectiveTenantID, headers };
}

/**
 * Decode the role claim from a JWT without verifying the signature.
 * Verification is handled by the Go backend on every proxied request.
 * Returns null if the token is malformed or the claim is absent.
 */
export function getRoleFromToken(token: string): string | null {
    try {
        const payloadB64 = token.split('.')[1];
        if (!payloadB64) return null;
        // atob is available in Node 16+ (via global) and all modern runtimes
        const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(json) as Record<string, unknown>;
        const role = payload['role'] ?? payload['roles'];
        if (typeof role === 'string') return role.toLowerCase();
        if (Array.isArray(role) && typeof role[0] === 'string') return (role[0] as string).toLowerCase();
        return null;
    } catch {
        return null;
    }
}

/** Get the base API URL from environment or fallback */
export function getApiUrl(): string {
    return import.meta.env.PUBLIC_API_URL || API_URL_DEFAULT;
}

/** Standard 401 response for unauthenticated requests */
export function unauthorizedResponse(): Response {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
    });
}

/** Standard 503 response for backend failures */
export function backendUnavailableResponse(): Response {
    return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Forward a response from the backend, handling 204/205 edge cases
 * and DEV-only error logging.
 */
export function forwardResponse(response: Response, data: string, label: string, backendUrl?: string): Response {
    if (!response.ok && import.meta.env.DEV) {
        console.error(`[${label}] Backend error ${response.status}:`, {
            url: backendUrl,
            status: response.status,
            response: data.substring(0, 500),
        });
    }

    if (response.status === 204 || response.status === 205) {
        return new Response(null, { status: response.status });
    }

    return new Response(data, {
        status: response.status,
        headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
    });
}
