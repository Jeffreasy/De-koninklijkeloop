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

    const tenantID = import.meta.env.PUBLIC_TENANT_ID || 'b2727666-7230-4689-b58b-ceab8c2898d5';

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('X-Tenant-ID', tenantID);
    headers.set('X-Requested-With', 'XMLHttpRequest');
    headers.set('Content-Type', 'application/json');

    const apiUrl = import.meta.env.PUBLIC_API_URL || API_URL_DEFAULT;
    headers.set('Host', new URL(apiUrl).host);

    return { token, tenantID, headers };
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
