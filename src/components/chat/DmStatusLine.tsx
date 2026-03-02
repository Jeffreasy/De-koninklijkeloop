import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { TeamMember } from './types';

interface DmStatusLineProps {
    userId: string;   // This is an email address (from the chat conversations)
    teamMembers: TeamMember[];
    currentUser: string;
}

export function DmStatusLine({ userId, teamMembers, currentUser }: DmStatusLineProps) {
    // Go API returns user_id (UUID) + email separately.
    // userId here is an email — match on email field.
    const member = teamMembers.find(m => (m as any).email === userId || m.user_id === userId);
    const typingUsers = useQuery(api.chat.getTypingStatus, { user: currentUser }) || [];
    const isTyping = typingUsers.some(t => t.user === userId);

    if (isTyping) {
        return <p className="text-xs text-brand-orange font-medium animate-pulse">aan het typen...</p>;
    }

    if (!member) return null;

    if (member.isOnline) {
        return (
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Online
            </p>
        );
    }

    const lastActive = (member as any).last_active;
    // Guard against Go zero-time ("0001-01-01T00:00:00Z") — treat as no data
    const hasLastSeen = lastActive && new Date(lastActive).getFullYear() >= 2000;
    return (
        <p className="text-xs text-text-muted font-medium">
            {hasLastSeen ? `Laatste gezien ${formatLastSeen(lastActive)}` : 'Nooit actief geweest'}
        </p>
    );
}

function formatLastSeen(timestamp: string | number): string {
    if (!timestamp) return 'onbekend';

    const date = typeof timestamp === 'number'
        ? new Date(timestamp)
        : new Date(timestamp);

    // Guard against zero-value Go time (0001-01-01)
    if (isNaN(date.getTime()) || date.getFullYear() < 2000) return 'onbekend';

    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'zojuist';
    if (minutes < 60) return `${minutes} min geleden`;
    if (hours < 24) return `om ${date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
    if (days === 1) return 'gisteren';
    if (days < 7) return `${days} dagen geleden`;

    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}
