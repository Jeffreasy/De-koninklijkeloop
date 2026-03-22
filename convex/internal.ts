import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Internal query to fetch all registrations
// Used by admin actions after auth verification
// (Forces Codegen)
export const listRegistrations = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("registrations").order("desc").collect();
    },
});

// Internal query to fetch a single registration by ID (used for cleanup before delete)
export const getRegistrationById = internalQuery({
    args: { id: v.id("registrations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});


// Shared validator object for a single group member (no email required)
const groupMemberValidator = v.object({
    name: v.string(),
    distance: v.optional(v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15"))),
    wheelchairUser: v.optional(v.boolean()),
    shuttleBus: v.optional(v.union(v.literal("pendelbus"), v.literal("eigen-vervoer"))),
    supportNeeded: v.optional(v.union(v.literal("ja"), v.literal("nee"), v.literal("anders"))),
    supportDescription: v.optional(v.string()),
    livesInFacility: v.optional(v.boolean()),
    participantType: v.optional(v.union(v.literal("doelgroep"), v.literal("verwant"), v.literal("anders"))),
    agreedToMedia: v.optional(v.boolean()),
    iceName: v.optional(v.string()),
    icePhone: v.optional(v.string()),
});

// Internal mutation to create a registration record
// Only callable by internal actions (like registerParticipant)
export const createRegistration = internalMutation({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("deelnemer"), v.literal("begeleider"), v.literal("vrijwilliger")),
        distance: v.optional(v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15"))),
        supportNeeded: v.optional(v.union(v.literal("ja"), v.literal("nee"), v.literal("anders"))),
        supportDescription: v.optional(v.string()),
        city: v.optional(v.string()),
        wheelchairUser: v.optional(v.boolean()),
        shuttleBus: v.optional(v.union(v.literal("pendelbus"), v.literal("eigen-vervoer"))),
        livesInFacility: v.optional(v.boolean()),
        participantType: v.optional(v.union(v.literal("doelgroep"), v.literal("verwant"), v.literal("anders"))),
        iceName: v.string(),
        icePhone: v.string(),
        agreedToTerms: v.boolean(),
        agreedToMedia: v.boolean(),
        userType: v.union(v.literal("authenticated"), v.literal("guest")),
        authUserId: v.optional(v.string()), // Link to Auth System ID (only for authenticated)
        edition: v.optional(v.string()), // Current edition (e.g. "2026")
        // Begeleider companion linking (single, legacy)
        companionName: v.optional(v.string()),
        companionEmail: v.optional(v.string()),
        // Groepsregistratie: meerdere deelnemers onder één begeleider email
        groupMembers: v.optional(v.array(groupMemberValidator)),
    },
    handler: async (ctx, args) => {
        const currentEdition = args.edition || "2026";

        const existing = await ctx.db
            .query("registrations")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .filter((q) => q.eq(q.field("edition"), currentEdition))
            .first();

        if (existing) {
            throw new Error("Dit e-mailadres is al geregistreerd voor deze editie.");
        }

        return await ctx.db.insert("registrations", {
            ...args,
            edition: currentEdition,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});


// Internal mutation to promote a guest registration to authenticated
// Called when a ghost user creates an account (sets password)
export const promoteRegistration = internalMutation({
    args: {
        email: v.string(),
        authUserId: v.string(),
        edition: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const currentEdition = args.edition || "2026";

        const existing = await ctx.db
            .query("registrations")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .filter((q) => q.eq(q.field("edition"), currentEdition))
            .first();

        if (!existing) {
            throw new Error("Geen gastregistratie gevonden voor dit e-mailadres.");
        }

        if (existing.userType === "authenticated") {
            // Already promoted — idempotent
            return existing._id;
        }

        // Promote: guest → authenticated
        await ctx.db.patch(existing._id, {
            userType: "authenticated",
            authUserId: args.authUserId,
        });

        return existing._id;
    },
});

export const getRegistrationByEmail = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("registrations")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});

// Internal mutation to update a registration (e.g. status, notes, edit profile)
// Modified for admin and user self-service
export const updateRegistration = internalMutation({
    args: {
        id: v.id("registrations"),
        status: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled"))),
        notes: v.optional(v.string()),
        // Editable fields
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        role: v.optional(v.union(v.literal("deelnemer"), v.literal("begeleider"), v.literal("vrijwilliger"))),
        distance: v.optional(v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15"))),
        iceName: v.optional(v.string()),
        icePhone: v.optional(v.string()),
        supportNeeded: v.optional(v.union(v.literal("ja"), v.literal("nee"), v.literal("anders"))),
        supportDescription: v.optional(v.string()),
        city: v.optional(v.string()),
        wheelchairUser: v.optional(v.boolean()),
        shuttleBus: v.optional(v.union(v.literal("pendelbus"), v.literal("eigen-vervoer"))),
        livesInFacility: v.optional(v.boolean()),
        participantType: v.optional(v.union(v.literal("doelgroep"), v.literal("verwant"), v.literal("anders"))),
        // Begeleider companion linking
        companionName: v.optional(v.string()),
        companionEmail: v.optional(v.string()),
        // Groepsregistratie: embedded deelnemers array (admin kan updaten)
        groupMembers: v.optional(v.array(groupMemberValidator)),
        // Confirmation email tracking
        confirmationSentAt: v.optional(v.number()),
        confirmationSentBy: v.optional(v.string()),
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
        distance: v.optional(v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15"))),
        supportNeeded: v.optional(v.union(v.literal("ja"), v.literal("nee"), v.literal("anders"))),
        supportDescription: v.optional(v.string()),
        iceName: v.string(),
        icePhone: v.string(),
        agreedToTerms: v.boolean(),
        agreedToMedia: v.boolean(),
        // Participant Profile
        city: v.optional(v.string()),
        wheelchairUser: v.optional(v.boolean()),
        shuttleBus: v.optional(v.union(v.literal("pendelbus"), v.literal("eigen-vervoer"))),
        livesInFacility: v.optional(v.boolean()),
        participantType: v.optional(v.union(v.literal("doelgroep"), v.literal("verwant"), v.literal("anders"))),
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

// Get linked companion registrations (for begeleiders)
export const getCompanionRegistrations = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("registrations")
            .withIndex("by_companion_email", (q) => q.eq("companionEmail", args.email))
            .collect();
    },
});

// Get the registration a begeleider is companion of
export const getLinkedDeelnemer = internalQuery({
    args: { companionEmail: v.string() },
    handler: async (ctx, args) => {
        if (!args.companionEmail) return null;
        return await ctx.db
            .query("registrations")
            .withIndex("by_email", (q) => q.eq("email", args.companionEmail))
            .first();
    },
});

// Get volunteer tasks for a registration
export const getVolunteerTasks = internalQuery({
    args: { registrationId: v.id("registrations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("volunteer_tasks")
            .withIndex("by_registration", (q) => q.eq("registrationId", args.registrationId))
            .collect();
    },
});

// Update volunteer task status (confirm/complete)
export const updateVolunteerTaskStatus = internalMutation({
    args: {
        id: v.id("volunteer_tasks"),
        status: v.union(v.literal("assigned"), v.literal("confirmed"), v.literal("completed")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    },
});

// Admin: create a volunteer task
export const createVolunteerTask = internalMutation({
    args: {
        registrationId: v.id("registrations"),
        title: v.string(),
        description: v.optional(v.string()),
        location: v.optional(v.string()),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        assignedBy: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("volunteer_tasks", {
            ...args,
            status: "assigned",
            createdAt: Date.now(),
        });
    },
});

// Admin: delete a volunteer task
export const deleteVolunteerTask = internalMutation({
    args: { id: v.id("volunteer_tasks") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// Admin: list all volunteer tasks with registration info
export const listVolunteerTasks = internalQuery({
    args: {},
    handler: async (ctx) => {
        const tasks = await ctx.db.query("volunteer_tasks").order("desc").collect();
        const tasksWithNames = await Promise.all(
            tasks.map(async (task) => {
                const reg = await ctx.db.get(task.registrationId);
                return { ...task, volunteerName: reg?.name || "Onbekend", volunteerEmail: reg?.email || "" };
            })
        );
        return tasksWithNames;
    },
});

// Admin: list all vrijwilliger registrations (for assignment dropdown)
export const listVolunteerRegistrations = internalQuery({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("registrations").collect();
        return all.filter(r => r.role === "vrijwilliger").map(r => ({
            _id: r._id,
            name: r.name,
            email: r.email,
            distance: r.distance,
            status: r.status,
        }));
    },
});

