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
