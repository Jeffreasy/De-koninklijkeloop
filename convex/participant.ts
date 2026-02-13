import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { verifyAuth } from "./authHelpers";

import type { Doc } from "./_generated/dataModel";

export const getDashboardData = action({
    args: {
        token: v.string(),
        tenantId: v.string()
    },
    handler: async (ctx, args): Promise<{
        user: { email: string; id: string };
        registration: Doc<"registrations"> | null;
        linkedDeelnemer: Doc<"registrations"> | null;
        volunteerTasks: Doc<"volunteer_tasks">[];
    }> => {
        try {
            const authUser = await verifyAuth(args.token, {
                tenantId: args.tenantId,
                useBearerAuth: true,
            });

            // Fetch registration by email
            const registration = await ctx.runQuery(
                internal.internal.getRegistrationByEmail,
                { email: authUser.email }
            );

            // Role-specific data
            let linkedDeelnemer: Doc<"registrations"> | null = null;
            let volunteerTasks: Doc<"volunteer_tasks">[] = [];

            if (registration) {
                // Begeleider: fetch the deelnemer they're accompanying
                if (registration.role === "begeleider" && registration.companionEmail) {
                    linkedDeelnemer = await ctx.runQuery(
                        internal.internal.getLinkedDeelnemer,
                        { companionEmail: registration.companionEmail }
                    );
                }

                // Vrijwilliger: fetch assigned tasks
                if (registration.role === "vrijwilliger") {
                    volunteerTasks = await ctx.runQuery(
                        internal.internal.getVolunteerTasks,
                        { registrationId: registration._id }
                    );
                }
            }

            return {
                user: { email: authUser.email, id: authUser.id },
                registration,
                linkedDeelnemer,
                volunteerTasks
            };
        } catch (e: any) {
            console.error("[Convex] Dashboard data error:", e.message);
            throw e;
        }
    },
});

export const updateProfile = action({
    args: {
        token: v.string(),
        tenantId: v.string(),
        iceName: v.optional(v.string()),
        icePhone: v.optional(v.string()),
        supportNeeded: v.optional(v.union(v.literal("ja"), v.literal("nee"), v.literal("anders"))),
        supportDescription: v.optional(v.string()),
        companionName: v.optional(v.string()),
        companionEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const authUser = await verifyAuth(args.token, {
            tenantId: args.tenantId,
            useBearerAuth: true,
        });

        const registration = await ctx.runQuery(
            internal.internal.getRegistrationByEmail,
            { email: authUser.email }
        );

        if (!registration) throw new Error("Registration not found");

        await ctx.runMutation(internal.internal.updateRegistration, {
            id: registration._id,
            iceName: args.iceName,
            icePhone: args.icePhone,
            supportNeeded: args.supportNeeded,
            supportDescription: args.supportDescription,
            companionName: args.companionName,
            companionEmail: args.companionEmail,
        });
    },
});

// Vrijwilliger: confirm a task assignment
export const confirmVolunteerTask = action({
    args: {
        token: v.string(),
        tenantId: v.string(),
        taskId: v.id("volunteer_tasks"),
    },
    handler: async (ctx, args) => {
        await verifyAuth(args.token, {
            tenantId: args.tenantId,
            useBearerAuth: true,
        });

        await ctx.runMutation(internal.internal.updateVolunteerTaskStatus, {
            id: args.taskId,
            status: "confirmed",
        });
    },
});
