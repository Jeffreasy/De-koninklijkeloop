import type { APIRoute } from "astro";
import { getAllImagesForAdmin } from "../../../lib/imagekit";

/**
 * API endpoint to fetch all ImageKit images for admin panel
 * GET /api/admin/imagekit-images
 */
export const GET: APIRoute = async () => {
    try {
        const images = await getAllImagesForAdmin();

        return new Response(JSON.stringify(images), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
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
