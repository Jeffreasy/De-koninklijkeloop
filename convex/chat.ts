
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Helpers ──────────────────────────────────────────────────

function makeConversationId(a: string, b: string): string {
    return a < b ? `${a}:${b}` : `${b}:${a}`;
}

// ─── Presence System ──────────────────────────────────────────

export const heartbeat = mutation({
    args: {
        user: v.string(),
        name: v.string(),
        path: v.optional(v.string()),
        role: v.optional(v.union(v.literal("admin"), v.literal("editor")))
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("presence")
            .withIndex("by_user", (q) => q.eq("user", args.user))
            .first();

        const data = {
            lastActive: Date.now(),
            status: "online" as const,
            currentPath: args.path,
            name: args.name,
            role: args.role,
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
        } else {
            await ctx.db.insert("presence", {
                user: args.user,
                ...data,
            });
        }
    }
});

export const getOnlineUsers = query({
    args: {},
    handler: async (ctx) => {
        const presence = await ctx.db.query("presence").collect();
        const now = Date.now();
        return presence.filter(p => (now - p.lastActive) < 60000).map(p => ({
            user: p.user,
            name: p.name,
            status: p.status,
            path: p.currentPath,
            role: p.role,
        }));
    }
});

export const getAllTeamMembers = query({
    args: {},
    handler: async (ctx) => {
        const presence = await ctx.db.query("presence").collect();
        const now = Date.now();

        return presence.map(p => ({
            user: p.user,
            name: p.name,
            role: p.role,
            isOnline: (now - p.lastActive) < 60000,
            lastActive: p.lastActive,
            path: p.currentPath,
        }));
    }
});

// ─── Typing Indicator ─────────────────────────────────────────

export const setTyping = mutation({
    args: {
        user: v.string(),
        typingTo: v.optional(v.string()), // null = stopped typing
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("presence")
            .withIndex("by_user", (q) => q.eq("user", args.user))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                typingTo: args.typingTo,
                typingUpdatedAt: args.typingTo ? Date.now() : undefined,
            });
        }
    }
});

export const getTypingStatus = query({
    args: { user: v.string() },
    handler: async (ctx, args) => {
        const presence = await ctx.db.query("presence").collect();
        const now = Date.now();

        // Find anyone typing TO this user (within last 4s)
        const typingUsers = presence.filter(p =>
            p.typingTo === args.user &&
            p.typingUpdatedAt &&
            (now - p.typingUpdatedAt) < 4000
        );

        return typingUsers.map(p => ({
            user: p.user,
            name: p.name,
        }));
    }
});

// ─── Direct Messaging ─────────────────────────────────────────

export const getConversations = query({
    args: { user: v.string() },
    handler: async (ctx, args) => {
        const sent = await ctx.db
            .query("direct_messages")
            .withIndex("by_participants", (q) => q.eq("sender", args.user))
            .collect();

        const received = await ctx.db
            .query("direct_messages")
            .withIndex("by_recipient_read", (q) => q.eq("recipient", args.user))
            .collect();

        const allMessages = [...sent, ...received];
        const conversations = new Map();

        allMessages.sort((a, b) => b.createdAt - a.createdAt);

        allMessages.forEach(msg => {
            const otherUser = msg.sender === args.user ? msg.recipient : msg.sender;
            if (!conversations.has(otherUser)) {
                conversations.set(otherUser, {
                    otherUser,
                    lastMessage: msg.content,
                    timestamp: msg.createdAt,
                    isRead: msg.sender === args.user ? true : msg.isRead
                });
            }
        });

        return Array.from(conversations.values());
    }
});

export const getMessages = query({
    args: {
        currentUser: v.string(),
        otherUser: v.string(),
    },
    handler: async (ctx, args) => {
        const conversationId = makeConversationId(args.currentUser, args.otherUser);

        // Try indexed query first (new messages have conversationId)
        const indexed = await ctx.db
            .query("direct_messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
            .collect();

        if (indexed.length > 0) {
            return indexed.sort((a, b) => a.createdAt - b.createdAt);
        }

        // Fallback for legacy messages without conversationId
        const sent = await ctx.db
            .query("direct_messages")
            .withIndex("by_participants", (q) =>
                q.eq("sender", args.currentUser).eq("recipient", args.otherUser)
            )
            .collect();

        const received = await ctx.db
            .query("direct_messages")
            .withIndex("by_participants", (q) =>
                q.eq("sender", args.otherUser).eq("recipient", args.currentUser)
            )
            .collect();

        return [...sent, ...received].sort((a, b) => a.createdAt - b.createdAt);
    }
});

export const sendMessage = mutation({
    args: {
        sender: v.string(),
        recipient: v.string(),
        content: v.string(),
        type: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("system")))
    },
    handler: async (ctx, args) => {
        const conversationId = makeConversationId(args.sender, args.recipient);

        await ctx.db.insert("direct_messages", {
            sender: args.sender,
            recipient: args.recipient,
            content: args.content,
            isRead: false,
            type: args.type || "text",
            conversationId,
            createdAt: Date.now()
        });

        // Clear typing indicator
        const presence = await ctx.db
            .query("presence")
            .withIndex("by_user", (q) => q.eq("user", args.sender))
            .first();
        if (presence) {
            await ctx.db.patch(presence._id, { typingTo: undefined, typingUpdatedAt: undefined });
        }
    }
});

export const markAsRead = mutation({
    args: {
        recipient: v.string(),
        sender: v.string()
    },
    handler: async (ctx, args) => {
        // Use index: find unread messages where recipient is current user
        const unread = await ctx.db
            .query("direct_messages")
            .withIndex("by_recipient_read", (q) => q.eq("recipient", args.recipient).eq("isRead", false))
            .collect();

        // Filter to specific sender
        const toMark = unread.filter(m => m.sender === args.sender);

        for (const msg of toMark) {
            await ctx.db.patch(msg._id, { isRead: true });
        }
    }
});

export const getUnreadCounts = query({
    args: { user: v.string() },
    handler: async (ctx, args) => {
        const unreadMessages = await ctx.db
            .query("direct_messages")
            .withIndex("by_recipient_read", (q) => q.eq("recipient", args.user).eq("isRead", false))
            .collect();

        const counts: Record<string, number> = {};
        let total = 0;

        for (const msg of unreadMessages) {
            counts[msg.sender] = (counts[msg.sender] || 0) + 1;
            total++;
        }

        return { counts, total };
    }
});

// ─── Message Reactions ────────────────────────────────────────

export const addReaction = mutation({
    args: {
        messageId: v.id("direct_messages"),
        emoji: v.string(),
        user: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        const reactions = message.reactions || [];

        // Remove existing reaction from this user (toggle behavior)
        const filtered = reactions.filter(r => !(r.user === args.user && r.emoji === args.emoji));

        if (filtered.length === reactions.length) {
            // No existing reaction found → add it
            filtered.push({ emoji: args.emoji, user: args.user, name: args.name });
        }

        await ctx.db.patch(args.messageId, { reactions: filtered });
    }
});

export const addGroupMessageReaction = mutation({
    args: {
        messageId: v.id("group_messages"),
        emoji: v.string(),
        user: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        const reactions = message.reactions || [];
        const filtered = reactions.filter(r => !(r.user === args.user && r.emoji === args.emoji));

        if (filtered.length === reactions.length) {
            filtered.push({ emoji: args.emoji, user: args.user, name: args.name });
        }

        await ctx.db.patch(args.messageId, { reactions: filtered });
    }
});

// ─── Group Chat ───────────────────────────────────────────────

export const createGroupConversation = mutation({
    args: {
        name: v.string(),
        members: v.array(v.string()),
        createdBy: v.string(),
        avatarEmoji: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Ensure creator is in members
        const members = args.members.includes(args.createdBy)
            ? args.members
            : [args.createdBy, ...args.members];

        const id = await ctx.db.insert("group_conversations", {
            name: args.name,
            members,
            createdBy: args.createdBy,
            avatarEmoji: args.avatarEmoji || "👥",
            createdAt: Date.now(),
        });

        // System message
        await ctx.db.insert("group_messages", {
            groupId: id,
            sender: args.createdBy,
            senderName: "Systeem",
            content: `Groep "${args.name}" is aangemaakt`,
            type: "system",
            createdAt: Date.now(),
        });

        return id;
    }
});

export const getGroupConversations = query({
    args: { user: v.string() },
    handler: async (ctx, args) => {
        const all = await ctx.db
            .query("group_conversations")
            .collect();

        // Filter groups where user is a member
        return all
            .filter(g => g.members.includes(args.user))
            .sort((a, b) => (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt));
    }
});

export const getGroupMessages = query({
    args: { groupId: v.id("group_conversations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("group_messages")
            .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
            .collect();
    }
});

export const sendGroupMessage = mutation({
    args: {
        groupId: v.id("group_conversations"),
        sender: v.string(),
        senderName: v.string(),
        content: v.string(),
        type: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("system"))),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("group_messages", {
            groupId: args.groupId,
            sender: args.sender,
            senderName: args.senderName,
            content: args.content,
            type: args.type || "text",
            createdAt: Date.now(),
        });

        // Update group's last message info
        await ctx.db.patch(args.groupId, {
            lastMessageAt: Date.now(),
            lastMessagePreview: args.content.substring(0, 60),
        });

        // Clear typing indicator
        const presence = await ctx.db
            .query("presence")
            .withIndex("by_user", (q) => q.eq("user", args.sender))
            .first();
        if (presence) {
            await ctx.db.patch(presence._id, { typingTo: undefined, typingUpdatedAt: undefined });
        }
    }
});
