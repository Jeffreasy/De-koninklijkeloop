import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Log a single analytics event */
export const logEvent = mutation({
    args: {
        event: v.string(),
        metadata: v.optional(v.object({
            url: v.optional(v.string()),
            referrer: v.optional(v.string()),
            userAgent: v.optional(v.string()),
            screen: v.optional(v.string()),
            language: v.optional(v.string()),
            source: v.optional(v.string()),
            value: v.optional(v.number()),
            label: v.optional(v.string()),
            flow: v.optional(v.string()),
            step: v.optional(v.string()),
            error_type: v.optional(v.string()),
            year: v.optional(v.string()),
            filter: v.optional(v.string()),
            images_loaded: v.optional(v.number()),
            media_id: v.optional(v.string()),
            media_type: v.optional(v.string()),
            from: v.optional(v.string()),
            to: v.optional(v.string()),
            metric: v.optional(v.string()),
            threshold: v.optional(v.number()),
            user_type: v.optional(v.string()),
        })),
        sessionId: v.string(),
        path: v.string(),
    },
    handler: async (ctx, args) => {
        // Input length guards
        if (args.event.length > 100) throw new Error("Event name too long");
        if (args.path.length > 500) throw new Error("Path too long");
        if (args.sessionId.length > 100) throw new Error("Session ID too long");

        await ctx.db.insert("analytics_events", {
            event: args.event,
            metadata: args.metadata,
            sessionId: args.sessionId,
            path: args.path,
            timestamp: Date.now(),
        });
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
