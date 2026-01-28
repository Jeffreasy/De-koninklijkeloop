import type { APIRoute } from 'astro';

export const prerender = false;

const API_URL = import.meta.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";

export const ALL: APIRoute = async ({ request, params }) => {
    const path = params.path;
    const targetUrl = `${API_URL}/auth/${path}`;

    // Forward the request to the backend
    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: request.headers,
            body: request.body,
            // duping formatting
            duplex: 'half'
        } as any);

        // Forward the response back to the client
        // STRIP HEADERS that cause issues if body is already decompressed by node-fetch
        const newHeaders = new Headers(response.headers);
        newHeaders.delete('content-encoding');
        newHeaders.delete('content-length');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (error) {
        console.error("Proxy Error:", error);
        return new Response(JSON.stringify({ error: "Proxy Failed" }), { status: 500 });
    }
};
