import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, ConvexProvider, ConvexReactClient } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { MessageSquare, X, Send, Smile, ArrowLeft, Users, Plus, Search, Hash } from 'lucide-react';
import { usePresence, useTypingIndicator } from '../../hooks/usePresence';
import type { Id } from '../../../convex/_generated/dataModel';

// ─── Types ────────────────────────────────────────────────────

interface ChatWidgetProps {
    currentUser: { id: string; name: string; email: string; role?: string };
    convexUrl: string;
}

interface TeamMember {
    user: string;
    name: string;
    role?: string;
    isOnline: boolean;
    lastActive: number;
    path?: string;
}

interface GroupConversation {
    _id: Id<"group_conversations">;
    name: string;
    members: string[];
    avatarEmoji?: string;
    lastMessageAt?: number;
    lastMessagePreview?: string;
}

type ChatView = 'list' | 'dm' | 'group' | 'create-group';

// ─── Root Component ───────────────────────────────────────────

export default function ChatWidget({ currentUser, convexUrl }: ChatWidgetProps) {
    const [convexClient, setConvexClient] = useState<ConvexReactClient | null>(null);

    useEffect(() => {
        if (convexUrl) {
            setConvexClient(new ConvexReactClient(convexUrl));
        }
    }, [convexUrl]);

    if (!convexClient) return null;

    return (
        <ConvexProvider client={convexClient}>
            <ChatWidgetContent currentUser={currentUser} />
        </ConvexProvider>
    );
}

// ─── Main Content ─────────────────────────────────────────────

function ChatWidgetContent({ currentUser }: { currentUser: ChatWidgetProps['currentUser'] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [chatView, setChatView] = useState<ChatView>('list');
    const [activeDmUser, setActiveDmUser] = useState<{ id: string; name: string } | null>(null);
    const [activeGroup, setActiveGroup] = useState<GroupConversation | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // Presence
    usePresence(
        { id: currentUser.email, name: currentUser.name || currentUser.email || "Gebruiker", role: currentUser.role },
        "chat-widget"
    );

    // Queries
    const teamMembers = useQuery(api.chat.getAllTeamMembers) || [];
    const unreadStats = useQuery(api.chat.getUnreadCounts, { user: currentUser.email });
    const conversations = useQuery(api.chat.getConversations, { user: currentUser.email }) || [];
    const groupConversations = useQuery(api.chat.getGroupConversations, { user: currentUser.email }) || [];

    const otherOnlineUsers = teamMembers.filter(u => u.user !== currentUser.email && u.isOnline);
    const offlineUsers = teamMembers.filter(u => u.user !== currentUser.email && !u.isOnline);
    const totalUnread = unreadStats?.total || 0;

    // Browser notifications
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "granted") {
            setNotificationsEnabled(true);
        }
    }, []);

    const requestNotifications = useCallback(() => {
        if ("Notification" in window && Notification.permission !== "denied") {
            Notification.requestPermission().then(p => {
                setNotificationsEnabled(p === "granted");
            });
        }
    }, []);

    // Notify on new unread messages (when widget is closed or in list view)
    const prevUnreadRef = useRef(totalUnread);
    useEffect(() => {
        if (notificationsEnabled && totalUnread > prevUnreadRef.current && (!isOpen || chatView === 'list')) {
            const newCount = totalUnread - prevUnreadRef.current;
            new Notification("De Koninklijke Loop", {
                body: `${newCount} nieuw${newCount > 1 ? 'e' : ''} bericht${newCount > 1 ? 'en' : ''}`,
                icon: "/favicon.webp",
            });
        }
        prevUnreadRef.current = totalUnread;
    }, [totalUnread, notificationsEnabled, isOpen, chatView]);

    const openDm = (user: { id: string; name: string }) => {
        setActiveDmUser(user);
        setActiveGroup(null);
        setChatView('dm');
        if (!notificationsEnabled) requestNotifications();
    };

    const openGroup = (group: GroupConversation) => {
        setActiveGroup(group);
        setActiveDmUser(null);
        setChatView('group');
    };

    const goBack = () => {
        setActiveDmUser(null);
        setActiveGroup(null);
        setChatView('list');
    };

    // ─── Closed State (FAB) ───────────────────────────────────
    if (!isOpen) {
        return (
            <button
                onClick={() => { setIsOpen(true); if (!notificationsEnabled) requestNotifications(); }}
                className="fixed bottom-24 right-6 group p-0 rounded-full shadow-lg shadow-brand-orange/20 z-50 hover:scale-110 transition-transform duration-300"
            >
                <div className="relative w-14 h-14 bg-brand-orange rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20">
                    <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MessageSquare className="w-6 h-6 text-white drop-shadow-md" />
                    {otherOnlineUsers.length > 0 && (
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-brand-orange animate-pulse"></span>
                    )}
                </div>
                {totalUnread > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-surface flex items-center justify-center animate-bounce">
                        <span className="text-[10px] font-bold text-white">{totalUnread}</span>
                    </div>
                )}
            </button>
        );
    }

    // ─── Open State ───────────────────────────────────────────
    return (
        <div className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-surface/95 backdrop-blur-xl border border-glass-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5 zoom-in-95 duration-300 origin-bottom-right">
            {/* Header */}
            <div className="p-4 border-b border-glass-border bg-white/5 flex justify-between items-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-linear-to-r from-brand-orange/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3">
                    {chatView !== 'list' && (
                        <button onClick={goBack} className="p-1.5 -ml-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h3 className="font-bold text-lg text-white font-display tracking-tight flex items-center gap-2">
                            {chatView === 'list' && 'Berichten'}
                            {chatView === 'dm' && activeDmUser?.name}
                            {chatView === 'group' && activeGroup?.name}
                            {chatView === 'create-group' && 'Nieuwe groep'}
                            {chatView === 'list' && totalUnread > 0 && (
                                <span className="bg-brand-orange text-[10px] px-1.5 py-0.5 rounded-full text-white">{totalUnread}</span>
                            )}
                        </h3>
                        {chatView === 'list' && (
                            <p className="text-xs text-text-muted font-medium flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${otherOnlineUsers.length > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`}></span>
                                {otherOnlineUsers.length} online · {offlineUsers.length} offline
                            </p>
                        )}
                        {chatView === 'dm' && activeDmUser && (
                            <DmStatusLine userId={activeDmUser.id} teamMembers={teamMembers} currentUser={currentUser.email} />
                        )}
                        {chatView === 'group' && activeGroup && (
                            <p className="text-xs text-text-muted">{activeGroup.members.length} leden</p>
                        )}
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-text-muted hover:text-white transition-colors relative z-10">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden bg-black/20">
                {chatView === 'list' && (
                    <ConversationList
                        currentUser={currentUser}
                        onlineUsers={otherOnlineUsers}
                        offlineUsers={offlineUsers}
                        conversations={conversations}
                        groupConversations={groupConversations}
                        unreadStats={unreadStats}
                        onOpenDm={openDm}
                        onOpenGroup={openGroup}
                        onCreateGroup={() => setChatView('create-group')}
                    />
                )}
                {chatView === 'dm' && activeDmUser && (
                    <DirectMessageView
                        currentUser={currentUser}
                        otherUser={activeDmUser}
                    />
                )}
                {chatView === 'group' && activeGroup && (
                    <GroupChatView
                        currentUser={currentUser}
                        group={activeGroup}
                    />
                )}
                {chatView === 'create-group' && (
                    <CreateGroupView
                        currentUser={currentUser}
                        teamMembers={teamMembers.filter(m => m.user !== currentUser.email)}
                        onCreated={(group) => { openGroup(group); }}
                        onCancel={goBack}
                    />
                )}
            </div>
        </div>
    );
}

// ─── Status Line for DM Header ────────────────────────────────

function DmStatusLine({ userId, teamMembers, currentUser }: { userId: string; teamMembers: TeamMember[]; currentUser: string }) {
    const member = teamMembers.find(m => m.user === userId);
    const typingUsers = useQuery(api.chat.getTypingStatus, { user: currentUser }) || [];
    const isTyping = typingUsers.some(t => t.user === userId);

    if (isTyping) {
        return <p className="text-xs text-brand-orange font-medium animate-pulse">aan het typen...</p>;
    }

    if (!member) return null;

    if (member.isOnline) {
        return (
            <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Online
            </p>
        );
    }

    return (
        <p className="text-xs text-text-muted font-medium">
            Laatst gezien {formatLastSeen(member.lastActive)}
        </p>
    );
}

// ─── Conversation List ────────────────────────────────────────

function ConversationList({
    currentUser,
    onlineUsers,
    offlineUsers,
    conversations,
    groupConversations,
    unreadStats,
    onOpenDm,
    onOpenGroup,
    onCreateGroup,
}: {
    currentUser: ChatWidgetProps['currentUser'];
    onlineUsers: TeamMember[];
    offlineUsers: TeamMember[];
    conversations: { otherUser: string; lastMessage: string; timestamp: number; isRead: boolean }[];
    groupConversations: GroupConversation[];
    unreadStats: { counts: Record<string, number>; total: number } | null | undefined;
    onOpenDm: (user: { id: string; name: string }) => void;
    onOpenGroup: (group: GroupConversation) => void;
    onCreateGroup: () => void;
}) {
    return (
        <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
            {/* Group Chats */}
            {groupConversations.length > 0 && (
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                            <Hash className="w-3 h-3" /> Groepen ({groupConversations.length})
                        </h4>
                    </div>
                    {groupConversations.map(group => (
                        <button
                            key={group._id}
                            onClick={() => onOpenGroup(group)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-left transition-colors group/item"
                        >
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-lg border border-white/10">
                                {group.avatarEmoji || '👥'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white truncate">{group.name}</div>
                                {group.lastMessagePreview && (
                                    <div className="text-xs text-text-muted truncate">{group.lastMessagePreview}</div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Online Users */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        Online ({onlineUsers.length})
                    </h4>
                    <button onClick={onCreateGroup} className="p-1 rounded-md hover:bg-white/10 text-text-muted hover:text-white transition-colors" title="Nieuwe groep">
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>

                {onlineUsers.length === 0 ? (
                    <div className="p-5 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 text-text-muted">
                            <MessageSquare className="w-5 h-5 opacity-50" />
                        </div>
                        <p className="text-xs text-text-muted">Niemand anders online</p>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {onlineUsers.map(user => (
                            <UserListItem
                                key={user.user}
                                user={user}
                                unreadCount={unreadStats?.counts?.[user.user] || 0}
                                onClick={() => onOpenDm({ id: user.user, name: user.name })}
                                isOnline
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Offline Users */}
            {offlineUsers.length > 0 && (
                <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider px-2">
                        Offline ({offlineUsers.length})
                    </h4>
                    <div className="space-y-0.5">
                        {offlineUsers.map(user => (
                            <UserListItem
                                key={user.user}
                                user={user}
                                unreadCount={unreadStats?.counts?.[user.user] || 0}
                                onClick={() => onOpenDm({ id: user.user, name: user.name })}
                                isOnline={false}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Recent conversations with users not in presence yet */}
            {conversations.filter(c => !teamMembers.some(m => m.user === c.otherUser)).length > 0 && (
                <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider px-2">
                        Recente gesprekken
                    </h4>
                    {conversations
                        .filter(c => !teamMembers.some(m => m.user === c.otherUser))
                        .map(conv => (
                            <button
                                key={conv.otherUser}
                                onClick={() => onOpenDm({ id: conv.otherUser, name: conv.otherUser })}
                                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-left transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-bold">
                                    {conv.otherUser.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">{conv.otherUser}</div>
                                    <div className="text-xs text-text-muted truncate">{conv.lastMessage}</div>
                                </div>
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
}

// Reusable for online/offline users
const teamMembers: TeamMember[] = []; // hoisted reference for filter (used in ConversationList scope)

function UserListItem({ user, unreadCount, onClick, isOnline }: {
    user: TeamMember;
    unreadCount: number;
    onClick: () => void;
    isOnline: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-left transition-colors border border-transparent hover:border-white/5 group/item relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-brand-orange/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
            <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border border-white/10 ${isOnline
                    ? 'bg-linear-to-br from-brand-orange to-orange-600 shadow-brand-orange/20'
                    : 'bg-white/10'
                    }`}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface shadow-sm ${isOnline ? 'bg-green-500 animate-[pulse_3s_infinite]' : 'bg-gray-500'
                    }`}></span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white truncate">{user.name}</span>
                        {user.role && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${user.role === 'admin'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}>
                                {user.role}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <span className="bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="text-xs text-text-muted truncate flex items-center gap-1.5">
                    {isOnline ? (
                        <><span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>Nu actief</>
                    ) : (
                        <>Laatst gezien {formatLastSeen(user.lastActive)}</>
                    )}
                </div>
            </div>
            <div className="text-text-muted opacity-0 group-hover/item:opacity-100 transition-opacity -mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </div>
        </button>
    );
}

// ─── Direct Message View ──────────────────────────────────────

function DirectMessageView({ currentUser, otherUser }: {
    currentUser: ChatWidgetProps['currentUser'];
    otherUser: { id: string; name: string };
}) {
    const [messageInput, setMessageInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const messages = useQuery(api.chat.getMessages, { currentUser: currentUser.email, otherUser: otherUser.id }) || [];
    const sendMessage = useMutation(api.chat.sendMessage);
    const markAsRead = useMutation(api.chat.markAsRead);
    const addReaction = useMutation(api.chat.addReaction);
    const typingUsers = useQuery(api.chat.getTypingStatus, { user: currentUser.email }) || [];
    const isOtherTyping = typingUsers.some(t => t.user === otherUser.id);
    const { startTyping, stopTyping } = useTypingIndicator(currentUser.email);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Mark as read
    useEffect(() => {
        if (messages.length > 0) {
            markAsRead({ recipient: currentUser.email, sender: otherUser.id });
        }
    }, [messages.length]);

    const handleSend = async () => {
        if (!messageInput.trim()) return;
        stopTyping();
        await sendMessage({
            sender: currentUser.email,
            recipient: otherUser.id,
            content: messageInput,
            type: "text"
        });
        setMessageInput("");
        setShowEmojiPicker(false);
    };

    const handleInputChange = (value: string) => {
        setMessageInput(value);
        if (value.trim()) {
            startTyping(otherUser.id);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" ref={scrollRef}>
                {messages.map((msg) => (
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
                        <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5">
                            <TypingDots />
                        </div>
                    </div>
                )}
                <div className="h-2" />
            </div>

            {/* Input */}
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

// ─── Group Chat View ──────────────────────────────────────────

function GroupChatView({ currentUser, group }: {
    currentUser: ChatWidgetProps['currentUser'];
    group: GroupConversation;
}) {
    const [messageInput, setMessageInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const messages = useQuery(api.chat.getGroupMessages, { groupId: group._id }) || [];
    const sendGroupMessage = useMutation(api.chat.sendGroupMessage);
    const addReaction = useMutation(api.chat.addGroupMessageReaction);
    const { startTyping, stopTyping } = useTypingIndicator(currentUser.email);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!messageInput.trim()) return;
        stopTyping();
        await sendGroupMessage({
            groupId: group._id,
            sender: currentUser.email,
            senderName: currentUser.name,
            content: messageInput,
            type: "text"
        });
        setMessageInput("");
        setShowEmojiPicker(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10" ref={scrollRef}>
                {messages.map((msg) => (
                    <GroupMessageBubble
                        key={msg._id}
                        message={msg}
                        isMe={msg.sender === currentUser.email}
                        currentUser={currentUser}
                        onReact={(emoji) => addReaction({ messageId: msg._id, emoji, user: currentUser.email, name: currentUser.name })}
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

// ─── Message Bubbles ──────────────────────────────────────────

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '🔥', '👏'];

function MessageBubble({ message, isMe, currentUser, onReact }: {
    message: any;
    isMe: boolean;
    currentUser: ChatWidgetProps['currentUser'];
    onReact: (emoji: string) => void;
}) {
    const [showReactions, setShowReactions] = useState(false);

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
                    <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">{message.content}</p>
                    <div className={`text-[9px] mt-1 text-right opacity-60 ${isMe ? 'text-white' : 'text-text-muted'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && (
                            <span className="ml-1 inline-block">
                                {message.isRead ? '✓✓' : '✓'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Quick React Bar */}
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

                {/* Reactions Display */}
                {message.reactions && message.reactions.length > 0 && (
                    <ReactionDisplay reactions={message.reactions} onReact={onReact} currentUser={currentUser.email} />
                )}
            </div>
        </div>
    );
}

function GroupMessageBubble({ message, isMe, currentUser, onReact }: {
    message: any;
    isMe: boolean;
    currentUser: ChatWidgetProps['currentUser'];
    onReact: (emoji: string) => void;
}) {
    const [showReactions, setShowReactions] = useState(false);

    if (message.type === "system") {
        return (
            <div className="text-center py-2">
                <span className="text-[10px] text-text-muted bg-white/5 px-3 py-1 rounded-full">{message.content}</span>
            </div>
        );
    }

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
                    {!isMe && (
                        <div className="text-[10px] font-bold text-brand-orange mb-1">{message.senderName}</div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">{message.content}</p>
                    <div className={`text-[9px] mt-1 text-right opacity-60 ${isMe ? 'text-white' : 'text-text-muted'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
}

// ─── Reaction Display ─────────────────────────────────────────

function ReactionDisplay({ reactions, onReact, currentUser }: {
    reactions: { emoji: string; user: string; name: string }[];
    onReact: (emoji: string) => void;
    currentUser: string;
}) {
    // Group reactions by emoji
    const grouped = reactions.reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = [];
        acc[r.emoji].push(r);
        return acc;
    }, {} as Record<string, typeof reactions>);

    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(grouped).map(([emoji, users]) => (
                <button
                    key={emoji}
                    onClick={() => onReact(emoji)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors border ${users.some(u => u.user === currentUser)
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
}

// ─── Typing Dots Animation ────────────────────────────────────

function TypingDots() {
    return (
        <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
    );
}

// ─── Chat Input with Emoji Picker ─────────────────────────────

function ChatInput({ value, onChange, onSend, showEmojiPicker, onToggleEmoji, onEmojiSelect }: {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    showEmojiPicker: boolean;
    onToggleEmoji: () => void;
    onEmojiSelect: (emoji: string) => void;
}) {
    return (
        <div className="p-3 border-t border-glass-border bg-surface/95 backdrop-blur-md shrink-0 relative">
            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
                <div className="absolute bottom-full left-0 right-0 mb-2 px-2 z-20">
                    <EmojiPickerWrapper onSelect={onEmojiSelect} onClose={onToggleEmoji} />
                </div>
            )}

            <div className="relative flex gap-2 items-end bg-black/20 p-1.5 rounded-2xl border border-white/10 focus-within:border-brand-orange/50 focus-within:ring-1 focus-within:ring-brand-orange/50 transition-all">
                <button
                    onClick={onToggleEmoji}
                    className={`p-2 rounded-xl transition-colors ${showEmojiPicker ? 'bg-brand-orange/20 text-brand-orange' : 'text-text-muted hover:text-white hover:bg-white/10'}`}
                >
                    <Smile className="w-5 h-5" />
                </button>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
                        }
                    }}
                    placeholder="Typ een bericht..."
                    className="flex-1 bg-transparent border-none px-2 py-2.5 text-sm text-white placeholder:text-text-muted/50 focus:outline-none resize-none max-h-24 min-h-[44px]"
                    rows={1}
                />
                <button
                    onClick={onSend}
                    disabled={!value.trim()}
                    className="p-2.5 bg-brand-orange text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 mb-0.5 mr-0.5"
                >
                    <Send className="w-4 h-4 fill-current" />
                </button>
            </div>
        </div>
    );
}

// ─── Emoji Picker Wrapper ─────────────────────────────────────

function EmojiPickerWrapper({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
    const [Picker, setPicker] = useState<any>(null);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        // Dynamic import for code splitting
        Promise.all([
            import('@emoji-mart/react'),
            import('@emoji-mart/data')
        ]).then(([pickerModule, dataModule]) => {
            setPicker(() => pickerModule.default);
            setData(dataModule.default);
        });
    }, []);

    if (!Picker || !data) {
        return (
            <div className="bg-surface/95 backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-2xl flex items-center justify-center h-[350px]">
                <div className="flex flex-col items-center gap-2 text-text-muted">
                    <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Emoji's laden...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-glass-border">
            <Picker
                data={data}
                onEmojiSelect={(emoji: any) => onSelect(emoji.native)}
                theme="dark"
                locale="nl"
                previewPosition="none"
                skinTonePosition="search"
                maxFrequentRows={2}
                perLine={8}
                set="native"
                categories={['frequent', 'people', 'nature', 'foods', 'activity', 'places', 'objects', 'symbols', 'flags']}
                searchPosition="sticky"
            />
        </div>
    );
}

// ─── Create Group Dialog ──────────────────────────────────────

function CreateGroupView({ currentUser, teamMembers, onCreated, onCancel }: {
    currentUser: ChatWidgetProps['currentUser'];
    teamMembers: TeamMember[];
    onCreated: (group: GroupConversation) => void;
    onCancel: () => void;
}) {
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [avatarEmoji, setAvatarEmoji] = useState("👥");
    const createGroup = useMutation(api.chat.createGroupConversation);

    const filteredMembers = teamMembers.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.user.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async () => {
        if (!groupName.trim() || selectedMembers.length === 0) return;

        const groupId = await createGroup({
            name: groupName,
            members: selectedMembers,
            createdBy: currentUser.email,
            avatarEmoji,
        });

        onCreated({
            _id: groupId,
            name: groupName,
            members: [currentUser.email, ...selectedMembers],
            avatarEmoji,
        } as GroupConversation);
    };

    const toggleMember = (email: string) => {
        setSelectedMembers(prev =>
            prev.includes(email) ? prev.filter(m => m !== email) : [...prev, email]
        );
    };

    return (
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
            {/* Group Info */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const emojis = ['👥', '🏃', '🎯', '💬', '🔥', '⭐', '🎉', '📋', '🏆', '💪'];
                            const idx = emojis.indexOf(avatarEmoji);
                            setAvatarEmoji(emojis[(idx + 1) % emojis.length]);
                        }}
                        className="w-14 h-14 rounded-full bg-linear-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-2xl border border-white/10 hover:border-white/30 transition-colors shrink-0"
                    >
                        {avatarEmoji}
                    </button>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Groepsnaam..."
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50"
                    />
                </div>
            </div>

            {/* Members Selection */}
            <div className="space-y-2">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Leden selecteren ({selectedMembers.length})
                </h4>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Zoek teamleden..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-orange/50"
                    />
                </div>
                <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
                    {filteredMembers.map(member => (
                        <button
                            key={member.user}
                            onClick={() => toggleMember(member.user)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${selectedMembers.includes(member.user) ? 'bg-brand-orange/10 border border-brand-orange/30' : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedMembers.includes(member.user) ? 'bg-brand-orange border-brand-orange' : 'border-white/20'
                                }`}>
                                {selectedMembers.includes(member.user) && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-white truncate">{member.name}</span>
                                    <span className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                </div>
                                <span className="text-[10px] text-text-muted truncate">{member.user}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto pt-2">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                    Annuleren
                </button>
                <button
                    onClick={handleCreate}
                    disabled={!groupName.trim() || selectedMembers.length === 0}
                    className="flex-1 py-3 rounded-xl bg-brand-orange text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-orange/20"
                >
                    <Users className="w-4 h-4 inline mr-1.5" />
                    Aanmaken
                </button>
            </div>
        </div>
    );
}

// ─── Utility ──────────────────────────────────────────────────

function formatLastSeen(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
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
