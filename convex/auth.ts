import { action } from "./_generated/server";
import { v } from "convex/values";

export const validateToken = action({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        // Call LaventeCare API to verify token
        const res = await fetch("https://laventecareauthsystems.onrender.com/api/v1/me", {
            headers: {
                "Authorization": `Bearer ${args.token}`,
                "X-Tenant-ID": "c3888c7e-44cf-4827-9a7d-adaae2a1a095" // UUID for de-koninklijkeloop
            }
        });

        if (!res.ok) {
            throw new Error("Invalid Token");
        }

        const userData = await res.json();
        return userData; // Returns user profile including role
    },
});
