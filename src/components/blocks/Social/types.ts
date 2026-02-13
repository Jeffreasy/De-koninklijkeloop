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
    displayOrder?: number;
    postedDate?: string;
}
