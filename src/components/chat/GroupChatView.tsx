import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useTypingIndicator } from '../../hooks/usePresence';
import type { ChatUser, GroupConversation, GroupMessage } from './types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { addToast } from '../../lib/toast';

interface GroupChatViewProps {
    currentUser: ChatUser;
    group: GroupConversation;
}

export function GroupChatView({ currentUser, group }: GroupChatViewProps) {
    const [messageInput, setMessageInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const messages = useQuery(api.chat.getGroupMessages, { groupId: group._id }) as GroupMessage[] | undefined;
    const sendGroupMessage = useMutation(api.chat.sendGroupMessage);
    const addReaction = useMutation(api.chat.addGroupMessageReaction);
    const { startTyping, stopTyping } = useTypingIndicator(currentUser.email);

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
            await sendGroupMessage({
                groupId: group._id,
                sender: currentUser.email,
                senderName: currentUser.name,
                content,
                type: "text"
            });
        } catch {
            setMessageInput(content);
            addToast("Bericht kon niet worden verzonden", "error");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10" ref={scrollRef}>
                {messageList.map((msg) => (
                    <MessageBubble
                        key={msg._id}
                        message={msg}
                        isMe={msg.sender === currentUser.email}
                        currentUser={currentUser}
                        onReact={(emoji) => addReaction({ messageId: msg._id, emoji, user: currentUser.email, name: currentUser.name })}
                        showSenderName
                    />
                ))}
                <div className="h-2" />
            </div>

            <ChatInput
                value={messageInput}
                onChange={(v) => { setMessageInput(v); if (v.trim()) startTyping(`group:${group._id}`); }}
                onSend={handleSend}
                showEmojiPicker={showEmojiPicker}
                onToggleEmoji={() => setShowEmojiPicker(!showEmojiPicker)}
                onEmojiSelect={(emoji: string) => setMessageInput(prev => prev + emoji)}
            />
        </div>
    );
}
