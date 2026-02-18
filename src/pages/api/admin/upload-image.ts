import type { APIRoute } from 'astro';
import { uploadImage } from '../../../lib/imagekit';
import { verifyApiAdmin } from '../../../lib/apiAuth';

export const POST: APIRoute = async ({ request }) => {
    try {
        const user = await verifyApiAdmin(request);
        if (!user) {
            return new Response(JSON.stringify({
                error: "Niet ingelogd — herlaad de pagina en probeer opnieuw",
                code: "AUTH_REQUIRED"
            }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response(JSON.stringify({
                error: 'Geen bestand geselecteerd',
                code: 'NO_FILE'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (import.meta.env.DEV) console.log('📁 File:', file.name, file.type, file.size);

        // Convert file to buffer, then to base64 for ImageKit SDK v7
        // (SDK v7 requires base64 string, not Buffer)
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Upload to ImageKit
        const result = await uploadImage(base64, file.name, '/SocialmediaPosts');

        return new Response(
            JSON.stringify({
                success: true,
                url: result.url,
                fileId: result.fileId,
                filePath: result.filePath,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Onbekende fout';
        console.error('❌ Upload error:', message, error);

        return new Response(
            JSON.stringify({
                error: `Upload mislukt: ${message}`,
                code: 'UPLOAD_FAILED',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
