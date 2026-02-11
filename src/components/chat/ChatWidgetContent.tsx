import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { usePresence } from '../../hooks/usePresence';
import { MessageSquare, X, ArrowLeft } from 'lucide-react';
import type { ChatUser, GroupConversation, ChatView } from './types';
import { ConversationList } from './ConversationList';
import { DirectMessageView } from './DirectMessageView';
import { GroupChatView } from './GroupChatView';
import { CreateGroupView } from './CreateGroupView';
import { DmStatusLine } from './DmStatusLine';

interface ChatWidgetContentProps {
    currentUser: ChatUser;
}

export function ChatWidgetContent({ currentUser }: ChatWidgetContentProps) {
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
