import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { TENANT_ID, AUTH_API_URL } from "./authHelpers";

/**
 * ClaimGuest Action
 *
 * Converts a guest registration into a fully authenticated account.
 *
 * Flow:
 *  1. POST /auth/register → creates account in Go backend
 *  2. promoteRegistration() → Convex patches userType: "guest" → "authenticated"
 *
 * Edge cases:
 *  - 409: Account already exists → auto-trigger password reset (15 min token)
 *  - 400: Validation failure (e.g. password too short)
 *  - 404: Email not found in auth system
 */
export const claimGuestRegistration = action({
    args: {
        email: v.string(),
        password: v.string(),
        fullName: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<{ registrationId: string; authUserId: string; resetSent?: boolean }> => {
        // 1. Register in Go backend
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
                // Account already exists — send a password reset email instead
                console.log(`[ClaimGuest] 409 for ${args.email} — triggering password reset`);
                try {
                    await fetch(`${AUTH_API_URL}/auth/password/forgot`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Tenant-ID": TENANT_ID,
                        },
                        body: JSON.stringify({ email: args.email }),
                    });
                } catch (resetErr) {
                    console.error("[ClaimGuest] Failed to trigger password reset:", resetErr);
                }
                // Return sentinel so UI can show "check your email for reset link"
                return { registrationId: "", authUserId: "", resetSent: true };
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



