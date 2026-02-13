import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { verifyAuth } from "./authHelpers";

// Admin: create a volunteer task
export const createTask = action({
    args: {
        token: v.string(),
        registrationId: v.id("registrations"),
        title: v.string(),
        description: v.optional(v.string()),
        location: v.optional(v.string()),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await verifyAuth(args.token, { requiredRoles: ["admin"], useBearerAuth: true });

        await ctx.runMutation(internal.internal.createVolunteerTask, {
            registrationId: args.registrationId,
            title: args.title,
            description: args.description,
            location: args.location,
            startTime: args.startTime,
            endTime: args.endTime,
            assignedBy: user.email,
        });
    },
});

// Admin: delete a volunteer task
export const deleteTask = action({
    args: {
        token: v.string(),
        taskId: v.id("volunteer_tasks"),
    },
    handler: async (ctx, args) => {
        await verifyAuth(args.token, { requiredRoles: ["admin"], useBearerAuth: true });

        await ctx.runMutation(internal.internal.deleteVolunteerTask, {
            id: args.taskId,
        });
    },
});

// Admin: update task status
export const updateTaskStatus = action({
    args: {
        token: v.string(),
        taskId: v.id("volunteer_tasks"),
        status: v.union(v.literal("assigned"), v.literal("confirmed"), v.literal("completed")),
    },
    handler: async (ctx, args) => {
        await verifyAuth(args.token, { requiredRoles: ["admin"], useBearerAuth: true });

        await ctx.runMutation(internal.internal.updateVolunteerTaskStatus, {
            id: args.taskId,
            status: args.status,
        });
    },
});

// Admin: list volunteer tasks with registration info (secure wrapper)
export const getVolunteerTasks = action({
    args: { token: v.string() },
    handler: async (ctx, args): Promise<any[]> => {
        await verifyAuth(args.token, { requiredRoles: ["admin", "editor"], useBearerAuth: true });
        return await ctx.runQuery(internal.internal.listVolunteerTasks, {});
    },
});

// Admin: list vrijwilliger registrations (secure wrapper)
export const getVolunteerRegistrations = action({
    args: { token: v.string() },
    handler: async (ctx, args): Promise<any[]> => {
        await verifyAuth(args.token, { requiredRoles: ["admin", "editor"], useBearerAuth: true });
        return await ctx.runQuery(internal.internal.listVolunteerRegistrations, {});
    },
});

