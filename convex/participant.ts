import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

import { Doc } from "./_generated/dataModel";

export const getDashboardData = action({
    args: { token: v.string() },
    handler: async (ctx, args): Promise<{
        user: { email: string; id: string };
        registration: Doc<"registrations"> | null;
    }> => {
        const tenantId = process.env.TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";

        // 1. Verify Token via Auth API
        const res = await fetch("https://laventecareauthsystems.onrender.com/api/v1/me", {
            headers: {
                "Authorization": `Bearer ${args.token}`,
                "X-Tenant-ID": tenantId
            }
        });

        if (!res.ok) {
            throw new Error("Unauthorized");
        }

        const userData = await res.json();
        const user = userData.User || userData.user;
        const email = user.Email || user.email;

        // 2. Fetch Registration by Email
        // We use the internal query similar to admin fetch
        const registration = await ctx.runQuery(api.internal.getRegistrationByEmail, { email });

        return {
            user: { email, id: user.ID || user.id },
            registration
        };
    },
});
