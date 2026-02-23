import type { APIRoute } from 'astro';
import { uploadImage } from '../../../lib/imagekit';
import { verifyApiAdmin } from '../../../lib/apiAuth';

export const prerender = false;

interface UploadBody {
    fileName: string;
    fileType: string;
    fileBase64: string;
}

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

        // Accept JSON+base64 to bypass Vercel Edge CSRF block on multipart/form-data.
        // Vercel blocks "Cross-site POST form submissions" for multipart, but allows application/json.
        let body: UploadBody;
        try {
            body = await request.json() as UploadBody;
        } catch {
            return new Response(JSON.stringify({
                error: 'Ongeldig verzoek formaat',
                code: 'INVALID_BODY'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { fileName, fileType, fileBase64 } = body;

        if (!fileName || !fileBase64) {
            return new Response(JSON.stringify({
                error: 'Geen bestand geselecteerd',
                code: 'NO_FILE'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (import.meta.env.DEV) console.log('📁 File:', fileName, fileType);

        // ImageKit SDK v7 accepts base64 string directly — no Buffer conversion needed.
        const result = await uploadImage(fileBase64, fileName, '/SocialmediaPosts');

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
