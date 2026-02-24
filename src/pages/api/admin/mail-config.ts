import type { APIRoute } from 'astro';
import { getAuthContext, getApiUrl, unauthorizedResponse, backendUnavailableResponse, forwardResponse } from '../_email-proxy-utils';

/**
 * BFF Proxy: /api/admin/mail-config → /api/v1/admin/mail-config
 * Requires admin role (enforced by backend). Follows HttpOnly cookie auth pattern.
 * Supports GET (read config), POST (update config), DELETE (remove config).
 */
export const ALL: APIRoute = async ({ request, cookies }) => {
    const auth = getAuthContext(cookies);
    if (!auth) return unauthorizedResponse();

    const backendUrl = `${getApiUrl()}/admin/mail-config`;

    try {
        const isBodyMethod = !['GET', 'HEAD', 'DELETE'].includes(request.method);
        const body = isBodyMethod ? await request.text() : undefined;

        const response = await fetch(backendUrl, {
            method: request.method,
            headers: auth.headers,
            body,
        });

        const text = await response.text();
        return forwardResponse(response, text, 'MailConfig');
    } catch {
        return backendUnavailableResponse();
    }
};
