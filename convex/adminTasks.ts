import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Admin: create a volunteer task
export const createTask = action({
    args: {
        token: v.string(),
        tenantId: v.string(),
        registrationId: v.id("registrations"),
        title: v.string(),
        description: v.optional(v.string()),
        location: v.optional(v.string()),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Verify admin token
        const API_URL = process.env.LAVENTECARE_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${args.token}`,
                "X-Tenant-ID": args.tenantId
            }
        });
        if (!res.ok) throw new Error("Unauthorized");
        const userData = await res.json();
        const user = userData.User || userData.user;
        const adminEmail = user?.Email || user?.email || "admin";

        // @ts-ignore
        await ctx.runMutation(api.internal.createVolunteerTask, {
            registrationId: args.registrationId,
            title: args.title,
            description: args.description,
            location: args.location,
            startTime: args.startTime,
            endTime: args.endTime,
            assignedBy: adminEmail,
        });
    },
});

// Admin: delete a volunteer task
export const deleteTask = action({
    args: {
        token: v.string(),
        tenantId: v.string(),
        taskId: v.id("volunteer_tasks"),
    },
    handler: async (ctx, args) => {
        const API_URL = process.env.LAVENTECARE_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${args.token}`,
                "X-Tenant-ID": args.tenantId
            }
        });
        if (!res.ok) throw new Error("Unauthorized");

        // @ts-ignore
        await ctx.runMutation(api.internal.deleteVolunteerTask, {
            id: args.taskId,
        });
    },
});

// Admin: update task status
export const updateTaskStatus = action({
    args: {
        token: v.string(),
        tenantId: v.string(),
        taskId: v.id("volunteer_tasks"),
        status: v.union(v.literal("assigned"), v.literal("confirmed"), v.literal("completed")),
    },
    handler: async (ctx, args) => {
        const API_URL = process.env.LAVENTECARE_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${args.token}`,
                "X-Tenant-ID": args.tenantId
            }
        });
        if (!res.ok) throw new Error("Unauthorized");

        // @ts-ignore
        await ctx.runMutation(api.internal.updateVolunteerTaskStatus, {
            id: args.taskId,
            status: args.status,
        });
    },
});
