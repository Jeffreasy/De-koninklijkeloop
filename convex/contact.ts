import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Public contact form mutation.
 * Validates input server-side and implements basic rate limiting.
 */
export const sendMessage = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        // Input validation
        const name = args.name.trim();
        const email = args.email.trim().toLowerCase();
        const message = args.message.trim();

        if (!name || name.length < 2 || name.length > 100) {
            throw new Error("Naam moet tussen 2 en 100 tekens zijn.");
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Ongeldig e-mailadres.");
        }

        if (!message || message.length < 10 || message.length > 5000) {
            throw new Error("Bericht moet tussen 10 en 5000 tekens zijn.");
        }

        // Basic rate limiting: max 3 messages per email per hour
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const recentMessages = await ctx.db
            .query("messages")
            .filter(q =>
                q.and(
                    q.eq(q.field("email"), email),
                    q.gte(q.field("createdAt"), oneHourAgo)
                )
            )
            .collect();

        if (recentMessages.length >= 3) {
            throw new Error("Je hebt te veel berichten verstuurd. Probeer het later opnieuw.");
        }

        const messageId = await ctx.db.insert("messages", {
            name,
            email,
            message,
            status: "new",
            createdAt: Date.now(),
        });

        return messageId;
    },
});
