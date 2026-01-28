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
        agreedToTerms: v.boolean(),
    },
    handler: async (ctx, args): Promise<string> => {
        const tenantId = process.env.TENANT_ID || "c3888c7e-44cf-4827-9a7d-adaae2a1a095";

        // 1. Create User in Auth System
        const authRes = await fetch("https://laventecareauthsystems.onrender.com/api/v1/auth/register", {
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

            // Map common errors or return generic
            if (authRes.status === 409) {
                throw new Error("Dit e-mailadres is al in gebruik (Auth).");
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
            authUserId: authUserId
        });

        return registrationId;
    },
});
