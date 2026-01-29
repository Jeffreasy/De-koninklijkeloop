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

    const targetUrl = `${API_URL}/${path}`;
    const token = cookies.get("dkl_auth_token")?.value;

    const headers = new Headers(request.headers);
    headers.set("Host", new URL(API_URL).host); // Good practice for some proxies

    // ATTACH TOKEN FROM COOKIE
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    // Strip Origin/Referer if needed, or keep for CORS checks on backend
    // Usually backend expects them. 

    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: request.body as any,
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
