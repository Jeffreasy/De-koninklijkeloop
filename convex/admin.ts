import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getRegistrations = action({
    args: { token: v.string() },
    handler: async (ctx, args): Promise<any> => {
        const tenantId = process.env.TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";

        // 1. Verify Token via Auth API
        // 1. Verify Token via Auth API
        const res = await fetch("https://laventecareauthsystems.onrender.com/api/v1/auth/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `access_token=${args.token}`,
                "X-Tenant-ID": tenantId
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[Admin] Auth Failed: ${res.status} ${res.statusText} - ${errorText}`);
            throw new Error(`Unauthorized: Invalid Token (${res.status}: ${errorText})`);
        }

        const userData = await res.json();
        const user = userData.User || userData.user || userData; // Handle PascalCase/snake_case/flat
        const role = (user.Role || user.role || "").toLowerCase();

        if (role !== "admin") {
            console.warn(`[Admin] Access Forbidden. User Role: ${role}`);
            throw new Error("Forbidden: Insufficient Permissions (Admin Required)");
        }

        // 2. Fetch Data securely (Internal Query)
        // We use the separated 'internal' file to avoid circular type inference
        const data = await ctx.runQuery(api.internal.listRegistrations, {});
        return data;
    },
});
