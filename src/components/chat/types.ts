
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
    user_id: string; // From Go: UUID
    email?: string;  // From Go: email address
    role?: string;   // From Go: role
    last_active: string; // From Go: last_active (Time, zero if offline)

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
    id: string;
    name: string;
    avatar_emoji?: string;
    created_at: string;
    last_message?: string;
    last_message_at?: string;
}

export interface GroupMessage {
    id: string;
    sender_id: string;
    sender_name: string;
    content: string;
    type: "text" | "image" | "system";
    reactions?: Reaction[];
    created_at: string;
}

export interface GroupMember {
    id: string;
    name: string;
    email: string;
    global_role: string;
    group_role: string;
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
