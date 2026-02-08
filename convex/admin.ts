import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getRegistrations = action({
    args: { token: v.string() },
    handler: async (ctx, args): Promise<any> => {
        const tenantId = process.env.TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";

        // 1. Verify Token via Auth API
        // 1. Verify Token via Auth API
        const API_URL = process.env.LAVENTECARE_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
        const res = await fetch(`${API_URL}/auth/me`, {
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

export const updateRegistration = action({
    args: {
        token: v.string(),
        id: v.id("registrations"),
        status: v.optional(v.string()), // String to match union type after validation
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Verify Token (Reused logic - ideally extract this)
        const tenantId = process.env.TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";
        const API_URL = process.env.LAVENTECARE_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";

        const res = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `access_token=${args.token}`,
                "X-Tenant-ID": tenantId
            }
        });

        if (!res.ok) throw new Error("Unauthorized");
        const userData = await res.json();
        const user = userData.User || userData.user || userData;
        if ((user.Role || user.role || "").toLowerCase() !== "admin") throw new Error("Forbidden");

        // 2. Call Internal Mutation
        // @ts-ignore - Status string to union type cast safe here as internal validates it
        await ctx.runMutation(api.internal.updateRegistration, {
            id: args.id,
            status: args.status,
            notes: args.notes
        });
    },
});

export const deleteRegistration = action({
    args: {
        token: v.string(),
        id: v.id("registrations"),
    },
    handler: async (ctx, args) => {
        // 1. Verify Token
        const tenantId = process.env.TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";
        const API_URL = process.env.LAVENTECARE_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";

        const res = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `access_token=${args.token}`,
                "X-Tenant-ID": tenantId
            }
        });

        if (!res.ok) throw new Error("Unauthorized");
        const userData = await res.json();
        const user = userData.User || userData.user || userData;
        if ((user.Role || user.role || "").toLowerCase() !== "admin") throw new Error("Forbidden");

        // 2. Call Internal Mutation
        // @ts-ignore - Internal mutation types might not be generated yet
        await ctx.runMutation(api.internal.deleteRegistration, { id: args.id });
    },
});
