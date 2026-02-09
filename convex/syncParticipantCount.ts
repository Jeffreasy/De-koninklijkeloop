import { internalMutation } from "./_generated/server";

/**
 * Sync Current Participants Count
 * Manually sync the current_participants count with actual registrations
 */
export const syncParticipantCount = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Count active registrations (not cancelled) for the CURRENT edition only
        const allRegistrations = await ctx.db
            .query("registrations")
            .collect();

        // Filter: non-cancelled registrations for edition 2026 (exclude 2025 archive)
        const count = allRegistrations.filter(
            r => r.status !== "cancelled" && r.edition !== "2025"
        ).length;

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
