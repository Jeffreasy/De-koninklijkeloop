import ImageKit from 'imagekit';

// ─── ImageKit Server-Side SDK (Lazy Singleton) ─────────────────
let _imagekit: InstanceType<typeof ImageKit> | null = null;

function getImageKit(): InstanceType<typeof ImageKit> {
    if (!_imagekit) {
        const publicKey = import.meta.env.IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY;
        const privateKey = import.meta.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY;
        const urlEndpoint = import.meta.env.PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/a0oim4e3e';

        if (!publicKey || !privateKey) {
            console.warn('[ImageKit] Missing publicKey or privateKey — SDK calls will fail.');
        }
        console.log('[ImageKit] Init with:', {
            publicKey: publicKey ? `${publicKey.substring(0, 10)}...` : 'MISSING',
            privateKey: privateKey ? `${privateKey.substring(0, 10)}...` : 'MISSING',
            urlEndpoint,
        });

        _imagekit = new ImageKit({
            publicKey: publicKey || 'missing',
            privateKey: privateKey || 'missing',
            urlEndpoint,
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
        console.log(`[Cache] Serving images for ${folderPath} from memory`);
        return cached.data;
    }

    try {
        console.log(`[ImageKit] Fetching images for ${folderPath}`);
        const result = await imagekit.listFiles({
            path: folderPath,
            fileType: 'image',
            limit: 500,
        });

        if (!result || !Array.isArray(result) || result.length === 0) {
            return [];
        }

        const processedImages: GalleryImage[] = result.map((file: any) => ({
            src: file.filePath,
            secureUrl: file.url,
            alt: file.customMetadata?.alt || `Foto uit ${year}`,
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
        console.log(`[Cache] Serving admin images from memory`);
        return cached.data;
    }

    try {
        console.log(`[ImageKit] Fetching all images for admin panel`);
        const allImages: ImageKitFileAdmin[] = [];

        for (const folder of FOLDERS) {
            const result = await imagekit.listFiles({
                path: folder,
                fileType: 'image',
                limit: 500,
            });

            if (result && Array.isArray(result) && result.length > 0) {
                const folderImages = result.map((file: any) => ({
                    fileId: file.fileId,
                    name: file.name,
                    filePath: file.filePath,
                    url: file.url,
                    width: file.width || 0,
                    height: file.height || 0,
                    fileType: file.fileType,
                    size: file.size,
                    createdAt: file.createdAt,
                    customMetadata: file.customMetadata,
                }));
                allImages.push(...folderImages);
            }
        }

        cache.set(CACHE_KEY, { data: allImages, timestamp: now });
        console.log(`[ImageKit] Fetched ${allImages.length} images for admin panel`);
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
        console.log(`[ImageKit] Deleting image: ${fileId}`);
        await imagekit.deleteFile(fileId);
        cache.clear();
        return true;
    } catch (e) {
        console.error(`[ImageKit] Delete error:`, e);
        return false;
    }
}

// ─── Upload image ──────────────────────────────────────────────
export async function uploadImage(
    file: string | Buffer,
    fileName: string,
    folder: string
): Promise<{ url: string; fileId: string; filePath: string } | null> {
    try {
        const result = await imagekit.upload({
            file,
            fileName,
            folder,
            useUniqueFileName: true,
        });

        return {
            url: result.url,
            fileId: result.fileId,
            filePath: result.filePath,
        };
    } catch (e) {
        console.error(`[ImageKit] Upload error:`, e);
        return null;
    }
}

// ─── Auth params for client-side uploads ───────────────────────
export function getAuthenticationParameters() {
    return imagekit.getAuthenticationParameters();
}
