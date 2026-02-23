import { useState, useEffect, useRef } from 'react';
import { useTypingIndicator } from '../../hooks/usePresence';
import type { ChatUser, DirectMessage } from './types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingDots } from './TypingDots';
import { addToast } from '../../lib/toast';
import { apiRequest } from '../../lib/api';

interface DirectMessageViewProps {
    currentUser: ChatUser;
    otherUser: { id: string; name: string };
}

export function DirectMessageView({ currentUser, otherUser }: DirectMessageViewProps) {
    const [messageInput, setMessageInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasMarkedReadRef = useRef<string | null>(null);

    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const typingUsers: any[] = []; // Subbed out Convex typing for now
    const isOtherTyping = false;
    const { startTyping, stopTyping } = useTypingIndicator(currentUser.email);

    // Initial Fetch & SSE Subscription
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await apiRequest(`/v1/messages/${otherUser.id}`);
                if (Array.isArray(res)) setMessages(res);
            } catch (e) {
                console.warn("Failed to fetch messages", e);
            }
        };
        fetchMessages();

        const eventSource = new EventSource('/api/v1/messages/stream', { withCredentials: true });
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "NEW_MESSAGE") {
                    // Re-fetch to guarantee correct ordering and DB IDs
                    fetchMessages();
                }
            } catch (e) { }
        };

        return () => eventSource.close();
    }, [otherUser.id]);

    const messageList = messages || [];

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messageList]);

    // Mark as read 
    useEffect(() => {
        if (messageList.length > 0 && hasMarkedReadRef.current !== otherUser.id) {
            hasMarkedReadRef.current = otherUser.id;
            apiRequest(`/v1/messages/${otherUser.id}/read`, { method: 'PATCH' }).catch(console.warn);
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
        const tempMsg: DirectMessage = {
            id: Date.now().toString(),
            sender_id: currentUser.email, // using email as id mapping, wait, Go expects UUID. Assuming user ID maps to email here or backend maps it
            recipient_id: otherUser.id,
            content: content,
            is_read: false,
            type: "text",
            created_at: new Date().toISOString()
        };

        try {
            // Optimistic UI Update
            setMessages(prev => [...prev, tempMsg]);

            await apiRequest('/v1/messages', {
                method: 'POST',
                body: JSON.stringify({
                    recipient_id: otherUser.id,
                    content: content
                })
            });
        } catch {
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
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
                        key={msg.id || msg.created_at}
                        message={msg}
                        isMe={msg.sender_id === currentUser.email}
                        currentUser={currentUser}
                        onReact={() => { }} // Reactions temporarily subbed out
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
