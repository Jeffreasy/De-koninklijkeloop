import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { routes } from '../../lib/routeData';
import {
    Flag,
    Play,
    Bus,
    MapPin,
    Coffee,
    Trophy,
    PartyPopper,
    ChevronRight,
    Circle,
    Clock,
    Plus,
    Edit3,
    Trash2
} from 'lucide-react';

// Enhanced Icon Set based on Lucide
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

const EventSchedule = ({ onAddClick, onEditClick }: { onAddClick?: () => void, onEditClick?: (item: any) => void }) => {
    const schedule = useQuery(api.team.getSchedule);
    const deleteScheduleItem = useMutation(api.team.deleteScheduleItem);

    const handleDelete = async (e: React.MouseEvent, id: any) => {
        e.stopPropagation();
        if (confirm("Item verwijderen?")) {
            await deleteScheduleItem({ id });
        }
    };

    return (
        <div className="bg-glass-bg border border-glass-border rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl group">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-75 transition-opacity duration-700" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2 opacity-30" />

            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12 relative">
                    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-widest mb-4 border border-brand-orange/20 shadow-sm">
                        <Clock className="w-3 h-3" />
                        2026 Editie
                    </span>
                    <h3 className="text-4xl font-bold text-text-primary mb-4 tracking-tight font-display">Programma Overzicht</h3>
                    <p className="text-text-muted text-lg max-w-xl mx-auto font-light leading-relaxed">
                        De officiële planning voor De Koninklijke Loop 2026. Tijden onder voorbehoud van wijzigingen.
                    </p>

                    {/* Admin Action: Add Item */}
                    {onAddClick && (
                        <button
                            onClick={onAddClick}
                            className="absolute right-0 top-0 p-2 bg-glass-surface border border-glass-border rounded-lg text-text-muted hover:text-brand-orange hover:bg-glass-surface/80 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                            title="Item toevoegen"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-glass-border before:to-transparent">
                    {!schedule ? (
                        // Skeleton Loading
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-4 opacity-50">
                                <div className="w-12 h-12 rounded-full bg-glass-surface animate-pulse"></div>
                                <div className="flex-1 h-24 bg-glass-bg rounded-2xl animate-pulse"></div>
                            </div>
                        ))
                    ) : schedule.length === 0 ? (
                        <div className="text-center text-text-muted py-12">Nog geen programma items.</div>
                    ) : (
                        schedule.map((item, i) => {
                            const isEvent = item.type === 'event';
                            const isBreak = item.type === 'break';
                            const route = item.routeId ? routes.find(r => r.id === item.routeId) : null;

                            return (
                                <div key={item._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group/item">
                                    {/* Timeline Node */}
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-all duration-500 group-hover/item:scale-110
                                        ${isEvent
                                            ? 'bg-linear-to-br from-brand-orange to-red-500 text-white border-white/20 shadow-brand-orange/40'
                                            : isBreak
                                                ? 'bg-linear-to-br from-blue-500 to-indigo-600 text-white border-white/20 shadow-blue-500/30'
                                                : 'bg-glass-surface text-text-muted border-glass-border'
                                        }`}>
                                        {getIcon(item.icon, "w-5 h-5")}
                                    </div>

                                    {/* Card content */}
                                    <div className={`w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 group-hover/item:-translate-y-1 group-hover/item:shadow-xl relative overflow-hidden
                                        ${isEvent
                                            ? 'bg-glass-surface/90 border-brand-orange/20 hover:border-brand-orange/50 shadow-brand-orange/5'
                                            : 'bg-glass-surface/40 border-glass-border hover:bg-glass-surface/60'
                                        }`}>

                                        {/* Admin Actions (Hover) */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity z-20">
                                            {onEditClick && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEditClick(item); }}
                                                    className="p-1.5 text-text-muted hover:text-brand-orange bg-glass-bg rounded-md border border-glass-border hover:bg-glass-surface"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                </button>
                                            )}
                                            {onAddClick && (
                                                <button
                                                    onClick={(e) => handleDelete(e, item._id)}
                                                    className="p-1.5 text-text-muted hover:text-red-500 bg-glass-bg rounded-md border border-glass-border hover:bg-glass-surface"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Route Integration Background */}
                                        {route && (
                                            <div
                                                className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full -mr-4 -mt-4 transition-opacity group-hover/item:opacity-20 pointer-events-none"
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
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div >
    );
};

export default EventSchedule;
