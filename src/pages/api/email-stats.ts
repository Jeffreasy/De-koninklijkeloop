// Direct proxy for email-stats endpoint
import type { APIRoute } from 'astro';
import { getAuthContext, getApiUrl, unauthorizedResponse, backendUnavailableResponse, forwardResponse } from './_email-proxy-utils';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
    const auth = getAuthContext(cookies);
    if (!auth) return unauthorizedResponse();

    const backendUrl = `${getApiUrl()}/email-stats`;

    try {
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: auth.headers,
        });

        const data = await response.text();
        return forwardResponse(response, data, 'Email Stats Proxy', backendUrl);
    } catch (error) {
        if (import.meta.env.DEV) console.error('[Email Stats Proxy] Backend request failed:', error);
        return backendUnavailableResponse();
    }
};
