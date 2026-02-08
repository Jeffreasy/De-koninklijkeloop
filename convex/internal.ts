import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Internal query to fetch all registrations
// Used by admin actions after auth verification
// (Forces Codegen)
export const listRegistrations = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("registrations").order("desc").collect();
    },
});

// Internal mutation to create a registration record
// Only callable by internal actions (like registerParticipant)
export const createRegistration = internalMutation({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("deelnemer"), v.literal("begeleider"), v.literal("vrijwilliger")),
        distance: v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15")),
        supportNeeded: v.union(v.literal("ja"), v.literal("nee"), v.literal("anders")),
        supportDescription: v.optional(v.string()),
        iceName: v.string(),
        icePhone: v.string(),
        agreedToTerms: v.boolean(),
        agreedToMedia: v.boolean(),
        userType: v.union(v.literal("authenticated"), v.literal("guest")),
        authUserId: v.optional(v.string()) // Link to Auth System ID (only for authenticated)
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("registrations")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existing) {
            throw new Error("Dit e-mailadres is al geregistreerd voor deze editie.");
        }

        return await ctx.db.insert("registrations", {
            ...args,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});

export const getRegistrationByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("registrations")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});

// Internal mutation to update a registration (e.g. status, notes)
export const updateRegistration = internalMutation({
    args: {
        id: v.id("registrations"),
        status: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled"))),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Internal mutation to import a registration (preserves timestamps/status)
export const importRegistration = internalMutation({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("deelnemer"), v.literal("begeleider"), v.literal("vrijwilliger")),
        distance: v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15")),
        supportNeeded: v.union(v.literal("ja"), v.literal("nee"), v.literal("anders")),
        supportDescription: v.optional(v.string()),
        iceName: v.string(),
        icePhone: v.string(),
        agreedToTerms: v.boolean(),
        agreedToMedia: v.boolean(),
        userType: v.union(v.literal("authenticated"), v.literal("guest")),
        authUserId: v.optional(v.string()),
        status: v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled")),
        createdAt: v.number(),
        edition: v.string(), // Required for import
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check for duplicates within the same edition
        const existing = await ctx.db
            .query("registrations")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .filter((q) => q.eq(q.field("edition"), args.edition))
            .first();

        if (existing) {
            console.log(`Skipping duplicate: ${args.email} in ${args.edition}`);
            return; // Skip duplicates
        }

        await ctx.db.insert("registrations", args);
    },
});

export const deleteRegistration = internalMutation({
    args: { id: v.id("registrations") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
