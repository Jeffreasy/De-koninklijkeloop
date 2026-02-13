
import type { APIRoute } from "astro";
import { getAuthenticationParameters } from "../../lib/imagekit";
import { verifyApiAdmin } from "../../lib/apiAuth";

/**
 * POST /api/sign-imagekit
 * Returns authentication parameters for client-side ImageKit uploads
 */
export const POST: APIRoute = async ({ request }) => {
    const user = await verifyApiAdmin(request);
    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const authParams = getAuthenticationParameters();

        return new Response(JSON.stringify(authParams), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("ImageKit Auth Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
