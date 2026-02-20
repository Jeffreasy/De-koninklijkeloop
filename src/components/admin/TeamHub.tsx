import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import EventSchedule from './EventSchedule';
import VolunteerTasksManager from './VolunteerTasksManager';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useMutation } from 'convex/react';
import { MinuteModal, ScheduleModal } from './TeamHubModals';
import {
    FileText,
    Calendar,
    Search,
    Download,
    ChevronLeft,
    Clock,
    Tag,
    Plus,
    Edit3,
    Trash2,
    ClipboardList
} from 'lucide-react';
import { ConvexClientProvider } from '../islands/ConvexClientProvider';
import type { Id } from '../../../convex/_generated/dataModel';

const TeamHubContent = () => {
    const [activeTab, setActiveTab] = useState<'minutes' | 'schedule' | 'volunteers'>('minutes');
    const [selectedMinute, setSelectedMinute] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isMinuteModalOpen, setIsMinuteModalOpen] = useState(false);
    const [editingMinute, setEditingMinute] = useState<any | null>(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingScheduleItem, setEditingScheduleItem] = useState<any | null>(null);

    const minutes = useQuery(api.team.getMinutes, { searchQuery: searchQuery || undefined });
    const deleteMinute = useMutation(api.team.deleteMinute);

    const handleOpenMinuteModal = (minute: any = null) => {
        setEditingMinute(minute);
        setIsMinuteModalOpen(true);
    };

    const handleDeleteMinute = async (id: Id<"team_minutes">) => {
        if (confirm("Weet je zeker dat je deze notule wilt verwijderen?")) {
            await deleteMinute({ id });
            if (selectedMinute?._id === id) setSelectedMinute(null);
        }
    };

    const handleOpenScheduleModal = (item: any = null) => {
        setEditingScheduleItem(item);
        setIsScheduleModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex p-1 bg-glass-surface/50 rounded-xl border border-glass-border/50 backdrop-blur-md overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('minutes')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-1 ${activeTab === 'minutes'
                        ? 'bg-brand-orange text-white shadow-md'
                        : 'text-text-muted hover:text-text-primary hover:bg-glass-surface'
                        }`}
                >
                    <FileText className="w-4 h-4 shrink-0" /><span className="hidden sm:inline">Notulen</span>
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-1 ${activeTab === 'schedule'
                        ? 'bg-brand-orange text-white shadow-md'
                        : 'text-text-muted hover:text-text-primary hover:bg-glass-surface'
                        }`}
                >
                    <Calendar className="w-4 h-4 shrink-0" /><span className="hidden sm:inline">Programma</span>
                </button>
                <button
                    onClick={() => setActiveTab('volunteers')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-1 ${activeTab === 'volunteers'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'text-text-muted hover:text-text-primary hover:bg-glass-surface'
                        }`}
                >
                    <ClipboardList className="w-4 h-4 shrink-0" /><span className="hidden sm:inline">Vrijwilligers</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'minutes' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                        {/* List View - Hidden on mobile if checking details */}
                        <div className={`lg:col-span-1 space-y-4 ${selectedMinute ? 'hidden lg:block' : 'block'}`}>
                            {/* Actions & Search */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Zoek in notulen..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-glass-bg border border-glass-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => handleOpenMinuteModal()}
                                    className="p-2.5 bg-brand-orange text-white rounded-xl shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-dark transition-colors cursor-pointer"
                                    title="Nieuwe Notule"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Items */}
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {!minutes ? (
                                    // Skeleton Loading
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="p-4 rounded-xl border border-glass-border bg-glass-bg animate-pulse h-24"></div>
                                    ))
                                ) : minutes.length === 0 ? (
                                    <div className="text-center p-8 text-text-muted">
                                        Geen notulen gevonden
                                    </div>
                                ) : (
                                    minutes.map((minute) => (
                                        <div
                                            key={minute._id}
                                            onClick={() => setSelectedMinute(minute)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${selectedMinute?._id === minute._id
                                                ? 'bg-brand-orange/10 border-brand-orange/50 shadow-md transform scale-[1.02]'
                                                : 'bg-glass-bg border-glass-border hover:border-brand-orange/30 hover:bg-glass-surface'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${minute.type === 'meeting'
                                                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    }`}>
                                                    {minute.type === 'meeting' ? 'Vergadering' : 'Agenda'}
                                                </span>
                                                <span className="text-xs text-text-muted font-mono">
                                                    {format(new Date(minute.date), 'd MMM yyyy', { locale: nl })}
                                                </span>
                                            </div>
                                            <h3 className={`font-semibold text-sm mb-2 line-clamp-2 ${selectedMinute?._id === minute._id ? 'text-brand-orange' : 'text-text-primary group-hover:text-brand-orange'
                                                }`}>
                                                {minute.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {minute.tags?.slice(0, 3).map((tag: string) => (
                                                    <span key={tag} className="px-2 py-0.5 text-[10px] bg-glass-surface border border-glass-border rounded-md text-text-muted">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Detail View */}
                        <div className={`lg:col-span-2 ${selectedMinute ? 'block' : 'hidden lg:block'}`}>
                            <div className="bg-glass-bg border border-glass-border rounded-2xl min-h-[400px] h-[calc(100dvh-14rem)] flex flex-col overflow-hidden shadow-sm relative">
                                {selectedMinute ? (
                                    <>
                                        <div className="p-6 border-b border-glass-border bg-glass-surface/30 backdrop-blur-sm sticky top-0 z-10">
                                            {/* Mobile Back Button */}
                                            <button
                                                onClick={() => setSelectedMinute(null)}
                                                className="lg:hidden mb-4 flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium cursor-pointer"
                                            >
                                                <ChevronLeft className="w-4 h-4" /> Terug naar overzicht
                                            </button>

                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                                        <h2 className="text-xl font-bold text-text-primary">{selectedMinute.title}</h2>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${selectedMinute.status === 'final'
                                                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                            }`}>
                                                            {selectedMinute.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-text-muted">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4" />
                                                            {format(new Date(selectedMinute.date), 'dd MMMM yyyy', { locale: nl })}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" />
                                                            {format(selectedMinute.created_at, 'HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenMinuteModal(selectedMinute)}
                                                        className="p-2 hover:bg-glass-surface rounded-lg text-text-muted hover:text-brand-orange transition-colors cursor-pointer"
                                                        title="Bewerken"
                                                    >
                                                        <Edit3 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMinute(selectedMinute._id)}
                                                        className="p-2 hover:bg-glass-surface rounded-lg text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                                                        title="Verwijderen"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-2 hover:bg-glass-surface rounded-lg text-text-muted hover:text-brand-orange transition-colors cursor-pointer" title="Download PDF (Mock)">
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-text-secondary">
                                                <div className="whitespace-pre-wrap font-sans leading-relaxed">
                                                    {/* Simple rendering for now, could use a markdown parser later */}
                                                    {selectedMinute.content.split('\n').map((line: string, i: number) => (
                                                        <p key={i} className={`mb-2 ${line.startsWith('#') || line.startsWith('**') ? 'font-bold text-text-primary mt-4' : ''}`}>
                                                            {line.replace(/\*\*/g, '')}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tags Footer */}
                                            {selectedMinute.tags && selectedMinute.tags.length > 0 && (
                                                <div className="mt-8 pt-6 border-t border-glass-border">
                                                    <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
                                                        <Tag className="w-4 h-4" />
                                                        <span className="font-medium">Labels</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedMinute.tags.map((tag: string) => (
                                                            <span key={tag} className="px-3 py-1 rounded-full bg-glass-surface border border-glass-border text-xs text-text-secondary">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8 text-center bg-dots-pattern">
                                        <div className="w-20 h-20 rounded-full bg-glass-surface flex items-center justify-center mb-6 shadow-sm border border-glass-border">
                                            <FileText className="w-8 h-8 opacity-50" />
                                        </div>
                                        <h3 className="text-lg font-bold text-text-primary mb-2">Selecteer een notule</h3>
                                        <p className="max-w-xs mx-auto">Klik in de lijst hiernaast om de details te bekijken of gebruik de zoekfunctie. Of maak een nieuwe aan.</p>
                                        <button
                                            onClick={() => handleOpenMinuteModal()}
                                            className="mt-6 px-6 py-2 bg-brand-orange text-white rounded-xl shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-dark transition-colors font-medium flex items-center gap-2 cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" /> Nieuwe Notule
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'schedule' ? (
                    <EventSchedule onAddClick={() => handleOpenScheduleModal()} onEditClick={(item) => handleOpenScheduleModal(item)} />
                ) : (
                    <VolunteerTasksManager />
                )}
            </div>

            {/* Modals */}
            <MinuteModal
                isOpen={isMinuteModalOpen}
                onClose={() => setIsMinuteModalOpen(false)}
                initialData={editingMinute}
            />
            <ScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                initialData={editingScheduleItem}
            />
        </div>
    );
};

export default function TeamHub() {
    return (
        <ConvexClientProvider>
            <TeamHubContent />
        </ConvexClientProvider>
    );
}
