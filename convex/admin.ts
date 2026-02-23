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
        supportNeeded: v.optional(v.union(v.literal("ja"), v.literal("nee"), v.literal("anders"))),
        supportDescription: v.optional(v.string()),
        city: v.optional(v.string()),
        wheelchairUser: v.optional(v.boolean()),
        shuttleBus: v.optional(v.union(v.literal("pendelbus"), v.literal("eigen-vervoer"))),
        livesInFacility: v.optional(v.boolean()),
        participantType: v.optional(v.union(v.literal("doelgroep"), v.literal("verwant"), v.literal("anders"))),
        // Begeleider companion linking
        companionName: v.optional(v.string()),
        companionEmail: v.optional(v.string()),
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
            icePhone: args.icePhone,
            supportNeeded: args.supportNeeded,
            supportDescription: args.supportDescription,
            city: args.city,
            wheelchairUser: args.wheelchairUser,
            shuttleBus: args.shuttleBus,
            livesInFacility: args.livesInFacility,
            participantType: args.participantType,
            companionName: args.companionName,
            companionEmail: args.companionEmail,
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

/**
 * Mark a registration as having received a confirmation email.
 * Called by the admin UI after the email is successfully sent via /api/send-confirmation.
 * Records who sent it and when.
 */
export const markConfirmationSent = action({
    args: {
        token: v.string(),
        id: v.id("registrations"),
        sentAt: v.number(),      // Unix ms timestamp from the API response
        sentBy: v.string(),      // Email of the admin/editor
    },
    handler: async (ctx, args) => {
        await verifyAuth(args.token, { requiredRoles: ["admin", "editor"] });

        await ctx.runMutation(internal.internal.updateRegistration, {
            id: args.id,
            confirmationSentAt: args.sentAt,
            confirmationSentBy: args.sentBy,
        });
    },
});

