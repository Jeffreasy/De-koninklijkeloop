import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { verifyAuth, AUTH_API_URL, TENANT_ID } from "./authHelpers";


// Shared group member validator (mirrors internal.ts)
const groupMemberValidator = v.object({
    name: v.string(),
    distance: v.optional(v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15"))),
    wheelchairUser: v.optional(v.boolean()),
    shuttleBus: v.optional(v.union(v.literal("pendelbus"), v.literal("eigen-vervoer"))),
    supportNeeded: v.optional(v.union(v.literal("ja"), v.literal("nee"), v.literal("anders"))),
    supportDescription: v.optional(v.string()),
    livesInFacility: v.optional(v.boolean()),
    participantType: v.optional(v.union(v.literal("doelgroep"), v.literal("verwant"), v.literal("anders"))),
    agreedToMedia: v.optional(v.boolean()),
    iceName: v.optional(v.string()),
    icePhone: v.optional(v.string()),
});

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
        // Begeleider companion linking (1-op-1)
        companionName: v.optional(v.string()),
        companionEmail: v.optional(v.string()),
        // Groepsregistratie: embedded deelnemers array
        groupMembers: v.optional(v.array(groupMemberValidator)),
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
            groupMembers: args.groupMembers,
        });
    },
});


export const deleteRegistration = action({
    args: {
        token: v.string(),
        id: v.id("registrations"),
    },
    handler: async (ctx, args) => {
        await verifyAuth(args.token, { requiredRoles: ["admin", "editor"] });

        // 1. Fetch authUserId before deleting (ghost user cleanup)
        const registration = await ctx.runQuery(internal.internal.getRegistrationById, { id: args.id });

        // 2. Clean up linked PostgreSQL ghost user (fire-and-forget — never blocks delete)
        if (registration?.authUserId) {
            const serviceKey = process.env.INTERNAL_SERVICE_KEY;
            if (serviceKey) {
                try {
                    const res = await fetch(`${AUTH_API_URL}/guest/${registration.authUserId}`, {
                        method: "DELETE",
                        headers: {
                            "X-Tenant-ID": TENANT_ID,
                            "X-Service-Key": serviceKey,
                        },
                    });
                    if (!res.ok && res.status !== 200) {
                        console.warn(`[deleteRegistration] Ghost user cleanup returned ${res.status} for authUserId=${registration.authUserId}`);
                    } else {
                        console.log(`[deleteRegistration] Ghost user ${registration.authUserId} removed from PostgreSQL`);
                    }
                } catch (e) {
                    // Network error — log and continue, don't block the Convex delete
                    console.warn("[deleteRegistration] Ghost user cleanup failed (network):", e);
                }
            } else {
                console.warn("[deleteRegistration] INTERNAL_SERVICE_KEY not set — skipping ghost user cleanup");
            }
        }

        // 3. Delete from Convex (always happens, even if Go cleanup failed)
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

