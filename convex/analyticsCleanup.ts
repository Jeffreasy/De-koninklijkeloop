import { internalMutation } from "./_generated/server";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export const deleteOldEvents = internalMutation({
    handler: async (ctx) => {
        const cutoff = Date.now() - NINETY_DAYS_MS;
        const oldEvents = await ctx.db
            .query("analytics_events")
            .withIndex("by_timestamp", (q) => q.lt("timestamp", cutoff))
            .take(500);

        for (const event of oldEvents) {
            await ctx.db.delete(event._id);
        }

        if (oldEvents.length === 500) {
            console.log(`[Analytics Cleanup] Deleted 500 events, more remain. Next run will continue.`);
        } else {
            console.log(`[Analytics Cleanup] Deleted ${oldEvents.length} old events.`);
        }
    },
});
