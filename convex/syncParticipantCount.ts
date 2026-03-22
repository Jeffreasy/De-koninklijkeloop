import { internalMutation } from "./_generated/server";

/**
 * Sync Current Participants Count
 * Manually sync the current_participants count with actual registrations.
 *
 * Counting rules:
 *   - role === "deelnemer"   → +1
 *   - role === "begeleider"  → +groupMembers.length (begeleider zelf telt NIET)
 *   - role === "vrijwilliger" → 0 (telt nooit mee in capaciteit)
 */
export const syncParticipantCount = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Only count for current edition, exclude cancelled registrations
        const allRegistrations = await ctx.db
            .query("registrations")
            .collect();

        const active = allRegistrations.filter(
            r => r.status !== "cancelled" && r.edition !== "2025"
        );

        let count = 0;
        for (const reg of active) {
            if (reg.role === "deelnemer") {
                count += 1;
            } else if (reg.role === "begeleider") {
                // Groepsregistratie: elke embedded deelnemer telt als 1 capaciteitsplaats
                count += (reg.groupMembers?.length ?? 0);
            }
            // vrijwilligers tellen nooit mee in capaciteit
        }

        // Get active event settings
        const settings = await ctx.db
            .query("event_settings")
            .filter((q) => q.eq(q.field("is_active"), true))
            .first();

        if (!settings) {
            throw new Error("No active event settings found");
        }

        await ctx.db.patch(settings._id, {
            current_participants: count,
        });

        console.log(`[syncParticipantCount] Updated count to ${count} participants (${active.length} registrations, incl. group members)`);

        return {
            success: true,
            count,
            previous: settings.current_participants,
        };
    },
});
