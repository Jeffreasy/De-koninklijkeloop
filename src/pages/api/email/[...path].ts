// BFF Proxy for Email API
// Tunnels email requests to LaventeCare Auth backend with cookie injection
import type { APIRoute } from 'astro';
import { getAuthContext, getApiUrl, unauthorizedResponse, backendUnavailableResponse, forwardResponse } from '../_email-proxy-utils';

export const prerender = false;

export const ALL: APIRoute = async ({ params, request, cookies }) => {
    const auth = getAuthContext(cookies);
    if (!auth) return unauthorizedResponse();

    const backendUrl = `${getApiUrl()}/admin/email/${params.path}`;

    try {
        const isBodyMethod = request.method !== 'GET' && request.method !== 'HEAD';

        // Inherit Content-Type from client request for body methods
        if (isBodyMethod) {
            const ct = request.headers.get('Content-Type');
            if (ct) auth.headers.set('Content-Type', ct);
        }

        const response = await fetch(backendUrl, {
            method: request.method,
            headers: auth.headers,
            body: isBodyMethod ? await request.text() : undefined,
        });

        const data = await response.text();
        return forwardResponse(response, data, 'Email Proxy', backendUrl);
    } catch (error) {
        if (import.meta.env.DEV) console.error('[Email Proxy] Backend request failed:', error);
        return backendUnavailableResponse();
    }
};
