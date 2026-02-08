import { mutation } from "./_generated/server";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if 2025 exists
        const existing = await ctx.db
            .query("donation_campaigns")
            .withIndex("by_year", (q) => q.eq("year", "2025"))
            .first();

        if (existing) {
            console.log("2025 campaign already exists.");
            return;
        }

        await ctx.db.insert("donation_campaigns", {
            year: "2025",
            title: "Samen in Actie 2025",
            description: "Resultaten van de inzamelingsactie 2025",
            gofundme_url: "https://www.gofundme.com/f/samen-op-weg-voor-het-liliane-fonds-met-de-koninklijke-loop/widget/large?sharesheet=undefined&attribution_id=sl:3869c2bc-bc00-4e82-a49b-dc65ab84282a",
            is_active: true,
            target_amount: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
        });

        console.log("Seeded 2025 campaign.");
    },
});
