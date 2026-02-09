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

        // User Type & Auth
        userType: v.optional(v.union(
            v.literal("authenticated"),  // Has LaventeCare account
            v.literal("guest")            // Event-only registration
        )),
        authUserId: v.optional(v.string()), // Linked Auth ID (only for authenticated)

        // Admin Notes
        notes: v.optional(v.string()),

        // Status
        status: v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled")),

        createdAt: v.number(),

        // Edition (for archiving)
        edition: v.optional(v.string()) // e.g., "2025", "2026"
    })
        .index("by_email", ["email"])
        .index("by_auth_user_id", ["authUserId"]) // Scalability: Fast lookup by user
        .index("by_status", ["status"])
        .index("by_edition", ["edition"]),

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

    // Media Metadata (Cloudinary Integration)
    media_metadata: defineTable({
        cloudinary_public_id: v.string(), // Cloudinary public_id (unique identifier)
        alt_text: v.string(),            // User-defined alt text for accessibility
        title: v.optional(v.string()),   // Optional title/caption for the image
        folder: v.optional(v.string()),  // e.g., "De Koninklijkeloop/DKLFoto's 2024"
        tags: v.optional(v.array(v.string())), // Future: custom tags
        updated_by: v.string(),          // Admin user email or ID
        updated_at: v.number(),          // Last update timestamp
    })
        .index("by_public_id", ["cloudinary_public_id"])
        .index("by_folder", ["folder"]),

    // Event Settings (Singleton - only one active event)
    event_settings: defineTable({
        // Singleton flag
        is_active: v.boolean(),

        // Basic Event Info
        name: v.string(),
        tagline: v.string(),
        description: v.string(),

        // Date & Time
        event_date: v.string(), // ISO format: "2026-05-16"
        event_date_display: v.string(), // "zaterdag 16 mei 2026"
        registration_open: v.boolean(),
        registration_deadline: v.optional(v.string()),

        // Location
        location_name: v.string(),
        location_city: v.string(),
        start_location: v.string(),
        finish_location: v.string(),
        route_description: v.string(),

        // Capacity
        max_participants: v.optional(v.number()),
        current_participants: v.number(),

        // Distances
        available_distances: v.array(
            v.object({
                km: v.string(),
                label: v.string(),
                description: v.optional(v.string()),
            })
        ),

        // Media
        hero_video_id: v.string(),
        hero_image_url: v.optional(v.string()),

        // Contact
        contact_email: v.string(),

        // Email Settings
        send_confirmation_emails: v.boolean(),
        email_sender: v.string(),

        // Payment Settings
        payment_provider: v.optional(v.string()),
        payment_api_key: v.optional(v.string()),

        // Mobile App Integration
        mobile_app_enabled: v.optional(v.boolean()),
        mobile_app_url: v.optional(v.string()),
        mobile_app_status: v.optional(v.union(v.literal("coming_soon"), v.literal("live"), v.literal("beta"))),

        // Meta
        created_at: v.number(),
        updated_at: v.number(),
        updated_by: v.optional(v.string()),
    })
        .index("by_active", ["is_active"]),

    leads: defineTable({
        email: v.string(),
        source: v.string(),
        createdAt: v.number(),
    }),

    // Social Media Posts (Manual Instagram Management)
    social_posts: defineTable({
        // Post Content
        imageUrl: v.string(),           // Direct URL to Instagram image
        caption: v.string(),            // Instagram caption/description
        instagramUrl: v.string(),       // Link to original Instagram post

        // Display Settings
        isFeatured: v.boolean(),        // Mark as "main/featured" post
        displayOrder: v.number(),       // Display order (1 = shown first)

        // Status
        isVisible: v.boolean(),         // Visible on website

        // Metadata
        postedDate: v.optional(v.string()), // Original Instagram post date (optional)
        createdAt: v.number(),          // When added to CMS
        updatedAt: v.number(),          // Last update timestamp
        updatedBy: v.string(),          // Admin email/ID
    })
        .index("by_display_order", ["displayOrder"])
        .index("by_featured", ["isFeatured"])
        .index("by_visible", ["isVisible"]),

    // Social Post Reactions (User Engagement)
    social_reactions: defineTable({
        postId: v.id("social_posts"),   // Which post
        userId: v.string(),             // User email/ID (from auth)
        reactionType: v.string(),       // Emoji: "❤️", "👍", "😍", "🔥", "👏"
        createdAt: v.number(),          // Timestamp
    })
        .index("by_post", ["postId"])
        .index("by_user_post", ["userId", "postId"]), // Ensure one reaction per user per post

    // Contact Messages
    messages: defineTable({
        name: v.string(),
        email: v.string(),
        message: v.string(),
        status: v.union(v.literal("new"), v.literal("read"), v.literal("archived")),
        createdAt: v.number(),
    })
        .index("by_status", ["status"])
        .index("by_email", ["email"]),

    // Donation Campaigns (Dynamic GoFundMe Management)
    donation_campaigns: defineTable({
        year: v.string(),              // "2025", "2026"
        title: v.string(),             // "Samen in Actie 2025"
        description: v.optional(v.string()), // Context text

        // Widget Configuration
        gofundme_url: v.string(),      // The full widget URL

        // Status
        is_active: v.boolean(),        // Only one active at a time

        // Targets
        target_amount: v.optional(v.number()),
        current_amount: v.optional(v.number()),

        // Meta
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_year", ["year"])
        .index("by_active", ["is_active"]),

    // Team Hub: Minutes & Agendas
    team_minutes: defineTable({
        title: v.string(),
        date: v.string(), // ISO "2026-01-19"
        type: v.union(v.literal("meeting"), v.literal("agenda"), v.literal("other")),
        status: v.union(v.literal("concept"), v.literal("final")),
        tags: v.array(v.string()),
        content: v.string(), // Markdown

        // Meta
        created_at: v.number(),
        updated_at: v.number(),
        updated_by: v.optional(v.string()),
    })
        .index("by_date", ["date"])
        .index("by_type", ["type"]),

    // Team Hub: Event Schedule (Chronological)
    event_schedule: defineTable({
        time: v.string(), // "10:15"
        title: v.string(),
        description: v.string(),
        type: v.union(v.literal("logistics"), v.literal("event"), v.literal("break")),
        icon: v.string(), // "aanvang", "start", etc.
        routeId: v.optional(v.string()), // "15km"

        // Sorting
        order: v.number(),

        // Meta
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_order", ["order"]),

    // Feedback System (Editor/Admin Feedback)
    feedback: defineTable({
        type: v.string(), // "bug", "feature", "praise", "other"
        message: v.string(),
        metadata: v.optional(v.any()), // flexible object for url, browser, etc.
        status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("closed"), v.literal("rejected")),
        adminNotes: v.optional(v.string()), // For admin replies/notes

        // User Info (Snapshot)
        userId: v.optional(v.string()), // If authenticated
        userName: v.optional(v.string()),
        userEmail: v.optional(v.string()),

        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_type", ["type"])
        .index("by_created", ["createdAt"]),

    /**
     * Real-Time Presence System
     * Tracks user activity for the "Green Dot" indicator.
     * Logic: Frontend sends heartbeat every 30s. Offline if > 60s.
     */
    presence: defineTable({
        user: v.string(), // Identifier (email or ID)
        name: v.string(), // Display name cache
        lastActive: v.number(), // Timestamp of last heartbeat
        status: v.union(v.literal("online"), v.literal("offline")), // Explicit status override
        currentPath: v.optional(v.string()), // Optional: Where are they?
    })
        .index("by_user", ["user"])
        .index("by_last_active", ["lastActive"]),

    /**
     * Direct Messaging System
     * 1-on-1 Chat with database persistence.
     */
    direct_messages: defineTable({
        sender: v.string(), // User Identifier
        recipient: v.string(), // User Identifier
        content: v.string(), // Message body
        isRead: v.boolean(), // Read status
        type: v.union(v.literal("text"), v.literal("image"), v.literal("system")), // Message type

        // Threading/Context (Optional)
        conversationId: v.optional(v.string()), // optimize listing

        createdAt: v.number(),
    })
        .index("by_recipient_read", ["recipient", "isRead"]) // Fast "Unread Count"
        .index("by_participants", ["sender", "recipient"]) // Fetch conversation
        .index("by_conversation", ["conversationId", "createdAt"]), // Fetch thread
});
