import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Allowed reaction types
const ALLOWED_REACTIONS = ["❤️", "👍", "😍", "🔥", "👏"] as const;
type ReactionType = typeof ALLOWED_REACTIONS[number];

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get reaction counts for a specific post
 * Returns: { "❤️": 5, "👍": 3, "🔥": 2, ... }
 */
export const getReactionCounts = query({
    args: { postId: v.id("social_posts") },
    handler: async (ctx, args) => {
        const reactions = await ctx.db
            .query("social_reactions")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        // Aggregate counts by reaction type
        const counts: Record<string, number> = {};

        for (const reaction of reactions) {
            counts[reaction.reactionType] = (counts[reaction.reactionType] || 0) + 1;
        }

        // Convert to array to avoid "Invalid character" error in Convex return values (Emoji keys are restricted)
        return Object.entries(counts).map(([emoji, count]) => ({
            emoji,
            count
        }));
    },
});

/**
 * Get the current user's reaction for a specific post
 * Returns: "❤️" | null
 */
export const getUserReaction = query({
    args: {
        postId: v.id("social_posts"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.userId) return null;

        const reaction = await ctx.db
            .query("social_reactions")
            .withIndex("by_user_post", (q) =>
                q.eq("userId", args.userId).eq("postId", args.postId)
            )
            .first();

        return reaction?.reactionType || null;
    },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Toggle a reaction on a post
 * Logic:
 * - If user has no reaction: Add new reaction
 * - If user has same reaction: Remove it (toggle off)
 * - If user has different reaction: Update to new reaction
 */
export const toggleReaction = mutation({
    args: {
        postId: v.id("social_posts"),
        userId: v.string(),
        reactionType: v.string(),
    },
    handler: async (ctx, args) => {
        // Validate reaction type
        if (!ALLOWED_REACTIONS.includes(args.reactionType as ReactionType)) {
            throw new Error(`Invalid reaction type: ${args.reactionType}`);
        }

        // Validate user is authenticated
        if (!args.userId || args.userId.trim() === "") {
            throw new Error("User must be authenticated to react");
        }

        // Check if post exists
        const post = await ctx.db.get(args.postId);
        if (!post) {
            throw new Error("Post not found");
        }

        // Check for existing reaction
        const existingReaction = await ctx.db
            .query("social_reactions")
            .withIndex("by_user_post", (q) =>
                q.eq("userId", args.userId).eq("postId", args.postId)
            )
            .first();

        if (existingReaction) {
            // If same reaction type → Remove (toggle off)
            if (existingReaction.reactionType === args.reactionType) {
                await ctx.db.delete(existingReaction._id);
                return { action: "removed" };
            }
            // If different reaction type → Update
            else {
                await ctx.db.patch(existingReaction._id, {
                    reactionType: args.reactionType,
                    createdAt: Date.now(), // Update timestamp
                });
                return { action: "updated" };
            }
        }
        // No existing reaction → Create new
        else {
            await ctx.db.insert("social_reactions", {
                postId: args.postId,
                userId: args.userId,
                reactionType: args.reactionType,
                createdAt: Date.now(),
            });
            return { action: "created" };
        }
    },
});

/**
 * Remove a user's reaction from a post
 */
export const removeReaction = mutation({
    args: {
        postId: v.id("social_posts"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            throw new Error("User must be authenticated");
        }

        const existingReaction = await ctx.db
            .query("social_reactions")
            .withIndex("by_user_post", (q) =>
                q.eq("userId", args.userId).eq("postId", args.postId)
            )
            .first();

        if (existingReaction) {
            await ctx.db.delete(existingReaction._id);
            return { success: true };
        }

        return { success: false, message: "No reaction found" };
    },
});

/**
 * Admin: Get all reactions for a post (with user info)
 * For moderation purposes
 */
export const getPostReactionsAdmin = query({
    args: { postId: v.id("social_posts") },
    handler: async (ctx, args) => {
        const reactions = await ctx.db
            .query("social_reactions")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .order("desc")
            .collect();

        return reactions.map((r) => ({
            id: r._id,
            userId: r.userId,
            reactionType: r.reactionType,
            createdAt: r.createdAt,
        }));
    },
});
