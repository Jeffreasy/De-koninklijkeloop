/**
 * ImageKit Utility - Centralized URL generation for admin
 */

const URL_ENDPOINT = import.meta.env.PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/a0oim4e3e';

/**
 * Image transformation presets
 */
export const IMAGEKIT_PRESETS = {
    MEDIA_CARD_400: 'w-400,h-300,c-maintain_ratio,f-auto,q-80',
    MEDIA_CARD_800: 'w-800,h-600,c-maintain_ratio,f-auto,q-80',
    MEDIA_CARD_1200: 'w-1200,h-900,c-maintain_ratio,f-auto,q-80',
    MEDIA_DETAIL: 'w-800,h-600,c-at_max,f-auto,q-80',
    SOCIAL_THUMBNAIL: 'w-600,h-600,c-maintain_ratio,f-auto,q-80',
    DASHBOARD_PREVIEW: 'w-300,h-200,c-maintain_ratio,f-auto,q-80',
} as const;

/**
 * Build ImageKit URL for an image
 */
export function buildImageKitUrl(
    filePath: string,
    transformation: string = 'f-auto,q-80'
): string {
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${URL_ENDPOINT}/tr:${transformation}${normalizedPath}`;
}

/**
 * Build responsive srcset for an image
 */
export function buildImageKitSrcSet(
    filePath: string,
    sizes: Array<{ width: number; height: number; crop?: string }>
): string {
    return sizes
        .map(({ width, height, crop = 'maintain_ratio' }) => {
            const transformation = `w-${width},h-${height},c-${crop},f-auto,q-80`;
            const url = buildImageKitUrl(filePath, transformation);
            return `${url} ${width}w`;
        })
        .join(', ');
}

/**
 * Build Media Card srcset (preset sizes)
 */
export function buildMediaCardSrcSet(filePath: string): string {
    return buildImageKitSrcSet(filePath, [
        { width: 400, height: 300 },
        { width: 800, height: 600 },
        { width: 1200, height: 900 },
    ]);
}

/**
 * Build Media Card default src
 */
export function buildMediaCardSrc(filePath: string): string {
    return buildImageKitUrl(filePath, IMAGEKIT_PRESETS.MEDIA_CARD_400);
}

/**
 * Build Media Detail Modal src
 */
export function buildMediaDetailSrc(filePath: string): string {
    return buildImageKitUrl(filePath, IMAGEKIT_PRESETS.MEDIA_DETAIL);
}
