import type { Id } from '../../../convex/_generated/dataModel';

export interface ChatUser {
    id: string;
    name: string;
    email: string;
    role?: string;
}

export interface ChatWidgetProps {
    currentUser: ChatUser;
    convexUrl: string;
}

export interface TeamMember {
    user: string;
    name: string;
    role?: string;
    isOnline: boolean;
    lastActive: number;
    path?: string;
}

export interface Reaction {
    emoji: string;
    user: string;
    name: string;
}

export interface DirectMessage {
    _id: Id<"direct_messages">;
    sender: string;
    recipient: string;
    content: string;
    isRead: boolean;
    type: "text" | "image" | "system";
    conversationId?: string;
    reactions?: Reaction[];
    createdAt: number;
}

export interface GroupConversation {
    _id: Id<"group_conversations">;
    name: string;
    members: string[];
    avatarEmoji?: string;
    lastMessageAt?: number;
    lastMessagePreview?: string;
    createdAt: number;
}

export interface GroupMessage {
    _id: Id<"group_messages">;
    groupId: Id<"group_conversations">;
    sender: string;
    senderName: string;
    content: string;
    type: "text" | "image" | "system";
    reactions?: Reaction[];
    createdAt: number;
}

export interface ConversationSummary {
    otherUser: string;
    lastMessage: string;
    timestamp: number;
    isRead: boolean;
}

export interface UnreadStats {
    counts: Record<string, number>;
    total: number;
}

export type ChatView = 'list' | 'dm' | 'group' | 'create-group';
