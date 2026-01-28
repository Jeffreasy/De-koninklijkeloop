import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getDashboardData = action({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const tenantId = process.env.TENANT_ID || "c3888c7e-44cf-4827-9a7d-adaae2a1a095";

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
