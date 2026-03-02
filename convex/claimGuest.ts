import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { TENANT_ID, AUTH_API_URL } from "./authHelpers";

/**
 * ClaimGuest Action
 *
 * Converts a guest registration into a fully authenticated account.
 * The guest already has a ghost user in the Go auth backend (password_hash = NULL).
 * This action sets a password (promoting the ghost) and links the Convex registration.
 *
 * Flow:
 *  1. POST /auth/register → Go auto-detects ghost user → sets password → same user_id preserved
 *  2. promoteRegistration() → Convex patches userType: "guest" → "authenticated"
 *
 * Edge cases handled:
 *  - Email not a ghost (already has password) → 409 from Go → clear error to user
 *  - Email not in Convex at all → promoteRegistration throws
 *  - Network failure at Go → throw (guest stays guest, user can retry)
 */
export const claimGuestRegistration = action({
    args: {
        email: v.string(),
        password: v.string(),
        fullName: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<{ registrationId: string; authUserId: string }> => {
        // 1. Promote ghost user → set password in Go backend
        const authRes = await fetch(`${AUTH_API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Tenant-ID": TENANT_ID,
            },
            body: JSON.stringify({
                email: args.email,
                password: args.password,
                full_name: args.fullName || args.email.split("@")[0],
            }),
        });

        if (!authRes.ok) {
            const errorText = await authRes.text();
            console.error(`[ClaimGuest] Auth API failed: ${authRes.status} - ${errorText}`);

            if (authRes.status === 409) {
                // Ghost already promoted OR full account exists
                throw new Error(
                    "Je hebt al een volledig account met dit e-mailadres. Log in via de normale weg."
                );
            }
            if (authRes.status === 404) {
                throw new Error(
                    "Geen gastregistratie gevonden voor dit e-mailadres. Controleer het adres en probeer opnieuw."
                );
            }
            throw new Error(`Account aanmaken mislukt. Probeer het later opnieuw. (${authRes.status})`);
        }

        // 2. Normalize the returned auth user ID
        let authUserId: string;
        try {
            const authData = await authRes.json();
            // Go backend may return: {User:{ID}}, {user:{id}}, {id}, {user_id}, or {data:{id}}
            const rawUser = authData.User || authData.user || authData.data || authData;
            const id =
                rawUser?.ID ||
                rawUser?.id ||
                authData.id ||
                authData.user_id ||
                authData.userId;
            if (!id) {
                console.error("[ClaimGuest] Full auth response:", JSON.stringify(authData));
                throw new Error("Auth response missing user ID");
            }
            authUserId = String(id);
        } catch (e) {
            console.error("[ClaimGuest] Could not parse auth response:", e);
            throw new Error("Onverwachte responsvorm van de auth server. Meld dit aan de beheerder.");
        }

        // 3. Promote Convex registration: guest → authenticated
        const registrationId = await ctx.runMutation(internal.internal.promoteRegistration, {
            email: args.email,
            authUserId,
        });

        console.log(`[ClaimGuest] Promoted: ${args.email} → authUserId: ${authUserId}, regId: ${registrationId}`);

        return { registrationId: registrationId.toString(), authUserId };
    },
});
