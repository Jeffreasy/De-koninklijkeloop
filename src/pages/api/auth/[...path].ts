import type { APIRoute } from 'astro';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";

export const ALL: APIRoute = async ({ request, params, cookies }) => {
    const path = params.path;
    const targetUrl = `${API_URL}/auth/${path}`;

    // INTERCEPT LOGIN
    if (path === 'login' && request.method === 'POST') {
        try {
            const body = await request.json();

            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': import.meta.env.PUBLIC_TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5"
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                return new Response(await response.text(), { status: response.status });
            }

            const data = await response.json();
            const token = data.access_token || data.token;

            if (token) {
                // HARDENING: Set HttpOnly Cookie
                cookies.set('dkl_auth_token', token, {
                    path: '/',
                    httpOnly: true,
                    secure: import.meta.env.PROD || import.meta.env.VERCEL_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24 * 7 // 1 week
                });
            }

            // Return sanitized user data (NO TOKEN LEAK)
            // If backend returns { access_token: "...", user: {...} }
            const { access_token, token: _, ...safeData } = data;

            return new Response(JSON.stringify(safeData), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (error) {
            console.error("Login Proxy Error:", error);
            return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
        }
    }

    // INTERCEPT LOGOUT
    if (path === 'logout') {
        cookies.delete('dkl_auth_token', { path: '/' });
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // FALLBACK: Generic Proxy for other auth routes (e.g. register, forgot-password)
    // We pass through but ensure we don't leak anything unexpected
    try {
        // We cannot read body if we want to stream it, but for auth endpoints usually JSON.
        // If we consumed body above (we didn't for this branch), we are fine.
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: request.headers,
            body: request.clone().body as any,
            duplex: 'half'
        } as any);

        const newHeaders = new Headers(response.headers);
        newHeaders.delete('content-encoding');
        newHeaders.delete('content-length');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Proxy Failed" }), { status: 500 });
    }
};
