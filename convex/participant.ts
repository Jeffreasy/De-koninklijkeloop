import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

import type { Doc } from "./_generated/dataModel";

export const getDashboardData = action({
    args: {
        token: v.string(),
        tenantId: v.string() // ✅ Not hardcoded anymore
    },
    handler: async (ctx, args): Promise<{
        user: { email: string; id: string };
        registration: Doc<"registrations"> | null;
    }> => {
        try {
            // ✅ Removed Cookie header injection - only use Authorization header
            const res = await fetch(
                "https://laventecareauthsystems.onrender.com/api/v1/auth/me",
                {
                    headers: {
                        "Authorization": `Bearer ${args.token}`,
                        "X-Tenant-ID": args.tenantId
                    }
                }
            );

            if (!res.ok) {
                throw new Error(`Auth verification failed: ${res.status}`);
            }

            const userData = await res.json();
            const user = userData.User || userData.user;

            if (!user) {
                throw new Error("User data missing in Auth response");
            }

            const email = user.Email || user.email;

            // Fetch registration by email
            const registration = await ctx.runQuery(
                api.internal.getRegistrationByEmail,
                { email }
            );

            return {
                user: { email, id: user.ID || user.id },
                registration
            };
        } catch (e: any) {
            console.error("[Convex] Dashboard data error:", e.message);
            throw e;
        }
    },
});
