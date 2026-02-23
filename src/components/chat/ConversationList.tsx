import { memo } from 'react';
import { MessageSquare, Plus, Hash } from 'lucide-react';
import type { ChatUser, TeamMember, GroupConversation, ConversationSummary, UnreadStats } from './types';
import { formatLastSeen } from './utils';

interface ConversationListProps {
    currentUser: ChatUser;
    onlineUsers: TeamMember[];
    offlineUsers: TeamMember[];
    conversations: ConversationSummary[];
    groupConversations: GroupConversation[];
    unreadStats: UnreadStats | null | undefined;
    onOpenDm: (user: { id: string; name: string }) => void;
    onOpenGroup: (group: GroupConversation) => void;
    onCreateGroup: () => void;
}

export function ConversationList({
    currentUser,
    onlineUsers,
    offlineUsers,
    conversations,
    groupConversations,
    unreadStats,
    onOpenDm,
    onOpenGroup,
    onCreateGroup,
}: ConversationListProps) {
    // Collect all known team members for filtering recent conversations
    const allTeamMembers = [...onlineUsers, ...offlineUsers];

    return (
        <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin scrollbar-thumb-glass-border overscroll-contain">
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
                            className="w-full flex items-center gap-3 p-3 hover:bg-glass-surface/50 rounded-xl text-left transition-colors group/item cursor-pointer touch-action-manipulation"
                        >
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500/30 to-emerald-500/30 flex items-center justify-center text-lg border border-glass-border">
                                {group.avatarEmoji || '👥'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-text-primary truncate">{group.name}</div>
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
                    <button onClick={onCreateGroup} className="p-1.5 rounded-md hover:bg-glass-surface text-text-muted hover:text-text-primary transition-colors cursor-pointer touch-action-manipulation" title="Nieuwe groep">
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>

                {onlineUsers.length === 0 ? (
                    <div className="p-5 text-center border-2 border-dashed border-glass-border/30 rounded-2xl bg-glass-surface/30">
                        <div className="w-10 h-10 bg-glass-surface/50 rounded-full flex items-center justify-center mx-auto mb-2 text-text-muted">
                            <MessageSquare className="w-5 h-5 opacity-50" />
                        </div>
                        <p className="text-xs text-text-muted">Niemand anders online</p>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {onlineUsers.map(user => (
                            <UserListItem
                                key={user.user_id}
                                user={user}
                                unreadCount={unreadStats?.counts?.[user.user_id] || 0}
                                onClick={() => onOpenDm({ id: user.user_id, name: user.name || 'Gebruiker' })}
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
                                key={user.user_id}
                                user={user}
                                unreadCount={unreadStats?.counts?.[user.user_id] || 0}
                                onClick={() => onOpenDm({ id: user.user_id, name: user.name || 'Gebruiker' })}
                                isOnline={false}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Recent conversations with users not in presence */}
            {conversations.filter(c => !allTeamMembers.some(m => m.user_id === c.other_user_id)).length > 0 && (
                <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider px-2">
                        Recente gesprekken
                    </h4>
                    {conversations
                        .filter(c => !allTeamMembers.some(m => m.user_id === c.other_user_id))
                        .map(conv => (
                            <button
                                key={conv.other_user_id}
                                onClick={() => onOpenDm({ id: conv.other_user_id, name: conv.other_user_name })}
                                className="w-full flex items-center gap-3 p-3 hover:bg-glass-surface/50 rounded-xl text-left transition-colors cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-glass-surface flex items-center justify-center text-text-primary text-sm font-bold">
                                    {(conv.other_user_name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-text-primary truncate">{conv.other_user_name}</div>
                                    <div className="text-xs text-text-muted truncate">{conv.last_message}</div>
                                </div>
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
}

const UserListItem = memo(function UserListItem({ user, unreadCount, onClick, isOnline }: {
    user: TeamMember;
    unreadCount: number;
    onClick: () => void;
    isOnline: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 hover:bg-glass-surface/50 rounded-xl text-left transition-colors border border-transparent hover:border-glass-border/50 group/item relative overflow-hidden cursor-pointer touch-action-manipulation"
        >
            <div className="absolute inset-0 bg-brand-orange/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
            <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border border-glass-border ${isOnline
                    ? 'bg-linear-to-br from-brand-orange to-orange-600 shadow-brand-orange/20 text-white'
                    : 'bg-glass-surface text-text-primary'
                    }`}>
                    {(user.name || 'G').charAt(0).toUpperCase()}
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface shadow-sm ${isOnline ? 'bg-green-500 animate-[pulse_3s_infinite]' : 'bg-gray-500'
                    }`}></span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-text-primary truncate">{user.name || 'Gebruiker'}</span>
                        {user.role && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${user.role === 'admin'
                                ? 'bg-red-500/20 text-red-600 border border-red-500/30'
                                : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
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
                        <>Laatst gezien {formatLastSeen(Date.parse(user.last_active) || 0)}</>
                    )}
                </div>
            </div>
            <div className="text-text-muted opacity-0 group-hover/item:opacity-100 transition-opacity -mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </div>
        </button>
    );
});
