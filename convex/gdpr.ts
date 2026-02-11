import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DELETED_USER_LABEL = "Verwijderd Account";

// ═══════════════════════════════════════════════════
// GDPR Art. 17: Right to Erasure — Convex Data Cleanup
// ═══════════════════════════════════════════════════
// Deletes or anonymizes all user-attributable data across Convex tables.
// Called BEFORE the Go backend DELETE /auth/account endpoint.
// Tables: registrations, donations, social_reactions, messages, feedback,
//         presence, direct_messages, group_conversations, group_messages, media

export const deleteUserData = mutation({
    args: {
        email: v.string(),
        authUserId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { email, authUserId } = args;
        const stats = {
            registrations: 0,
            donations: 0,
            socialReactions: 0,
            messages: 0,
            feedback: 0,
            presence: 0,
            directMessages: 0,
            groupConversations: 0,
            groupMessages: 0,
            media: 0,
        };

        // 1. Registrations — delete by authUserId first, fallback to email
        if (authUserId) {
            const byAuth = await ctx.db
                .query("registrations")
                .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
                .collect();
            for (const reg of byAuth) {
                // Also delete linked volunteer_tasks
                const tasks = await ctx.db
                    .query("volunteer_tasks")
                    .withIndex("by_registration", (q) => q.eq("registrationId", reg._id))
                    .collect();
                for (const task of tasks) {
                    await ctx.db.delete(task._id);
                }
                await ctx.db.delete(reg._id);
                stats.registrations++;
            }
        }
        // Also check by email (guest registrations without authUserId)
        const byEmail = await ctx.db
            .query("registrations")
            .withIndex("by_email", (q) => q.eq("email", email))
            .collect();
        for (const reg of byEmail) {
            const tasks = await ctx.db
                .query("volunteer_tasks")
                .withIndex("by_registration", (q) => q.eq("registrationId", reg._id))
                .collect();
            for (const task of tasks) {
                await ctx.db.delete(task._id);
            }
            await ctx.db.delete(reg._id);
            stats.registrations++;
        }

        // 2. Donations — delete by donorEmail
        const donations = await ctx.db
            .query("donations")
            .withIndex("by_email", (q) => q.eq("donorEmail", email))
            .collect();
        for (const donation of donations) {
            await ctx.db.delete(donation._id);
            stats.donations++;
        }

        // 3. Social Reactions — delete by userId (email or authUserId)
        const lookupIds = [email, authUserId].filter(Boolean) as string[];
        for (const userId of lookupIds) {
            const reactions = await ctx.db
                .query("social_reactions")
                .filter((q) => q.eq(q.field("userId"), userId))
                .collect();
            for (const reaction of reactions) {
                await ctx.db.delete(reaction._id);
                stats.socialReactions++;
            }
        }

        // 4. Contact Messages — delete by email
        const contactMessages = await ctx.db
            .query("messages")
            .withIndex("by_email", (q) => q.eq("email", email))
            .collect();
        for (const msg of contactMessages) {
            await ctx.db.delete(msg._id);
            stats.messages++;
        }

        // 5. Feedback — anonymize (preserve content for admin audit)
        const feedbackItems = await ctx.db
            .query("feedback")
            .filter((q) =>
                q.or(
                    q.eq(q.field("userId"), email),
                    q.eq(q.field("userEmail"), email),
                    ...(authUserId ? [q.eq(q.field("userId"), authUserId)] : [])
                )
            )
            .collect();
        for (const fb of feedbackItems) {
            await ctx.db.patch(fb._id, {
                userId: undefined,
                userName: undefined,
                userEmail: undefined,
            });
            stats.feedback++;
        }

        // 6. Presence — delete by user
        const presenceRecords = await ctx.db
            .query("presence")
            .withIndex("by_user", (q) => q.eq("user", email))
            .collect();
        for (const p of presenceRecords) {
            await ctx.db.delete(p._id);
            stats.presence++;
        }

        // 7. Direct Messages — anonymize sender (preserve conversation for other user)
        const dmAsSender = await ctx.db
            .query("direct_messages")
            .filter((q) => q.eq(q.field("sender"), email))
            .collect();
        for (const dm of dmAsSender) {
            const cleanedReactions = dm.reactions?.map((r) =>
                r.user === email ? { ...r, user: DELETED_USER_LABEL, name: DELETED_USER_LABEL } : r
            );
            await ctx.db.patch(dm._id, {
                sender: DELETED_USER_LABEL,
                reactions: cleanedReactions,
            });
            stats.directMessages++;
        }
        // Also anonymize reactions where user is mentioned but not sender
        const dmAsRecipient = await ctx.db
            .query("direct_messages")
            .filter((q) => q.eq(q.field("recipient"), email))
            .collect();
        for (const dm of dmAsRecipient) {
            if (dm.reactions?.some((r) => r.user === email)) {
                const cleanedReactions = dm.reactions.map((r) =>
                    r.user === email ? { ...r, user: DELETED_USER_LABEL, name: DELETED_USER_LABEL } : r
                );
                await ctx.db.patch(dm._id, { reactions: cleanedReactions });
            }
        }

        // 8. Group Conversations — remove from members array
        const allGroups = await ctx.db.query("group_conversations").collect();
        for (const group of allGroups) {
            if (group.members.includes(email)) {
                const updatedMembers = group.members.filter((m) => m !== email);
                if (updatedMembers.length === 0) {
                    // Delete empty group
                    const groupMsgs = await ctx.db
                        .query("group_messages")
                        .withIndex("by_group", (q) => q.eq("groupId", group._id))
                        .collect();
                    for (const gm of groupMsgs) {
                        await ctx.db.delete(gm._id);
                    }
                    await ctx.db.delete(group._id);
                } else {
                    await ctx.db.patch(group._id, { members: updatedMembers });
                    if (group.createdBy === email) {
                        await ctx.db.patch(group._id, { createdBy: DELETED_USER_LABEL });
                    }
                }
                stats.groupConversations++;
            }
        }

        // 9. Group Messages — anonymize sender/senderName
        const groupMessages = await ctx.db
            .query("group_messages")
            .filter((q) => q.eq(q.field("sender"), email))
            .collect();
        for (const gm of groupMessages) {
            const cleanedReactions = gm.reactions?.map((r) =>
                r.user === email ? { ...r, user: DELETED_USER_LABEL, name: DELETED_USER_LABEL } : r
            );
            await ctx.db.patch(gm._id, {
                sender: DELETED_USER_LABEL,
                senderName: DELETED_USER_LABEL,
                reactions: cleanedReactions,
            });
            stats.groupMessages++;
        }

        // 10. Media — delete uploaded by user
        const mediaItems = await ctx.db
            .query("media")
            .withIndex("by_uploader", (q) => q.eq("uploaderEmail", email))
            .collect();
        for (const m of mediaItems) {
            await ctx.db.delete(m._id);
            stats.media++;
        }

        return stats;
    },
});

// ═══════════════════════════════════════════════════
// GDPR Art. 20: Right to Data Portability — Convex Data Export
// ═══════════════════════════════════════════════════
// Collects all user-attributable data from Convex for JSON export.
// Frontend merges this with the Go backend export.

export const exportUserData = query({
    args: {
        email: v.string(),
        authUserId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { email, authUserId } = args;

        // Registrations (by authUserId + email)
        let registrations = [];
        if (authUserId) {
            const byAuth = await ctx.db
                .query("registrations")
                .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
                .collect();
            registrations.push(...byAuth);
        }
        const byEmail = await ctx.db
            .query("registrations")
            .withIndex("by_email", (q) => q.eq("email", email))
            .collect();
        // Deduplicate (authUserId lookup may overlap with email lookup)
        const regIds = new Set(registrations.map((r) => r._id));
        for (const reg of byEmail) {
            if (!regIds.has(reg._id)) {
                registrations.push(reg);
            }
        }

        // Donations
        const donations = await ctx.db
            .query("donations")
            .withIndex("by_email", (q) => q.eq("donorEmail", email))
            .collect();

        // Contact Messages
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_email", (q) => q.eq("email", email))
            .collect();

        // Feedback
        const feedback = await ctx.db
            .query("feedback")
            .filter((q) =>
                q.or(
                    q.eq(q.field("userId"), email),
                    q.eq(q.field("userEmail"), email),
                    ...(authUserId ? [q.eq(q.field("userId"), authUserId)] : [])
                )
            )
            .collect();

        // Social Reactions
        const lookupIds = [email, authUserId].filter(Boolean) as string[];
        let socialReactions: any[] = [];
        for (const userId of lookupIds) {
            const reactions = await ctx.db
                .query("social_reactions")
                .filter((q) => q.eq(q.field("userId"), userId))
                .collect();
            socialReactions.push(...reactions);
        }

        // Media uploads
        const media = await ctx.db
            .query("media")
            .withIndex("by_uploader", (q) => q.eq("uploaderEmail", email))
            .collect();

        // Direct Messages (sent by user)
        const directMessages = await ctx.db
            .query("direct_messages")
            .filter((q) => q.eq(q.field("sender"), email))
            .collect();

        return {
            registrations,
            donations,
            messages,
            feedback,
            socialReactions,
            media: media.map(({ uploaderEmail, ...rest }) => rest),
            directMessages: directMessages.map(({ sender, ...rest }) => ({
                ...rest,
                sent_by_you: true,
            })),
        };
    },
});
