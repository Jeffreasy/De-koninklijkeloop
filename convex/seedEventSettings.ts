import { internalMutation } from "./_generated/server";

export const seed = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Check if already seeded
        const existing = await ctx.db
            .query("event_settings")
            .filter(q => q.eq(q.field("is_active"), true))
            .first();

        if (existing) {
            console.log("Event settings already exist");
            return { success: false, message: "Already seeded", id: existing._id };
        }

        // Create default settings with confirmed data
        const id = await ctx.db.insert("event_settings", {
            is_active: true,

            // Basic Event Info
            name: "De Koninklijke Loop 2026",
            tagline: "Samen maken we het verschil",
            description: "De sponsorloop van mensen met een beperking voor een goed doel!",

            // Date & Time
            event_date: "2026-05-16",
            event_date_display: "zaterdag 16 mei 2026",
            registration_open: true,
            registration_deadline: "2026-05-10",

            // Location
            location_name: "Koninklijkeloop",
            location_city: "Apeldoorn",
            start_location: "Kootwijk",
            finish_location: "Grote Kerk, Apeldoorn",
            route_description: "Het laatste stukje van de historische Koninklijke Weg",

            // Capacity
            max_participants: 500,
            current_participants: 0,

            // Distances (confirmed: 2.5, 6, 10, 15 km)
            available_distances: [
                { km: "2.5", label: "2.5 kilometer", description: "Korte route, ideaal voor beginners" },
                { km: "6", label: "6 kilometer", description: "Middellange afstand" },
                { km: "10", label: "10 kilometer", description: "Uitdagende afstand" },
                { km: "15", label: "15 kilometer", description: "Voor ervaren wandelaars" },
            ],

            // Media
            hero_video_id: "tt6k80", // From site.config
            hero_image_url: undefined,

            // Contact
            contact_email: "info@dekoninklijkeloop.nl",

            // Email Settings
            send_confirmation_emails: true,
            email_sender: "info@dekoninklijkeloop.nl",

            // Payment Settings
            payment_provider: undefined,
            payment_api_key: undefined,

            // Mobile App
            mobile_app_enabled: false,
            mobile_app_url: undefined,
            mobile_app_status: "coming_soon",

            // Meta
            created_at: Date.now(),
            updated_at: Date.now(),
            updated_by: undefined,
        });

        console.log("Event settings seeded successfully");
        return { success: true, message: "Seeded successfully", id };
    },
});
