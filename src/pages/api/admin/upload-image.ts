import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
    api_key: import.meta.env.CLOUDINARY_API_KEY,
    api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export const POST: APIRoute = async ({ request }) => {
    try {
        console.log('📤 Upload request received');
        console.log('☁️ Cloud name:', import.meta.env.CLOUDINARY_CLOUD_NAME);

        // Get the form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error('❌ No file in request');
            return new Response(JSON.stringify({ error: 'No file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log('📁 File received:', file.name, file.type, file.size);

        // Convert file to array buffer then to base64
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Convert bytes to base64
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        const dataURI = `data:${file.type};base64,${base64}`;

        console.log('🔄 Converting to base64... Done');
        console.log('⬆️ Uploading to Cloudinary...');

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'De Koninklijkeloop/SocialMediaPosts',
            resource_type: 'auto',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        });

        console.log('✅ Upload successful:', result.secure_url);

        return new Response(
            JSON.stringify({
                success: true,
                url: result.secure_url,
                public_id: result.public_id,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('❌ Cloudinary upload error:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown',
            stack: error instanceof Error ? error.stack : undefined,
        });

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
