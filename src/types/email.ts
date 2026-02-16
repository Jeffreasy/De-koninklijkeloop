// Shared Email types for admin email components
// Single source of truth — used by EmailManagerIsland, ComposeModal, EmailDetailPanel

export interface Email {
    id: string;
    account: string;
    message_id: string;
    subject: string;
    from_address: string;
    from_name?: string;
    to_addresses: string[];
    has_attachments: boolean;
    is_read: boolean;
    is_starred: boolean;
    is_archived: boolean;
    thread_id?: string;
    received_at: string;
}

export interface EmailStats {
    unread_count: number;
    starred_count: number;
    total_count: number;
    archived_count: number;
}

export interface Attachment {
    filename: string;
    content_type: string;
    size: number;
    storage_url?: string;
}

export interface FullEmail extends Email {
    body_html?: string;
    body_text?: string;
    attachments: Attachment[];
}

export type Account = 'info' | 'inschrijving';
