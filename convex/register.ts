import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { TENANT_ID, AUTH_API_URL } from "./authHelpers";

export const registerParticipant = action({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        role: v.union(v.literal("deelnemer"), v.literal("begeleider"), v.literal("vrijwilliger")),
        distance: v.optional(v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15"))),
        supportNeeded: v.optional(v.union(v.literal("ja"), v.literal("nee"), v.literal("anders"))),
        supportDescription: v.optional(v.string()),
        companionName: v.optional(v.string()),
        companionEmail: v.optional(v.string()),
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
        // 1. Create User in Auth System (or auto-promote ghost user)
        // The Go backend auto-detects ghost users (password_hash IS NULL)
        // and promotes them by setting the password — same user_id preserved.
        const authRes = await fetch(`${AUTH_API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Tenant-ID": TENANT_ID
            },
            body: JSON.stringify({
                email: args.email,
                password: args.password
            })
        });

        if (!authRes.ok) {
            const errorText = await authRes.text();
            console.error(`[Register] Auth API Failed: ${authRes.status} - ${errorText}`);

            if (authRes.status === 409) {
                throw new Error("Dit e-mailadres is al in gebruik (Auth).");
            }
            if (authRes.status === 500 && errorText.includes("Registration failed")) {
                throw new Error("Dit e-mailadres is al bekend. Log in of gebruik een ander adres.");
            }
            throw new Error(`Registratie mislukt: ${errorText}`);
        }

        // 2. Normalize Auth User ID
        let authUserId: string | undefined;
        try {
            const authData = await authRes.json();
            const rawUser = authData.User || authData.user;
            authUserId = rawUser?.ID || rawUser?.id;
        } catch (e) {
            console.warn("[Register] Could not parse Auth response JSON, proceeding without linking ID.", e);
        }

        // 3. Store/Update Registration in Convex
        // Try creating a new registration first. If the email already exists
        // (guest registered earlier), promote the existing guest record instead.
        const { password, ...registrationData } = args;

        let registrationId: string;
        try {
            registrationId = await ctx.runMutation(internal.internal.createRegistration, {
                ...registrationData,
                userType: "authenticated",
                authUserId: authUserId
            });
        } catch (e: any) {
            // Duplicate email for this edition → guest exists, promote it
            if (e.message?.includes("al geregistreerd") && authUserId) {
                registrationId = await ctx.runMutation(internal.internal.promoteRegistration, {
                    email: args.email,
                    authUserId: authUserId,
                });
                console.log(`[Register] Ghost user promoted in Convex: ${registrationId}`);
            } else {
                throw e; // Re-throw unexpected errors
            }
        }

        return registrationId;
    },
});
