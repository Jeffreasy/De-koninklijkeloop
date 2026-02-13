import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * One-time fix script — converts registration edition to "2026".
 * Use via Convex dashboard: npx convex run fixData:fixEdition --args '{"id": "..."}'
 * NOT callable from client.
 */
export const fixEdition = internalMutation({
    args: {
        id: v.string()
    },
    handler: async (ctx, args) => {
        const id = args.id as Id<"registrations">;
        await ctx.db.patch(id, { edition: "2026" });
        return "Updated edition to 2026";
    },
});
