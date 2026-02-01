import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Admin: Get all donations
export const listDonations = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("donations")
            .order("desc")
            .collect();
    },
});

// Admin: Get donation statistics
export const getDonationStats = query({
    handler: async (ctx) => {
        const donations = await ctx.db.query("donations").collect();
        const completed = donations.filter(d => d.status === "completed");

        const total = completed.reduce((sum, d) => sum + d.amount, 0);

        return {
            totalAmount: total, // In cents
            totalCount: completed.length,
            pendingCount: donations.filter(d => d.status === "pending").length,
            failedCount: donations.filter(d => d.status === "failed").length,
        };
    },
});

// Admin: Get donations by status
export const getDonationsByStatus = query({
    args: { status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("refunded")) },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("donations")
            .withIndex("by_status", (q) => q.eq("status", args.status))
            .order("desc")
            .collect();
    },
});
