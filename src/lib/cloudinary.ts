import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary
cloudinary.config({
    cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
    api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

// Simple in-memory cache
// Note: In serverless (Vercel), this persists only as long as the lambda instance is warm.
// This is typically sufficient to handle burst traffic and reduce API calls significantly.
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cache = new Map<string, { data: any[]; timestamp: number }>();

export interface CloudinaryImage {
    src: string;
    alt: string;
    aspect: 'horizontal' | 'vertical';
    year: string;
}

export async function getImagesFromFolder(folderName: string, year: string): Promise<CloudinaryImage[]> {
    const now = Date.now();
    const cacheKey = `${folderName}-${year}`;
    const cached = cache.get(cacheKey);

    if (cached && (now - cached.timestamp < CACHE_TTL)) {
        console.log(`[Cache] Serving images for ${folderName} from memory`);
        return cached.data;
    }

    try {
        console.log(`[Cloudinary] Fetching images for ${folderName}`);
        const result = await cloudinary.api.resources_by_asset_folder(folderName, {
            max_results: 500,
            context: true,
            tags: true
        });

        if (!result.resources || result.resources.length < 1) {
            return [];
        }

        const processedImages: CloudinaryImage[] = result.resources.map((res: any) => ({
            src: res.public_id,
            alt: res.context?.custom?.alt || `Foto uit ${year}`,
            aspect: (res.width && res.height && res.width > res.height) ? 'horizontal' as const : 'vertical' as const,
            year: year
        }));

        // Update cache
        cache.set(cacheKey, { data: processedImages, timestamp: now });

        return processedImages;
    } catch (e: unknown) {
        const error = e as { error?: { message?: string } };
        console.error(`[Cloudinary] Error fetching images for "${folderName}":`, error.error?.message || String(e));

        // Return cached stale data if available on error
        if (cached) {
            console.warn(`[Cache] Serving STALE images for ${folderName} due to API error`);
            return cached.data;
        }

        return [];
    }
}

export async function getSponsors(): Promise<CloudinaryImage[]> {
    const FOLDER = 'De Koninklijke Loop/DKLSponsors';
    const CACHE_KEY = 'sponsors-list-v1';
    const now = Date.now();
    const cached = cache.get(CACHE_KEY);

    if (cached && (now - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }

    try {
        const result = await cloudinary.api.resources_by_asset_folder(FOLDER, {
            max_results: 100,
            context: true,
            tags: true
        });

        if (!result.resources || result.resources.length < 1) {
            return [];
        }

        const sponsors: CloudinaryImage[] = result.resources.map((res: any) => ({
            src: res.public_id,
            alt: res.context?.custom?.alt || res.public_id.split('/').pop() || 'Sponsor',
            aspect: (res.width && res.height && res.width > res.height) ? 'horizontal' : 'vertical',
            year: new Date().getFullYear().toString()
        }));

        cache.set(CACHE_KEY, { data: sponsors, timestamp: now });
        return sponsors;

    } catch (e: unknown) {
        console.error(`[Cloudinary] Error fetching sponsors:`, e);
        if (cached) return cached.data;
        return [];
    }
}
