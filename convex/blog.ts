import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ═══════════════════════════════════════════════════════════
// BLOG POSTS
// ═══════════════════════════════════════════════════════════

export const listPosts = query({
    args: {
        status: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { status, limit }) => {
        let posts;

        if (status && status !== "all") {
            posts = await ctx.db
                .query("blog_posts")
                .withIndex("by_status", (q) => q.eq("status", status as any))
                .order("desc")
                .collect();
        } else {
            posts = await ctx.db
                .query("blog_posts")
                .order("desc")
                .collect();
        }

        return {
            posts: limit ? posts.slice(0, limit) : posts,
            total: posts.length,
        };
    },
});

export const getPostBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, { slug }) => {
        return await ctx.db
            .query("blog_posts")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();
    },
});

export const getPostById = query({
    args: { id: v.id("blog_posts") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

/** Ensures slug is unique by appending -2, -3, etc. if needed */
async function ensureUniqueSlug(ctx: any, baseSlug: string, excludeId?: any): Promise<string> {
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
        const existing = await ctx.db
            .query("blog_posts")
            .withIndex("by_slug", (q: any) => q.eq("slug", slug))
            .first();
        if (!existing || (excludeId && existing._id === excludeId)) break;
        slug = `${baseSlug}-${suffix}`;
        suffix++;
    }
    return slug;
}

function estimateReadingTime(content: string): number {
    const text = content.replace(/<[^>]*>/g, "");
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

export const createPost = mutation({
    args: {
        title: v.string(),
        slug: v.optional(v.string()),
        content: v.string(),
        excerpt: v.optional(v.string()),
        cover_image_url: v.optional(v.string()),
        category_id: v.optional(v.id("blog_categories")),
        status: v.optional(v.string()),
        is_featured: v.optional(v.boolean()),
        tags: v.optional(v.array(v.string())),
        seo_title: v.optional(v.string()),
        seo_description: v.optional(v.string()),
        author_name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const baseSlug = args.slug || generateSlug(args.title);
        const slug = await ensureUniqueSlug(ctx, baseSlug);

        // Resolve category
        let category_name: string | undefined;
        let category_slug: string | undefined;
        if (args.category_id) {
            const cat = await ctx.db.get(args.category_id);
            category_name = cat?.name;
            category_slug = cat?.slug;
            // P4: increment post_count
            if (cat) {
                await ctx.db.patch(cat._id, { post_count: (cat.post_count || 0) + 1 });
            }
        }

        const status = (args.status || "draft") as "draft" | "review" | "published" | "scheduled" | "archived";

        const id = await ctx.db.insert("blog_posts", {
            title: args.title,
            slug,
            content: args.content,
            excerpt: args.excerpt,
            cover_image_url: args.cover_image_url,
            category_id: args.category_id,
            category_name,
            category_slug,
            status,
            is_featured: args.is_featured || false,
            tags: args.tags,
            reading_time_minutes: estimateReadingTime(args.content),
            author_name: args.author_name,
            seo_title: args.seo_title,
            seo_description: args.seo_description,
            published_at: status === "published" ? now : undefined,
            created_at: now,
            updated_at: now,
        });

        return { id, slug };
    },
});

export const updatePost = mutation({
    args: {
        id: v.id("blog_posts"),
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        content: v.optional(v.string()),
        excerpt: v.optional(v.string()),
        cover_image_url: v.optional(v.string()),
        category_id: v.optional(v.id("blog_categories")),
        status: v.optional(v.string()),
        is_featured: v.optional(v.boolean()),
        tags: v.optional(v.array(v.string())),
        seo_title: v.optional(v.string()),
        seo_description: v.optional(v.string()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Post not found");

        const patch: Record<string, any> = { updated_at: Date.now() };

        if (updates.title !== undefined) patch.title = updates.title;
        if (updates.slug !== undefined) {
            patch.slug = await ensureUniqueSlug(ctx, updates.slug, id);
        }
        if (updates.content !== undefined) {
            patch.content = updates.content;
            patch.reading_time_minutes = estimateReadingTime(updates.content);
        }
        if (updates.excerpt !== undefined) patch.excerpt = updates.excerpt;
        if (updates.cover_image_url !== undefined) patch.cover_image_url = updates.cover_image_url;
        if (updates.category_id !== undefined) {
            // P4: decrement old category, increment new
            if (existing.category_id && existing.category_id !== updates.category_id) {
                const oldCat = await ctx.db.get(existing.category_id);
                if (oldCat) await ctx.db.patch(oldCat._id, { post_count: Math.max(0, (oldCat.post_count || 0) - 1) });
            }
            patch.category_id = updates.category_id;
            const cat = await ctx.db.get(updates.category_id);
            patch.category_name = cat?.name;
            patch.category_slug = cat?.slug;
            if (cat && existing.category_id !== updates.category_id) {
                await ctx.db.patch(cat._id, { post_count: (cat.post_count || 0) + 1 });
            }
        }
        if (updates.status !== undefined) {
            patch.status = updates.status;
            if (updates.status === "published" && !existing.published_at) {
                patch.published_at = Date.now();
            }
        }
        if (updates.is_featured !== undefined) patch.is_featured = updates.is_featured;
        if (updates.tags !== undefined) patch.tags = updates.tags;
        if (updates.seo_title !== undefined) patch.seo_title = updates.seo_title;
        if (updates.seo_description !== undefined) patch.seo_description = updates.seo_description;

        await ctx.db.patch(id, patch);
        return { success: true };
    },
});

export const deletePost = mutation({
    args: { id: v.id("blog_posts") },
    handler: async (ctx, { id }) => {
        const post = await ctx.db.get(id);
        // P4: decrement category post_count
        if (post?.category_id) {
            const cat = await ctx.db.get(post.category_id);
            if (cat) await ctx.db.patch(cat._id, { post_count: Math.max(0, (cat.post_count || 0) - 1) });
        }
        // Delete associated comments
        const comments = await ctx.db
            .query("blog_comments")
            .withIndex("by_post", (q) => q.eq("post_id", id))
            .collect();
        for (const comment of comments) {
            await ctx.db.delete(comment._id);
        }
        await ctx.db.delete(id);
        return { success: true };
    },
});

// ═══════════════════════════════════════════════════════════
// BLOG CATEGORIES
// ═══════════════════════════════════════════════════════════

export const listCategories = query({
    handler: async (ctx) => {
        const categories = await ctx.db.query("blog_categories").collect();
        return { categories };
    },
});

export const createCategory = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const id = await ctx.db.insert("blog_categories", {
            name: args.name,
            slug: args.slug,
            description: args.description,
            post_count: 0,
            created_at: now,
            updated_at: now,
        });
        return { id };
    },
});

export const updateCategory = mutation({
    args: {
        id: v.id("blog_categories"),
        name: v.optional(v.string()),
        slug: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const patch: Record<string, any> = { updated_at: Date.now() };
        if (updates.name !== undefined) patch.name = updates.name;
        if (updates.slug !== undefined) patch.slug = updates.slug;
        if (updates.description !== undefined) patch.description = updates.description;

        await ctx.db.patch(id, patch);
        return { success: true };
    },
});

export const deleteCategory = mutation({
    args: { id: v.id("blog_categories") },
    handler: async (ctx, { id }) => {
        // Unlink posts from this category
        const posts = await ctx.db
            .query("blog_posts")
            .withIndex("by_category", (q) => q.eq("category_id", id))
            .collect();
        for (const post of posts) {
            await ctx.db.patch(post._id, { category_id: undefined, category_name: undefined });
        }
        await ctx.db.delete(id);
        return { success: true };
    },
});

// ═══════════════════════════════════════════════════════════
// BLOG COMMENTS
// ═══════════════════════════════════════════════════════════

export const listComments = query({
    args: {
        status: v.optional(v.string()),
        post_id: v.optional(v.id("blog_posts")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { status, post_id, limit }) => {
        let results;

        if (post_id && status) {
            results = await ctx.db
                .query("blog_comments")
                .withIndex("by_post_status", (q) =>
                    q.eq("post_id", post_id).eq("status", status as any)
                )
                .order("desc")
                .collect();
        } else if (post_id) {
            results = await ctx.db
                .query("blog_comments")
                .withIndex("by_post", (q) => q.eq("post_id", post_id))
                .order("desc")
                .collect();
        } else if (status) {
            results = await ctx.db
                .query("blog_comments")
                .withIndex("by_status", (q) => q.eq("status", status as any))
                .order("desc")
                .collect();
        } else {
            results = await ctx.db.query("blog_comments").order("desc").collect();
        }

        // Resolve post titles and nest replies
        const enriched = await Promise.all(
            results.map(async (c) => {
                const post = await ctx.db.get(c.post_id);
                return { ...c, post_title: post?.title || "Verwijderd", replies: [] as any[] };
            })
        );

        // Build parent→children tree
        const byId = new Map(enriched.map(c => [c._id, c]));
        const roots: typeof enriched = [];
        for (const comment of enriched) {
            if (comment.parent_id && byId.has(comment.parent_id)) {
                byId.get(comment.parent_id)!.replies.push(comment);
            } else {
                roots.push(comment);
            }
        }

        return {
            comments: limit ? roots.slice(0, limit) : roots,
            total: roots.length,
        };
    },
});

export const createComment = mutation({
    args: {
        post_id: v.id("blog_posts"),
        author_name: v.string(),
        author_email: v.optional(v.string()),
        content: v.string(),
        parent_id: v.optional(v.id("blog_comments")),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("blog_comments", {
            post_id: args.post_id,
            author_name: args.author_name,
            author_email: args.author_email,
            content: args.content,
            status: "pending",
            parent_id: args.parent_id,
            created_at: Date.now(),
        });
        return { id };
    },
});

export const moderateComment = mutation({
    args: {
        id: v.id("blog_comments"),
        action: v.union(v.literal("approve"), v.literal("reject")),
    },
    handler: async (ctx, { id, action }) => {
        const status = action === "approve" ? "approved" : "rejected";
        await ctx.db.patch(id, { status } as any);
        return { success: true };
    },
});

export const deleteComment = mutation({
    args: { id: v.id("blog_comments") },
    handler: async (ctx, { id }) => {
        // Delete child replies
        const replies = await ctx.db
            .query("blog_comments")
            .filter((q) => q.eq(q.field("parent_id"), id))
            .collect();
        for (const reply of replies) {
            await ctx.db.delete(reply._id);
        }
        await ctx.db.delete(id);
        return { success: true };
    },
});

// ═══════════════════════════════════════════════════════════
// BLOG CONFIG (Singleton)
// ═══════════════════════════════════════════════════════════

export const getConfig = query({
    handler: async (ctx) => {
        const config = await ctx.db.query("blog_config").first();
        return config || { enabled: true, comments_enabled: true, posts_per_page: 12 };
    },
});

export const updateConfig = mutation({
    args: {
        enabled: v.optional(v.boolean()),
        comments_enabled: v.optional(v.boolean()),
        posts_per_page: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("blog_config").first();
        const data = {
            enabled: args.enabled ?? existing?.enabled ?? true,
            comments_enabled: args.comments_enabled ?? existing?.comments_enabled ?? true,
            posts_per_page: args.posts_per_page ?? existing?.posts_per_page ?? 12,
            updated_at: Date.now(),
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
        } else {
            await ctx.db.insert("blog_config", data);
        }
        return { success: true };
    },
});
