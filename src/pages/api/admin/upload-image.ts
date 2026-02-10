import type { APIRoute } from 'astro';
import { uploadImage } from '../../../lib/imagekit';

export const POST: APIRoute = async ({ request, locals }) => {
    const { user } = locals as any;
    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        if (import.meta.env.DEV) console.log('📤 Upload request received');

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error('❌ No file in request');
            return new Response(JSON.stringify({ error: 'No file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (import.meta.env.DEV) console.log('📁 File received:', file.name, file.type, file.size);

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        const dataURI = `data:${file.type};base64,${base64}`;

        if (import.meta.env.DEV) console.log('⬆️ Uploading to ImageKit...');

        const result = await uploadImage(dataURI, file.name, '/De Koninklijkeloop/SocialmediaPosts');

        if (import.meta.env.DEV) console.log('✅ Upload successful:', result.url);

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
        console.error('❌ ImageKit upload error:', error);

        return new Response(
            JSON.stringify({
                error: 'Upload failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
