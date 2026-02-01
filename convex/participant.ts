import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

import type { Doc } from "./_generated/dataModel";

export const getDashboardData = action({
    args: { token: v.string() },
    handler: async (ctx, args): Promise<{
        user: { email: string; id: string };
        registration: Doc<"registrations"> | null;
    }> => {
        const tenantId = "b2727666-7230-4689-b58b-ceab8c2898d5";

        console.log("[Convex] Step 1: Starting Fetch to Auth API...");
        try {
            const res = await fetch("https://laventecareauthsystems.onrender.com/api/v1/auth/me", {
                headers: {
                    "Authorization": `Bearer ${args.token}`,
                    "Cookie": `access_token=${args.token}; dkl_auth_token=${args.token}`,
                    "X-Tenant-ID": tenantId
                }
            });

            console.log(`[Convex] Step 2: Fetch Complete. Status: ${res.status}`);

            if (!res.ok) {
                console.error(`[Convex] Auth Verification Failed: ${res.status} ${res.statusText}`);
                throw new Error("Unauthorized");
            }

            console.log("[Convex] Step 3: Parsing JSON...");
            const userData = await res.json();
            console.log("[Convex] Step 4: JSON Parsed. Extracting User...");

            const user = userData.User || userData.user;
            if (!user) throw new Error("User data missing in Auth response");

            const email = user.Email || user.email;
            console.log(`[Convex] Step 5: User Identified (${email}). Fetching Registration...`);

            // 2. Fetch Registration by Email
            const registration = await ctx.runQuery(api.internal.getRegistrationByEmail, { email });
            console.log(`[Convex] Step 6: Registration Fetched:`, registration ? "FOUND" : "NULL");

            return {
                user: { email, id: user.ID || user.id },
                registration
            };
        } catch (e: any) {
            console.error("[Convex] CRITICAL ACTION ERROR:", e);
            throw e; // Ensure the client receives the error
        }
    },
});

