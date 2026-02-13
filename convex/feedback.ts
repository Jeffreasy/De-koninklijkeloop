/**
 * TRUST BOUNDARY: Mutations in this file are admin-only.
 * Security relies on SSR middleware auth (admin pages are gated).
 * TODO: Convert critical mutations to action() + verifyAuth() for defense-in-depth.
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Submit Feedback
 * Accessible by anyone with access to the admin interface (Editors/Admins)
 */
export const submit = mutation({
    args: {
        type: v.union(v.literal("bug"), v.literal("feature"), v.literal("question"), v.literal("other")),
        message: v.string(),
        metadata: v.optional(v.object({
            page: v.optional(v.string()),
            browser: v.optional(v.string()),
            screen: v.optional(v.string()),
        })),
        userId: v.optional(v.string()),
        userName: v.optional(v.string()),
        userEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.message.length > 2000) throw new Error("Feedback te lang (max 2000 tekens)");
        if (args.message.trim().length === 0) throw new Error("Feedback mag niet leeg zijn");

        const feedbackId = await ctx.db.insert("feedback", {
            type: args.type,
            message: args.message.trim(),
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
