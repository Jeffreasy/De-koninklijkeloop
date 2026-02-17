// src/lib/analytics.ts
// Hybrid Analytics: Vercel SI + Go Backend (sendBeacon) + Convex (live feed)
// Privacy-First: No PII, GDPR-Compliant, Client-Side Only

declare global {
    interface Window {
        si?: (event: string, metadata?: Record<string, unknown>) => void;
    }
}

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
                try {
                    this.convex = new ConvexHttpClient(convexUrl);
                    if (this.debugMode) console.log('[Analytics] Convex client initialized:', convexUrl.slice(0, 30) + '...');
                } catch (err) {
                    if (this.debugMode) console.error('[Analytics] Convex client init failed:', err);
                }
            } else {
                if (this.debugMode) console.warn('[Analytics] PUBLIC_CONVEX_URL not set — Convex live feed disabled');
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

        // 3. Convex for live feed
        if (this.convex && CONVEX_EVENTS.has(event as AnalyticsEvent)) {
            this.convex.mutation(api.analytics.logEvent, {
                event,
                metadata: metadata || {},
                sessionId: this.sessionId,
                path: typeof window !== 'undefined' ? window.location.pathname : '/',
            }).catch((err) => {
                if (this.debugMode) console.error('[Analytics] Convex write failed:', err);
            });
        }
    }

    /**
     * Send event to Go backend via Astro BFF bypass → direct to Render.
     * The [...all].ts proxy detects POST /api/v1/analytics and forwards
     * directly WITHOUT X-Tenant-ID header or Authorization token.
     * The Go backend uses Path B (tenant_id from body) for public ingestion.
     */
    private sendToGo(event: string, metadata?: EventMetadata): void {
        const payload = JSON.stringify({
            event,
            path: window.location.pathname,
            referrer: document.referrer || undefined,
            session_id: this.sessionId,
            tenant_id: this.tenantId,
            metadata: metadata || {},
        });

        fetch('/api/v1/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
        }).catch(() => { /* fire-and-forget */ });
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

export const trackEvent = analytics.track.bind(analytics);
export const trackPageView = analytics.trackPageView.bind(analytics);
export const trackRegistrationStarted = analytics.trackRegistrationStarted.bind(analytics);
export const trackRegistrationCompleted = analytics.trackRegistrationCompleted.bind(analytics);
export const trackRegistrationFailed = analytics.trackRegistrationFailed.bind(analytics);
export const trackGalleryViewed = analytics.trackGalleryViewed.bind(analytics);
export const trackGalleryFilterApplied = analytics.trackGalleryFilterApplied.bind(analytics);
export const trackGalleryLoadMore = analytics.trackGalleryLoadMore.bind(analytics);
export const trackVideoPlayed = analytics.trackVideoPlayed.bind(analytics);
export const trackImageExpanded = analytics.trackImageExpanded.bind(analytics);
export const trackRouteChange = analytics.trackRouteChange.bind(analytics);
export const trackDonationIntent = analytics.trackDonationIntent.bind(analytics);
export const trackPerformanceBudgetExceeded = analytics.trackPerformanceBudgetExceeded.bind(analytics);

