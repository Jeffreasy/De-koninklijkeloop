import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { TeamMember } from './types';

interface DmStatusLineProps {
    userId: string;
    teamMembers: TeamMember[];
    currentUser: string;
}

export function DmStatusLine({ userId, teamMembers, currentUser }: DmStatusLineProps) {
    const member = teamMembers.find(m => m.user_id === userId);
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

    return (
        <p className="text-xs text-text-muted font-medium">
            Laatst gezien {formatLastSeen(member.last_active)}
        </p>
    );
}

function formatLastSeen(timestamp: string): string {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "zojuist";
    if (minutes < 60) return `${minutes} min geleden`;
    if (hours < 24) {
        const date = new Date(timestamp);
        return `om ${date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (days === 1) return "gisteren";
    if (days < 7) return `${days} dagen geleden`;

    return new Date(timestamp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}
