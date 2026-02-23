import { useState, useEffect, useRef, useCallback } from 'react';
import { usePresence } from '../../hooks/usePresence';
import { MessageSquare, X, ArrowLeft } from 'lucide-react';
import type { ChatUser, GroupConversation, ChatView, ConversationSummary, TeamMember, UnreadStats } from './types';
import { ConversationList } from './ConversationList';
import { DirectMessageView } from './DirectMessageView';
import { GroupChatView } from './GroupChatView';
import { CreateGroupView } from './CreateGroupView';
import { DmStatusLine } from './DmStatusLine';
import { apiRequest } from '../../lib/api';

interface ChatWidgetContentProps {
    currentUser: ChatUser;
}

export function ChatWidgetContent({ currentUser }: ChatWidgetContentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [chatView, setChatView] = useState<ChatView>('list');
    const [activeDmUser, setActiveDmUser] = useState<{ id: string; name: string } | null>(null);
    const [activeGroup, setActiveGroup] = useState<GroupConversation | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // Presence — ONLY when widget is open (prevents heartbeat→reactivity spam)
    usePresence(
        isOpen ? { id: currentUser.email, name: currentUser.name || currentUser.email || "Gebruiker", role: currentUser.role } : null,
        isOpen ? "chat-widget" : undefined
    );

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [unreadStats, setUnreadStats] = useState<UnreadStats>({ counts: {}, total: 0 });
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [groupConversations, setGroupConversations] = useState<GroupConversation[]>([]);

    // Custom SSE Events & Fetching Data
    useEffect(() => {
        if (!isOpen) return;

        // Initial Fetch
        const fetchInitialData = async () => {
            try {
                const [membersRes, unreadRes, convosRes] = await Promise.all([
                    apiRequest('/v1/presence/members'), // All members with isOnline status
                    apiRequest('/v1/messages/unread'),
                    apiRequest('/v1/messages/conversations')
                ]);
                if (Array.isArray(membersRes)) setTeamMembers(membersRes);
                if (unreadRes && typeof unreadRes.count === 'number') {
                    setUnreadStats(prev => ({ ...prev, total: unreadRes.count }));
                }
                if (Array.isArray(convosRes)) setConversations(convosRes);
            } catch (e) {
                console.warn("[ChatWidget] Failed to fetch initial data", e);
            }
        };
        fetchInitialData();

        // Setup Server-Sent Events Subscription
        const eventSource = new EventSource('/api/v1/messages/stream', {
            withCredentials: true
        });

        eventSource.onopen = () => console.log("[SSE] Connected to chat stream");

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "NEW_MESSAGE") {
                    // Refresh unread and conversations on new message
                    fetchInitialData();
                } else if (data.type === "PRESENCE_UPDATE") {
                    apiRequest('/v1/presence/members').then(res => {
                        if (Array.isArray(res)) setTeamMembers(res);
                    });
                }
            } catch (e) {
                console.warn("[SSE] Parse error", e);
            }
        };

        eventSource.onerror = (e) => {
            console.warn("[SSE] Stream connected error:", e);
        };

        return () => {
            eventSource.close();
        };

    }, [isOpen]);

    const otherOnlineUsers = teamMembers.filter(u => (u as any).isOnline === true);
    const offlineUsers = teamMembers.filter(u => (u as any).isOnline === false || (u as any).isOnline === undefined);
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

    // Notify on new unread messages
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
                className="fixed bottom-20 right-4 md:bottom-24 md:right-6 group p-0 rounded-full shadow-lg shadow-brand-orange/20 z-50 hover:scale-110 transition-transform duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-surface touch-action-manipulation"
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
        <div className="fixed inset-0 md:inset-auto md:bottom-4 md:right-4 lg:bottom-24 lg:right-6 md:w-[380px] md:h-[70vh] lg:h-[600px] bg-surface/95 backdrop-blur-xl border-0 md:border md:border-glass-border rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5 zoom-in-95 duration-300 motion-reduce:animate-none origin-bottom-right overscroll-contain pb-[env(safe-area-inset-bottom)]">
            {/* Header */}
            <div className="p-4 border-b border-glass-border bg-glass-surface/50 flex justify-between items-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-linear-to-r from-brand-orange/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3">
                    {chatView !== 'list' && (
                        <button onClick={goBack} className="p-1.5 -ml-1 rounded-lg hover:bg-glass-surface text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h3 className="font-bold text-lg text-text-primary font-display flex items-center gap-2">
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
                            <p className="text-xs text-text-muted">Groepsgesprek</p>
                        )}
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-glass-surface rounded-xl text-text-muted hover:text-text-primary transition-colors relative z-10 cursor-pointer">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden bg-glass-surface/30">
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
                        teamMembers={teamMembers.filter(m => m.user_id !== currentUser.email)}
                        onCreated={(group) => { openGroup(group); }}
                        onCancel={goBack}
                    />
                )}
            </div>
        </div>
    );
}
