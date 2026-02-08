// Direct proxy for email-stats endpoint (legacy route structure)
// Backend endpoint is /api/admin/email-stats (with hyphen), not /email/stats
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, cookies }) => {
    const API_URL = import.meta.env.PUBLIC_API_URL || 'https://laventecareauthsystems.onrender.com/api/v1';

    // Get auth token from cookie
    const token = cookies.get('access_token')?.value;

    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Get tenant ID from environment
    const tenantID = import.meta.env.PUBLIC_TENANT_ID || 'b2727666-7230-4689-b58b-ceab8c2898d5';

    // Backend route: /api/email-stats
    const backendUrl = `${API_URL}/email-stats`;

    console.log(`[Email Stats Proxy] Forwarding to ${backendUrl}`);

    try {
        const headers = new Headers();
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('X-Tenant-ID', tenantID);
        headers.set('Content-Type', 'application/json');

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: headers,
        });

        const data = await response.text();

        if (!response.ok) {
            console.error(`[Email Stats Proxy] Backend error ${response.status}:`, data.substring(0, 500));
        }

        return new Response(data, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
            },
        });
    } catch (error) {
        console.error('[Email Stats Proxy] Backend request failed:', error);
        return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
