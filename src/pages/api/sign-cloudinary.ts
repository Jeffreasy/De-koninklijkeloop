
import type { APIRoute } from "astro";
import { v2 as cloudinary } from "cloudinary";

export const POST: APIRoute = async ({ request, locals }) => {
    // 1. Security Check: Only logged-in users can sign uploads
    const { user } = locals;
    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    // 2. Parse Request Body
    const body = await request.json();
    const { paramsToSign } = body;

    try {
        // 3. Configure Cloudinary (Server-side only)
        // Note: CLOUDINARY_API_SECRET is loaded from .env automatically
        cloudinary.config({
            cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
            api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
            api_secret: import.meta.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
        });

        // 4. Generate Signature
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            import.meta.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET
        );

        return new Response(JSON.stringify({ signature }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Cloudinary Signing Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
