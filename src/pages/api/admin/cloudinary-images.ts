import type { APIRoute } from "astro";
import { getAllImagesForAdmin } from "../../../lib/cloudinary";

/**
 * API endpoint to fetch all Cloudinary images for admin panel
 * GET /api/admin/cloudinary-images
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
        console.error("[API] Error fetching Cloudinary images:", error);

        return new Response(JSON.stringify({ error: "Failed to fetch images" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
};
