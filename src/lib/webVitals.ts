// src/lib/webVitals.ts
// Web Vitals Performance Monitoring
// Tracks Core Web Vitals and enforces performance budgets

import { onCLS, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { trackPerformanceBudgetExceeded } from './analytics';

/**
 * Performance Budgets (Google's "Good" thresholds)
 * Based on: https://web.dev/vitals/
 */
export const PERFORMANCE_BUDGETS = {
    LCP: 2500,   // Largest Contentful Paint: 2.5s
    INP: 200,    // Interaction to Next Paint: 200ms
    CLS: 0.1,    // Cumulative Layout Shift: 0.1
    TTFB: 800,   // Time to First Byte: 800ms
} as const;

/**
 * Rating thresholds from web-vitals library
 */
const RATING_THRESHOLDS = {
    LCP: [2500, 4000],
    INP: [200, 500],
    CLS: [0.1, 0.25],
    TTFB: [800, 1800],
} as const;

/**
 * Get performance rating for a metric
 */
function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = RATING_THRESHOLDS[metric.name as keyof typeof RATING_THRESHOLDS];
    if (!thresholds) return 'good';

    if (metric.value <= thresholds[0]) return 'good';
    if (metric.value <= thresholds[1]) return 'needs-improvement';
    return 'poor';
}

/**
 * Get color for console logging based on rating
 */
function getRatingColor(rating: string): string {
    switch (rating) {
        case 'good': return '#0CCE6B';
        case 'needs-improvement': return '#FFA400';
        case 'poor': return '#FF4E42';
        default: return '#666666';
    }
}

/**
 * Log metric to console in development
 */
function logMetric(metric: Metric): void {
    if (import.meta.env.PROD) return;

    const rating = getRating(metric);
    const color = getRatingColor(rating);
    const budget = PERFORMANCE_BUDGETS[metric.name as keyof typeof PERFORMANCE_BUDGETS];

    console.log(
        `%c[Web Vitals] ${metric.name}`,
        `color: ${color}; font-weight: bold;`,
        {
            value: `${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
            rating,
            budget: budget ? `${budget}${metric.name === 'CLS' ? '' : 'ms'}` : 'N/A',
            delta: metric.delta,
            id: metric.id,
        }
    );
}

/**
 * Check if metric exceeds performance budget
 */
function checkBudget(metric: Metric): void {
    const budget = PERFORMANCE_BUDGETS[metric.name as keyof typeof PERFORMANCE_BUDGETS];
    if (!budget) return;

    if (metric.value > budget) {
        trackPerformanceBudgetExceeded(
            metric.name as 'LCP' | 'INP' | 'CLS' | 'TTFB',
            metric.value,
            budget
        );

        // Console warning in development
        if (import.meta.env.DEV) {
            console.warn(
                `⚠️ Performance Budget Exceeded: ${metric.name}`,
                `${Math.round(metric.value)}ms > ${budget}ms`
            );
        }
    }
}

/**
 * Handle metric measurement
 */
function handleMetric(metric: Metric): void {
    logMetric(metric);
    checkBudget(metric);
}

/**
 * Initialize Web Vitals monitoring
 * Call this once on page load
 */
export function initWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Measure Core Web Vitals
    onLCP(handleMetric);
    onINP(handleMetric);
    onCLS(handleMetric);
    onTTFB(handleMetric);

    // Log initialization in development
    if (import.meta.env.DEV) {
        console.log(
            '%c[Web Vitals] Monitoring initialized',
            'color: #0CCE6B; font-weight: bold;',
            PERFORMANCE_BUDGETS
        );
    }
}

/**
 * Get current Web Vitals (for manual inspection)
 * Returns a Promise that resolves when all metrics are collected
 */
export function getCurrentWebVitals(): Promise<Record<string, number>> {
    return new Promise((resolve) => {
        const vitals: Record<string, number> = {};
        let collected = 0;
        const total = 4; // LCP, INP, CLS, TTFB

        const checkComplete = () => {
            collected++;
            if (collected === total) {
                resolve(vitals);
            }
        };

        onLCP((metric: Metric) => {
            vitals.LCP = metric.value;
            checkComplete();
        });

        onINP((metric: Metric) => {
            vitals.INP = metric.value;
            checkComplete();
        });

        onCLS((metric: Metric) => {
            vitals.CLS = metric.value;
            checkComplete();
        });

        onTTFB((metric: Metric) => {
            vitals.TTFB = metric.value;
            checkComplete();
        });
    });
}
