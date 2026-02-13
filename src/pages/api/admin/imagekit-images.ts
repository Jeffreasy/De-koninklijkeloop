import type { APIRoute } from "astro";
import { getAllImagesForAdmin } from "../../../lib/imagekit";
import { verifyApiAdmin } from "../../../lib/apiAuth";

/**
 * API endpoint to fetch all ImageKit images for admin panel
 * GET /api/admin/imagekit-images
 */
export const GET: APIRoute = async ({ request }) => {
    const user = await verifyApiAdmin(request);
    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const images = await getAllImagesForAdmin();

        return new Response(JSON.stringify(images), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
            },
        });
    } catch (error) {
        console.error("[API] Error fetching ImageKit images:", error);

        return new Response(JSON.stringify({ error: "Failed to fetch images" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
};
