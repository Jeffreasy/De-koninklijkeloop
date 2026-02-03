---
// BFF Proxy for Email API
// Tunnels email requests to LaventeCare Auth backend with cookie injection
// Pattern consistent with existing /api/auth/[...path].ts proxy
import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ params, request, cookies, locals }) => {
    const { path } = params;
    const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';

    // Get auth token from cookie
    const token = cookies.get('access_token')?.value;

    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Get tenant from locals (set by middleware)
    const tenantID = locals.user?.tenant_id;

    if (!tenantID) {
        return new Response(JSON.stringify({ error: 'Tenant context missing' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Construct backend URL
    const backendUrl = `${API_URL}/api/v1/admin/email/${path}`;

    // Forward request to backend
    try {
        const response = await fetch(backendUrl, {
            method: request.method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': tenantID,
                'X-CSRF-Token': cookies.get('csrf_token')?.value || '',
                'Content-Type': 'application/json',
            },
            body: request.method !== 'GET' && request.method !== 'HEAD'
                ? await request.text()
                : undefined,
        });

        // Forward response from backend
        const data = await response.text();

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
