import { internalMutation } from "./_generated/server";

/**
 * Sync Current Participants Count
 * Manually sync the current_participants count with actual registrations
 */
export const syncParticipantCount = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Count active registrations
        const registrations = await ctx.db
            .query("registrations")
            .filter((q) => q.eq(q.field("status"), "confirmed"))
            .collect();

        const count = registrations.length;

        // Get active settings
        const settings = await ctx.db
            .query("event_settings")
            .filter((q) => q.eq(q.field("is_active"), true))
            .first();

        if (!settings) {
            throw new Error("No active event settings found");
        }

        // Update count
        await ctx.db.patch(settings._id, {
            current_participants: count,
        });

        console.log(`[syncParticipantCount] Updated count to ${count} participants`);

        return {
            success: true,
            count,
            previous: settings.current_participants,
        };
    },
});
