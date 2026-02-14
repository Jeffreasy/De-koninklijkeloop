import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export const prerender = false;

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

/**
 * Blog API Route — Intercepts /api/blog/* BEFORE the catch-all proxy.
 * Bridges frontend apiRequest() calls to Convex blog functions.
 */

// Allowed fields for Convex mutations (strips frontend extras like is_pinned, visibility)
const POST_CREATE_FIELDS = [
    "title", "slug", "content", "excerpt", "cover_image_url",
    "category_id", "status", "is_featured", "tags",
    "seo_title", "seo_description", "author_name",
] as const;

const POST_UPDATE_FIELDS = [
    "title", "slug", "content", "excerpt", "cover_image_url",
    "category_id", "status", "is_featured", "tags",
    "seo_title", "seo_description",
] as const;

function pick(obj: Record<string, any>, keys: readonly string[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key of keys) {
        if (key in obj && obj[key] !== undefined && obj[key] !== "") {
            result[key] = obj[key];
        }
    }
    return result;
}

/** Maps Convex _id → id so all frontend components work unchanged */
function normalize(data: any): any {
    if (Array.isArray(data)) return data.map(normalize);
    if (data && typeof data === "object") {
        const result: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (key === "_id") {
                result.id = value;
            } else if (key === "_creationTime") {
                result.created_at = value;
            } else if (Array.isArray(value)) {
                result[key] = value.map(normalize);
            } else {
                result[key] = value;
            }
        }
        return result;
    }
    return data;
}

export const ALL: APIRoute = async ({ request, params }) => {
    const path = params.path || "";
    const method = request.method;
    const segments = path.split("/").filter(Boolean);
    const url = new URL(request.url);

    try {
        // ─── POSTS ──────────────────────────────────────
        if (segments[0] === "posts") {
            const postId = segments[1];

            if (method === "GET" && !postId) {
                // GET /api/blog/posts?status=...&limit=...
                const status = url.searchParams.get("status") || undefined;
                const limit = url.searchParams.get("limit");
                const data = await convex.query(api.blog.listPosts, {
                    status: status || undefined,
                    limit: limit ? parseInt(limit) : undefined,
                });
                return json(normalize(data));
            }

            if (method === "POST" && !postId) {
                // POST /api/blog/posts
                const body = await request.json();
                const sanitized = pick(body, POST_CREATE_FIELDS);
                const result = await convex.mutation(api.blog.createPost, sanitized as any);
                return json(normalize(result), 201);
            }

            if ((method === "PATCH" || method === "PUT") && postId) {
                // PATCH|PUT /api/blog/posts/:id
                const body = await request.json();
                const sanitized = pick(body, POST_UPDATE_FIELDS);
                const result = await convex.mutation(api.blog.updatePost, {
                    id: postId as any,
                    ...sanitized,
                });
                return json(normalize(result));
            }

            if (method === "DELETE" && postId) {
                // DELETE /api/blog/posts/:id
                const result = await convex.mutation(api.blog.deletePost, {
                    id: postId as any,
                });
                return json(result);
            }
        }

        // ─── CATEGORIES ─────────────────────────────────
        if (segments[0] === "categories") {
            const catId = segments[1];

            if (method === "GET" && !catId) {
                const data = await convex.query(api.blog.listCategories);
                return json(normalize(data));
            }

            if (method === "POST" && !catId) {
                const body = await request.json();
                const result = await convex.mutation(api.blog.createCategory, body);
                return json(normalize(result), 201);
            }

            if (method === "PUT" && catId) {
                const body = await request.json();
                const result = await convex.mutation(api.blog.updateCategory, {
                    id: catId as any,
                    ...body,
                });
                return json(normalize(result));
            }

            if (method === "DELETE" && catId) {
                const result = await convex.mutation(api.blog.deleteCategory, {
                    id: catId as any,
                });
                return json(result);
            }
        }

        // ─── COMMENTS ───────────────────────────────────
        if (segments[0] === "comments") {
            const commentId = segments[1];
            const action = segments[2]; // approve|reject

            if (method === "GET" && !commentId) {
                const status = url.searchParams.get("status") || undefined;
                const limit = url.searchParams.get("limit");
                const postId = url.searchParams.get("post_id") || undefined;
                const data = await convex.query(api.blog.listComments, {
                    status: status || undefined,
                    post_id: postId as any,
                    limit: limit ? parseInt(limit) : undefined,
                });
                return json(normalize(data));
            }

            if (method === "POST" && !commentId) {
                const body = await request.json();
                const result = await convex.mutation(api.blog.createComment, body);
                return json(normalize(result), 201);
            }

            if (method === "PATCH" && commentId && action) {
                // PATCH /api/blog/comments/:id/approve or /reject
                const result = await convex.mutation(api.blog.moderateComment, {
                    id: commentId as any,
                    action: action as "approve" | "reject",
                });
                return json(result);
            }

            if (method === "DELETE" && commentId) {
                const result = await convex.mutation(api.blog.deleteComment, {
                    id: commentId as any,
                });
                return json(result);
            }
        }

        // ─── CONFIG ─────────────────────────────────────
        if (segments[0] === "config") {
            if (method === "GET") {
                const data = await convex.query(api.blog.getConfig);
                return json(data);
            }
            if (method === "POST") {
                const body = await request.json();
                const result = await convex.mutation(api.blog.updateConfig, body);
                return json(result);
            }
        }

        return json({ error: "Blog route not found" }, 404);
    } catch (err: any) {
        console.error("[Blog API]", err);
        return json({ error: err.message || "Internal server error" }, 500);
    }
};

function json(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
