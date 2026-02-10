// BFF Proxy for Email API
// Tunnels email requests to LaventeCare Auth backend with cookie injection
// Pattern consistent with existing /api/auth/[...path].ts proxy
import type { APIRoute } from 'astro';

export const prerender = false;

export const ALL: APIRoute = async ({ params, request, cookies, locals }) => {
    const { path } = params;
    // PUBLIC_API_URL already includes /api/v1 suffix
    const API_URL = import.meta.env.PUBLIC_API_URL || 'https://laventecareauthsystems.onrender.com/api/v1';

    // Get auth token from cookie (check both cookie names)
    const token = cookies.get('access_token')?.value || cookies.get('dkl_auth_token')?.value;

    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Get tenant ID from environment (consistent with auth proxy pattern)
    // FALLBACK: Use the specific DKL tenant ID if env is missing
    const tenantID = import.meta.env.PUBLIC_TENANT_ID || 'b2727666-7230-4689-b58b-ceab8c2898d5';

    // Construct backend URL - API_URL already contains /api/v1
    // Go backend email routes are under /api/v1/admin/email/*
    const backendUrl = `${API_URL}/admin/email/${path}`;

    console.log(`[Email Proxy] Forwarding ${request.method} to ${backendUrl}`);
    console.log(`[Email Proxy] X-Tenant-ID: ${tenantID}`);

    // Forward request to backend
    try {
        // IMPORTANT: Build clean headers instead of forwarding browser headers.
        // Forwarding browser Cookie/Origin headers causes CSRF mismatch on the
        // Go backend. Bearer token auth bypasses CSRF on the backend side,
        // but only if we don't also forward conflicting cookie headers.
        const headers = new Headers();

        headers.set('Authorization', `Bearer ${token}`);
        headers.set('X-Tenant-ID', tenantID);
        headers.set('X-Requested-With', 'XMLHttpRequest'); // CSRF bypass signal
        headers.set('Host', new URL(API_URL).host);
        headers.set('Content-Type', 'application/json');

        console.log(`[Email Proxy] Token present: ${!!token}, length: ${token?.length}`);

        const response = await fetch(backendUrl, {
            method: request.method,
            headers: headers,
            body: request.method !== 'GET' && request.method !== 'HEAD'
                ? await request.text()
                : undefined,
        });

        // Forward response from backend
        const data = await response.text();

        // Log errors for debugging
        if (!response.ok) {
            console.error(`[Email Proxy] Backend error ${response.status}:`, {
                url: backendUrl,
                status: response.status,
                statusText: response.statusText,
                response: data.substring(0, 500) // First 500 chars
            });
        }

        // Handle 204/205 No Content - these statuses CANNOT have a body
        if (response.status === 204 || response.status === 205) {
            return new Response(null, {
                status: response.status,
                headers: {
                    'Content-Type': response.headers.get('Content-Type') || 'application/json',
                },
            });
        }

        return new Response(data, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
            },
        });
    } catch (error) {
        console.error('[Email Proxy] Backend request failed:', error);
        return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
