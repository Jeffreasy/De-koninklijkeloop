import type { APIRoute } from 'astro';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";

// PROXY: Forward requests to Backend, attaching the HttpOnly Token
// NOTE: AI generation (/admin/social/posts/generate) has its own dedicated
// endpoint at src/pages/api/admin/social/posts/generate.ts which takes
// priority over this catch-all. See that file for AI Gateway routing.
export const ALL: APIRoute = async ({ request, params, cookies, locals }) => {
    // Determine the actual path after /api/
    // This file should remain in src/pages/api/[...all].ts
    const path = params.all;

    if (!path) {
        return new Response("API Root", { status: 404 });
    }

    // Email routes have their own dedicated proxy at /api/email/[...path].ts
    if (path.startsWith('email/')) {
        return new Response("Use /api/email proxy", { status: 404 });
    }

    // Analytics ingestion — bypass proxy, forward directly to Go backend.
    // The Go backend accepts tenant_id in the body (Path B) for CORS-safe public ingestion.
    // Proxying would add X-Tenant-ID header, routing to Path A which requires RLS session
    // setup — silently dropping INSERT for anonymous visitors.
    if (path === 'v1/analytics' && request.method === 'POST') {
        const API_BASE = import.meta.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
        const body = await request.text();

        // Forward Vercel geo headers for server-side GeoIP resolution
        const geoHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        const country = request.headers.get('x-vercel-ip-country');
        if (country) geoHeaders['X-Geo-Country'] = country;

        const res = await fetch(`${API_BASE}/analytics`, {
            method: 'POST',
            headers: geoHeaders,
            body,
        });
        return new Response(res.body, {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Clean up path to avoid double /v1/v1
    let cleanPath = path;
    if (API_URL.endsWith('/v1') && cleanPath.startsWith('v1/')) {
        cleanPath = cleanPath.substring(3); // Remove 'v1/'
    } else if (API_URL.endsWith('/api') && cleanPath.startsWith('api/')) {
        cleanPath = cleanPath.substring(4);
    }

    // Ensure no double slashes
    if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }

    // Preserve query parameters (e.g. ?from=&to= for analytics date ranges)
    const queryString = new URL(request.url).search; // includes leading '?'
    const targetUrl = `${API_URL}/${cleanPath}${queryString}`;

    try {
        // Inject Authorization header from cookie if valid
        // Check both 'access_token' (Backend standard) and 'dkl_auth_token' (Old middleware standard)
        const token = cookies.get("access_token")?.value || cookies.get("dkl_auth_token")?.value;
        const headers = new Headers(request.headers);

        // CRITICAL: Remove browser-specific headers that cause CSRF issues on the Go backend.
        // The Go CSRF middleware uses Double-Submit Cookie Pattern. Forwarded browser cookies
        // from a different domain cause a mismatch. Bearer token auth bypasses CSRF,
        // but only if we don't also forward conflicting Cookie/Origin headers.
        headers.delete("Cookie");
        headers.delete("Origin");

        // Good practice for some proxies
        headers.set("Host", new URL(API_URL).host);

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        // CRITICAL: Add Tenant ID for RLS enforcement
        const tenantID = import.meta.env.PUBLIC_TENANT_ID || 'b2727666-7230-4689-b58b-ceab8c2898d5';
        if (tenantID) {
            headers.set("X-Tenant-ID", tenantID);
        }

        // Debug Proxy Request (safe — no body/PII logged)
        if (import.meta.env.DEV) {
            console.log(`[Proxy] Forwarding ${request.method} to ${targetUrl}`);
        }

        let body: string | undefined = undefined;
        if (request.method !== 'GET') {
            const rawBody = await request.clone().text();
            body = rawBody;
        }

        // 55s timeout for backend API calls (AI generation uses dedicated generate.ts endpoint)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 55_000);

        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: body,
            signal: controller.signal,
        } as RequestInit);

        clearTimeout(timeoutId);

        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('content-length');
        responseHeaders.delete('set-cookie');

        // Stream the response body to avoid buffering large responses.
        return new Response(response.body, {
            status: response.status,
            headers: responseHeaders
        });
    } catch (e) {
        if (import.meta.env.DEV) console.error("API Proxy Error:", e);
        const isTimeout = e instanceof DOMException && e.name === 'AbortError';
        return new Response(JSON.stringify({ error: isTimeout ? "Backend timeout — probeer opnieuw" : "Backend Protocol Violation" }), {
            status: isTimeout ? 504 : 502
        });
    }
};

