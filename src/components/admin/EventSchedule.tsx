import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { $accessToken } from '../../lib/auth';
import { useStore } from '@nanostores/react';
import { routes } from '../../lib/routeData';
import {
    Flag,
    Play,
    Bus,
    MapPin,
    Coffee,
    Trophy,
    PartyPopper,
    Circle,
    Clock,
    Plus,
    Edit3,
    Trash2,
    Users,
    CalendarDays,
    Timer,
    Route,
    Sparkles,
    Info
} from 'lucide-react';

const getIcon = (iconName: string, className: string = "w-5 h-5") => {
    switch (iconName) {
        case 'aanvang': return <Flag className={className} />;
        case 'start': return <Play className={className} />;
        case 'vertrek': return <Bus className={className} />;
        case 'aanwezig': return <MapPin className={className} />;
        case 'rustpunt': return <Coffee className={className} />;
        case 'aankomst': return <Flag className={className} />;
        case 'finish': return <Trophy className={className} />;
        case 'feest': return <PartyPopper className={className} />;
        default: return <Circle className={className} />;
    }
};

// Static color mapping for JIT-safe Tailwind classes
const STAT_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    'brand-orange': { bg: 'bg-brand-orange/10', border: 'border-brand-orange/20', text: 'text-brand-orange', glow: 'bg-brand-orange/5' },
    'blue-500': { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', glow: 'bg-blue-500/5' },
    'text-muted': { bg: 'bg-glass-surface', border: 'border-glass-border', text: 'text-text-muted', glow: 'bg-glass-surface' },
    'green-500': { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-500', glow: 'bg-green-500/5' },
};

const EventSchedule = ({ onAddClick, onEditClick }: { onAddClick?: () => void, onEditClick?: (item: any) => void }) => {
    const accessToken = useStore($accessToken);
    const schedule = useQuery(api.team.getSchedule);
    const getVolunteerTasks = useAction(api.adminTasks.getVolunteerTasks);
    const deleteScheduleItem = useMutation(api.team.deleteScheduleItem);

    const [volunteerTasks, setVolunteerTasks] = useState<any[] | undefined>(undefined);

    const fetchVolunteers = useCallback(() => {
        if (!accessToken) return;
        getVolunteerTasks({ token: accessToken }).then(setVolunteerTasks).catch(console.error);
    }, [accessToken]);

    useEffect(() => { fetchVolunteers(); }, [fetchVolunteers]);
    const getVolunteersForTime = (time: string) => {
        if (!volunteerTasks || !time) return [];
        return volunteerTasks.filter(t => t.startTime === time);
    };

    const handleDelete = async (e: React.MouseEvent, id: any) => {
        e.stopPropagation();
        if (confirm("Item verwijderen?")) {
            await deleteScheduleItem({ id });
        }
    };

    const totalEvents = schedule?.filter(s => s.type === 'event').length ?? 0;
    const totalBreaks = schedule?.filter(s => s.type === 'break').length ?? 0;
    const totalLogistics = schedule?.filter(s => s.type === 'logistics').length ?? 0;
    const totalVolunteers = volunteerTasks?.length ?? 0;

    return (
        <div className="space-y-6">
            {/* Stats Overview Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Evenementen', value: totalEvents, icon: CalendarDays, color: 'brand-orange' },
                    { label: 'Rustpunten', value: totalBreaks, icon: Coffee, color: 'blue-500' },
                    { label: 'Logistiek', value: totalLogistics, icon: Timer, color: 'text-muted' },
                    { label: 'Vrijwilligers', value: totalVolunteers, icon: Users, color: 'green-500' },
                ].map((stat) => {
                    const colors = STAT_COLORS[stat.color];
                    return (
                        <div key={stat.label} className="relative overflow-hidden p-4 rounded-2xl bg-glass-bg border border-glass-border backdrop-blur-md group hover:border-glass-border/80 transition-all duration-300">
                            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${colors.glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${colors.bg} ${colors.border} border`}>
                                    <stat.icon className={`w-4 h-4 ${colors.text}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-text-primary font-display tabular-nums">{stat.value}</p>
                                    <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Route Legend */}
            <div className="flex flex-wrap items-center gap-2 px-1">
                <span className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                    <Route className="w-3.5 h-3.5" /> Routes:
                </span>
                {routes.map(route => (
                    <span
                        key={route.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-sm cursor-default transition-all duration-200 hover:scale-105"
                        style={{
                            color: route.color,
                            borderColor: `${route.color}25`,
                            backgroundColor: `${route.color}08`,
                        }}
                    >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: route.color }} />
                        {route.distance}
                    </span>
                ))}
            </div>

            {/* Main Timeline Container */}
            <div className="relative bg-glass-bg border border-glass-border rounded-3xl p-4 sm:p-6 md:p-10 shadow-2xl overflow-hidden backdrop-blur-xl group/container">
                {/* Ambient Background Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 opacity-40 group-hover/container:opacity-60 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2 opacity-25 pointer-events-none" />

                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 relative">
                        <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-widest mb-4 border border-brand-orange/20 shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            2026 Editie
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-text-primary mb-3 font-display">
                            Dagprogramma
                        </h3>
                        <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed">
                            De officiële planning voor De Koninklijke Loop 2026.
                        </p>

                        {/* Preview Badge */}
                        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 text-xs font-medium">
                            <Info className="w-3 h-3" />
                            Concept — Tijden onder voorbehoud van wijzigingen
                        </div>

                        {/* Admin: Add Item */}
                        {onAddClick && (
                            <button
                                onClick={onAddClick}
                                className="absolute right-0 top-0 p-2.5 bg-glass-surface border border-glass-border rounded-xl text-text-muted hover:text-brand-orange hover:border-brand-orange/30 hover:bg-brand-orange/5 transition-all md:opacity-0 md:group-hover/container:opacity-100 shadow-sm cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title="Item toevoegen"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="relative space-y-0">
                        {/* Timeline Spine */}
                        <div className="absolute left-9 md:left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-glass-border to-transparent md:-translate-x-px pointer-events-none" />

                        {!schedule ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="relative flex items-start gap-4 py-6">
                                    <div className="w-12 h-12 rounded-full bg-glass-surface animate-pulse shrink-0" />
                                    <div className="flex-1 h-28 bg-glass-surface rounded-2xl animate-pulse" />
                                </div>
                            ))
                        ) : schedule.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-glass-surface flex items-center justify-center border border-glass-border">
                                    <CalendarDays className="w-7 h-7 text-text-muted opacity-50" />
                                </div>
                                <p className="text-text-muted text-sm">Nog geen programma items toegevoegd.</p>
                                {onAddClick && (
                                    <button
                                        onClick={onAddClick}
                                        className="mt-4 px-5 py-2 bg-brand-orange text-white rounded-xl shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-dark transition-colors font-medium text-sm flex items-center gap-2 mx-auto cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" /> Eerste item toevoegen
                                    </button>
                                )}
                            </div>
                        ) : (
                            schedule.map((item, i) => {
                                const isEvent = item.type === 'event';
                                const isBreak = item.type === 'break';
                                const route = item.routeId ? routes.find(r => r.id === item.routeId) : null;
                                const linkedVolunteers = getVolunteersForTime(item.time);
                                const isLeft = i % 2 === 0;

                                return (
                                    <div key={item._id} className="relative group/item">
                                        {/* Desktop: Alternating Layout */}
                                        <div className={`flex items-start py-4 md:py-6 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                                            {/* Timeline Node */}
                                            <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 z-10">
                                                <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 shadow-lg transition-all duration-300 group-hover/item:scale-110 group-hover/item:shadow-xl
                                                    ${isEvent
                                                        ? 'bg-linear-to-br from-brand-orange to-red-500 text-white border-white/20 shadow-brand-orange/30'
                                                        : isBreak
                                                            ? 'bg-linear-to-br from-blue-500 to-indigo-600 text-white border-white/20 shadow-blue-500/25'
                                                            : 'bg-glass-surface text-text-muted border-glass-border shadow-sm'
                                                    }`}
                                                >
                                                    {getIcon(item.icon, "w-4 h-4 md:w-5 md:h-5")}
                                                </div>
                                            </div>

                                            {/* Spacer for mobile (left-aligned) */}
                                            <div className="w-16 shrink-0 md:hidden" />

                                            {/* Desktop spacer */}
                                            <div className={`hidden md:block md:w-[calc(50%-1.5rem)] ${isLeft ? 'order-last' : ''}`} />

                                            {/* Card */}
                                            <div className={`flex-1 min-w-0 md:w-[calc(50%-1.5rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                                                <div className={`relative p-4 md:p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 group-hover/item:-translate-y-0.5 group-hover/item:shadow-xl overflow-hidden
                                                    ${isEvent
                                                        ? 'bg-glass-surface/90 border-brand-orange/15 hover:border-brand-orange/40 shadow-md shadow-brand-orange/5'
                                                        : isBreak
                                                            ? 'bg-glass-surface/70 border-blue-500/15 hover:border-blue-500/30 shadow-sm'
                                                            : 'bg-glass-surface/40 border-glass-border hover:bg-glass-surface/60 shadow-sm'
                                                    }`}
                                                >
                                                    {/* Admin Actions — hidden on mobile, hover-reveal on desktop */}
                                                    <div className="hidden md:flex absolute top-3 right-3 gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity z-20">
                                                        {onEditClick && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onEditClick(item); }}
                                                                className="p-1.5 text-text-muted hover:text-brand-orange bg-glass-bg/80 rounded-lg border border-glass-border hover:border-brand-orange/30 transition-all cursor-pointer"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        {onAddClick && (
                                                            <button
                                                                onClick={(e) => handleDelete(e, item._id)}
                                                                className="p-1.5 text-text-muted hover:text-red-500 bg-glass-bg/80 rounded-lg border border-glass-border hover:border-red-500/30 transition-all cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Route Background Accent */}
                                                    {route && (
                                                        <div
                                                            className="absolute top-0 right-0 w-28 h-28 opacity-[0.06] rounded-bl-full -mr-6 -mt-6 pointer-events-none transition-opacity group-hover/item:opacity-[0.12]"
                                                            style={{ backgroundColor: route.color }}
                                                        />
                                                    )}

                                                    {/* Time + Route Badge */}
                                                    <div className="flex items-center justify-between gap-3 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className={`w-3.5 h-3.5 ${isEvent ? 'text-brand-orange' : 'text-text-muted'}`} />
                                                            <span className={`font-mono text-sm font-bold tracking-wide ${isEvent ? 'text-brand-orange' : 'text-text-muted'}`}>
                                                                {item.time}
                                                            </span>
                                                        </div>
                                                        {route && (
                                                            <span
                                                                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
                                                                style={{ color: route.color, borderColor: `${route.color}25`, backgroundColor: `${route.color}08` }}
                                                            >
                                                                {route.distance}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <h4 className={`text-base md:text-lg font-bold mb-2 leading-snug pr-0 md:pr-16 ${isEvent ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                        {item.title}
                                                    </h4>

                                                    {/* Description */}
                                                    <p className={`text-sm leading-relaxed ${isEvent ? 'text-text-secondary' : 'text-text-muted'}`}>
                                                        {item.description}
                                                    </p>

                                                    {/* Route Link */}
                                                    {route && (
                                                        <div className="mt-4 pt-3 border-t border-glass-border/50 flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: route.color }} />
                                                            <span className="text-xs font-medium text-text-muted">{route.name}</span>
                                                        </div>
                                                    )}

                                                    {/* Volunteer Badge */}
                                                    {linkedVolunteers.length > 0 && (
                                                        <div className={`${route ? 'mt-3' : 'mt-4 pt-3 border-t border-glass-border/50'}`}>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                                                                    <Users className="w-3 h-3 text-green-500" />
                                                                    <span className="text-[11px] font-semibold text-green-500 tabular-nums">{linkedVolunteers.length}</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {linkedVolunteers.slice(0, 3).map(v => (
                                                                        <span key={v._id} className="px-2 py-0.5 rounded-md bg-glass-surface border border-glass-border text-[10px] text-text-muted truncate max-w-[100px]">
                                                                            {v.volunteerName}
                                                                        </span>
                                                                    ))}
                                                                    {linkedVolunteers.length > 3 && (
                                                                        <span className="px-2 py-0.5 rounded-md bg-glass-surface border border-glass-border text-[10px] text-text-muted tabular-nums">
                                                                            +{linkedVolunteers.length - 3}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Mobile Admin Actions — inline at bottom */}
                                                    {(onEditClick || onAddClick) && (
                                                        <div className="flex md:hidden items-center gap-2 mt-3 pt-3 border-t border-glass-border/50">
                                                            {onEditClick && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onEditClick(item); }}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-brand-orange bg-glass-bg rounded-lg border border-glass-border hover:border-brand-orange/30 transition-all cursor-pointer"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                    Bewerk
                                                                </button>
                                                            )}
                                                            {onAddClick && (
                                                                <button
                                                                    onClick={(e) => handleDelete(e, item._id)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-red-500 bg-glass-bg rounded-lg border border-glass-border hover:border-red-500/30 transition-all cursor-pointer"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    Verwijder
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer: Total Duration */}
                    {schedule && schedule.length > 1 && (
                        <div className="mt-12 pt-6 border-t border-glass-border/30">
                            <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
                                <span className="flex items-center gap-1.5">
                                    <Timer className="w-4 h-4 text-brand-orange" />
                                    <span className="font-medium">{schedule[0]?.time} — {schedule[schedule.length - 1]?.time}</span>
                                </span>
                                <span className="w-px h-4 bg-glass-border" />
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="w-4 h-4" />
                                    <span className="tabular-nums">{schedule.length} momenten</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventSchedule;
