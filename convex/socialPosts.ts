import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * SOCIAL POSTS API
 * Manual Instagram post management for homepage display
 */

// ============================================================
// QUERIES (Public + Admin)
// ============================================================

/**
 * Get all visible posts ordered by displayOrder (for public display)
 */
export const listPublic = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("social_posts")
            .withIndex("by_visible", (q) => q.eq("isVisible", true))
            .collect()
            .then((posts) =>
                posts.sort((a, b) => a.displayOrder - b.displayOrder)
            );
    },
});

/**
 * Get the featured post (for public display)
 */
export const getFeatured = query({
    args: {},
    handler: async (ctx) => {
        const posts = await ctx.db
            .query("social_posts")
            .withIndex("by_featured", (q) => q.eq("isFeatured", true))
            .collect();

        // Return first visible featured post
        return posts.find((p) => p.isVisible) || null;
    },
});

/**
 * Get thumbnail posts (excluding featured, for public display)
 */
export const getThumbnails = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 7;

        const allPosts = await ctx.db
            .query("social_posts")
            .withIndex("by_visible", (q) => q.eq("isVisible", true))
            .collect();

        // Filter out featured posts and sort by displayOrder
        const thumbnails = allPosts
            .filter((p) => !p.isFeatured)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .slice(0, limit);

        return thumbnails;
    },
});

/**
 * Get all posts (for admin panel)
 */
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("social_posts")
            .collect()
            .then((posts) =>
                posts.sort((a, b) => a.displayOrder - b.displayOrder)
            );
    },
});

/**
 * Get single post by ID
 */
export const getById = query({
    args: { id: v.id("social_posts") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// ============================================================
// MUTATIONS (Admin Only)
// ============================================================

/**
 * Create new social post
 */
export const create = mutation({
    args: {
        imageUrl: v.string(),
        caption: v.string(),
        instagramUrl: v.string(),
        isFeatured: v.boolean(),
        displayOrder: v.number(),
        isVisible: v.boolean(),
        postedDate: v.optional(v.string()),
        updatedBy: v.string(),
    },
    handler: async (ctx, args) => {
        // If setting as featured, unfeatured all other posts
        if (args.isFeatured) {
            const allPosts = await ctx.db.query("social_posts").collect();
            for (const post of allPosts) {
                if (post.isFeatured) {
                    await ctx.db.patch(post._id, { isFeatured: false });
                }
            }
        }

        const now = Date.now();
        return await ctx.db.insert("social_posts", {
            imageUrl: args.imageUrl,
            caption: args.caption,
            instagramUrl: args.instagramUrl,
            isFeatured: args.isFeatured,
            displayOrder: args.displayOrder,
            isVisible: args.isVisible,
            postedDate: args.postedDate,
            createdAt: now,
            updatedAt: now,
            updatedBy: args.updatedBy,
        });
    },
});

/**
 * Update existing post
 */
export const update = mutation({
    args: {
        id: v.id("social_posts"),
        imageUrl: v.optional(v.string()),
        caption: v.optional(v.string()),
        instagramUrl: v.optional(v.string()),
        isFeatured: v.optional(v.boolean()),
        displayOrder: v.optional(v.number()),
        isVisible: v.optional(v.boolean()),
        postedDate: v.optional(v.string()),
        updatedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const { id, updatedBy, ...updates } = args;

        // If setting as featured, unfeatured all other posts
        if (updates.isFeatured === true) {
            const allPosts = await ctx.db.query("social_posts").collect();
            for (const post of allPosts) {
                if (post.isFeatured && post._id !== id) {
                    await ctx.db.patch(post._id, { isFeatured: false });
                }
            }
        }

        await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now(),
            updatedBy,
        });

        return id;
    },
});

/**
 * Delete post
 */
export const remove = mutation({
    args: { id: v.id("social_posts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return args.id;
    },
});

/**
 * Toggle visibility
 */
export const toggleVisibility = mutation({
    args: {
        id: v.id("social_posts"),
        updatedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.id);
        if (!post) throw new Error("Post not found");

        await ctx.db.patch(args.id, {
            isVisible: !post.isVisible,
            updatedAt: Date.now(),
            updatedBy: args.updatedBy,
        });

        return args.id;
    },
});

/**
 * Toggle featured status
 */
export const toggleFeatured = mutation({
    args: {
        id: v.id("social_posts"),
        updatedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.id);
        if (!post) throw new Error("Post not found");

        const newFeaturedStatus = !post.isFeatured;

        // If setting as featured, unfeatured all other posts
        if (newFeaturedStatus) {
            const allPosts = await ctx.db.query("social_posts").collect();
            for (const p of allPosts) {
                if (p.isFeatured && p._id !== args.id) {
                    await ctx.db.patch(p._id, { isFeatured: false });
                }
            }
        }

        await ctx.db.patch(args.id, {
            isFeatured: newFeaturedStatus,
            updatedAt: Date.now(),
            updatedBy: args.updatedBy,
        });

        return args.id;
    },
});

/**
 * Bulk update display order
 */
export const reorder = mutation({
    args: {
        updates: v.array(v.object({
            id: v.id("social_posts"),
            displayOrder: v.number(),
        })),
        updatedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        for (const update of args.updates) {
            await ctx.db.patch(update.id, {
                displayOrder: update.displayOrder,
                updatedAt: now,
                updatedBy: args.updatedBy,
            });
        }

        return args.updates.map((u) => u.id);
    },
});
