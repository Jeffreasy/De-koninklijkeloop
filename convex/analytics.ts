import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Log a single analytics event */
export const logEvent = mutation({
    args: {
        event: v.string(),
        metadata: v.optional(v.any()),
        sessionId: v.string(),
        path: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("analytics_events", {
            event: args.event,
            metadata: args.metadata,
            sessionId: args.sessionId,
            path: args.path,
            timestamp: Date.now(),
        });
    },
});

/** Get aggregated event stats for a time range */
export const getEventStats = query({
    args: {
        fromTimestamp: v.number(),
    },
    handler: async (ctx, args) => {
        const events = await ctx.db
            .query("analytics_events")
            .withIndex("by_timestamp", (q) => q.gte("timestamp", args.fromTimestamp))
            .collect();

        // Aggregate by event type
        const byEvent: Record<string, number> = {};
        const byDay: Record<string, number> = {};
        const sessions = new Set<string>();

        for (const e of events) {
            byEvent[e.event] = (byEvent[e.event] || 0) + 1;
            sessions.add(e.sessionId);

            const day = new Date(e.timestamp).toISOString().slice(0, 10);
            byDay[day] = (byDay[day] || 0) + 1;
        }

        return {
            totalEvents: events.length,
            uniqueSessions: sessions.size,
            byEvent,
            byDay,
        };
    },
});

/** Get top visited pages */
export const getTopPages = query({
    args: {
        fromTimestamp: v.number(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const events = await ctx.db
            .query("analytics_events")
            .withIndex("by_timestamp", (q) => q.gte("timestamp", args.fromTimestamp))
            .collect();

        const pageMap: Record<string, number> = {};
        for (const e of events) {
            if (e.event === "page_view") {
                pageMap[e.path] = (pageMap[e.path] || 0) + 1;
            }
        }

        return Object.entries(pageMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, args.limit || 10)
            .map(([path, count]) => ({ path, count }));
    },
});

/** Get registration funnel data */
export const getConversionFunnel = query({
    args: {
        fromTimestamp: v.number(),
    },
    handler: async (ctx, args) => {
        const events = await ctx.db
            .query("analytics_events")
            .withIndex("by_timestamp", (q) => q.gte("timestamp", args.fromTimestamp))
            .collect();

        const funnel = {
            pageViews: 0,
            registerPageViews: 0,
            registrationStarted: 0,
            registrationCompleted: 0,
        };

        for (const e of events) {
            if (e.event === "page_view") {
                funnel.pageViews++;
                if (e.path === "/register") funnel.registerPageViews++;
            }
            if (e.event === "registration_started") funnel.registrationStarted++;
            if (e.event === "registration_completed") funnel.registrationCompleted++;
        }

        return funnel;
    },
});

/** Get recent events for live feed */
export const getRecentEvents = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("analytics_events")
            .withIndex("by_timestamp")
            .order("desc")
            .take(args.limit || 20);
    },
});
