import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Admin: Get all media
export const listMedia = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("media")
            .order("desc")
            .collect();
    },
});

// Admin: Get media by status
export const getMediaByStatus = query({
    args: { status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("archived")) },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("media")
            .withIndex("by_status", (q) => q.eq("status", args.status))
            .order("desc")
            .collect();
    },
});

// Admin: Get media by type
export const getMediaByType = query({
    args: { type: v.union(v.literal("photo"), v.literal("video")) },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("media")
            .withIndex("by_type", (q) => q.eq("type", args.type))
            .order("desc")
            .collect();
    },
});

// Admin: Get media statistics
export const getMediaStats = query({
    handler: async (ctx) => {
        const media = await ctx.db.query("media").collect();

        return {
            totalCount: media.length,
            photoCount: media.filter(m => m.type === "photo").length,
            videoCount: media.filter(m => m.type === "video").length,
            pendingCount: media.filter(m => m.status === "pending").length,
            approvedCount: media.filter(m => m.status === "approved").length,
        };
    },
});

// Admin: Update media status (approve/reject/archive)
export const updateMediaStatus = mutation({
    args: {
        mediaId: v.id("media"),
        status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("archived")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.mediaId, {
            status: args.status,
            approvedAt: args.status === "approved" ? Date.now() : undefined,
        });
    },
});
