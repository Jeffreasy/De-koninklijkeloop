import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, ConvexProvider, ConvexReactClient } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { MessageSquare, X, Send, Circle } from 'lucide-react';
import { usePresence } from '../../hooks/usePresence';

interface ChatWidgetProps {
    currentUser: { id: string; name: string; email: string };
    convexUrl: string;
}

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

function ChatWidgetContent({ currentUser }: { currentUser: { id: string; name: string; email: string } }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChatUser, setActiveChatUser] = useState<{ id: string; name: string } | null>(null);
    const [messageInput, setMessageInput] = useState("");

    // Presence Heartbeat
    usePresence({ id: currentUser.email, name: currentUser.name || currentUser.email || "Gebruiker" }, "chat-widget");

    // Fetch Data
    const onlineUsers = useQuery(api.chat.getOnlineUsers) || [];
    const conversations = useQuery(api.chat.getConversations, { user: currentUser.email });
    const messages = useQuery(api.chat.getMessages,
        activeChatUser ? { currentUser: currentUser.email, otherUser: activeChatUser.id } : "skip"
    );
    const unreadStats = useQuery(api.chat.getUnreadCounts, { user: currentUser.email });

    const sendMessage = useMutation(api.chat.sendMessage);
    const markAsRead = useMutation(api.chat.markAsRead);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Mark as read when opening chat
    useEffect(() => {
        if (activeChatUser && messages?.length > 0) {
            markAsRead({ recipient: currentUser.email, sender: activeChatUser.id });
        }
    }, [activeChatUser, messages?.length]);


    const handleSend = async () => {
        if (!messageInput.trim() || !activeChatUser) return;

        await sendMessage({
            sender: currentUser.email,
            recipient: activeChatUser.id,
            content: messageInput,
            type: "text"
        });
        setMessageInput("");
    };

    // Filter out self from online list
    const otherOnlineUsers = onlineUsers.filter(u => u.user !== currentUser.email);
    const totalUnread = unreadStats?.total || 0;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 group p-0 rounded-full shadow-lg shadow-brand-orange/20 z-50 hover:scale-110 transition-transform duration-300"
            >
                <div className="relative w-14 h-14 bg-brand-orange rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20">
                    <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MessageSquare className="w-6 h-6 text-white drop-shadow-md" />

                    {/* Online Indicator (if others are online) */}
                    {otherOnlineUsers.length > 0 && (
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-brand-orange animate-pulse"></span>
                    )}
                </div>

                {/* Unread Badge */}
                {totalUnread > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-surface flex items-center justify-center animate-bounce">
                        <span className="text-[10px] font-bold text-white">{totalUnread}</span>
                    </div>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-24 right-6 w-[360px] h-[550px] bg-surface/95 backdrop-blur-xl border border-glass-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5 zoom-in-95 duration-300 origin-bottom-right">
            {/* Header */}
            <div className="p-4 border-b border-glass-border bg-white/5 flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-brand-orange/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <h3 className="font-bold text-lg text-white font-display tracking-tight flex items-center gap-2">
                        Berichten
                        {totalUnread > 0 && <span className="bg-brand-orange text-[10px] px-1.5 py-0.5 rounded-full text-white">{totalUnread}</span>}
                    </h3>
                    <p className="text-xs text-text-muted font-medium flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${otherOnlineUsers.length > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`}></span>
                        {otherOnlineUsers.length} online
                    </p>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-xl text-text-muted hover:text-white transition-colors relative z-10"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden bg-black/20">
                {activeChatUser ? (
                    // Active Chat View
                    <div className="flex-1 flex flex-col h-full">
                        {/* Chat Header */}
                        <div className="px-4 py-3 border-b border-glass-border bg-white/5 flex items-center gap-3 shadow-xs z-10">
                            <button
                                onClick={() => setActiveChatUser(null)}
                                className="p-1.5 -ml-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                            <div className="flex-1">
                                <span className="font-bold text-sm text-white block leading-tight">{activeChatUser.name}</span>
                                <span className="text-[10px] text-green-400 font-medium">Online</span>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" ref={scrollRef}>
                            {messages?.map((msg) => {
                                const isMe = msg.sender === currentUser.email;
                                return (
                                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${isMe
                                            ? 'bg-brand-orange text-white rounded-tr-sm'
                                            : 'bg-white/10 text-text-body rounded-tl-sm border border-white/5'
                                            }`}>
                                            <p className="leading-relaxed">{msg.content}</p>
                                            <div className={`text-[9px] mt-1 text-right opacity-60 ${isMe ? 'text-white' : 'text-text-muted'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isMe && (
                                                    <span className="ml-1 inline-block">
                                                        {msg.isRead ? '✓✓' : '✓'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="h-2" /> {/* Spacer */}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-glass-border bg-surface/95 backdrop-blur-md">
                            <div className="relative flex gap-2 items-end bg-black/20 p-1.5 rounded-2xl border border-white/10 focus-within:border-brand-orange/50 focus-within:ring-1 focus-within:ring-brand-orange/50 transition-all">
                                <textarea
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Typ een bericht..."
                                    className="flex-1 bg-transparent border-none px-3 py-2.5 text-sm text-white placeholder:text-text-muted/50 focus:outline-none resize-none max-h-24 min-h-[44px]"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!messageInput.trim()}
                                    className="p-2.5 bg-brand-orange text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 mb-0.5 mr-0.5"
                                >
                                    <Send className="w-4 h-4 fill-current" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Conversation List View
                    <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                        {/* Online Users Section */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-text-muted uppercase px-2 tracking-wider flex justify-between items-center">
                                Online ({otherOnlineUsers.length})
                            </h4>

                            {otherOnlineUsers.length === 0 ? (
                                <div className="p-6 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-text-muted">
                                        <MessageSquare className="w-6 h-6 opacity-50" />
                                    </div>
                                    <p className="text-sm text-text-muted">Er is momenteel niemand anders online.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {otherOnlineUsers.map(user => {
                                        // Count unread for this specific user
                                        const unreadCount = unreadStats?.counts?.[user.user] || 0;

                                        return (
                                            <button
                                                key={user.user}
                                                onClick={() => setActiveChatUser({ id: user.user, name: user.name })}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-left transition-colors border border-transparent hover:border-white/5 group relative overflow-hidden"
                                            >
                                                {/* Hover Highlight */}
                                                <div className="absolute inset-0 bg-brand-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-brand-orange to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-brand-orange/20 border border-white/10">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface shadow-sm animate-[pulse_3s_infinite]"></span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <div className="text-sm font-bold text-white truncate pr-2">{user.name}</div>
                                                        {unreadCount > 0 && (
                                                            <span className="bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                                                {unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-text-muted truncate flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
                                                        Nu actief
                                                    </div>
                                                </div>
                                                <div className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
