import { action } from "./_generated/server";
import { v } from "convex/values";

export const validateToken = action({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        // Call LaventeCare API to verify token
        const res = await fetch("https://laventecareauthsystems.onrender.com/api/v1/me", {
            headers: {
                "Authorization": `Bearer ${args.token}`,
                "X-Tenant-ID": "b2727666-7230-4689-b58b-ceab8c2898d5" // UUID for de-koninklijkeloop
            }
        });

        if (!res.ok) {
            throw new Error("Invalid Token");
        }

        const userData = await res.json();
        return userData; // Returns user profile including role
    },
});
