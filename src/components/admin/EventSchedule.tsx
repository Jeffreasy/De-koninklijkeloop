import React, { useState } from 'react';
import { teamSchedule } from './data/teamData';
import { routes } from '../../lib/routeData';

// Enhanced Icon Set based on CSV mapping
const Icons = {
    Logistics: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    Bus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" /><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>,
    MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
    Start: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
    Coffee: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v2" /><path d="M14 2v2" /><path d="M16 8a1 1 0 0 1 .5 2.5l-4 3.7a8 8 0 0 1-5 0l-4-3.7A1 1 0 0 1 4 8z" /></svg>,
    Flag: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>,
    Trophy: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>,
    Party: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z" /></svg>,
    ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>,
    Default: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /></svg>
};

const getIcon = (iconName: string) => {
    switch (iconName) {
        case 'aanvang': return <Icons.Flag />;
        case 'start': return <Icons.Start />;
        case 'vertrek': return <Icons.Bus />;
        case 'aanwezig': return <Icons.MapPin />;
        case 'rustpunt': return <Icons.Coffee />;
        case 'aankomst': return <Icons.Flag />;
        case 'finish': return <Icons.Trophy />;
        case 'feest': return <Icons.Party />;
        default: return <Icons.Default />;
    }
};

const EventSchedule = () => {
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

    return (
        <div className="bg-glass-bg border border-glass-border rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-widest mb-4">
                        2026 Editie
                    </span>
                    <h3 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">Programma Overzicht</h3>
                    <p className="text-text-muted text-lg max-w-xl mx-auto font-light leading-relaxed">
                        De officiële planning voor De Koninklijke Loop 2026. Tijden onder voorbehoud van wijzigingen.
                    </p>
                </div>

                <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-glass-border before:to-transparent">
                    {teamSchedule.map((item, i) => {
                        const isEvent = item.type === 'event';
                        const isBreak = item.type === 'break';
                        const route = item.routeId ? routes.find(r => r.id === item.routeId) : null;

                        return (
                            <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                {/* Timeline Node */}
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-all duration-500 group-hover:scale-110
                                    ${isEvent
                                        ? 'bg-gradient-to-br from-brand-orange to-red-500 text-white border-white/20 shadow-brand-orange/40'
                                        : isBreak
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-white/20 shadow-blue-500/30'
                                            : 'bg-glass-surface text-text-muted border-glass-border'
                                    }`}>
                                    {getIcon(item.icon)}
                                </div>

                                {/* Card content */}
                                <div className={`w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl relative overflow-hidden
                                    ${isEvent
                                        ? 'bg-glass-surface/90 border-brand-orange/20 hover:border-brand-orange/50 shadow-brand-orange/5'
                                        : 'bg-glass-surface/40 border-glass-border hover:bg-glass-surface/60'
                                    }`}>

                                    {/* Route Integration Background */}
                                    {route && (
                                        <div
                                            className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full -mr-4 -mt-4 transition-opacity group-hover:opacity-20 pointer-events-none"
                                            style={{ backgroundColor: route.color }}
                                        />
                                    )}

                                    <div className="flex flex-col gap-2 mb-3">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-mono text-sm font-bold px-2.5 py-1 rounded-md ${isEvent ? 'bg-brand-orange/10 text-brand-orange' : 'bg-glass-surface text-text-muted'}`}>
                                                {item.time}
                                            </span>
                                            {route && (
                                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                                                    style={{ color: route.color, borderColor: `${route.color}30`, backgroundColor: `${route.color}10` }}>
                                                    {route.distance}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className={`text-lg font-bold mb-2 ${isEvent ? 'text-text-primary' : 'text-text-secondary'}`}>
                                        {item.title}
                                    </h4>

                                    <p className={`text-sm leading-relaxed mb-3 ${isEvent ? 'text-text-secondary font-medium' : 'text-text-muted'}`}>
                                        {item.description}
                                    </p>

                                    {/* Route Details Integration */}
                                    {route && (
                                        <div className="mt-4 pt-4 border-t border-glass-border flex items-center justify-between group/link">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: route.color }} />
                                                <span className="text-xs font-semibold text-text-muted">{route.name}</span>
                                            </div>
                                            {/* Optional: Add Link/Button here later */}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div >
    );
};

export default EventSchedule;
