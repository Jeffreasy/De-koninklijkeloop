import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useTypingIndicator } from '../../hooks/usePresence';
import type { ChatUser, DirectMessage } from './types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingDots } from './TypingDots';
import { addToast } from '../../lib/toast';

interface DirectMessageViewProps {
    currentUser: ChatUser;
    otherUser: { id: string; name: string };
}

export function DirectMessageView({ currentUser, otherUser }: DirectMessageViewProps) {
    const [messageInput, setMessageInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasMarkedReadRef = useRef<string | null>(null);

    const messages = useQuery(api.chat.getMessages, { currentUser: currentUser.email, otherUser: otherUser.id }) as DirectMessage[] | undefined;
    const sendMessage = useMutation(api.chat.sendMessage);
    const markAsRead = useMutation(api.chat.markAsRead);
    const addReaction = useMutation(api.chat.addReaction);
    const typingUsers = useQuery(api.chat.getTypingStatus, { user: currentUser.email }) || [];
    const isOtherTyping = typingUsers.some(t => t.user === otherUser.id);
    const { startTyping, stopTyping } = useTypingIndicator(currentUser.email);

    const messageList = messages || [];

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messageList]);

    // Mark as read — only once per conversation, not on every message update
    useEffect(() => {
        if (messageList.length > 0 && hasMarkedReadRef.current !== otherUser.id) {
            hasMarkedReadRef.current = otherUser.id;
            markAsRead({ recipient: currentUser.email, sender: otherUser.id });
        }
    }, [messageList.length, otherUser.id]);

    const handleSend = async () => {
        const content = messageInput.trim();
        if (!content) return;
        if (content.length > 2000) {
            addToast("Bericht is te lang (max 2000 tekens)", "error");
            return;
        }
        stopTyping();
        setMessageInput("");
        setShowEmojiPicker(false);
        try {
            await sendMessage({
                sender: currentUser.email,
                recipient: otherUser.id,
                content,
                type: "text"
            });

            // Dual Dispatch (Hybrid Data Pattern)
            // Fire-and-forget sync to the LaventeCare Go API for persistent backup & compliance.
            // The Astro Proxy automatically injects the HttpOnly token + Tenant ID.
            fetch('/api/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient_id: otherUser.id,
                    content: content
                })
            }).catch(e => console.warn("Background sync to API failed:", e));

        } catch {
            setMessageInput(content);
            addToast("Bericht kon niet worden verzonden", "error");
        }
    };

    const handleInputChange = (value: string) => {
        setMessageInput(value);
        if (value.trim()) {
            startTyping(otherUser.id);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-glass-border scrollbar-track-transparent overscroll-contain" ref={scrollRef}>
                {messageList.map((msg) => (
                    <MessageBubble
                        key={msg._id}
                        message={msg}
                        isMe={msg.sender === currentUser.email}
                        currentUser={currentUser}
                        onReact={(emoji) => addReaction({ messageId: msg._id, emoji, user: currentUser.email, name: currentUser.name })}
                    />
                ))}
                {isOtherTyping && (
                    <div className="flex justify-start">
                        <div className="bg-glass-surface/50 rounded-2xl rounded-tl-sm px-4 py-3 border border-glass-border/50">
                            <TypingDots />
                        </div>
                    </div>
                )}
                <div className="h-2" />
            </div>

            <ChatInput
                value={messageInput}
                onChange={handleInputChange}
                onSend={handleSend}
                showEmojiPicker={showEmojiPicker}
                onToggleEmoji={() => setShowEmojiPicker(!showEmojiPicker)}
                onEmojiSelect={(emoji: string) => setMessageInput(prev => prev + emoji)}
            />
        </div>
    );
}
