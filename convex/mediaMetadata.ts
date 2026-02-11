import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Media Metadata Functions
 * For managing alt-text and metadata for ImageKit images (legacy field names from Cloudinary)
 */

/**
 * Get all media metadata
 * Used to merge with ImageKit images in admin panel
 */
export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("media_metadata").collect();
    },
});

/**
 * Get metadata for specific image by public_id
 */
export const getByPublicId = query({
    args: { cloudinary_public_id: v.string() },
    handler: async (ctx, { cloudinary_public_id }) => {
        return await ctx.db
            .query("media_metadata")
            .withIndex("by_public_id", (q) => q.eq("cloudinary_public_id", cloudinary_public_id))
            .first();
    },
});

/**
 * Get metadata by folder (e.g., "De Koninklijkeloop/DKLFoto's 2024")
 */
export const getByFolder = query({
    args: { folder: v.string() },
    handler: async (ctx, { folder }) => {
        return await ctx.db
            .query("media_metadata")
            .withIndex("by_folder", (q) => q.eq("folder", folder))
            .collect();
    },
});

/**
 * Save or update metadata for a single image (alt text, title, tags)
 */
export const saveAltText = mutation({
    args: {
        cloudinary_public_id: v.string(),
        alt_text: v.string(),
        title: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        folder: v.optional(v.string()),
        token: v.string(), // Admin auth token
    },
    handler: async (ctx, { cloudinary_public_id, alt_text, title, tags, folder, token }) => {
        // TODO: Verify admin auth via token
        // For now, we trust the client (admin panel is behind auth middleware)

        const existing = await ctx.db
            .query("media_metadata")
            .withIndex("by_public_id", (q) => q.eq("cloudinary_public_id", cloudinary_public_id))
            .first();

        if (existing) {
            // Update existing metadata
            await ctx.db.patch(existing._id, {
                alt_text,
                title,
                tags,
                updated_at: Date.now(),
            });

            return {
                success: true,
                action: "updated",
                cloudinary_public_id
            };
        } else {
            // Create new metadata entry
            await ctx.db.insert("media_metadata", {
                cloudinary_public_id,
                alt_text,
                title,
                tags,
                folder,
                updated_by: "admin", // TODO: Extract from token
                updated_at: Date.now(),
            });

            return {
                success: true,
                action: "created",
                cloudinary_public_id
            };
        }
    },
});

/**
 * Bulk update alt texts for multiple images
 * Used in bulk edit modal
 */
export const bulkSave = mutation({
    args: {
        updates: v.array(
            v.object({
                cloudinary_public_id: v.string(),
                alt_text: v.string(),
                folder: v.optional(v.string()),
            })
        ),
        token: v.string(),
    },
    handler: async (ctx, { updates, token }) => {
        // TODO: Verify admin auth via token

        let created = 0;
        let updated = 0;

        for (const { cloudinary_public_id, alt_text, folder } of updates) {
            const existing = await ctx.db
                .query("media_metadata")
                .withIndex("by_public_id", (q) => q.eq("cloudinary_public_id", cloudinary_public_id))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    alt_text,
                    updated_at: Date.now(),
                });
                updated++;
            } else {
                await ctx.db.insert("media_metadata", {
                    cloudinary_public_id,
                    alt_text,
                    folder,
                    updated_by: "admin",
                    updated_at: Date.now(),
                });
                created++;
            }
        }

        return {
            success: true,
            total: updates.length,
            created,
            updated,
        };
    },
});

/**
 * Delete metadata for a specific image
 * (Optional - for cleanup)
 */
export const deleteMetadata = mutation({
    args: {
        cloudinary_public_id: v.string(),
        token: v.string(),
    },
    handler: async (ctx, { cloudinary_public_id, token }) => {
        // TODO: Verify admin auth

        const existing = await ctx.db
            .query("media_metadata")
            .withIndex("by_public_id", (q) => q.eq("cloudinary_public_id", cloudinary_public_id))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            return { success: true, deleted: true };
        }

        return { success: false, deleted: false };
    },
});

/**
 * Get statistics about alt-text coverage
 */
export const getStats = query({
    handler: async (ctx) => {
        const allMetadata = await ctx.db.query("media_metadata").collect();

        const total = allMetadata.length;
        const withAltText = allMetadata.filter(m => m.alt_text && m.alt_text.length > 0).length;
        const missing = total - withAltText;
        const coverage = total > 0 ? Math.round((withAltText / total) * 100) : 0;

        return {
            total,
            withAltText,
            missing,
            coverage,
        };
    },
});
