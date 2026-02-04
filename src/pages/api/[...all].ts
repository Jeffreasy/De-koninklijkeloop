import type { APIRoute } from 'astro';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";

// PROXY: Forward requests to Backend, attaching the HttpOnly Token
export const ALL: APIRoute = async ({ request, params, cookies, locals }) => {
    // Determine the actual path after /api/
    // This file should remain in src/pages/api/[...all].ts
    const path = params.all;

    if (!path) {
        return new Response("API Root", { status: 404 });
    }

    // CRITICAL: Exclude /email/* routes - they have their own proxy
    if (path.startsWith('email/')) {
        return new Response("Use specific email proxy", { status: 404 });
    }

    // API_URL already contains /api/v1
    const targetUrl = `${API_URL}/${path}`;

    try {
        // Inject Authorization header from cookie if valid
        // Check both 'access_token' (Backend standard) and 'dkl_auth_token' (Old middleware standard)
        const token = cookies.get("access_token")?.value || cookies.get("dkl_auth_token")?.value;
        const headers = new Headers(request.headers);

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

        // Debug Proxy Request
        console.log(`[Proxy] Forwarding ${request.method} to ${targetUrl}`);
        console.log(`[Proxy] X-Tenant-ID: ${headers.get("X-Tenant-ID")}`);

        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: request.method !== 'GET' ? request.clone().body as any : undefined,
            duplex: 'half' // Required for Node, harmless on Vercel
        } as any);

        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('content-length');

        // Security: Remove any potential Set-Cookie from backend passing through
        responseHeaders.delete('set-cookie');

        return new Response(response.body, {
            status: response.status,
            headers: responseHeaders
        });
    } catch (e) {
        console.error("API Proxy Error:", e);
        return new Response(JSON.stringify({ error: "Backend Protocol Violation" }), { status: 502 });
    }
};
