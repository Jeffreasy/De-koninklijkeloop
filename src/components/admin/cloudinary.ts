/**
 * Cloudinary Utility - Centralized Configuration
 * 
 * All Cloudinary URL generation logic in one place.
 * Ensures consistency across the admin section.
 */

/**
 * Get Cloudinary cloud name from environment
 */
export function getCloudinaryCloudName(): string {
    return import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgfuv7wif';
}

/**
 * Image transformation presets
 */
export const CLOUDINARY_PRESETS = {
    // Media Card (responsive srcset)
    MEDIA_CARD_400: 'w_400,h_300,c_fill,f_auto,q_auto',
    MEDIA_CARD_800: 'w_800,h_600,c_fill,f_auto,q_auto',
    MEDIA_CARD_1200: 'w_1200,h_900,c_fill,f_auto,q_auto',

    // Media Detail Modal
    MEDIA_DETAIL: 'w_800,h_600,c_fit,f_auto,q_auto',

    // Social Post Thumbnails
    SOCIAL_THUMBNAIL: 'w_600,h_600,c_fill,f_auto,q_auto',

    // Dashboard preview
    DASHBOARD_PREVIEW: 'w_300,h_200,c_fill,f_auto,q_auto',
} as const;

/**
 * Build Cloudinary URL for an image
 */
export function buildCloudinaryUrl(
    publicId: string,
    transformation: string = 'f_auto,q_auto'
): string {
    const cloudName = getCloudinaryCloudName();
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

/**
 * Build responsive srcset for an image
 */
export function buildCloudinarySrcSet(
    publicId: string,
    sizes: Array<{ width: number; height: number; crop?: string }>
): string {
    const cloudName = getCloudinaryCloudName();

    return sizes
        .map(({ width, height, crop = 'fill' }) => {
            const transformation = `w_${width},h_${height},c_${crop},f_auto,q_auto`;
            const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
            return `${url} ${width}w`;
        })
        .join(', ');
}

/**
 * Build Media Card srcset (preset sizes)
 */
export function buildMediaCardSrcSet(publicId: string): string {
    return buildCloudinarySrcSet(publicId, [
        { width: 400, height: 300 },
        { width: 800, height: 600 },
        { width: 1200, height: 900 },
    ]);
}

/**
 * Build Media Card default src
 */
export function buildMediaCardSrc(publicId: string): string {
    return buildCloudinaryUrl(publicId, CLOUDINARY_PRESETS.MEDIA_CARD_400);
}

/**
 * Build Media Detail Modal src
 */
export function buildMediaDetailSrc(publicId: string): string {
    return buildCloudinaryUrl(publicId, CLOUDINARY_PRESETS.MEDIA_DETAIL);
}
