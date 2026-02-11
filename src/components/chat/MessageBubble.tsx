import { useState, memo } from 'react';
import type { DirectMessage, GroupMessage, ChatUser, Reaction } from './types';
import { QUICK_REACTIONS } from './utils';
import { ReactionDisplay } from './ReactionDisplay';

interface MessageBubbleProps {
    message: DirectMessage | GroupMessage;
    isMe: boolean;
    currentUser: ChatUser;
    onReact: (emoji: string) => void;
    showSenderName?: boolean;
}

export const MessageBubble = memo(function MessageBubble({ message, isMe, currentUser, onReact, showSenderName }: MessageBubbleProps) {
    const [showReactions, setShowReactions] = useState(false);

    if ('type' in message && message.type === "system") {
        return (
            <div className="text-center py-2">
                <span className="text-[10px] text-text-muted bg-white/5 px-3 py-1 rounded-full">{message.content}</span>
            </div>
        );
    }

    const groupMsg = showSenderName ? (message as GroupMessage) : null;
    const dmMsg = !showSenderName ? (message as DirectMessage) : null;

    return (
        <div
            className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg`}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
        >
            <div className="relative max-w-[85%]">
                <div className={`p-3.5 rounded-2xl text-sm shadow-sm ${isMe
                    ? 'bg-brand-orange text-white rounded-tr-sm'
                    : 'bg-white/10 text-text-body rounded-tl-sm border border-white/5'
                    }`}>
                    {showSenderName && !isMe && groupMsg && (
                        <div className="text-[10px] font-bold text-brand-orange mb-1">{groupMsg.senderName}</div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">{message.content}</p>
                    <div className={`text-[9px] mt-1 text-right opacity-60 ${isMe ? 'text-white' : 'text-text-muted'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && dmMsg && (
                            <span className="ml-1 inline-block">
                                {dmMsg.isRead ? '✓✓' : '✓'}
                            </span>
                        )}
                    </div>
                </div>

                {showReactions && (
                    <div className={`absolute -top-8 ${isMe ? 'right-0' : 'left-0'} flex gap-0.5 bg-surface/95 backdrop-blur-md border border-glass-border rounded-full px-1.5 py-1 shadow-lg z-10 animate-in fade-in zoom-in-95 duration-150`}>
                        {QUICK_REACTIONS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => onReact(emoji)}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-sm hover:scale-125 active:scale-90"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {message.reactions && message.reactions.length > 0 && (
                    <ReactionDisplay reactions={message.reactions} onReact={onReact} currentUser={currentUser.email} />
                )}
            </div>
        </div>
    );
});
