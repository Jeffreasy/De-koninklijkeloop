import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
            const API_URL = process.env.LAVENTECARE_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
            const res = await fetch(
                `${API_URL}/auth/me`,
                {
                    headers: {
                        "Authorization": `Bearer ${args.token}`,
                        "X-Tenant-ID": args.tenantId
                    }
                }
            );

            if (!res.ok) {
                throw new Error(`Auth verification failed: ${res.status}`);
            }

            const userData = await res.json();
            const user = userData.User || userData.user;

            if (!user) {
                throw new Error("User data missing in Auth response");
            }

            const email = user.Email || user.email;

            // Fetch registration by email
            const registration = await ctx.runQuery(
                api.internal.getRegistrationByEmail,
                { email }
            );

            // Role-specific data
            let linkedDeelnemer: Doc<"registrations"> | null = null;
            let volunteerTasks: Doc<"volunteer_tasks">[] = [];

            if (registration) {
                // Begeleider: fetch the deelnemer they're accompanying
                if (registration.role === "begeleider" && registration.companionEmail) {
                    linkedDeelnemer = await ctx.runQuery(
                        api.internal.getLinkedDeelnemer,
                        { companionEmail: registration.companionEmail }
                    );
                }

                // Vrijwilliger: fetch assigned tasks
                if (registration.role === "vrijwilliger") {
                    volunteerTasks = await ctx.runQuery(
                        api.internal.getVolunteerTasks,
                        { registrationId: registration._id }
                    );
                }
            }

            return {
                user: { email, id: user.ID || user.id },
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
        // Begeleider companion fields
        companionName: v.optional(v.string()),
        companionEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const API_URL = process.env.LAVENTECARE_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${args.token}`,
                "X-Tenant-ID": args.tenantId
            }
        });

        if (!res.ok) throw new Error("Unauthorized");
        const userData = await res.json();
        const user = userData.User || userData.user || userData;
        const email = user.Email || user.email;

        if (!email) throw new Error("Email not found in token");

        const registration = await ctx.runQuery(api.internal.getRegistrationByEmail, { email });

        if (!registration) throw new Error("Registration not found");

        // @ts-ignore - Internal mutation types might not be generated yet
        await ctx.runMutation(api.internal.updateRegistration, {
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
        const API_URL = process.env.LAVENTECARE_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${args.token}`,
                "X-Tenant-ID": args.tenantId
            }
        });

        if (!res.ok) throw new Error("Unauthorized");

        // Update the task status to "confirmed"
        // @ts-ignore - Internal mutation types might not be generated yet
        await ctx.runMutation(api.internal.updateVolunteerTaskStatus, {
            id: args.taskId,
            status: "confirmed",
        });
    },
});
