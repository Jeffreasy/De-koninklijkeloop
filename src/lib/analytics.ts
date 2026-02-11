// src/lib/analytics.ts
// Hybrid Analytics: Vercel SI + Go Backend (sendBeacon) + Convex (live feed)
// Privacy-First: No PII, GDPR-Compliant, Client-Side Only

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

/**
 * Custom Event Types
 */
export enum AnalyticsEvent {
    PAGE_VIEW = 'page_view',
    REGISTRATION_STARTED = 'registration_started',
    REGISTRATION_COMPLETED = 'registration_completed',
    REGISTRATION_FAILED = 'registration_failed',
    GALLERY_VIEWED = 'gallery_viewed',
    GALLERY_FILTER_APPLIED = 'gallery_filter_applied',
    GALLERY_LOAD_MORE = 'gallery_load_more',
    VIDEO_PLAYED = 'video_played',
    IMAGE_EXPANDED = 'image_expanded',
    ROUTE_CHANGED = 'route_changed',
    DONATION_INTENT = 'donation_intent',
    PERFORMANCE_BUDGET_EXCEEDED = 'performance_budget_exceeded',
}

interface EventMetadata {
    source?: string;
    value?: number;
    label?: string;
    flow?: 'participant' | 'volunteer' | 'admin';
    step?: string;
    error_type?: string;
    year?: string;
    filter?: string;
    images_loaded?: number;
    media_id?: string;
    media_type?: 'image' | 'video';
    from?: string;
    to?: string;
    metric?: 'LCP' | 'INP' | 'CLS' | 'TTFB';
    threshold?: number;
    user_type?: 'anonymous' | 'participant' | 'admin';
}

/**
 * Events that get written to Convex (real-time live feed only).
 * Critical business events that need instant visibility in admin.
 */
const CONVEX_EVENTS = new Set([
    AnalyticsEvent.REGISTRATION_STARTED,
    AnalyticsEvent.REGISTRATION_COMPLETED,
    AnalyticsEvent.REGISTRATION_FAILED,
    AnalyticsEvent.DONATION_INTENT,
]);

/**
 * Events sent to Go backend via sendBeacon (ALL business events).
 * Go handles: session hashing, device detection, referrer, aggregation.
 */
const GO_EVENTS = new Set([
    AnalyticsEvent.PAGE_VIEW,
    AnalyticsEvent.REGISTRATION_STARTED,
    AnalyticsEvent.REGISTRATION_COMPLETED,
    AnalyticsEvent.REGISTRATION_FAILED,
    AnalyticsEvent.GALLERY_VIEWED,
    AnalyticsEvent.VIDEO_PLAYED,
    AnalyticsEvent.DONATION_INTENT,
    AnalyticsEvent.ROUTE_CHANGED,
]);

/** Get or create anonymous session ID */
function getSessionId(): string {
    if (typeof window === 'undefined') return 'ssr';
    const key = 'dkl_session';
    let id = sessionStorage.getItem(key);
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem(key, id);
    }
    return id;
}

/**
 * Hybrid Analytics Engine
 * - Vercel SI: Web Vitals (always)
 * - Go Backend: All business events via sendBeacon (non-blocking)
 * - Convex: Critical events only for live feed widget
 */
class Analytics {
    private enabled: boolean;
    private debugMode: boolean;
    private convex: ConvexHttpClient | null = null;
    private sessionId: string = 'ssr';
    private tenantId: string;

    constructor() {
        this.enabled = typeof window !== 'undefined';
        this.debugMode = import.meta.env.DEV;
        this.tenantId = import.meta.env.PUBLIC_TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";

        if (this.enabled) {
            this.sessionId = getSessionId();
            const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
            if (convexUrl) {
                this.convex = new ConvexHttpClient(convexUrl);
            }
        }
    }

    track(event: AnalyticsEvent | string, metadata?: EventMetadata): void {
        if (!this.enabled) return;

        if (this.debugMode) {
            console.log('[Analytics]', event, metadata);
        }

        // 1. Vercel Speed Insights (Web Vitals)
        try {
            if (typeof window !== 'undefined' && window.si) {
                (window.si as any)(event, metadata);
            }
        } catch (error) {
            if (this.debugMode) console.warn('[Analytics] Vercel SI failed:', error);
        }

        // 2. Go Backend via sendBeacon (non-blocking, zero UX impact)
        if (GO_EVENTS.has(event as AnalyticsEvent)) {
            this.sendToGo(event, metadata);
        }

        // 3. Convex for live feed (critical events only)
        if (this.convex && CONVEX_EVENTS.has(event as AnalyticsEvent)) {
            this.convex.mutation(api.analytics.logEvent, {
                event,
                metadata: metadata || {},
                sessionId: this.sessionId,
                path: typeof window !== 'undefined' ? window.location.pathname : '/',
            }).catch((err) => {
                if (this.debugMode) console.warn('[Analytics] Convex write failed:', err);
            });
        }
    }

    /**
     * Send event to Go backend using sendBeacon (fire-and-forget).
     * sendBeacon survives page navigation and is non-blocking.
     */
    private sendToGo(event: string, metadata?: EventMetadata): void {
        if (typeof navigator === 'undefined' || !navigator.sendBeacon) {
            // Fallback for environments without sendBeacon
            this.sendToGoFetch(event, metadata);
            return;
        }

        const payload = JSON.stringify({
            event,
            path: window.location.pathname,
            referrer: document.referrer || undefined,
            metadata: metadata || {},
        });

        const blob = new Blob([payload], { type: 'application/json' });
        const sent = navigator.sendBeacon('/api/v1/analytics', blob);

        if (!sent && this.debugMode) {
            console.warn('[Analytics] sendBeacon failed, falling back to fetch');
            this.sendToGoFetch(event, metadata);
        }
    }

    /** Fetch fallback for sendBeacon */
    private sendToGoFetch(event: string, metadata?: EventMetadata): void {
        fetch('/api/v1/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': this.tenantId,
            },
            body: JSON.stringify({
                event,
                path: window.location.pathname,
                referrer: document.referrer || undefined,
                metadata: metadata || {},
            }),
            keepalive: true,
        }).catch(() => { });
    }

    private getUserContext(): { user_type: EventMetadata['user_type'] } {
        if (typeof window === 'undefined') return { user_type: 'anonymous' };
        const context = (window as any).DKL_USER_CONTEXT;
        return { user_type: context?.type || 'anonymous' };
    }

    // ═══════ Page Views ═══════
    trackPageView(): void {
        this.track(AnalyticsEvent.PAGE_VIEW, this.getUserContext());
    }

    // ═══════ Registration Flow ═══════
    trackRegistrationStarted(flow: EventMetadata['flow'] = 'participant'): void {
        this.track(AnalyticsEvent.REGISTRATION_STARTED, { flow, ...this.getUserContext() });
    }

    trackRegistrationCompleted(flow: EventMetadata['flow'] = 'participant'): void {
        this.track(AnalyticsEvent.REGISTRATION_COMPLETED, { flow, ...this.getUserContext() });
    }

    trackRegistrationFailed(errorType: string, step?: string): void {
        this.track(AnalyticsEvent.REGISTRATION_FAILED, { error_type: errorType, step, ...this.getUserContext() });
    }

    // ═══════ Gallery ═══════
    trackGalleryViewed(year?: string): void {
        this.track(AnalyticsEvent.GALLERY_VIEWED, { year: year || 'all', ...this.getUserContext() });
    }

    trackGalleryFilterApplied(filter: string): void {
        this.track(AnalyticsEvent.GALLERY_FILTER_APPLIED, { filter, ...this.getUserContext() });
    }

    trackGalleryLoadMore(currentCount: number): void {
        this.track(AnalyticsEvent.GALLERY_LOAD_MORE, { images_loaded: currentCount, ...this.getUserContext() });
    }

    // ═══════ Media ═══════
    trackVideoPlayed(videoId: string): void {
        this.track(AnalyticsEvent.VIDEO_PLAYED, { media_id: videoId, media_type: 'video', ...this.getUserContext() });
    }

    trackImageExpanded(imageId: string): void {
        this.track(AnalyticsEvent.IMAGE_EXPANDED, { media_id: imageId, media_type: 'image', ...this.getUserContext() });
    }

    // ═══════ Navigation ═══════
    trackRouteChange(from: string, to: string): void {
        this.track(AnalyticsEvent.ROUTE_CHANGED, { from, to, ...this.getUserContext() });
    }

    // ═══════ Conversion ═══════
    trackDonationIntent(source: string = 'unknown'): void {
        this.track(AnalyticsEvent.DONATION_INTENT, { source, ...this.getUserContext() });
    }

    // ═══════ Performance (Dev Only) ═══════
    trackPerformanceBudgetExceeded(metric: EventMetadata['metric'], value: number, threshold: number): void {
        if (!this.debugMode) return;
        this.track(AnalyticsEvent.PERFORMANCE_BUDGET_EXCEEDED, { metric, value, threshold, ...this.getUserContext() });
    }
}

export const analytics = new Analytics();

export const {
    track: trackEvent,
    trackPageView,
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
