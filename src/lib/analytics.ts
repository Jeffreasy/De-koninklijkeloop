// src/lib/analytics.ts
// Lightweight Analytics Wrapper for Vercel Speed Insights
// Privacy-First: No PII, GDPR-Compliant, Client-Side Only

// Note: Vercel Speed Insights injects the track() function globally via the adapter
// We'll access it via window to avoid import issues
declare global {
    interface Window {
        si?: (event: string, data?: Record<string, any>) => void;
    }
}

/**
 * Custom Event Types
 * Keep this enum in sync with your analytics dashboard filters
 */
export enum AnalyticsEvent {
    // Registration Flow
    REGISTRATION_STARTED = 'registration_started',
    REGISTRATION_COMPLETED = 'registration_completed',
    REGISTRATION_FAILED = 'registration_failed',

    // Gallery Engagement
    GALLERY_VIEWED = 'gallery_viewed',
    GALLERY_FILTER_APPLIED = 'gallery_filter_applied',
    GALLERY_LOAD_MORE = 'gallery_load_more',

    // Media Interactions
    VIDEO_PLAYED = 'video_played',
    IMAGE_EXPANDED = 'image_expanded',

    // Navigation
    ROUTE_CHANGED = 'route_changed',

    // Conversion Points
    DONATION_INTENT = 'donation_intent',

    // Performance
    PERFORMANCE_BUDGET_EXCEEDED = 'performance_budget_exceeded',
}

/**
 * Event Metadata Types
 * All properties are optional and non-PII
 */
interface EventMetadata {
    // Generic
    source?: string;
    value?: number;
    label?: string;

    // Registration
    flow?: 'participant' | 'volunteer' | 'admin';
    step?: string;
    error_type?: string;

    // Gallery
    year?: string;
    filter?: string;
    images_loaded?: number;

    // Media
    media_id?: string;
    media_type?: 'image' | 'video';

    // Navigation
    from?: string;
    to?: string;

    // Performance
    metric?: 'LCP' | 'FID' | 'CLS' | 'TTFB';
    threshold?: number;

    // User Context (non-PII)
    user_type?: 'anonymous' | 'participant' | 'admin';
}

/**
 * Core Analytics Wrapper
 * Thin abstraction over Vercel Speed Insights
 */
class Analytics {
    private enabled: boolean;
    private debugMode: boolean;

    constructor() {
        // Only enable in browser environment
        this.enabled = typeof window !== 'undefined';
        this.debugMode = import.meta.env.DEV;
    }

    /**
     * Track a custom event
     * @param event - Event name from AnalyticsEvent enum
     * @param metadata - Optional event metadata (non-PII only)
     */
    track(event: AnalyticsEvent | string, metadata?: EventMetadata): void {
        if (!this.enabled) return;

        // Debug logging in development
        if (this.debugMode) {
            console.log('[Analytics]', event, metadata);
        }

        // Send to Vercel Speed Insights
        // Vercel adapter injects this function globally
        try {
            if (typeof window !== 'undefined' && window.si) {
                window.si(event, metadata);
            }
        } catch (error) {
            if (this.debugMode) {
                console.warn('[Analytics] Failed to track event:', error);
            }
        }
    }

    /**
     * Get user context from global state
     * Falls back to 'anonymous' if not available
     */
    private getUserContext(): { user_type: EventMetadata['user_type'] } {
        if (typeof window === 'undefined') {
            return { user_type: 'anonymous' };
        }

        const context = (window as any).DKL_USER_CONTEXT;
        return {
            user_type: context?.type || 'anonymous'
        };
    }

    // ========================================
    // Registration Flow
    // ========================================

    trackRegistrationStarted(flow: EventMetadata['flow'] = 'participant'): void {
        this.track(AnalyticsEvent.REGISTRATION_STARTED, {
            flow,
            ...this.getUserContext()
        });
    }

    trackRegistrationCompleted(flow: EventMetadata['flow'] = 'participant'): void {
        this.track(AnalyticsEvent.REGISTRATION_COMPLETED, {
            flow,
            ...this.getUserContext()
        });
    }

    trackRegistrationFailed(errorType: string, step?: string): void {
        this.track(AnalyticsEvent.REGISTRATION_FAILED, {
            error_type: errorType,
            step,
            ...this.getUserContext()
        });
    }

    // ========================================
    // Gallery Engagement
    // ========================================

    trackGalleryViewed(year?: string): void {
        this.track(AnalyticsEvent.GALLERY_VIEWED, {
            year: year || 'all',
            ...this.getUserContext()
        });
    }

    trackGalleryFilterApplied(filter: string): void {
        this.track(AnalyticsEvent.GALLERY_FILTER_APPLIED, {
            filter,
            ...this.getUserContext()
        });
    }

    trackGalleryLoadMore(currentCount: number): void {
        this.track(AnalyticsEvent.GALLERY_LOAD_MORE, {
            images_loaded: currentCount,
            ...this.getUserContext()
        });
    }

    // ========================================
    // Media Interactions
    // ========================================

    trackVideoPlayed(videoId: string): void {
        this.track(AnalyticsEvent.VIDEO_PLAYED, {
            media_id: videoId,
            media_type: 'video',
            ...this.getUserContext()
        });
    }

    trackImageExpanded(imageId: string): void {
        this.track(AnalyticsEvent.IMAGE_EXPANDED, {
            media_id: imageId,
            media_type: 'image',
            ...this.getUserContext()
        });
    }

    // ========================================
    // Navigation
    // ========================================

    trackRouteChange(from: string, to: string): void {
        this.track(AnalyticsEvent.ROUTE_CHANGED, {
            from,
            to,
            ...this.getUserContext()
        });
    }

    // ========================================
    // Conversion Points
    // ========================================

    trackDonationIntent(source: string = 'unknown'): void {
        this.track(AnalyticsEvent.DONATION_INTENT, {
            source,
            ...this.getUserContext()
        });
    }

    // ========================================
    // Performance Monitoring (Dev Only)
    // ========================================

    trackPerformanceBudgetExceeded(
        metric: EventMetadata['metric'],
        value: number,
        threshold: number
    ): void {
        // Only track in development to avoid noise in production
        if (!this.debugMode) return;

        this.track(AnalyticsEvent.PERFORMANCE_BUDGET_EXCEEDED, {
            metric,
            value,
            threshold,
            ...this.getUserContext()
        });
    }
}

// Export singleton instance
export const analytics = new Analytics();

// Named exports for convenience
export const {
    track: trackEvent,
    trackRegistrationStarted,
    trackRegistrationCompleted,
    trackRegistrationFailed,
    trackGalleryViewed,
    trackGalleryFilterApplied,
    trackGalleryLoadMore,
    trackVideoPlayed,
    trackImageExpanded,
    trackRouteChange,
    trackDonationIntent,
    trackPerformanceBudgetExceeded,
} = analytics;
