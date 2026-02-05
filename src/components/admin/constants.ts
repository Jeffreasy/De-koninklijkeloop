/**
 * Admin Section - Centralized Constants
 * 
 * All magic numbers and configuration values for the admin section.
 * Ensures consistency and makes updates easier.
 */

// ===== Z-INDEX LAYERS =====
export const Z_INDEX = {
    /** Modal backdrop and content (highest priority) */
    MODAL: 50,
    /** Toast notifications */
    TOAST: 50,
    /** Sticky headers and footers */
    STICKY: 10,
} as const;

// ===== PAGINATION =====
export const PAGINATION = {
    /** Default page size for tables and grids */
    DEFAULT_PAGE_SIZE: 20,
    /** Items per page for media grid */
    MEDIA_GRID_PAGE_SIZE: 24,
    /** Items per page for social posts */
    SOCIAL_GRID_PAGE_SIZE: 12,
} as const;

// ===== FILE UPLOAD =====
export const UPLOAD = {
    /** Maximum file size in bytes (10MB) */
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    /** Maximum file size in MB (for display) */
    MAX_FILE_SIZE_MB: 10,
    /** Accepted image types */
    ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    /** Accepted image extensions */
    ACCEPTED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
} as const;

// ===== TEXT LIMITS =====
export const TEXT_LIMITS = {
    /** Character limit for social post captions */
    SOCIAL_CAPTION_MAX: 500,
    /** Character limit for truncated social captions in cards */
    SOCIAL_CAPTION_TRUNCATE: 100,
    /** Recommended alt text length (min) */
    ALT_TEXT_MIN_RECOMMENDED: 50,
    /** Recommended alt text length (max) */
    ALT_TEXT_MAX_RECOMMENDED: 125,
} as const;

// ===== DISPLAY ORDER =====
export const DISPLAY_ORDER = {
    /** Minimum display order value */
    MIN: 1,
    /** Maximum display order value */
    MAX: 100,
} as const;

// ===== TOUCH TARGETS (WCAG 2.5.5) =====
export const TOUCH_TARGET = {
    /** Minimum width/height for touch targets (WCAG 2.5.5) */
    MIN_SIZE: 44,
} as const;

// ===== GLASSMORPHISM =====
export const GLASSMORPHISM = {
    /** Standard backdrop blur for admin surfaces */
    BACKDROP_BLUR: 'backdrop-blur-md',
    /** Backdrop blur in pixels */
    BACKDROP_BLUR_PX: 12,
} as const;

// ===== RESPONSIVE BREAKPOINTS (Tailwind defaults) =====
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
} as const;

// ===== ANIMATION DURATIONS (ms) =====
export const ANIMATION = {
    /** Fast transitions (hover, focus) */
    FAST: 200,
    /** Standard transitions (modals, toasts) */
    STANDARD: 300,
    /** Slow transitions (page transitions) */
    SLOW: 500,
} as const;
