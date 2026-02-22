/**
 * Shared types for Social components
 */
export interface SSRPost {
    _id: string;
    imageUrl: string;
    caption: string;
    instagramUrl: string;
    isFeatured: boolean;
    isVisible?: boolean;
    postedDate?: string;
    mediaType?: string;
    videoUrl?: string;
    mediaItems?: { url: string; type: "image" | "video"; videoUrl?: string }[];
}
