import { memo } from 'react';
import type { Reaction } from './types';

interface ReactionDisplayProps {
    reactions: Reaction[];
    onReact: (emoji: string) => void;
    currentUser: string;
}

export const ReactionDisplay = memo(function ReactionDisplay({ reactions, onReact, currentUser }: ReactionDisplayProps) {
    const grouped = reactions.reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = [];
        acc[r.emoji].push(r);
        return acc;
    }, {} as Record<string, Reaction[]>);

    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(grouped).map(([emoji, users]) => (
                <button
                    key={emoji}
                    onClick={() => onReact(emoji)}
                    className={`flex items-center gap-1 px-2 py-1 min-h-[36px] rounded-full text-xs transition-colors border cursor-pointer touch-action-manipulation ${users.some(u => u.user === currentUser)
                        ? 'bg-brand-orange/20 border-brand-orange/40 text-white'
                        : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10'
                        }`}
                    title={users.map(u => u.name).join(', ')}
                >
                    <span>{emoji}</span>
                    <span className="text-[10px] font-bold">{users.length}</span>
                </button>
            ))}
        </div>
    );
});
