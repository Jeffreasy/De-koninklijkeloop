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

            // DOCS: Tokens are in Set-Cookie headers, NOT in body.
            // We must forward these cookies to the client, but adjust them for localhost.

            const responseHeaders = new Headers();
            responseHeaders.set('Content-Type', 'application/json');

            const setCookieHeader = response.headers.get("set-cookie");
            if (setCookieHeader) {


                // Parse and adjust the cookie
                // Backend sends: access_token=...; HttpOnly; Secure; SameSite=Strict
                // We need: access_token=...; HttpOnly; SameSite=Lax; (Secure=false in dev)

                // Note: fetch() might merge multiple Set-Cookie headers into one comma-separated string
                // or we might need to use getSetCookie() if available in this Node environment.

                let cookiesToSet: string[] = [];
                if (typeof response.headers.getSetCookie === 'function') {
                    cookiesToSet = response.headers.getSetCookie();
                } else {
                    // Fallback for older Node/Fetch environments
                    cookiesToSet = [setCookieHeader];
                }

                cookiesToSet.forEach(cookie => {
                    let adjustedCookie = cookie;

                    // 1. Force SameSite=Lax (Override None/Strict/Lax)
                    // SameSite=None REQUIRES Secure, so we must change it if we strip Secure.
                    adjustedCookie = adjustedCookie.replace(/SameSite=[a-zA-Z]+/gi, 'SameSite=Lax');

                    // 2. Remove 'Partitioned' (often used with SameSite=None)
                    adjustedCookie = adjustedCookie.replace(/; Partitioned/gi, '');

                    // 3. Handle Secure flag
                    if (!import.meta.env.PROD) {
                        // In DEV: Strip 'Secure'
                        adjustedCookie = adjustedCookie.replace(/; Secure/gi, '');
                    }

                    // 3. Rename cookie if needed? NO.
                    // Backend expects 'access_token'. Middleware now supports it too.
                    // if (adjustedCookie.includes("access_token=")) {
                    //      adjustedCookie = adjustedCookie.replace("access_token=", "dkl_auth_token=");
                    // }


                    responseHeaders.append('Set-Cookie', adjustedCookie);
                });
            } else {
                console.warn("⚠️ No Set-Cookie header found in backend response!");
            }

            // Return sanitized user data (NO TOKEN LEAK)
            // If backend returns { access_token: "...", user: {...} }
            const { access_token, token: _, ...restData } = data;

            // SECURITY: Strip sensitive fields that might be leaked by backend
            if (restData.user || restData.User) {
                const u = restData.user || restData.User;
                delete u.PasswordHash;
                delete u.MfaSecret;
            } else {
                delete restData.PasswordHash;
                delete restData.MfaSecret;
            }

            return new Response(JSON.stringify(restData), {
                status: 200,
                headers: responseHeaders
            });

        } catch (error) {
            console.error("Login Proxy Error:", error);
            return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
        }
    }

    // INTERCEPT TOKEN RETRIEVAL (For Client-Side Islands)
    if (path === 'token' && request.method === 'GET') {
        const token = cookies.get("access_token")?.value || cookies.get("dkl_auth_token")?.value;
        if (token) {
            return new Response(JSON.stringify({ token }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return new Response(JSON.stringify({ error: "No session" }), { status: 401 });
    }

    // INTERCEPT LOGOUT
    if (path === 'logout') {
        cookies.delete('dkl_auth_token', { path: '/' });
        cookies.delete('access_token', { path: '/' });
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // FALLBACK: Generic Proxy for other auth routes (e.g. register, forgot-password, token checks)
    // We pass through but ensure we don't leak anything unexpected
    try {
        const token = cookies.get("dkl_auth_token")?.value;
        const headers = new Headers(request.headers);

        // FIX: Inject Bearer token for /auth/token checks
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        // FIX: Inject Tenant ID for all auth routes (Critical for password reset/register)
        const tenantID = import.meta.env.PUBLIC_TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";
        headers.set("X-Tenant-ID", tenantID);

        // We cannot read body if we want to stream it, but for auth endpoints usually JSON.
        // If we consumed body above (we didn't for this branch), we are fine.
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
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
