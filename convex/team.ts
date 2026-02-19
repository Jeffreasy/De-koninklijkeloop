/**
 * TRUST BOUNDARY: Mutations in this file are admin-only.
 * Security relies on SSR middleware auth (admin pages are gated).
 * TODO: Convert critical mutations to action() + verifyAuth() for defense-in-depth.
 */
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

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
        const item = await ctx.db.get(args.id);
        if (!item) throw new Error("Schedule item not found");
        await ctx.db.delete(args.id);
    },
});

// --- SEED: Real Event Program (2025 Edition as template) ---

export const seedSchedule = internalMutation({
    handler: async (ctx) => {
        // Clear existing schedule
        const existing = await ctx.db.query("event_schedule").collect();
        for (const item of existing) {
            await ctx.db.delete(item._id);
        }

        const items = [
            { time: "10:15", title: "Aanvang Deelnemers 15 KM", description: "Melden bij het coördinatiepunt bij de Grote Kerk, Loolaan 16, Apeldoorn.", type: "logistics" as const, icon: "aanvang", routeId: "15km", order: 1 },
            { time: "10:45", title: "Vertrek pendelbussen 15 KM", description: "Vertrek met pendelbussen naar het startpunt van de 15 KM route.", type: "logistics" as const, icon: "vertrek", routeId: "15km", order: 2 },
            { time: "11:15", title: "START 15 KM", description: "De langste route gaat van start! Veel succes en geniet van de bossen.", type: "event" as const, icon: "start", routeId: "15km", order: 3 },
            { time: "12:00", title: "Aanvang Deelnemers 10 KM", description: "Melden bij het coördinatiepunt bij de Grote Kerk.", type: "logistics" as const, icon: "aanvang", routeId: "10km", order: 4 },
            { time: "12:30", title: "Vertrek pendelbussen 10 KM", description: "Vertrek met pendelbussen naar het startpunt van de 10 KM route.", type: "logistics" as const, icon: "vertrek", routeId: "10km", order: 5 },
            { time: "12:45", title: "Rustpunt Halte Assel (15 KM)", description: "Verwachte aankomst 15 KM lopers bij rustpunt Halte Assel. 15 minuten pauze met fruit en drinken.", type: "break" as const, icon: "rustpunt", routeId: "15km", order: 6 },
            { time: "13:00", title: "START 10 KM · Hervatting 15 KM", description: "De 10 KM route gaat van start. De 15 KM lopers hervatten hun tocht na de pauze.", type: "event" as const, icon: "start", routeId: "10km", order: 7 },
            { time: "13:15", title: "Aanvang Deelnemers 6 KM", description: "Melden bij het coördinatiepunt bij de Grote Kerk.", type: "logistics" as const, icon: "aanvang", routeId: "6km", order: 8 },
            { time: "13:45", title: "Vertrek pendelbussen 6 KM", description: "Vertrek met pendelbussen naar het startpunt van de 6 KM route.", type: "logistics" as const, icon: "vertrek", routeId: "6km", order: 9 },
            { time: "14:00", title: "Rustpunt Hoog Soeren (15 & 10 KM)", description: "Verwachte aankomst 15 en 10 KM lopers bij rustpunt Hoog Soeren. 15 minuten pauze.", type: "break" as const, icon: "rustpunt", order: 10 },
            { time: "14:15", title: "START 6 KM · Hervatting 10 & 15 KM", description: "De 6 KM route gaat van start. De 10 en 15 KM lopers hervatten hun tocht.", type: "event" as const, icon: "start", routeId: "6km", order: 11 },
            { time: "14:30", title: "Aanvang Deelnemers 2,5 KM", description: "Melden bij het coördinatiepunt bij de Grote Kerk.", type: "logistics" as const, icon: "aanvang", routeId: "2.5km", order: 12 },
            { time: "15:00", title: "Vertrek pendelbussen 2,5 KM", description: "Vertrek met pendelbussen naar het startpunt van de 2,5 KM route.", type: "logistics" as const, icon: "vertrek", routeId: "2.5km", order: 13 },
            { time: "15:15", title: "Rustpunt Berg & Bos (15, 10 & 6 KM)", description: "Verwachte aankomst 15, 10 en 6 KM lopers bij rustpunt Berg & Bos. 15 minuten pauze.", type: "break" as const, icon: "rustpunt", order: 14 },
            { time: "15:35", title: "START 2,5 KM · Hervatting alle routes", description: "De 2,5 KM route gaat van start. Alle andere lopers hervatten hun tocht naar de finish.", type: "event" as const, icon: "start", routeId: "2.5km", order: 15 },
            { time: "15:55", title: "Aankomst De Naald · Inhuldigingsloop", description: "Alle lopers komen samen bij De Naald voor de gezamenlijke Inhuldigingsloop richting de finish.", type: "event" as const, icon: "aankomst", order: 16 },
            { time: "16:10 – 16:30", title: "FINISH", description: "De gezamenlijke finish! Vier dit bijzondere moment met alle deelnemers, vrijwilligers en publiek.", type: "event" as const, icon: "finish", order: 17 },
        ];

        const now = Date.now();
        for (const item of items) {
            await ctx.db.insert("event_schedule", {
                ...item,
                created_at: now,
                updated_at: now,
            });
        }

        return { success: true, count: items.length };
    },
});
