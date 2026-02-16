import { Star, Paperclip } from 'lucide-react';
import type { Email } from '../../types/email';

interface EmailListItemProps {
    email: Email;
    isSelected: boolean;
    onClick: () => void;
}

export function EmailListItem({ email, isSelected, onClick }: EmailListItemProps) {
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Nu';
        if (diffMins < 60) return `${diffMins}m geleden`;
        if (diffHours < 24) return `${diffHours}u geleden`;
        if (diffDays < 7) return `${diffDays}d geleden`;

        return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
    };

    return (
        <button
            onClick={onClick}
            aria-label={`Email van ${email.from_name || email.from_address}, ${email.subject || 'Geen onderwerp'}`}
            className={`
                w-full text-left px-6 py-4 transition-[background-color,border-color] duration-200 cursor-pointer
                ${isSelected
                    ? 'bg-brand-orange/5 border-l-2 border-brand-orange'
                    : 'hover:bg-white/5'
                }
                ${!email.is_read
                    ? 'bg-brand-orange/5 border-l-2 border-brand-orange/40'
                    : ''
                }
            `}
        >
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    {/* From */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm truncate ${!email.is_read ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                            {email.from_name || email.from_address}
                        </span>
                        <span className="text-xs text-text-muted shrink-0">
                            {formatRelativeTime(email.received_at)}
                        </span>
                    </div>

                    {/* Subject */}
                    <div className={`text-sm truncate mb-1 ${!email.is_read ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                        {email.subject || '(Geen onderwerp)'}
                    </div>

                    {/* Preview */}
                    <div className="text-xs text-text-muted line-clamp-1">
                        {email.from_address}
                    </div>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-2 shrink-0">
                    {email.has_attachments && (
                        <Paperclip className="w-4 h-4 text-text-muted" />
                    )}
                    {email.is_starred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    {!email.is_read && (
                        <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse shadow-[0_0_8px_color-mix(in_srgb,var(--color-brand-orange),transparent_40%)]" />
                    )}
                </div>
            </div>
        </button>
    );
}
