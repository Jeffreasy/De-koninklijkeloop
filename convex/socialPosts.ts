/**
 * TRUST BOUNDARY: Mutations in this file are admin-only.
 * Security relies on SSR middleware auth (admin pages are gated).
 * TODO: Convert critical mutations to action() + verifyAuth() for defense-in-depth.
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * SOCIAL POSTS API
 * Manual Instagram post management for homepage display
 * Posts are scoped by year/edition (2024, 2025, 2026, ...)
 */

const CURRENT_YEAR = "2026";

// ============================================================
// QUERIES (Public + Admin)
// ============================================================

/**
 * Get all visible posts ordered by displayOrder (for public display)
 * Scoped by year — defaults to current year
 */
export const listPublic = query({
    args: { year: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (args.year) {
            const year = args.year;
            return await ctx.db
                .query("social_posts")
                .withIndex("by_year_visible", (q) => q.eq("year", year).eq("isVisible", true))
                .collect()
                .then((posts) => posts.sort((a, b) => b.createdAt - a.createdAt));
        }
        // No year filter — return all visible posts
        return await ctx.db
            .query("social_posts")
            .withIndex("by_visible", (q) => q.eq("isVisible", true))
            .collect()
            .then((posts) => posts.sort((a, b) => b.createdAt - a.createdAt));
    },
});

/**
 * Get the featured post (for public display)
 * Scoped by year — defaults to current year
 */
export const getFeatured = query({
    args: { year: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let posts;
        if (args.year) {
            const year = args.year;
            posts = await ctx.db
                .query("social_posts")
                .withIndex("by_year_featured", (q) => q.eq("year", year).eq("isFeatured", true))
                .collect();
        } else {
            posts = await ctx.db
                .query("social_posts")
                .withIndex("by_featured", (q) => q.eq("isFeatured", true))
                .collect();
        }

        // Return first visible featured post
        return posts.find((p) => p.isVisible) || null;
    },
});

/**
 * Get thumbnail posts (excluding featured, for public display)
 * Scoped by year — defaults to current year
 */
export const getThumbnails = query({
    args: {
        limit: v.optional(v.number()),
        year: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;

        let allPosts;
        if (args.year) {
            const year = args.year;
            allPosts = await ctx.db
                .query("social_posts")
                .withIndex("by_year_visible", (q) => q.eq("year", year).eq("isVisible", true))
                .collect();
        } else {
            allPosts = await ctx.db
                .query("social_posts")
                .withIndex("by_visible", (q) => q.eq("isVisible", true))
                .collect();
        }

        // Filter out featured posts and sort by creation date (newest first)
        const thumbnails = allPosts
            .filter((p) => !p.isFeatured)
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, limit);

        return thumbnails;
    },
});

/**
 * Get all posts (for admin panel)
 * Optionally scoped by year
 */
export const listAll = query({
    args: { year: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (args.year) {
            const year = args.year;
            return await ctx.db
                .query("social_posts")
                .withIndex("by_year", (q) => q.eq("year", year))
                .collect()
                .then((posts) =>
                    posts.sort((a, b) => b.createdAt - a.createdAt)
                );
        }
        // No year filter — return all posts
        return await ctx.db
            .query("social_posts")
            .collect()
            .then((posts) =>
                posts.sort((a, b) => b.createdAt - a.createdAt)
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
        isVisible: v.boolean(),
        postedDate: v.optional(v.number()),
        year: v.optional(v.string()),
        mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
        videoUrl: v.optional(v.string()),
        mediaItems: v.optional(v.array(v.object({
            url: v.string(),
            type: v.union(v.literal("image"), v.literal("video")),
            videoUrl: v.optional(v.string()),
        }))),
        updatedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const year = args.year || CURRENT_YEAR;

        // If setting as featured, unfeatured all other posts IN THE SAME YEAR
        if (args.isFeatured) {
            const yearPosts = await ctx.db
                .query("social_posts")
                .withIndex("by_year_featured", (q) => q.eq("year", year).eq("isFeatured", true))
                .collect();
            for (const post of yearPosts) {
                await ctx.db.patch(post._id, { isFeatured: false });
            }
        }
        const now = Date.now();
        return await ctx.db.insert("social_posts", {
            year,
            mediaType: args.mediaType ?? "image",
            videoUrl: args.videoUrl,
            mediaItems: args.mediaItems,
            imageUrl: args.imageUrl,
            caption: args.caption,
            instagramUrl: args.instagramUrl,
            isFeatured: args.isFeatured,
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
        isVisible: v.optional(v.boolean()),
        postedDate: v.optional(v.number()),
        year: v.optional(v.string()),
        mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
        videoUrl: v.optional(v.string()),
        mediaItems: v.optional(v.array(v.object({
            url: v.string(),
            type: v.union(v.literal("image"), v.literal("video")),
            videoUrl: v.optional(v.string()),
        }))),
        updatedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const { id, updatedBy, ...updates } = args;
        const post = await ctx.db.get(id);
        if (!post) throw new Error("Post not found");

        const postYear = updates.year || post.year || CURRENT_YEAR;

        // If setting as featured, unfeatured all other posts IN THE SAME YEAR
        if (updates.isFeatured === true) {
            const yearPosts = await ctx.db
                .query("social_posts")
                .withIndex("by_year_featured", (q) => q.eq("year", postYear).eq("isFeatured", true))
                .collect();
            for (const p of yearPosts) {
                if (p._id !== id) {
                    await ctx.db.patch(p._id, { isFeatured: false });
                }
            }
        } await ctx.db.patch(id, {
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
        const post = await ctx.db.get(args.id);
        if (!post) throw new Error("Post not found");

        // Clean up orphan reactions
        const reactions = await ctx.db
            .query("social_reactions")
            .withIndex("by_post", (q) => q.eq("postId", args.id))
            .collect();
        for (const r of reactions) {
            await ctx.db.delete(r._id);
        }

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
 * Scoped: only unfeatured other posts within the same year
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
        const postYear = post.year || CURRENT_YEAR;

        // If setting as featured, unfeatured all other posts IN THE SAME YEAR
        if (newFeaturedStatus) {
            const yearPosts = await ctx.db
                .query("social_posts")
                .withIndex("by_year_featured", (q) => q.eq("year", postYear).eq("isFeatured", true))
                .collect();
            for (const p of yearPosts) {
                if (p._id !== args.id) {
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
 * Backfill: Set year on posts that don't have one yet.
 * Run once from Convex dashboard or CLI.
 * Uses the manual year override if provided.
 */
export const backfillYear = mutation({
    args: { year: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const defaultYear = args.year || CURRENT_YEAR;
        // Use collect() since withIndex on optional field may skip undefined-year rows
        const allPosts = await ctx.db.query("social_posts").collect();
        let updated = 0;

        for (const post of allPosts) {
            // After schema change year is required; patch any legacy rows that snuck through
            if (!post.year) {
                await ctx.db.patch(post._id, { year: defaultYear });
                updated++;
            }
        }

        return { updated, total: allPosts.length, year: defaultYear };
    },
});

/**
 * Migration: Convert any string postedDate values to Unix timestamps (ms).
 *
 * Background: Schema changed postedDate from string ("2024-08-27") to float64 (timestamp).
 * This mutation converts all legacy string values to numbers.
 *
 * Run ONCE from Convex Dashboard → Functions → socialPosts:migratePostedDates
 * Args: {} — no arguments needed.
 *
 * After running: change schema postedDate back to v.optional(v.float64()) only.
 */
export const migratePostedDates = mutation({
    args: {},
    handler: async (ctx) => {
        const allPosts = await ctx.db.query("social_posts").collect();
        let converted = 0;
        let skipped = 0;
        let cleared = 0;

        for (const post of allPosts) {
            const pd = post.postedDate;

            if (pd === undefined || pd === null) {
                skipped++;
                continue;
            }

            if (typeof pd === "string") {
                const ts = new Date(pd).getTime();
                if (isNaN(ts)) {
                    // Unparseable string — clear it
                    await ctx.db.patch(post._id, { postedDate: undefined });
                    cleared++;
                } else {
                    await ctx.db.patch(post._id, { postedDate: ts });
                    converted++;
                }
            } else {
                // Already a number — skip
                skipped++;
            }
        }

        return {
            total: allPosts.length,
            converted,
            skipped,
            cleared,
            message: `Klaar: ${converted} geconverteerd, ${skipped} al correct, ${cleared} gewist (onleesbare datum).`,
            nextStep: "Zet schema postedDate terug naar v.optional(v.float64()) en verwijder de migratePostedDates functie.",
        };
    },
});

/**
 * Smart Backfill: Reassign year based on createdAt timestamp.
 * Use this to fix posts that were wrongly lumped into the same year bucket.
 *
 * Edition cutoffs (DKL event is in May each year):
 *   createdAt < 1 Jun 2024  → "2024"  (23/24 editie)
 *   createdAt < 1 Jun 2025  → "2025"  (24/25 editie)
 *   createdAt >= 1 Jun 2025 → "2026"  (25/26 editie)
 *
 * Run from Convex Dashboard → Functions → socialPosts:backfillYearByDate
 * Args: {} — no arguments needed. Returns a summary of changes.
 */
export const backfillYearByDate = mutation({
    args: {},
    handler: async (ctx) => {
        // Edition boundaries: first day of June in each event year
        const CUT_2024 = new Date("2024-06-01T00:00:00Z").getTime(); // < this = 2024 edition
        const CUT_2025 = new Date("2025-06-01T00:00:00Z").getTime(); // < this = 2025 edition
        // >= CUT_2025 = 2026 edition

        const allPosts = await ctx.db.query("social_posts").collect();
        const counts: Record<string, number> = { "2024": 0, "2025": 0, "2026": 0 };
        let updated = 0;

        for (const post of allPosts) {
            let correctYear: string;
            if (post.createdAt < CUT_2024) {
                correctYear = "2024";
            } else if (post.createdAt < CUT_2025) {
                correctYear = "2025";
            } else {
                correctYear = "2026";
            }

            counts[correctYear]++;

            if (post.year !== correctYear) {
                await ctx.db.patch(post._id, { year: correctYear });
                updated++;
            }
        }

        return {
            updated,
            total: allPosts.length,
            distribution: counts,
            message: `${updated} posts bijgewerkt. Verdeling: 2024=${counts["2024"]}, 2025=${counts["2025"]}, 2026=${counts["2026"]}`,
        };
    },
});
