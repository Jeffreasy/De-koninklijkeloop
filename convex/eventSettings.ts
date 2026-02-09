import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get active event settings
 * Used by frontend components to display event information
 */
export const getActiveSettings = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("event_settings")
            .filter(q => q.eq(q.field("is_active"), true))
            .first();
    },
});

/**
 * Update event settings
 * Admin only - requires token validation
 */
export const updateSettings = mutation({
    args: {
        // Basic Event Info
        name: v.optional(v.string()),
        tagline: v.optional(v.string()),
        description: v.optional(v.string()),

        // Date & Time
        event_date: v.optional(v.string()),
        event_date_display: v.optional(v.string()),
        registration_open: v.optional(v.boolean()),
        registration_deadline: v.optional(v.string()),

        // Location
        location_name: v.optional(v.string()),
        location_city: v.optional(v.string()),
        start_location: v.optional(v.string()),
        finish_location: v.optional(v.string()),
        route_description: v.optional(v.string()),

        // Capacity
        max_participants: v.optional(v.number()),

        // Distances
        available_distances: v.optional(v.array(
            v.object({
                km: v.string(),
                label: v.string(),
                description: v.optional(v.string()),
            })
        )),

        // Media
        hero_video_id: v.optional(v.string()),
        hero_image_url: v.optional(v.string()),

        // Contact
        contact_email: v.optional(v.string()),

        // Email Settings
        send_confirmation_emails: v.optional(v.boolean()),
        email_sender: v.optional(v.string()),

        // Payment Settings
        payment_provider: v.optional(v.string()),
        payment_api_key: v.optional(v.string()),

        // Mobile App
        mobile_app_enabled: v.optional(v.boolean()),
        mobile_app_url: v.optional(v.string()),
        mobile_app_status: v.optional(v.union(v.literal("coming_soon"), v.literal("live"), v.literal("beta"))),

        // Auth
        token: v.string(), // Admin auth token (validated against LaventeCare)
    },
    handler: async (ctx, args) => {
        // TODO: Validate admin token with LaventeCare Auth System
        // For now, we trust the middleware has validated the user

        const current = await ctx.db
            .query("event_settings")
            .filter(q => q.eq(q.field("is_active"), true))
            .first();

        if (!current) {
            throw new Error("No active event settings found. Please run seed script first.");
        }

        const { token, ...updates } = args;

        // Filter out undefined values
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
        );

        await ctx.db.patch(current._id, {
            ...filteredUpdates,
            updated_at: Date.now(),
            // TODO: updated_by: admin email from token validation
        });

        return { success: true, id: current._id };
    },
});

/**
 * Update participant count
 * Internal mutation called after registration changes
 */
export const updateParticipantCount = internalMutation({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db
            .query("event_settings")
            .filter(q => q.eq(q.field("is_active"), true))
            .first();

        if (!settings) {
            console.warn("No active event settings found");
            return;
        }

        // Count active registrations (not cancelled, excluding 2025 archive)
        const registrations = await ctx.db.query("registrations").collect();
        const count = registrations.filter(
            r => r.status !== "cancelled" && r.edition !== "2025"
        ).length;

        await ctx.db.patch(settings._id, {
            current_participants: count,
            updated_at: Date.now(),
        });

        console.log(`Updated participant count: ${count}`);
    },
});
