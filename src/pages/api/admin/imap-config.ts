import type { APIRoute } from 'astro';
import { getAuthContext, getApiUrl, unauthorizedResponse, backendUnavailableResponse, forwardResponse } from '../_email-proxy-utils';

/**
 * BFF Proxy: /api/admin/imap-config → /api/v1/admin/imap-config
 * Requires admin role (enforced by backend). Supports GET, POST, DELETE.
 * DELETE accepts ?account_type=info query parameter.
 */
export const ALL: APIRoute = async ({ request, cookies, url }) => {
    const auth = getAuthContext(cookies);
    if (!auth) return unauthorizedResponse();

    // Forward query params (e.g. ?account_type=info for DELETE)
    const searchParams = url.searchParams.toString();
    const backendUrl = searchParams
        ? `${getApiUrl()}/admin/imap-config?${searchParams}`
        : `${getApiUrl()}/admin/imap-config`;

    try {
        const isBodyMethod = !['GET', 'HEAD', 'DELETE'].includes(request.method);
        const body = isBodyMethod ? await request.text() : undefined;

        const response = await fetch(backendUrl, {
            method: request.method,
            headers: auth.headers,
            body,
        });

        const text = await response.text();
        return forwardResponse(response, text, 'IMAPConfig');
    } catch {
        return backendUnavailableResponse();
    }
};
