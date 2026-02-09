
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Presence System
 * Logic: Updates "lastActive" timestamp.
 * Status is derived from (now - lastActive) < 60s.
 */

export const heartbeat = mutation({
    args: {
        user: v.string(), // Email or ID
        name: v.string(),
        path: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("presence")
            .withIndex("by_user", (q) => q.eq("user", args.user))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                lastActive: Date.now(),
                status: "online",
                currentPath: args.path,
                name: args.name // Update name if changed
            });
        } else {
            await ctx.db.insert("presence", {
                user: args.user,
                name: args.name,
                lastActive: Date.now(),
                status: "online",
                currentPath: args.path
            });
        }
    }
});

export const getOnlineUsers = query({
    args: {},
    handler: async (ctx) => {
        const presence = await ctx.db.query("presence").collect();
        const now = Date.now();
        // Return users active in last 60s (Smart Polling compatibility)
        return presence.filter(p => (now - p.lastActive) < 60000).map(p => ({
            user: p.user,
            name: p.name,
            status: p.status,
            path: p.currentPath
        }));
    }
});

/**
 * Direct Messaging System
 */

export const getConversations = query({
    args: { user: v.string() },
    handler: async (ctx, args) => {
        // This is a naive implementation (full scan). 
        // For production, we'd use a separate "conversations" table to aggregate this.
        // Given constraints, we'll fetch messages where user is sender OR recipient.

        const sent = await ctx.db
            .query("direct_messages")
            .withIndex("by_participants", (q) => q.eq("sender", args.user))
            .collect();

        const received = await ctx.db
            .query("direct_messages")
            .withIndex("by_recipient_read", (q) => q.eq("recipient", args.user))
            .collect(); // Can't index OR queries easily in Convex w/o helper

        // Group by 'other user'
        const allMessages = [...sent, ...received];
        const conversations = new Map();

        allMessages.sort((a, b) => b.createdAt - a.createdAt); // Newest first

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
        // Fetch conversation thread
        // We need conversationId to be strictly defined as [min(u1,u2), max(u1,u2)].join(":")
        // But for now, let's just fetch all and filter (simple for MVP).

        const all = await ctx.db.query("direct_messages").collect();
        const thread = all.filter(msg =>
            (msg.sender === args.currentUser && msg.recipient === args.otherUser) ||
            (msg.sender === args.otherUser && msg.recipient === args.currentUser)
        );

        return thread.sort((a, b) => a.createdAt - b.createdAt);
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
        await ctx.db.insert("direct_messages", {
            sender: args.sender,
            recipient: args.recipient,
            content: args.content,
            isRead: false,
            type: args.type || "text",
            createdAt: Date.now()
        });
    }
});

export const markAsRead = mutation({
    args: {
        recipient: v.string(),
        sender: v.string()
    },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("direct_messages")
            .withIndex("by_participants", (q) => q.eq("sender", args.sender).eq("recipient", args.recipient))
            .collect();

        // Actually this index is wrong for this query (sender is the OTHER person).
        // Let's rely on filter for now or correct index usage.
        // Correct: User is 'recipient', Sender is 'sender'.

        // Optimally:
        // const unread = await ctx.db.query("direct_messages").withIndex("by_recipient_read", q => q.eq("recipient", args.recipient).eq("isRead", false)).collect();
        // But we want only from specific sender.

        // Let's iterate and patch.
        const allMessages = await ctx.db.query("direct_messages").collect();
        const toMark = allMessages.filter(m =>
            m.recipient === args.recipient &&
            m.sender === args.sender &&
            !m.isRead
        );

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

        // Group by sender
        const counts: Record<string, number> = {};
        let total = 0;

        for (const msg of unreadMessages) {
            counts[msg.sender] = (counts[msg.sender] || 0) + 1;
            total++;
        }

        return { counts, total };
    }
});
