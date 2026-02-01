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

    // Donations
    donations: defineTable({
        // Donor Info
        donorName: v.string(),
        donorEmail: v.string(),

        // Donation Details
        amount: v.number(), // In cents (e.g., 2500 = €25.00)
        currency: v.string(), // Default: "EUR"

        // Payment
        paymentMethod: v.union(
            v.literal("ideal"),
            v.literal("creditcard"),
            v.literal("bancontact"),
            v.literal("paypal"),
            v.literal("other")
        ),
        paymentProvider: v.string(), // e.g., "Mollie", "Stripe"
        paymentId: v.optional(v.string()), // External payment reference

        // Status
        status: v.union(
            v.literal("pending"),
            v.literal("completed"),
            v.literal("failed"),
            v.literal("refunded")
        ),

        // Optional
        message: v.optional(v.string()), // Donor message
        isAnonymous: v.boolean(),
        registrationId: v.optional(v.id("registrations")), // Link to registration

        // Timestamps
        createdAt: v.number(),
        completedAt: v.optional(v.number()),
    })
        .index("by_email", ["donorEmail"])
        .index("by_status", ["status"])
        .index("by_registration", ["registrationId"]),

    // Media (Photos/Videos from Cloudinary/Streamable)
    media: defineTable({
        // Media Source
        source: v.union(v.literal("cloudinary"), v.literal("streamable")),

        // Cloudinary Fields (for photos)
        cloudinaryPublicId: v.optional(v.string()),
        cloudinaryUrl: v.optional(v.string()),
        cloudinarySecureUrl: v.optional(v.string()),

        // Streamable Fields (for videos)
        streamableShortcode: v.optional(v.string()),
        streamableUrl: v.optional(v.string()),

        // Metadata
        type: v.union(v.literal("photo"), v.literal("video")),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        tags: v.optional(v.array(v.string())), // e.g., ["2.5km", "finish", "2024"]

        // Uploader (optional - if from participant)
        uploaderEmail: v.optional(v.string()),
        registrationId: v.optional(v.id("registrations")),

        // Moderation
        status: v.union(
            v.literal("pending"),    // Awaiting review
            v.literal("approved"),   // Visible on site
            v.literal("rejected"),   // Hidden
            v.literal("archived")    // Kept but not shown
        ),

        // Timestamps
        createdAt: v.number(),
        approvedAt: v.optional(v.number()),
    })
        .index("by_source", ["source"])
        .index("by_type", ["type"])
        .index("by_status", ["status"])
        .index("by_uploader", ["uploaderEmail"])
        .index("by_registration", ["registrationId"]),

    leads: defineTable({
        email: v.string(),
        source: v.string(),
        createdAt: v.number(),
    }),
});
