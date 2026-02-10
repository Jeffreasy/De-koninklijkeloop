import type { APIRoute } from "astro";
import { deleteImage } from "../../../lib/imagekit";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { fileIds } = body;

        if (!fileIds || !Array.isArray(fileIds)) {
            return new Response(JSON.stringify({ error: "Invalid fileIds" }), { status: 400 });
        }

        console.log(`[API] Deleting ${fileIds.length} images...`);

        const results = await Promise.all(
            fileIds.map(async (id: string) => {
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
