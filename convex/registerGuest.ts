import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Guest Registration Action
 * Allows users to register for the event WITHOUT creating a LaventeCare account
 * No password required, no Auth API call
 */
export const registerGuest = action({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("deelnemer"), v.literal("begeleider"), v.literal("vrijwilliger")),
        distance: v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15")),
        supportNeeded: v.union(v.literal("ja"), v.literal("nee"), v.literal("anders")),
        supportDescription: v.optional(v.string()),
        iceName: v.string(),
        icePhone: v.string(),
        agreedToTerms: v.boolean(),
        agreedToMedia: v.boolean(),
    },
    handler: async (ctx, args): Promise<string> => {
        // NO LaventeCare Auth System call - this is a guest registration
        // Guests cannot log in or access the dashboard

        // Store registration in Convex with userType: "guest"
        const registrationId = await ctx.runMutation(internal.internal.createRegistration, {
            ...args,
            userType: "guest",
            authUserId: undefined  // No linked account
        });

        console.log(`[RegisterGuest] Created guest registration: ${registrationId}`);

        return registrationId;
    },
});
