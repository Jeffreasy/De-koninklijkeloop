import { action } from "./_generated/server";
import { v } from "convex/values";
import { AUTH_API_URL, TENANT_ID } from "./authHelpers";

export const validateToken = action({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const res = await fetch(`${AUTH_API_URL}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${args.token}`,
                "X-Tenant-ID": TENANT_ID,
            },
        });

        if (!res.ok) {
            throw new Error("Invalid Token");
        }

        const userData = await res.json();
        return userData;
    },
});
