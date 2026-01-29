import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users (Walkers / Admins)
    users: defineTable({
        email: v.string(),
        passwordHash: v.string(),
        name: v.optional(v.string()),
        role: v.union(v.literal("admin"), v.literal("user")),
        createdAt: v.number(),
    })
        .index("by_email", ["email"]),

    // Registrations (The core CRM data)
    registrations: defineTable({
        // Contact Info
        name: v.string(),
        email: v.string(),

        // Deelname Details
        role: v.union(v.literal("deelnemer"), v.literal("begeleider"), v.literal("vrijwilliger")),
        distance: v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15")),
        supportNeeded: v.union(v.literal("ja"), v.literal("nee"), v.literal("anders")),
        supportDescription: v.optional(v.string()),

        // ICE (Noodcontact)
        iceName: v.string(),
        icePhone: v.string(),

        // Legal
        agreedToTerms: v.boolean(),
        agreedToMedia: v.boolean(),

        // Status
        status: v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled")),
        authUserId: v.optional(v.string()), // Linked Auth ID

        createdAt: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_auth_user_id", ["authUserId"]) // Scalability: Fast lookup by user
        .index("by_status", ["status"]),

    leads: defineTable({
        email: v.string(),
        source: v.string(),
        createdAt: v.number(),
    }),
});
