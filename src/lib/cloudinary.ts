import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dtlhpx4kj',
    api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY || '457466563842673',
    api_secret: import.meta.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Cache for API responses
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cache = new Map<string, { data: any[]; timestamp: number }>();

export interface CloudinaryImage {
    src: string;          // public_id for CloudinaryImage component
    secureUrl?: string;   // Full URL for modal/direct display
    alt: string;
    aspect: 'vertical' | 'horizontal';
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
            src: res.public_id,      // For CloudinaryImage component
            secureUrl: res.secure_url, // For modal direct display
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

/**
 * Extended Cloudinary Image interface for admin panel
 */
export interface CloudinaryImageAdmin {
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    folder?: string;
    created_at: string;
    bytes: number;
    context?: {
        custom?: {
            alt?: string;
        };
    };
}

/**
 * Get all images from De Koninklijkeloop folders for admin panel
 * Fetches from both 2024 and 2025 folders
 */
export async function getAllImagesForAdmin(): Promise<CloudinaryImageAdmin[]> {
    const FOLDERS = [
        'De Koninklijkeloop/DKLFoto\'s 2024',
        'De Koninklijkeloop/DKLFoto\'s 2025'
    ];

    const CACHE_KEY = 'admin-all-images';
    const now = Date.now();
    const cached = cache.get(CACHE_KEY);

    if (cached && (now - cached.timestamp < CACHE_TTL)) {
        console.log(`[Cache] Serving admin images from memory`);
        return cached.data;
    }

    try {
        console.log(`[Cloudinary] Fetching all images for admin panel`);
        const allImages: CloudinaryImageAdmin[] = [];

        for (const folder of FOLDERS) {
            const result = await cloudinary.api.resources_by_asset_folder(folder, {
                max_results: 500,
                context: true,
                tags: true,
                resource_type: 'image'
            });

            if (result.resources && result.resources.length > 0) {
                const folderImages = result.resources.map((res: any) => ({
                    public_id: res.public_id,
                    secure_url: res.secure_url,
                    width: res.width,
                    height: res.height,
                    format: res.format,
                    resource_type: res.resource_type,
                    folder: res.asset_folder || folder,
                    created_at: res.created_at,
                    bytes: res.bytes,
                    context: res.context
                }));

                allImages.push(...folderImages);
            }
        }

        // Update cache
        cache.set(CACHE_KEY, { data: allImages, timestamp: now });

        console.log(`[Cloudinary] Fetched ${allImages.length} images for admin panel`);
        return allImages;

    } catch (e: unknown) {
        const error = e as { error?: { message?: string } };
        console.error(`[Cloudinary] Error fetching admin images:`, error.error?.message || String(e));

        // Return cached stale data if available on error
        if (cached) {
            console.warn(`[Cache] Serving STALE admin images due to API error`);
            return cached.data;
        }

        return [];
    }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
    try {
        console.log(`[Cloudinary] Deleting image: ${publicId}`);
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            // Invalidate cache
            cache.clear();
            return true;
        }

        console.error(`[Cloudinary] Delete failed:`, result);
        return false;
    } catch (e) {
        console.error(`[Cloudinary] Delete error:`, e);
        return false;
    }
}
