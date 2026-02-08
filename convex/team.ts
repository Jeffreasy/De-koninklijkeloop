import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// TODO: Implement proper auth checks when Auth System is fully integrated
// import { requireAdminOrEditor } from "./users"; 

// --- MINUTES ---

export const getMinutes = query({
    args: {
        searchQuery: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const minutes = await ctx.db.query("team_minutes").collect();

        // Manual filter because Convex search is more complex to setup for simple substring
        if (args.searchQuery) {
            const lowerQuery = args.searchQuery.toLowerCase();
            return minutes.filter(m =>
                m.title.toLowerCase().includes(lowerQuery) ||
                m.content.toLowerCase().includes(lowerQuery) ||
                m.tags.some(t => t.toLowerCase().includes(lowerQuery))
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        return minutes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
});

export const createMinute = mutation({
    args: {
        title: v.string(),
        date: v.string(),
        type: v.union(v.literal("meeting"), v.literal("agenda"), v.literal("other")),
        status: v.union(v.literal("concept"), v.literal("final")),
        tags: v.array(v.string()),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        // await requireAdminOrEditor(ctx); // Security check
        const newId = await ctx.db.insert("team_minutes", {
            ...args,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        return newId;
    },
});

export const updateMinute = mutation({
    args: {
        id: v.id("team_minutes"),
        title: v.optional(v.string()),
        date: v.optional(v.string()),
        type: v.optional(v.union(v.literal("meeting"), v.literal("agenda"), v.literal("other"))),
        status: v.optional(v.union(v.literal("concept"), v.literal("final"))),
        tags: v.optional(v.array(v.string())),
        content: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // await requireAdminOrEditor(ctx);
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            updated_at: Date.now(),
        });
    },
});

export const deleteMinute = mutation({
    args: { id: v.id("team_minutes") },
    handler: async (ctx, args) => {
        // await requireAdminOrEditor(ctx);
        await ctx.db.delete(args.id);
    },
});

// --- SCHEDULE ---

export const getSchedule = query({
    handler: async (ctx) => {
        // Sort by 'order' field for custom sorting
        return await ctx.db.query("event_schedule").withIndex("by_order").collect();
    },
});

export const upsertScheduleItem = mutation({
    args: {
        id: v.optional(v.id("event_schedule")), // If provided, update. If not, create.
        time: v.string(),
        title: v.string(),
        description: v.string(),
        type: v.union(v.literal("logistics"), v.literal("event"), v.literal("break")),
        icon: v.string(),
        routeId: v.optional(v.string()),
        order: v.number(),
    },
    handler: async (ctx, args) => {
        // await requireAdminOrEditor(ctx);
        const { id, ...data } = args;

        if (id) {
            await ctx.db.patch(id, {
                ...data,
                updated_at: Date.now(),
            });
        } else {
            await ctx.db.insert("event_schedule", {
                ...data,
                created_at: Date.now(),
                updated_at: Date.now(),
            });
        }
    },
});

export const deleteScheduleItem = mutation({
    args: { id: v.id("event_schedule") },
    handler: async (ctx, args) => {
        // await requireAdminOrEditor(ctx);
        await ctx.db.delete(args.id);
    },
});
