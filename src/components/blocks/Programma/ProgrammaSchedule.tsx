import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { routes, loadRoutePoints, type RoutePoint } from '../../../lib/routeData';
import { getScheduleIcon } from '../../../lib/scheduleIcons';
import {
    Clock, Sparkles, Timer, CalendarDays, Route, Info,
    MapPinned, Users, ArrowRight, ChevronRight, AlertTriangle,
    Utensils, Heart, Bus, Phone
} from 'lucide-react';
import { ConvexClientProvider } from '../../islands/ConvexClientProvider';

const getIcon = getScheduleIcon;

/**
 * Decimates a GPS coordinate array for SVG thumbnail rendering.
 * Keeps at most `maxPoints` evenly-spaced points — reduces 500-pt
 * arrays to 60 pts without visible quality loss at thumbnail size.
 */
function simplifyPoints(pts: RoutePoint[], maxPoints = 60): RoutePoint[] {
    if (pts.length <= maxPoints) return pts;
    const stride = Math.ceil(pts.length / maxPoints);
    const simplified: RoutePoint[] = [];
    for (let i = 0; i < pts.length; i += stride) simplified.push(pts[i]);
    // Always include the last point so the end dot is correct
    if (simplified[simplified.length - 1] !== pts[pts.length - 1]) {
        simplified.push(pts[pts.length - 1]);
    }
    return simplified;
}

/** Converts route points to an SVG path string in a 200×120 viewBox. */
function buildSvgPath(pts: RoutePoint[]): string {
    if (!pts || pts.length < 2) return '';
    const lats = pts.map(p => p.lat);
    const lngs = pts.map(p => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const padding = 0.15;
    const rangeLat = (maxLat - minLat) || 0.001;
    const rangeLng = (maxLng - minLng) || 0.001;
    return pts.map((p, idx) => {
        const x = ((p.lng - minLng) / rangeLng) * (1 - 2 * padding) + padding;
        const y = 1 - (((p.lat - minLat) / rangeLat) * (1 - 2 * padding) + padding);
        return `${idx === 0 ? 'M' : 'L'} ${(x * 200).toFixed(1)} ${(y * 120).toFixed(1)}`;
    }).join(' ');
}

function getMapTiles(pts: RoutePoint[]): { url: string; offsetX: number; offsetY: number }[] | null {
    if (!pts || pts.length === 0) return null;
    const lats = pts.map(p => p.lat);
    const lngs = pts.map(p => p.lng);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const span = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
    let zoom = 13;
    if (span > 0.15) zoom = 10;
    else if (span > 0.08) zoom = 11;
    else if (span > 0.04) zoom = 12;
    const n = Math.pow(2, zoom);
    const exactX = ((centerLng + 180) / 360) * n;
    const latRad = (centerLat * Math.PI) / 180;
    const exactY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
    const tileX = Math.floor(exactX);
    const tileY = Math.floor(exactY);
    const fracX = exactX - tileX;
    const fracY = exactY - tileY;
    const subdomains = ['a', 'b', 'c'];
    const tiles: { url: string; offsetX: number; offsetY: number }[] = [];
    for (let dy = 0; dy <= 1; dy++) {
        for (let dx = 0; dx <= 1; dx++) {
            const s = subdomains[(dy * 2 + dx) % 3];
            tiles.push({
                url: `https://${s}.tile.openstreetmap.org/${zoom}/${tileX + dx}/${tileY + dy}.png`,
                offsetX: (dx - fracX) * 256,
                offsetY: (dy - fracY) * 256,
            });
        }
    }
    return tiles;
}

type RouteFilter = 'all' | '15km' | '10km' | '6km' | '2.5km';

const getRouteColor = (id: string) => routes.find(r => r.id === id)?.color ?? '#f97316';

const FILTER_TABS: { id: RouteFilter; label: string; color: string }[] = [
    { id: 'all', label: 'Alles', color: '#f97316' },
    { id: '15km', label: '15 KM', color: getRouteColor('15km') },
    { id: '10km', label: '10 KM', color: getRouteColor('10km') },
    { id: '6km', label: '6 KM', color: getRouteColor('6km') },
    { id: '2.5km', label: '2,5 KM', color: getRouteColor('2.5km') },
];

const MELDTIJDEN: { route: string; time: string; color: string }[] = [
    { route: '15 KM', time: '10:15', color: getRouteColor('15km') },
    { route: '10 KM', time: '12:00', color: getRouteColor('10km') },
    { route: '6 KM', time: '13:15', color: getRouteColor('6km') },
    { route: '2,5 KM', time: '14:30', color: getRouteColor('2.5km') },
];

function ProgrammaContent() {
    const schedule = useQuery(api.team.getSchedule);
    const settings = useQuery(api.eventSettings.getActiveSettings);
    const liveCount = useQuery(api.eventSettings.getLiveParticipantCount);
    const [activeFilter, setActiveFilter] = useState<RouteFilter>('all');

    const eventDate = settings?.event_date_display || settings?.event_date || '2026';
    const locationName = settings?.location_name || 'Paleis Het Loo';
    const locationCity = settings?.location_city || 'Apeldoorn';
    const currentParticipants = liveCount ?? 0;

    const filteredSchedule = useMemo(() => {
        if (!schedule) return null;
        if (activeFilter === 'all') return schedule;
        return schedule.filter(item =>
            item.routeId === activeFilter || !item.routeId
        );
    }, [schedule, activeFilter]);

    const [routePointsMap, setRoutePointsMap] = useState<Record<string, RoutePoint[]>>({});
    useEffect(() => {
        // Fix #2: Defer the 4 JSON fetches (~54KB total) until the browser
        // is idle — prevents network contention during first paint.
        const load = () => {
            Promise.all(routes.map(r =>
                loadRoutePoints(r.id).then(pts => [r.id, simplifyPoints(pts)] as const)
            )).then(entries => setRoutePointsMap(Object.fromEntries(entries)));
        };
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(load, { timeout: 3000 });
        } else {
            setTimeout(load, 500);
        }
    }, []);

    // Fix #4: Memoize ALL svg paths — recomputes only when routePointsMap changes.
    const svgPaths = useMemo(() => {
        const map: Record<string, string> = {};
        for (const route of routes) {
            const pts = routePointsMap[route.id];
            map[route.id] = pts ? buildSvgPath(pts) : '';
        }
        return map;
    }, [routePointsMap]);

    return (
        <div className="space-y-8 md:space-y-12">
            {/* ── Hero Header ── */}
            <section className="text-center">
                <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-widest mb-6 border border-brand-orange/20 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    Editie 2026
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary font-display mb-4">
                    Programma 2026
                </h1>
                <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-6">
                    Bekijk het volledige dagprogramma van De Koninklijke Loop 2026. Van de eerste stappen tot de finish bij de Grote Kerk.
                </p>


                {/* Social Proof Strip */}
                <div className="max-w-2xl mx-auto rounded-2xl bg-glass-bg border border-glass-border backdrop-blur-xl p-1">
                    <div className="grid grid-cols-2 md:grid-cols-4">
                        {[
                            { icon: CalendarDays, label: 'Datum', value: eventDate },
                            { icon: MapPinned, label: 'Locatie', value: `${locationName}` },
                            { icon: Users, label: 'Ingeschreven', value: currentParticipants > 0 ? `${currentParticipants}` : '—' },
                            { icon: Route, label: 'Routes', value: `${routes.length}` },
                        ].map((stat, i) => (
                            <div
                                key={stat.label}
                                className={`flex flex-col items-center gap-1 py-3 px-2 ${i < 3 ? 'border-r border-glass-border/40 last:border-r-0' : ''
                                    } ${i < 2 ? 'border-b md:border-b-0 border-glass-border/40' : ''}`}
                            >
                                <stat.icon className="w-4 h-4 text-brand-orange mb-0.5" />
                                <span className="text-sm md:text-base font-bold text-text-primary tabular-nums">{stat.value}</span>
                                <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Meldtijden Quick Reference ── */}
            <section>
                <div className="text-center mb-5">
                    <h2 className="text-xl md:text-2xl font-bold text-text-primary font-display">
                        Meldtijden
                    </h2>
                    <p className="text-text-muted text-sm mt-1">Meld je op tijd bij het coördinatiepunt (Grote Kerk)</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {MELDTIJDEN.map(m => (
                        <div
                            key={m.route}
                            // Fix #3: removed backdrop-blur-md — individual card blurs cause GPU jank
                            className="relative overflow-hidden rounded-2xl bg-glass-bg border border-glass-border p-4 text-center group hover:shadow-lg transition-shadow duration-300"
                        >
                            <div
                                className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.06] group-hover:opacity-[0.12] transition-opacity pointer-events-none"
                                style={{ backgroundColor: m.color }}
                            />
                            <div className="text-2xl md:text-3xl font-bold font-mono tabular-nums mb-1" style={{ color: m.color }}>
                                {m.time}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: m.color }}>
                                {m.route}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Praktische Informatie ── */}
            <section className="relative rounded-2xl bg-glass-bg border border-glass-border backdrop-blur-md p-6 md:p-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-brand-orange/3 rounded-full blur-3xl -z-10 -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <h2 className="text-xl md:text-2xl font-bold text-text-primary font-display mb-5">
                    Praktische Informatie
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        {
                            icon: MapPinned,
                            title: "Coördinatiepunt",
                            desc: "Grote Kerk, Loolaan 16, 7315 AB Apeldoorn. Hier meld je je aan en vertrekken de pendelbussen.",
                            color: "#f97316"
                        },
                        {
                            icon: Utensils,
                            title: "Eten & Drinken",
                            desc: "Je krijgt een lunchpakketje mee. Bij rustpunten is fruit & drinken aanwezig. Neem zelf voldoende water mee!",
                            color: "#10b981"
                        },
                        {
                            icon: AlertTriangle,
                            title: "Toiletten",
                            desc: "Bij de Grote Kerk zijn toiletten beschikbaar (incl. invalidetoilet). Let op: op de route zijn GEEN toiletten!",
                            color: "#eab308"
                        },
                        {
                            icon: Heart,
                            title: "EHBO & Begeleiding",
                            desc: "Er zijn routebegeleiders en EHBO'ers onderweg. Bij hun kun je altijd terecht voor vragen.",
                            color: "#ef4444"
                        },
                        {
                            icon: Bus,
                            title: "Vervoer",
                            desc: "Pendelbussen brengen je naar de startpunten. Er is een rolstoelbus beschikbaar.",
                            color: "#3b82f6"
                        },
                        {
                            icon: Phone,
                            title: "Vragen of info?",
                            desc: "Neem contact op via onze contactpagina of spreek een routebegeleider aan.",
                            color: "#06b6d4"
                        },
                    ].map(item => (
                        <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-glass-surface/40 border border-glass-border/50 group hover:bg-glass-surface/60 transition-all">
                            <div
                                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border"
                                style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}20` }}
                            >
                                <item.icon className="w-5 h-5" style={{ color: item.color }} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-primary mb-0.5">{item.title}</h3>
                                <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Route Detail Cards ── */}
            <section>
                <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary font-display mb-2">
                        Kies je route
                    </h2>
                    <p className="text-text-muted text-sm md:text-base max-w-lg mx-auto">
                        Vier unieke routes door de bossen rond Paleis Het Loo.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {routes.map(route => {
                        const distNum = parseFloat(route.distance);
                        const walkMinutes = Math.round((distNum / 4.5) * 60);
                        const walkHours = Math.floor(walkMinutes / 60);
                        const walkMins = walkMinutes % 60;
                        const walkTime = walkHours > 0 ? `${walkHours}u ${walkMins}m` : `${walkMins} min`;

                        const terrainLabels: Record<string, string[]> = {
                            '2.5km': ['Verhard', 'Toegankelijk', 'Rolstoelvriendelijk'],
                            '6km': ['Bospaden', 'Licht heuvelachtig', 'Rolstoelvriendelijk'],
                            '10km': ['Bospaden', 'Uitdagend', 'Rolstoelvriendelijk'],
                            '15km': ['Bospaden', 'Sportief', 'Rolstoelvriendelijk'],
                        };
                        const labels = terrainLabels[route.id] || ['Natuur'];

                        // Fix #4: use pre-computed memoized SVG path
                        const svgPath = svgPaths[route.id] ?? '';

                        return (
                            <div
                                key={route.id}
                                // Fix #3: removed backdrop-blur-md from individual route cards
                                className="relative overflow-hidden rounded-2xl bg-glass-bg border border-glass-border group hover:shadow-xl hover:border-glass-border/80 transition-shadow duration-300 flex flex-col h-full"
                            >
                                <div
                                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-[0.04] group-hover:opacity-[0.10] transition-opacity pointer-events-none"
                                    style={{ backgroundColor: route.color }}
                                />

                                {/* Map Preview — route SVG on gradient bg */}
                                <div
                                    className="relative w-full h-36 sm:h-40 shrink-0 overflow-hidden border-b border-glass-border/50"
                                    style={{ background: `linear-gradient(135deg, ${route.color}08 0%, ${route.color}03 40%, transparent 70%)` }}
                                >
                                    {/* Subtle grid pattern */}
                                    <div className="absolute inset-0 opacity-[0.04]" style={{
                                        backgroundImage: `linear-gradient(${route.color}40 1px, transparent 1px), linear-gradient(90deg, ${route.color}40 1px, transparent 1px)`,
                                        backgroundSize: '24px 24px',
                                    }} />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-glass-bg/60 pointer-events-none" />
                                    {/* Route SVG */}
                                    <svg viewBox="0 0 200 120" className="relative w-full h-full p-3 z-10" fill="none" preserveAspectRatio="xMidYMid meet">
                                        {svgPath && (
                                            <>
                                                {/* Shadow/glow layer */}
                                                <path d={svgPath} stroke={route.color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.08" fill="none" />
                                                {/* White outline */}
                                                <path d={svgPath} stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" fill="none" />
                                                {/* Main route */}
                                                <path d={svgPath} stroke={route.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ filter: `drop-shadow(0 0 3px ${route.color}50)` }} />
                                                {/* Start dot */}
                                                <circle cx={svgPath.split(' ')[1]} cy={svgPath.split(' ')[2]} r="5" fill="white" stroke={route.color} strokeWidth="2" opacity="0.9" />
                                                {/* End dot */}
                                                {(() => {
                                                    const parts = svgPath.trim().split(/\s+/);
                                                    return <circle cx={parts[parts.length - 2]} cy={parts[parts.length - 1]} r="5" fill={route.color} stroke="white" strokeWidth="2" />;
                                                })()}
                                            </>
                                        )}
                                    </svg>
                                    {/* Distance badge */}
                                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider border backdrop-blur-md z-10" style={{ color: 'white', borderColor: `${route.color}60`, backgroundColor: `${route.color}cc` }}>
                                        {route.distance}
                                    </div>
                                </div>

                                {/* Content — below map */}
                                <div className="flex-1 p-5 flex flex-col">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: route.color, boxShadow: `0 0 0 2px var(--color-bg-primary, #fff), 0 0 0 4px ${route.color}30` }} />
                                        <h3 className="text-base font-bold text-text-primary leading-tight">{route.name}</h3>
                                    </div>
                                    <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-2">{route.description}</p>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                                <Timer className="w-3.5 h-3.5" style={{ color: route.color }} />
                                                <span className="font-medium">~{walkTime}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                                <Route className="w-3.5 h-3.5" style={{ color: route.color }} />
                                                <span className="font-medium tabular-nums">{routePointsMap[route.id]?.length ?? '…'} punten</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {labels.map(label => (
                                                <span key={label} className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold border" style={{ color: route.color, borderColor: `${route.color}25`, backgroundColor: `${route.color}08` }}>
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Timeline with Route Filters ── */}
            <section className="relative bg-glass-bg border border-glass-border rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 opacity-40 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2 opacity-25 pointer-events-none" />

                <div className="max-w-3xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 font-display">
                            Dagprogramma
                        </h2>
                        <p className="text-text-muted text-sm md:text-base max-w-lg mx-auto">
                            Filter op jouw route of bekijk het volledige programma.
                        </p>
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
                            <Info className="w-3 h-3" />
                            Programma 2025 — Programma 2026 wordt binnenkort aangekondigd
                        </div>
                    </div>

                    {/* Route Filter Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                        {FILTER_TABS.map(tab => {
                            const isActive = activeFilter === tab.id;
                            const routeMatch = routes.find(r => r.id === tab.id);
                            const tabColor = routeMatch?.color || tab.color;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveFilter(tab.id)}
                                    // Fix #5: replaced scale-105 (causes layout shift) with
                                    // ring + border treatment — purely visual, no geometry change
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2
                                        ${isActive
                                            ? 'text-white shadow-lg ring-2 ring-offset-2 ring-offset-transparent'
                                            : 'bg-glass-surface/50 text-text-muted border-glass-border hover:border-opacity-60 hover:text-text-primary'
                                        }`}
                                    style={isActive ? {
                                        backgroundColor: tabColor,
                                        borderColor: tabColor,
                                        boxShadow: `0 4px 14px ${tabColor}30`,
                                        // @ts-ignore — ring color via inline style
                                        '--tw-ring-color': `${tabColor}50`,
                                    } : undefined}
                                >
                                    {tab.id !== 'all' && (
                                        <span
                                            className="inline-block w-2 h-2 rounded-full mr-1.5"
                                            style={{ backgroundColor: isActive ? 'white' : tabColor }}
                                        />
                                    )}
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Item Count Indicator */}
                    {filteredSchedule && (
                        <div className="text-center mb-6">
                            <span className="text-xs text-text-muted">
                                {filteredSchedule.length} {filteredSchedule.length === 1 ? 'moment' : 'momenten'}
                                {activeFilter !== 'all' && ' voor deze route'}
                            </span>
                        </div>
                    )}

                    {/* Timeline Items */}
                    <div className="relative space-y-0">
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-glass-border to-transparent md:-translate-x-px pointer-events-none" />

                        {!filteredSchedule ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="relative flex items-start gap-4 py-6">
                                    <div className="w-12 h-12 rounded-full bg-glass-surface animate-pulse shrink-0" />
                                    <div className="flex-1 h-28 bg-glass-surface rounded-2xl animate-pulse" />
                                </div>
                            ))
                        ) : filteredSchedule.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-glass-surface flex items-center justify-center border border-glass-border">
                                    <CalendarDays className="w-7 h-7 text-text-muted opacity-50" />
                                </div>
                                <p className="text-text-muted">Het programma wordt binnenkort bekendgemaakt.</p>
                            </div>
                        ) : (
                            filteredSchedule.map((item, i) => {
                                const isEvent = item.type === 'event';
                                const isBreak = item.type === 'break';
                                const route = item.routeId ? routes.find(r => r.id === item.routeId) : null;
                                const isLeft = i % 2 === 0;

                                return (
                                    <div key={item._id} className="relative group/item">
                                        <div className={`flex items-start py-4 md:py-6 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                            {/* Node */}
                                            <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 z-10">
                                                {/* Fix #7: motion-reduce — no scale on hover for users who prefer reduced motion */}
                                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-lg transition-all duration-300 group-hover/item:scale-110 motion-reduce:group-hover/item:scale-100
                                                    ${isEvent
                                                        ? 'bg-linear-to-br from-brand-orange to-red-500 text-white border-white/20 shadow-brand-orange/30'
                                                        : isBreak
                                                            ? 'bg-linear-to-br from-blue-500 to-indigo-600 text-white border-white/20 shadow-blue-500/25'
                                                            : 'bg-glass-surface text-text-muted border-glass-border shadow-sm'
                                                    }`}>
                                                    {getIcon(item.icon, "w-5 h-5")}
                                                </div>
                                            </div>

                                            {/* Spacer so the card clears the timeline node on mobile */}
                                            <div className="w-18 shrink-0 md:hidden" />
                                            <div className={`hidden md:block md:w-[calc(50%-1.5rem)] ${isLeft ? 'order-last' : ''}`} />

                                            {/* Card */}
                                            <div className={`flex-1 md:w-[calc(50%-1.5rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                                                {/* Fix #3: removed backdrop-blur-md from timeline cards
                                                    Fix #7: motion-reduce — no translateY on hover */}
                                                <div className={`relative p-5 md:p-6 rounded-2xl border transition-all duration-300 group-hover/item:-translate-y-0.5 motion-reduce:group-hover/item:translate-y-0 group-hover/item:shadow-xl overflow-hidden
                                                    ${isEvent
                                                        ? 'bg-glass-surface/90 border-brand-orange/15 hover:border-brand-orange/40 shadow-md shadow-brand-orange/5'
                                                        : isBreak
                                                            ? 'bg-glass-surface/70 border-blue-500/15 hover:border-blue-500/30 shadow-sm'
                                                            : 'bg-glass-surface/40 border-glass-border hover:bg-glass-surface/60 shadow-sm'
                                                    }`}>

                                                    {route && (
                                                        <div className="absolute top-0 right-0 w-28 h-28 opacity-[0.06] rounded-bl-full -mr-6 -mt-6 pointer-events-none" style={{ backgroundColor: route.color }} />
                                                    )}

                                                    <div className="flex items-center justify-between gap-3 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className={`w-3.5 h-3.5 ${isEvent ? 'text-brand-orange' : 'text-text-muted'}`} />
                                                            <span className={`font-mono text-sm font-bold tracking-wide ${isEvent ? 'text-brand-orange' : 'text-text-muted'}`}>
                                                                {item.time}
                                                            </span>
                                                        </div>
                                                        {route && (
                                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border" style={{ color: route.color, borderColor: `${route.color}25`, backgroundColor: `${route.color}08` }}>
                                                                {route.distance}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className={`text-base md:text-lg font-bold mb-2 leading-snug ${isEvent ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                        {item.title}
                                                    </h3>

                                                    <p className={`text-sm leading-relaxed ${isEvent ? 'text-text-secondary' : 'text-text-muted'}`}>
                                                        {item.description}
                                                    </p>

                                                    {route && (
                                                        <div className="mt-4 pt-3 border-t border-glass-border/50 flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: route.color }} />
                                                            <span className="text-xs font-medium text-text-muted">{route.name}</span>
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

                    {/* Duration Footer */}
                    {filteredSchedule && filteredSchedule.length > 1 && (
                        <div className="mt-10 pt-6 border-t border-glass-border/30">
                            <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
                                <span className="flex items-center gap-1.5">
                                    <Timer className="w-4 h-4 text-brand-orange" />
                                    <span className="font-medium">{filteredSchedule[0]?.time} — {filteredSchedule[filteredSchedule.length - 1]?.time}</span>
                                </span>
                                <span className="w-px h-4 bg-glass-border" />
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="w-4 h-4" />
                                    <span className="tabular-nums">{filteredSchedule.length} momenten</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── CTA Section ── */}
            <section className="text-center py-4">
                <div className="relative overflow-hidden rounded-3xl bg-glass-bg border border-glass-border p-8 md:p-12 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-linear-to-br from-brand-orange/5 via-transparent to-blue-500/5 pointer-events-none" />
                    <div className="relative">
                        <h2 className="text-2xl md:text-3xl font-bold text-text-primary font-display mb-3">
                            Doe mee aan De Koninklijke Loop
                        </h2>
                        <p className="text-text-muted text-base md:text-lg max-w-lg mx-auto mb-6">
                            Wandel mee door de prachtige bossen van Apeldoorn. Kies je afstand en schrijf je in.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <a
                                href="/register"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-orange text-white rounded-xl font-semibold shadow-lg shadow-brand-orange/25 hover:shadow-xl hover:shadow-brand-orange/30 hover:bg-brand-orange-dark transition-all duration-300 text-base cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
                            >
                                Schrijf je in <ArrowRight className="w-4 h-4" />
                            </a>
                            <a
                                href="/routes"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-glass-surface border border-glass-border text-text-primary rounded-xl font-medium hover:bg-glass-surface/80 hover:border-brand-orange/30 transition-all duration-300 text-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
                            >
                                Bekijk routes <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function ProgrammaSchedule() {
    return (
        <ConvexClientProvider>
            <ProgrammaContent />
        </ConvexClientProvider>
    );
}
