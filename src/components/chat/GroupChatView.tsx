import { useState, useEffect, useRef } from 'react';
import { useTypingIndicator } from '../../hooks/usePresence';
import type { ChatUser, GroupConversation, GroupMessage } from './types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { addToast } from '../../lib/toast';
import { apiRequest } from '../../lib/api';

interface GroupChatViewProps {
    currentUser: ChatUser;
    group: GroupConversation;
}

export function GroupChatView({ currentUser, group }: GroupChatViewProps) {
    const [messageInput, setMessageInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const { startTyping, stopTyping } = useTypingIndicator(currentUser.email);

    // Initial Fetch & SSE Subscription
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await apiRequest(`/v1/messages/groups/${group.id}/messages`);
                if (Array.isArray(res)) setMessages(res);
            } catch (e) {
                console.warn("Failed to fetch group messages", e);
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
    }, [group.id]);

    const messageList = messages || [];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messageList]);

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
            await apiRequest(`/v1/messages/groups/${group.id}/messages`, {
                method: 'POST',
                body: JSON.stringify({
                    content,
                    type: "text"
                })
            });
        } catch {
            setMessageInput(content);
            addToast("Bericht kon niet worden verzonden", "error");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-glass-border overscroll-contain" ref={scrollRef}>
                {messageList.map((msg) => (
                    <MessageBubble
                        key={msg.id || msg.created_at}
                        message={msg as any}
                        isMe={msg.sender_id === currentUser.id || msg.sender_id === currentUser.email}
                        currentUser={currentUser}
                        onReact={() => { }} // Reactions not yet implemented in Go for groups
                        showSenderName
                    />
                ))}
                <div className="h-2" />
            </div>

            <ChatInput
                value={messageInput}
                onChange={(v) => { setMessageInput(v); if (v.trim()) startTyping(`group:${group.id}`); }}
                onSend={handleSend}
                showEmojiPicker={showEmojiPicker}
                onToggleEmoji={() => setShowEmojiPicker(!showEmojiPicker)}
                onEmojiSelect={(emoji: string) => setMessageInput(prev => prev + emoji)}
            />
        </div>
    );
}
