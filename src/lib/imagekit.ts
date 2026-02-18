import ImageKit from '@imagekit/nodejs';

// ─── ImageKit Server-Side SDK (Lazy Singleton) ─────────────────
let _imagekit: InstanceType<typeof ImageKit> | null = null;

function getImageKit(): InstanceType<typeof ImageKit> {
    if (!_imagekit) {
        const privateKey = import.meta.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY;

        if (!privateKey) {
            console.warn('[ImageKit] Missing privateKey — SDK calls will fail.');
        }

        if (import.meta.env.DEV) {
            console.log('[ImageKit] Init with:', {
                privateKey: privateKey ? `${privateKey.substring(0, 10)}...` : 'MISSING',
            });
        }

        _imagekit = new ImageKit({
            privateKey: privateKey || 'missing',
        });
    }
    return _imagekit;
}

// Default export as a proxy that lazily initializes
const imagekit = new Proxy({} as InstanceType<typeof ImageKit>, {
    get(_target, prop) {
        const instance = getImageKit();
        const value = (instance as any)[prop];
        return typeof value === 'function' ? value.bind(instance) : value;
    }
});

export default imagekit;

// ─── URL Endpoint for client-side usage ────────────────────────
export const IMAGEKIT_URL_ENDPOINT = import.meta.env.PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/a0oim4e3e';

// ─── Video URL detection ───────────────────────────────────────
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];

/** Check if a URL points to a video file */
export function isVideoUrl(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase().split('?')[0];
    return VIDEO_EXTENSIONS.some(ext => lower.endsWith(ext));
}

/** Get a displayable thumbnail URL for any media URL */
export function getVideoThumbnail(url: string): string {
    if (!url || !isVideoUrl(url)) return url;
    // ImageKit generates video thumbnails with /ik-thumbnail.jpg
    if (url.includes('imagekit.io')) return url + '/ik-thumbnail.jpg';
    return url;
}

// ─── Client-side URL transforms (full-URL based) ──────────────
/** Transform a full ImageKit URL with width/quality/format params.
 *  For video URLs, automatically uses the thumbnail instead. */
export function ik(url: string, width: number): string {
    if (!url || !url.includes("imagekit.io")) return url;
    // Video URLs: use ImageKit thumbnail, then apply image transforms
    const imgUrl = isVideoUrl(url) ? url + '/ik-thumbnail.jpg' : url;
    return imgUrl.replace(
        "/De%20Koninklijkeloop/",
        `/tr:w-${width},q-80,f-auto/De%20Koninklijkeloop/`,
    );
}

/** Generate a srcSet string for responsive images */
export function ikSrcSet(url: string, widths: number[]): string {
    return widths.map((w) => `${ik(url, w)} ${w}w`).join(", ");
}

// ─── Cache ─────────────────────────────────────────────────────
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cache = new Map<string, { data: any[]; timestamp: number }>();

// ─── Shared Types ──────────────────────────────────────────────
export interface GalleryImage {
    src: string;           // file path in ImageKit (e.g. "/De Koninklijkeloop/DKL25/image.jpg")
    secureUrl?: string;    // full URL for direct display
    alt: string;
    aspect: 'vertical' | 'horizontal';
    year: string;
}

// ─── Build optimized URL ───────────────────────────────────────
export function buildImageUrl(
    path: string,
    options: {
        width?: number;
        height?: number;
        crop?: 'at_max' | 'maintain_ratio' | 'force' | 'at_least';
        quality?: number;
        format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    } = {}
): string {
    const { width, height, crop = 'at_max', quality = 80, format = 'auto' } = options;
    const transforms: string[] = [];

    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);
    if (crop) transforms.push(`c-${crop}`);
    transforms.push(`q-${quality}`);
    if (format === 'auto') transforms.push('f-auto');

    const tr = transforms.join(',');
    // Normalize path: ensure it starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${IMAGEKIT_URL_ENDPOINT}/tr:${tr}${normalizedPath}`;
}

// ─── Get images from a folder ──────────────────────────────────
export async function getImagesFromFolder(folderPath: string, year: string): Promise<GalleryImage[]> {
    const now = Date.now();
    const cacheKey = `${folderPath}-${year}`;
    const cached = cache.get(cacheKey);

    if (cached && (now - cached.timestamp < CACHE_TTL)) {
        if (import.meta.env.DEV) console.log(`[Cache] Serving images for ${folderPath} from memory`);
        return cached.data;
    }

    try {
        if (import.meta.env.DEV) console.log(`[ImageKit] Fetching images for ${folderPath}`);

        const result = await imagekit.assets.list({
            path: folderPath,
            fileType: 'image',
            limit: 500,
            type: 'file',
        });

        if (!result || !Array.isArray(result) || result.length === 0) {
            return [];
        }

        const processedImages: GalleryImage[] = result
            .filter((item): item is import('@imagekit/nodejs').ImageKit.File => item.type === 'file' || item.type === 'file-version')
            .map((file) => ({
                src: file.filePath || '',
                secureUrl: file.url,
                alt: (file.customMetadata as any)?.alt || `Foto uit ${year}`,
                aspect: (file.width && file.height && file.width > file.height) ? 'horizontal' as const : 'vertical' as const,
                year,
            }));

        cache.set(cacheKey, { data: processedImages, timestamp: now });
        return processedImages;
    } catch (e: unknown) {
        console.error(`[ImageKit] Error fetching images for "${folderPath}":`, e);

        if (cached) {
            console.warn(`[Cache] Serving STALE images for ${folderPath} due to API error`);
            return cached.data;
        }

        return [];
    }
}

// ─── Extended type for admin panel ─────────────────────────────
export interface ImageKitFileAdmin {
    fileId: string;
    name: string;
    filePath: string;
    url: string;
    width: number;
    height: number;
    fileType: string;
    size: number;
    createdAt: string;
    customMetadata?: {
        alt?: string;
    };
}

// ─── Get all images for admin panel ────────────────────────────
export async function getAllImagesForAdmin(): Promise<ImageKitFileAdmin[]> {
    const FOLDERS = [
        '/De Koninklijkeloop/DKL24',
        '/De Koninklijkeloop/DKL25',
        '/De Koninklijkeloop/DKL26',
    ];

    const CACHE_KEY = 'admin-all-images';
    const now = Date.now();
    const cached = cache.get(CACHE_KEY);

    if (cached && (now - cached.timestamp < CACHE_TTL)) {
        if (import.meta.env.DEV) console.log(`[Cache] Serving admin images from memory`);
        return cached.data;
    }

    try {
        if (import.meta.env.DEV) console.log(`[ImageKit] Fetching all images for admin panel`);
        const allImages: ImageKitFileAdmin[] = [];

        for (const folder of FOLDERS) {
            const result = await imagekit.assets.list({
                path: folder,
                fileType: 'image',
                limit: 500,
                type: 'file',
            });

            if (result && Array.isArray(result) && result.length > 0) {
                const folderImages = result
                    .filter((item): item is import('@imagekit/nodejs').ImageKit.File => item.type === 'file' || item.type === 'file-version')
                    .map((file) => ({
                        fileId: file.fileId || '',
                        name: file.name || '',
                        filePath: file.filePath || '',
                        url: file.url || '',
                        width: file.width || 0,
                        height: file.height || 0,
                        fileType: file.fileType || 'image',
                        size: file.size || 0,
                        createdAt: file.createdAt || '',
                        customMetadata: file.customMetadata as { alt?: string },
                    }));
                allImages.push(...folderImages);
            }
        }

        cache.set(CACHE_KEY, { data: allImages, timestamp: now });
        if (import.meta.env.DEV) console.log(`[ImageKit] Fetched ${allImages.length} images for admin panel`);
        return allImages;
    } catch (e: unknown) {
        console.error(`[ImageKit] Error fetching admin images:`, e);

        if (cached) {
            console.warn(`[Cache] Serving STALE admin images due to API error`);
            return cached.data;
        }

        return [];
    }
}

// ─── Delete image ──────────────────────────────────────────────
export async function deleteImage(fileId: string): Promise<boolean> {
    try {
        if (import.meta.env.DEV) console.log(`[ImageKit] Deleting image: ${fileId}`);
        await imagekit.files.delete(fileId);
        cache.clear();
        return true;
    } catch (e) {
        console.error(`[ImageKit] Delete error:`, e);
        return false;
    }
}

// ─── Upload image ──────────────────────────────────────────────
export async function uploadImage(
    file: string,
    fileName: string,
    folder: string
): Promise<{ url: string; fileId: string; filePath: string }> {
    const result = await imagekit.files.upload({
        file: file as any,
        fileName,
        folder,
        useUniqueFileName: true,
    });

    return {
        url: result.url || '',
        fileId: result.fileId || '',
        filePath: result.filePath || '',
    };
}

// ─── Auth params for client-side uploads ───────────────────────
export function getAuthenticationParameters() {
    return imagekit.helper.getAuthenticationParameters();
}
