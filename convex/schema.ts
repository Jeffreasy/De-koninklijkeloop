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
        distance: v.optional(v.union(v.literal("2.5"), v.literal("6"), v.literal("10"), v.literal("15"))),
        supportNeeded: v.optional(v.union(v.literal("ja"), v.literal("nee"), v.literal("anders"))),
        supportDescription: v.optional(v.string()),

        // Participant Profile
        city: v.optional(v.string()),
        wheelchairUser: v.optional(v.boolean()),
        shuttleBus: v.optional(v.union(v.literal("pendelbus"), v.literal("eigen-vervoer"))),
        livesInFacility: v.optional(v.boolean()),
        participantType: v.optional(v.union(v.literal("doelgroep"), v.literal("verwant"), v.literal("anders"))),

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

        // Begeleider Companion Linking
        companionName: v.optional(v.string()),   // Who are they accompanying?
        companionEmail: v.optional(v.string()),  // Links to another registration

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
        .index("by_edition", ["edition"])
        .index("by_companion_email", ["companionEmail"]),

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

    // Volunteer Tasks (Admin-assigned tasks for vrijwilligers)
    volunteer_tasks: defineTable({
        registrationId: v.id("registrations"),
        title: v.string(),
        description: v.optional(v.string()),
        location: v.optional(v.string()),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        status: v.union(
            v.literal("assigned"),
            v.literal("confirmed"),
            v.literal("completed")
        ),
        createdAt: v.number(),
        assignedBy: v.optional(v.string()),
    })
        .index("by_registration", ["registrationId"]),

    // Media (Photos/Videos from ImageKit/Streamable)
    media: defineTable({
        // Media Source
        source: v.union(v.literal("cloudinary"), v.literal("streamable")), // "cloudinary" kept for backward compat (now ImageKit)

        // ImageKit Fields (legacy names from Cloudinary migration)
        cloudinaryPublicId: v.optional(v.string()), // Now stores ImageKit filePath
        cloudinaryUrl: v.optional(v.string()), // Now stores ImageKit URL
        cloudinarySecureUrl: v.optional(v.string()), // Now stores ImageKit secure URL

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

    // Media Metadata (ImageKit Integration - legacy field names from Cloudinary migration)
    media_metadata: defineTable({
        cloudinary_public_id: v.string(), // Stores ImageKit filePath (legacy name for backward compat)
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
        // Edition
        year: v.optional(v.string()),   // "2024", "2025", "2026" — optional for backfill compat

        // Media Type
        mediaType: v.optional(v.string()),  // "image" | "video" — defaults to "image"
        videoUrl: v.optional(v.string()),   // Streamable URL (e.g. "https://streamable.com/abc123")

        // Multi-media carousel (optional; imageUrl remains the cover/thumbnail)
        mediaItems: v.optional(v.array(v.object({
            url: v.string(),                                           // ImageKit image URL or Streamable thumbnail
            type: v.union(v.literal("image"), v.literal("video")),     // Media type
            videoUrl: v.optional(v.string()),                          // Streamable URL for video items
        }))),

        // Post Content
        imageUrl: v.string(),           // Direct URL to image, or thumbnail for video
        caption: v.string(),            // Instagram caption/description
        instagramUrl: v.string(),       // Link to original Instagram post

        // Display Settings
        isFeatured: v.boolean(),        // Mark as "main/featured" post

        // Status
        isVisible: v.boolean(),         // Visible on website

        // Metadata
        postedDate: v.optional(v.string()), // Original Instagram post date (optional)
        createdAt: v.number(),          // When added to CMS
        updatedAt: v.number(),          // Last update timestamp
        updatedBy: v.string(),          // Admin email/ID
    })
        .index("by_featured", ["isFeatured"])
        .index("by_visible", ["isVisible"])
        .index("by_year", ["year"])
        .index("by_year_visible", ["year", "isVisible"])
        .index("by_year_featured", ["year", "isFeatured"]),

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
     * Logic: Frontend sends heartbeat every 60s. Offline if > 120s.
     */
    presence: defineTable({
        user: v.string(), // Identifier (email or ID)
        name: v.string(), // Display name cache
        lastActive: v.number(), // Timestamp of last heartbeat
        status: v.union(v.literal("online"), v.literal("offline")), // Explicit status override
        currentPath: v.optional(v.string()), // Optional: Where are they?
        role: v.optional(v.union(v.literal("admin"), v.literal("editor"))), // User role badge
        typingTo: v.optional(v.string()), // Who they're typing to (email/groupId)
        typingUpdatedAt: v.optional(v.number()), // Auto-expire after 3s
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

        // Threading/Context
        conversationId: v.optional(v.string()), // Deterministic: [min(a,b), max(a,b)].join(":")

        // Reactions
        reactions: v.optional(v.array(v.object({
            emoji: v.string(),
            user: v.string(),
            name: v.string(),
        }))),

        createdAt: v.number(),
    })
        .index("by_recipient_read", ["recipient", "isRead"]) // Fast "Unread Count"
        .index("by_participants", ["sender", "recipient"]) // Fetch conversation
        .index("by_conversation", ["conversationId", "createdAt"]), // Fetch thread

    /**
     * Group Conversations
     * Admin/Editor group chats.
     */
    group_conversations: defineTable({
        name: v.string(),
        members: v.array(v.string()),       // Array of user emails
        createdBy: v.string(),
        avatarEmoji: v.optional(v.string()), // Group emoji avatar
        lastMessageAt: v.optional(v.number()),
        lastMessagePreview: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_last_message", ["lastMessageAt"]),

    /**
     * Group Messages
     * Messages within group conversations.
     */
    group_messages: defineTable({
        groupId: v.id("group_conversations"),
        sender: v.string(),
        senderName: v.string(),
        content: v.string(),
        type: v.union(v.literal("text"), v.literal("image"), v.literal("system")),
        reactions: v.optional(v.array(v.object({
            emoji: v.string(),
            user: v.string(),
            name: v.string(),
        }))),
        createdAt: v.number(),
    })
        .index("by_group", ["groupId", "createdAt"]),

    // ═══════════════════════════════════════════════════════════
    // PR/COMMUNICATIE MODULE
    // Contact database for outreach to healthcare organizations
    // ═══════════════════════════════════════════════════════════

    /**
     * PR Organizations
     * Healthcare organizations targeted for event communication.
     */
    pr_organizations: defineTable({
        naam: v.string(),
        sector: v.union(
            v.literal("academisch_ziekenhuis"),
            v.literal("algemeen_ziekenhuis"),
            v.literal("ggz"),
            v.literal("gehandicaptenzorg"),
            v.literal("verpleging_verzorging"),
            v.literal("revalidatie"),
            v.literal("overig")
        ),
        regio: v.union(
            v.literal("apeldoorn"),
            v.literal("gelderland"),
            v.literal("overijssel"),
            v.literal("overig")
        ),
        type: v.optional(v.string()),       // Sub-classification
        website: v.optional(v.string()),
        notities: v.optional(v.string()),
        isActive: v.boolean(),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_sector", ["sector"])
        .index("by_regio", ["regio"])
        .index("by_active", ["isActive"])
        .index("by_sector_regio", ["sector", "regio"]),

    /**
     * PR Contacts
     * Individual contact persons at organizations.
     */
    pr_contacts: defineTable({
        email: v.string(),
        naam: v.optional(v.string()),
        functie: v.optional(v.string()),     // Job title
        organizationId: v.optional(v.id("pr_organizations")),
        tags: v.optional(v.array(v.string())),
        isActive: v.boolean(),
        laatstGecontacteerd: v.optional(v.number()),
        notities: v.optional(v.string()),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_organization", ["organizationId"])
        .index("by_active", ["isActive"]),

    /**
     * PR Send History
     * Log of communication campaigns sent.
     */
    pr_send_history: defineTable({
        onderwerp: v.string(),
        segment: v.string(),            // Human-readable segment description
        aantalOntvangers: v.number(),
        emailLijst: v.array(v.string()), // Snapshot of emails at send time
        notities: v.optional(v.string()),
        verzondenDoor: v.string(),       // Admin name/email
        verzondenOp: v.number(),         // Send timestamp
        created_at: v.number(),
    })
        .index("by_date", ["verzondenOp"]),

    /**
     * Analytics Events
     * Business-critical events for custom dashboard.
     * Dual-write: also sent to Vercel Speed Insights.
     */
    analytics_events: defineTable({
        event: v.string(),
        metadata: v.optional(v.any()),
        sessionId: v.string(),
        path: v.string(),
        timestamp: v.number(),
    })
        .index("by_event", ["event"])
        .index("by_timestamp", ["timestamp"])
        .index("by_path", ["path"]),

    // ═══════════════════════════════════════════════════════════
    // BLOG MODULE
    // Blog posts, categories, comments, and configuration
    // ═══════════════════════════════════════════════════════════

    blog_posts: defineTable({
        title: v.string(),
        slug: v.string(),
        content: v.string(),                    // HTML from TipTap
        excerpt: v.optional(v.string()),
        cover_image_url: v.optional(v.string()),
        category_id: v.optional(v.id("blog_categories")),
        category_name: v.optional(v.string()),  // Denormalized for read perf
        category_slug: v.optional(v.string()),  // Denormalized for filter links
        status: v.union(
            v.literal("draft"),
            v.literal("review"),
            v.literal("published"),
            v.literal("scheduled"),
            v.literal("archived")
        ),
        is_featured: v.boolean(),
        tags: v.optional(v.array(v.string())),
        reading_time_minutes: v.optional(v.number()),
        author_name: v.optional(v.string()),

        // SEO
        seo_title: v.optional(v.string()),
        seo_description: v.optional(v.string()),

        // Timestamps
        published_at: v.optional(v.number()),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_status", ["status"])
        .index("by_category", ["category_id"])
        .index("by_featured", ["is_featured"])
        .index("by_published", ["published_at"]),

    blog_categories: defineTable({
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        post_count: v.number(),             // Denormalized counter
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_slug", ["slug"]),

    blog_comments: defineTable({
        post_id: v.id("blog_posts"),
        author_name: v.string(),
        author_email: v.optional(v.string()),
        content: v.string(),
        status: v.union(
            v.literal("pending"),
            v.literal("approved"),
            v.literal("rejected")
        ),
        parent_id: v.optional(v.id("blog_comments")), // Reply threading
        created_at: v.number(),
    })
        .index("by_post", ["post_id"])
        .index("by_status", ["status"])
        .index("by_post_status", ["post_id", "status"])
        .index("by_parent", ["parent_id"]),

    blog_config: defineTable({
        enabled: v.boolean(),
        comments_enabled: v.boolean(),
        posts_per_page: v.number(),
        updated_at: v.number(),
    }),
});
