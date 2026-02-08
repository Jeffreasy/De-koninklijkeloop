import React, { useState } from 'react';
import { teamMinutes, type MinuteItem } from './data/teamData';
import EventSchedule from './EventSchedule';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

// --- Icons ---
const Icons = {
    FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
};

const TeamHub = () => {
    const [activeTab, setActiveTab] = useState<'minutes' | 'schedule'>('minutes');
    const [selectedMinute, setSelectedMinute] = useState<MinuteItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter Minutes
    const filteredMinutes = teamMinutes.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-glass-bg border border-glass-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-primary">Team Hub</h1>
                    <p className="text-text-muted text-sm mt-1">Beheer notulen, agenda's en de dagplanning.</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-glass-surface/50 rounded-xl border border-glass-border/50 backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab('minutes')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'minutes'
                            ? 'bg-brand-orange text-white shadow-md'
                            : 'text-text-muted hover:text-text-primary hover:bg-glass-surface'
                            }`}
                    >
                        <Icons.FileText /> Notulen
                    </button>
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'schedule'
                            ? 'bg-brand-orange text-white shadow-md'
                            : 'text-text-muted hover:text-text-primary hover:bg-glass-surface'
                            }`}
                    >
                        <Icons.Calendar /> Programma
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'minutes' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                        {/* List View - Hidden on mobile if checking details */}
                        <div className={`lg:col-span-1 space-y-4 ${selectedMinute ? 'hidden lg:block' : 'block'}`}>
                            {/* Search */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                    <Icons.Search />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Zoek in notulen..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-glass-bg border border-glass-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                                />
                            </div>

                            {/* Items */}
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredMinutes.map((minute) => (
                                    <div
                                        key={minute.id}
                                        onClick={() => setSelectedMinute(minute)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${selectedMinute?.id === minute.id
                                            ? 'bg-brand-orange/10 border-brand-orange/50 shadow-md transform scale-[1.02]'
                                            : 'bg-glass-bg border-glass-border hover:border-brand-orange/30 hover:bg-glass-surface'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${minute.type === 'meeting'
                                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                                }`}>
                                                {minute.type === 'meeting' ? 'Vergadering' : 'Agenda'}
                                            </span>
                                            <span className="text-xs text-text-muted font-mono">
                                                {format(new Date(minute.date), 'd MMM yyyy', { locale: nl })}
                                            </span>
                                        </div>
                                        <h3 className={`font-semibold text-sm mb-2 line-clamp-2 ${selectedMinute?.id === minute.id ? 'text-brand-orange' : 'text-text-primary group-hover:text-brand-orange'
                                            }`}>
                                            {minute.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {minute.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="px-2 py-0.5 text-[10px] bg-glass-surface border border-glass-border rounded-md text-text-muted">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detail View - Full width on mobile/tablet when active */}
                        <div className={`lg:col-span-2 ${selectedMinute ? 'block' : 'hidden lg:block'}`}>
                            <div className="bg-glass-bg border border-glass-border rounded-2xl h-[700px] flex flex-col overflow-hidden shadow-sm relative">
                                {selectedMinute ? (
                                    <>
                                        <div className="p-6 border-b border-glass-border bg-glass-surface/30 backdrop-blur-sm sticky top-0 z-10">
                                            {/* Mobile Back Button */}
                                            <button
                                                onClick={() => setSelectedMinute(null)}
                                                className="lg:hidden mb-4 flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
                                            >
                                                <Icons.ChevronLeft /> Terug naar overzicht
                                            </button>

                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                                        <h2 className="text-xl font-bold text-text-primary">{selectedMinute.title}</h2>
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                                            {selectedMinute.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-text-muted">
                                                        <span className="flex items-center gap-1.5">
                                                            <Icons.Calendar />
                                                            {format(new Date(selectedMinute.date), 'dd MMMM yyyy', { locale: nl })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button className="p-2 hover:bg-glass-surface rounded-lg text-text-muted hover:text-brand-orange transition-colors" title="Download PDF (Mock)">
                                                    <Icons.Download />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                            <div className="prose prose-sm md:prose-base prose-invert max-w-none text-text-secondary">
                                                <div className="whitespace-pre-wrap font-sans leading-relaxed">
                                                    {/* Simple rendering for now, could use a markdown parser later */}
                                                    {selectedMinute.content.split('\n').map((line, i) => (
                                                        <p key={i} className={`mb-2 ${line.startsWith('#') || line.startsWith('**') ? 'font-bold text-text-primary mt-4' : ''}`}>
                                                            {line.replace(/\*\*/g, '')}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8 text-center">
                                        <div className="w-16 h-16 rounded-full bg-glass-surface flex items-center justify-center mb-4">
                                            <Icons.FileText />
                                        </div>
                                        <p className="font-medium">Selecteer een notule om de details te bekijken</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <EventSchedule />
                )}
            </div>
        </div>
    );
};

export default TeamHub;
