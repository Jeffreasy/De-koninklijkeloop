import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

export const registerParticipant = action({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
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
        // Force the correct Tenant ID to avoid stale Environment Variables in Convex Cloud
        const tenantId = "b2727666-7230-4689-b58b-ceab8c2898d5";

        // 1. Create User in Auth System
        const API_URL = process.env.LAVENTECARE_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
        const authRes = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Tenant-ID": tenantId
            },
            body: JSON.stringify({
                email: args.email,
                password: args.password
            })
        });

        if (!authRes.ok) {
            const errorText = await authRes.text();
            console.error(`[Register] Auth API Failed: ${authRes.status} - ${errorText}`);

            // Map common errors
            if (authRes.status === 409) {
                throw new Error("Dit e-mailadres is al in gebruik (Auth).");
            }
            // WORKAROUND: Auth System returns 500 for duplicates currently
            if (authRes.status === 500 && errorText.includes("Registration failed")) {
                throw new Error("Dit e-mailadres is al bekend. Log in of gebruik een ander adres.");
            }
            throw new Error(`Registratie mislukt: ${errorText}`);
        }

        // 2. Normalize Auth User ID
        let authUserId: string | undefined;
        try {
            const authData = await authRes.json();
            // Handle PascalCase or snake_case
            const rawUser = authData.User || authData.user;
            authUserId = rawUser?.ID || rawUser?.id;
        } catch (e) {
            console.warn("[Register] Could not parse Auth response JSON, proceeding without linking ID.", e);
        }

        // 3. Store Registration in Convex (Internal Mutation)
        // We filter out 'password' before passing to DB
        const { password, ...registrationData } = args;

        const registrationId = await ctx.runMutation(internal.internal.createRegistration, {
            ...registrationData,
            userType: "authenticated",
            authUserId: authUserId
        });

        return registrationId;
    },
});
