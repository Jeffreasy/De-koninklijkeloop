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
    postedDate?: number;
    mediaType?: "image" | "video";
    videoUrl?: string;
    mediaItems?: { url: string; type: "image" | "video"; videoUrl?: string }[];
}
