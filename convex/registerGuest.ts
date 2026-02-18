import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { TENANT_ID, AUTH_API_URL } from "./authHelpers";

/**
 * Guest Registration Action
 * Creates a ghost user in the Go backend (password_hash = NULL)
 * and stores the registration in Convex with the linked authUserId.
 */
export const registerGuest = action({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("deelnemer"), v.literal("begeleider"), v.literal("vrijwilliger")),
        distance: v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15")),
        supportNeeded: v.union(v.literal("ja"), v.literal("nee"), v.literal("anders")),
        supportDescription: v.optional(v.string()),
        city: v.optional(v.string()),
        wheelchairUser: v.optional(v.boolean()),
        shuttleBus: v.optional(v.union(v.literal("pendelbus"), v.literal("eigen-vervoer"))),
        livesInFacility: v.optional(v.boolean()),
        participantType: v.optional(v.union(v.literal("doelgroep"), v.literal("verwant"), v.literal("anders"))),
        iceName: v.string(),
        icePhone: v.string(),
        agreedToTerms: v.boolean(),
        agreedToMedia: v.boolean(),
    },
    handler: async (ctx, args): Promise<string> => {


        // 1. Create ghost user in Go backend (password_hash = NULL)
        let authUserId: string | undefined;
        try {
            const ghostRes = await fetch(`${AUTH_API_URL}/guest/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Tenant-ID": TENANT_ID
                },
                body: JSON.stringify({
                    email: args.email,
                    full_name: args.name
                })
            });

            if (ghostRes.ok) {
                const ghostData = await ghostRes.json();
                // Normalize ID from Go response (pgtype.UUID returns as nested object or string)
                authUserId = ghostData.id || ghostData.ID;
                console.log(`[RegisterGuest] Ghost user created: ${authUserId}`);
            } else if (ghostRes.status === 409) {
                // Email already has an account — continue without linking
                console.warn(`[RegisterGuest] Email already registered in auth system, proceeding as unlinked guest`);
            } else {
                const errorText = await ghostRes.text();
                console.warn(`[RegisterGuest] Ghost API returned ${ghostRes.status}: ${errorText}`);
                // Don't block registration — guest can still register in Convex without auth link
            }
        } catch (e) {
            // Network error etc — don't block the guest registration
            console.warn("[RegisterGuest] Ghost API unreachable, proceeding without auth link:", e);
        }

        // 2. Store registration in Convex
        const registrationId = await ctx.runMutation(internal.internal.createRegistration, {
            ...args,
            userType: "guest",
            authUserId: authUserId  // Linked if ghost creation succeeded, undefined otherwise
        });

        console.log(`[RegisterGuest] Created registration: ${registrationId} (authUserId: ${authUserId || "none"})`);
        return registrationId;
    },
});
