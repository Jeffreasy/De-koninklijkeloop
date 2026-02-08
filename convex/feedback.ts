import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Submit Feedback
 * Accessible by anyone with access to the admin interface (Editors/Admins)
 */
export const submit = mutation({
    args: {
        type: v.string(),
        message: v.string(),
        metadata: v.optional(v.any()),
        userId: v.optional(v.string()),
        userName: v.optional(v.string()),
        userEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const feedbackId = await ctx.db.insert("feedback", {
            type: args.type,
            message: args.message,
            metadata: args.metadata,
            status: "open",
            userId: args.userId,
            userName: args.userName,
            userEmail: args.userEmail,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return feedbackId;
    },
});

/**
 * List Feedback
 * Intended for Admins to view all submissions
 */
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("feedback").order("desc").collect();
    },
});

/**
 * Update Feedback Status
 * Intended for Admins to manage feedback lifecycle
 */
export const updateStatus = mutation({
    args: {
        id: v.id("feedback"),
        status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("closed"), v.literal("rejected")),
        adminNotes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: args.status,
            adminNotes: args.adminNotes,
            updatedAt: Date.now(),
        });
    },
});
