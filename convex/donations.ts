/**
 * TRUST BOUNDARY: Mutations in this file are admin-only.
 * Security relies on SSR middleware auth (admin pages are gated).
 * TODO: Convert critical mutations to action() + verifyAuth() for defense-in-depth.
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the currently active donation campaign
 * Publicly accessible for the frontend widget
 */
export const getActiveCampaign = query({
    args: {},
    handler: async (ctx) => {
        const campaign = await ctx.db
            .query("donation_campaigns")
            .withIndex("by_active", (q) => q.eq("is_active", true))
            .first();

        return campaign;
    },
});

/**
 * Get all campaigns (Admin only)
 */
export const getAllCampaigns = query({
    args: {},
    handler: async (ctx) => {
        // TODO: Add auth check here if needed, but dashboard usually handles it
        // For strictness we could check context auth
        const campaigns = await ctx.db
            .query("donation_campaigns")
            .withIndex("by_year")
            .order("desc") // Newest years first
            .collect();
        return campaigns;
    },
});

/**
 * Create a new campaign (Admin)
 */
export const createCampaign = mutation({
    args: {
        year: v.string(),
        title: v.string(),
        gofundme_url: v.string(),
        description: v.optional(v.string()),
        target_amount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Deactivate others if this is the first one? 
        // Or just let user toggle it. Let's make it inactive by default unless it's the only one.
        const existing = await ctx.db.query("donation_campaigns").first();
        const is_active = !existing; // If no campaigns exist, make this one active

        await ctx.db.insert("donation_campaigns", {
            year: args.year,
            title: args.title,
            gofundme_url: args.gofundme_url,
            description: args.description,
            target_amount: args.target_amount,
            current_amount: 0,
            is_active,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
    },
});

/**
 * Toggle a campaign as active (Admin)
 */
export const toggleActive = mutation({
    args: { id: v.id("donation_campaigns") },
    handler: async (ctx, args) => {
        const campaign = await ctx.db.get(args.id);
        if (!campaign) throw new Error("Campaign not found");

        if (campaign.is_active) {
            // Cannot deactivate the only active campaign directly?
            // User should probably activate another one instead.
            // But let's allow toggling off for now.
            await ctx.db.patch(args.id, { is_active: false });
        } else {
            // Deactivate all others first
            const allActive = await ctx.db
                .query("donation_campaigns")
                .withIndex("by_active", (q) => q.eq("is_active", true))
                .collect();

            for (const c of allActive) {
                await ctx.db.patch(c._id, { is_active: false });
            }

            // Activate this one
            await ctx.db.patch(args.id, { is_active: true });
        }
    },
});

/**
 * Update campaign details (Admin)
 */
export const updateCampaign = mutation({
    args: {
        id: v.id("donation_campaigns"),
        title: v.optional(v.string()),
        gofundme_url: v.optional(v.string()),
        description: v.optional(v.string()),
        target_amount: v.optional(v.number()),
        current_amount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            updated_at: Date.now(),
        });
    },
});
