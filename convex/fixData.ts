import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const fixEdition = mutation({
    args: {
        id: v.string() // Accept string, cast to ID inside to be safe/flexible
    },
    handler: async (ctx, args) => {
        const id = args.id as Id<"registrations">;
        await ctx.db.patch(id, { edition: "2026" });
        return "Updated edition to 2026";
    },
});
