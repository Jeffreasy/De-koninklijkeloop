import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Users, Search } from 'lucide-react';
import type { ChatUser, TeamMember, GroupConversation } from './types';

interface CreateGroupViewProps {
    currentUser: ChatUser;
    teamMembers: TeamMember[];
    onCreated: (group: GroupConversation) => void;
    onCancel: () => void;
}

export function CreateGroupView({ currentUser, teamMembers, onCreated, onCancel }: CreateGroupViewProps) {
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
            createdAt: Date.now(),
        } as GroupConversation);
    };

    const toggleMember = (email: string) => {
        setSelectedMembers(prev =>
            prev.includes(email) ? prev.filter(m => m !== email) : [...prev, email]
        );
    };

    const EMOJI_OPTIONS = ['👥', '🏃', '🎯', '💬', '🔥', '⭐', '🎉', '📋', '🏆', '💪'];

    return (
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
            {/* Group Info */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const idx = EMOJI_OPTIONS.indexOf(avatarEmoji);
                            setAvatarEmoji(EMOJI_OPTIONS[(idx + 1) % EMOJI_OPTIONS.length]);
                        }}
                        className="w-14 h-14 rounded-full bg-linear-to-br from-indigo-500/30 to-emerald-500/30 flex items-center justify-center text-2xl border border-glass-border hover:border-brand-orange/30 transition-colors shrink-0 cursor-pointer"
                    >
                        {avatarEmoji}
                    </button>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Groepsnaam..."
                        className="flex-1 bg-glass-surface/30 border border-glass-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50"
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
                        className="w-full bg-glass-surface/30 border border-glass-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-brand-orange/50"
                    />
                </div>
                <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
                    {filteredMembers.map(member => (
                        <button
                            key={member.user}
                            onClick={() => toggleMember(member.user)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${selectedMembers.includes(member.user) ? 'bg-brand-orange/10 border border-brand-orange/30' : 'hover:bg-glass-surface/50 border border-transparent'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedMembers.includes(member.user) ? 'bg-brand-orange border-brand-orange' : 'border-glass-border'
                                }`}>
                                {selectedMembers.includes(member.user) && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-text-primary truncate">{member.name}</span>
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
                    className="flex-1 py-3 rounded-xl border border-glass-border text-sm text-text-muted hover:text-text-primary hover:bg-glass-surface/50 transition-colors cursor-pointer"
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
