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
    user_id: string; // From Go: user_id
    role?: string;   // From Go: role
    last_active: string; // From Go: last_active (Time)

    // Properties filled by Context or Frontend fallback if needed
    name?: string;
    isOnline?: boolean;
}

export interface Reaction {
    emoji: string;
    user: string;
    name: string;
}

export interface DirectMessage {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    is_read: boolean;
    type?: "text" | "image" | "system";
    reactions?: Reaction[];
    created_at: string; // ISO String from Go
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
    message_id: string;
    last_message: string;
    last_message_at: string;
    is_read: boolean;
    other_user_id: string;
    other_user_name: string;
    other_user_email: string;
    other_user_role?: string;
}

export interface UnreadStats {
    counts: Record<string, number>;
    total: number;
}

export type ChatView = 'list' | 'dm' | 'group' | 'create-group';
