import type { APIRoute } from "astro";
import { deleteImage } from "../../../lib/cloudinary";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { publicIds } = body;

        if (!publicIds || !Array.isArray(publicIds)) {
            return new Response(JSON.stringify({ error: "Invalid publicIds" }), { status: 400 });
        }

        console.log(`[API] Deleting ${publicIds.length} images...`);

        const results = await Promise.all(
            publicIds.map(async (id) => {
                const success = await deleteImage(id);
                return { id, success };
            })
        );

        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        return new Response(JSON.stringify({
            success: true,
            deleted: successCount,
            failed: failCount,
            results
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("[API] Delete error:", error);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
};
