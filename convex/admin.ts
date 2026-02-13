import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { verifyAuth } from "./authHelpers";

export const getRegistrations = action({
    args: { token: v.string() },
    handler: async (ctx, args): Promise<any> => {
        await verifyAuth(args.token, { requiredRoles: ["admin", "editor"] });

        const data = await ctx.runQuery(internal.internal.listRegistrations, {});
        return data;
    },
});

// Admin action to update registration
export const updateRegistration = action({
    args: {
        token: v.string(),
        id: v.id("registrations"),
        status: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled"))),
        notes: v.optional(v.string()),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        role: v.optional(v.union(v.literal("deelnemer"), v.literal("begeleider"), v.literal("vrijwilliger"))),
        distance: v.optional(v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15"))),
        iceName: v.optional(v.string()),
        icePhone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await verifyAuth(args.token, { requiredRoles: ["admin", "editor"] });

        await ctx.runMutation(internal.internal.updateRegistration, {
            id: args.id,
            status: args.status,
            notes: args.notes,
            name: args.name,
            email: args.email,
            role: args.role,
            distance: args.distance,
            iceName: args.iceName,
            icePhone: args.icePhone
        });
    },
});

export const deleteRegistration = action({
    args: {
        token: v.string(),
        id: v.id("registrations"),
    },
    handler: async (ctx, args) => {
        await verifyAuth(args.token, { requiredRoles: ["admin"] });

        await ctx.runMutation(internal.internal.deleteRegistration, { id: args.id });
    },
});
