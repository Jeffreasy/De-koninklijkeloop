import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
    Activity, Eye, Users, TrendingUp, ArrowRight,
    MousePointerClick, PlayCircle, UserPlus, Globe,
    Smartphone, Monitor, Tablet, RefreshCw
} from "lucide-react";
import { apiRequest } from "../../lib/api";

// ─── Constants ───

const PERIOD_OPTIONS = [
    { label: "Vandaag", value: "today", days: 1 },
    { label: "7 dagen", value: "7d", days: 7 },
    { label: "30 dagen", value: "30d", days: 30 },
] as const;

const EVENT_LABELS: Record<string, string> = {
    page_view: "Pageviews",
    registration_started: "Registratie gestart",
    registration_completed: "Registratie voltooid",
    registration_failed: "Registratie mislukt",
    gallery_viewed: "Gallery bekeken",
    video_played: "Video afgespeeld",
    donation_intent: "Donatie-intent",
    route_changed: "Navigatie",
};

const EVENT_COLORS: Record<string, string> = {
    page_view: "#3B82F6",
    registration_started: "#F97316",
    registration_completed: "#22C55E",
    registration_failed: "#EF4444",
    gallery_viewed: "#8B5CF6",
    video_played: "#EC4899",
    donation_intent: "#F59E0B",
    route_changed: "#6B7280",
};

const PAGE_LABELS: Record<string, string> = {
    "/": "Home",
    "/routes": "Routes",
    "/register": "Inschrijven",
    "/programma": "Programma",
    "/about": "Over Ons",
    "/contact": "Contact",
    "/media": "Media",
    "/charity": "Goede Doel",
    "/dkl": "DKL",
    "/faq": "FAQ",
};

// ─── Types (Go Backend responses) ───

interface GoDashboard {
    total_views: number;
    unique_sessions: number;
    events_by_type: Record<string, number>;
    device_breakdown: { device_type: string; count: number }[];
}

interface GoPage {
    path: string;
    views: number;
}

interface GoReferrer {
    referrer: string;
    count: number;
}

interface GoTimeseries {
    date: string;
    views: number;
}

// ─── Custom hook: Go Backend data with polling ───

function useGoAnalytics(period: typeof PERIOD_OPTIONS[number]) {
    const [dashboard, setDashboard] = useState<GoDashboard | null>(null);
    const [pages, setPages] = useState<GoPage[]>([]);
    const [referrers, setReferrers] = useState<GoReferrer[]>([]);
    const [timeseries, setTimeseries] = useState<GoTimeseries[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const dateRange = useMemo(() => {
        const to = new Date().toISOString().slice(0, 10);
        const from = new Date(Date.now() - period.days * 86400000).toISOString().slice(0, 10);
        return { from, to };
    }, [period]);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const params = `?from=${dateRange.from}&to=${dateRange.to}`;

            const [dashRes, pagesRes, refRes, tsRes] = await Promise.allSettled([
                apiRequest(`/v1/analytics/dashboard${params}`),
                apiRequest(`/v1/analytics/pages${params}`),
                apiRequest(`/v1/analytics/referrers${params}`),
                apiRequest(`/v1/analytics/timeseries${params}`),
            ]);

            if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
            if (pagesRes.status === 'fulfilled') setPages(pagesRes.value || []);
            if (refRes.status === 'fulfilled') setReferrers(refRes.value || []);
            if (tsRes.status === 'fulfilled') setTimeseries(tsRes.value || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        setLoading(true);
        fetchData();
        const interval = setInterval(fetchData, 30_000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [fetchData]);

    return { dashboard, pages, referrers, timeseries, loading, error, refetch: fetchData };
}

// ─── Main Component ───

export default function AnalyticsDashboard() {
    const [period, setPeriod] = useState<typeof PERIOD_OPTIONS[number]>(PERIOD_OPTIONS[1]);

    // Go Backend data (charts, stats, pages, referrers)
    const { dashboard, pages, referrers, timeseries, loading, error, refetch } = useGoAnalytics(period);

    // Convex data (live feed only)
    const recentEvents = useQuery(api.analytics.getRecentEvents, { limit: 15 });

    const trendData = useMemo(() => {
        if (!timeseries.length) return [];
        return timeseries.map((t) => ({
            date: new Date(t.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
            views: t.views,
        }));
    }, [timeseries]);

    const topPagesData = useMemo(() => {
        return pages.slice(0, 8).map((p) => ({
            ...p,
            label: PAGE_LABELS[p.path] || p.path,
        }));
    }, [pages]);

    const maxPageViews = topPagesData.length > 0
        ? Math.max(...topPagesData.map((p) => p.views))
        : 1;

    const deviceData = useMemo(() => {
        if (!dashboard?.device_breakdown) return [];
        return dashboard.device_breakdown;
    }, [dashboard]);

    const totalDevices = deviceData.reduce((sum, d) => sum + d.count, 0) || 1;

    const conversionRate = useMemo(() => {
        if (!dashboard?.total_views || !dashboard.events_by_type) return "0%";
        const completed = dashboard.events_by_type['registration_completed'] || 0;
        return dashboard.total_views > 0
            ? `${Math.round((completed / dashboard.total_views) * 100)}%`
            : "0%";
    }, [dashboard]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">

            {/* ═══════ Header + Period Selector ═══════ */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">
                        Analytics
                    </h2>
                    <p className="text-xs text-text-muted mt-1">
                        Real-time inzichten — Go Backend + Convex Live Feed
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className="p-2 rounded-xl bg-glass-border/20 text-text-muted hover:text-text-primary hover:bg-glass-border/40 transition-all cursor-pointer"
                        title="Ververs data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <div className="flex bg-glass-border/30 rounded-xl p-1 border border-glass-border">
                        {PERIOD_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setPeriod(opt)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${period.value === opt.value
                                        ? "bg-brand-orange text-white shadow-lg"
                                        : "text-text-muted hover:text-text-primary"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-400">
                    ⚠️ Go backend niet bereikbaar: {error}. Live feed via Convex werkt nog wel.
                </div>
            )}

            {/* ═══════ KPI Hero Cards ═══════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <KPICard
                    icon={<Eye className="w-4 h-4" />}
                    label="Pageviews"
                    value={dashboard?.total_views ?? 0}
                    accent="#3B82F6"
                    loading={loading}
                />
                <KPICard
                    icon={<Users className="w-4 h-4" />}
                    label="Unieke Sessies"
                    value={dashboard?.unique_sessions ?? 0}
                    accent="#14B8A6"
                    loading={loading}
                />
                <KPICard
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="Conversie Ratio"
                    value={conversionRate}
                    accent="#22C55E"
                    loading={loading}
                />
                <KPICard
                    icon={<Activity className="w-4 h-4" />}
                    label="Events Totaal"
                    value={
                        dashboard?.events_by_type
                            ? Object.values(dashboard.events_by_type).reduce((s, c) => s + c, 0)
                            : 0
                    }
                    accent="#F97316"
                    loading={loading}
                />
            </div>

            {/* ═══════ Trend Chart + Event Breakdown ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

                {/* Trend Area Chart — 8 col */}
                <div className="lg:col-span-8 relative overflow-hidden bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-3xl p-6 shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-brand-orange/10 to-transparent blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-text-primary mb-4">Pageviews per Dag</h3>
                        {loading ? (
                            <div className="h-48 bg-glass-border/20 rounded-xl animate-pulse" />
                        ) : trendData.length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-text-muted text-sm">
                                Nog geen data voor deze periode
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={30}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "rgba(15, 23, 42, 0.9)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            color: "#F8FAFC",
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        fill="url(#viewGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Event Breakdown — 4 col */}
                <div className="lg:col-span-4 relative overflow-hidden bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-3xl p-6 shadow-xl">
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full -ml-10 -mb-10 pointer-events-none" />
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-text-primary mb-4">Events per Type</h3>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-6 bg-glass-border/20 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(dashboard?.events_by_type || {})
                                    .sort(([, a], [, b]) => (b as number) - (a as number))
                                    .map(([event, count]) => {
                                        const total = Object.values(dashboard?.events_by_type || {}).reduce((s, c) => s + (c as number), 0) || 1;
                                        const pct = Math.round(((count as number) / total) * 100);
                                        return (
                                            <div key={event} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-medium text-text-secondary">
                                                        {EVENT_LABELS[event] || event}
                                                    </span>
                                                    <span className="text-text-muted font-mono">{count as number}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-glass-border/30 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{ width: `${pct}%`, backgroundColor: EVENT_COLORS[event] || "#6B7280" }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                {!dashboard?.events_by_type || Object.keys(dashboard.events_by_type).length === 0 ? (
                                    <div className="text-center py-6 text-xs text-text-muted">Nog geen data</div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════ Top Pages + Referrers ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                {/* Top Pages (Go Backend) */}
                <GlassCard icon={<Eye className="w-5 h-5 text-blue-400" />} title="Top Pagina's" hoverColor="blue">
                    {loading ? <SkeletonRows count={5} /> : topPagesData.length === 0 ? (
                        <EmptyState text="Nog geen pageview data" />
                    ) : (
                        <div className="space-y-3">
                            {topPagesData.map((page, i) => (
                                <div key={page.path} className="flex items-center gap-3 group/row">
                                    <span className="text-xs font-mono font-medium text-text-muted w-5 text-center opacity-50 group-hover/row:opacity-100">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium text-text-primary">{page.label}</span>
                                            <span className="text-text-muted font-mono">{page.views}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-glass-border/30 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${(page.views / maxPageViews) * 100}%` }}
                                                className={`h-full rounded-full ${i === 0 ? "bg-blue-500" : "bg-blue-400/50"}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>

                {/* Referrers (Go Backend — server-side data) */}
                <GlassCard icon={<Globe className="w-5 h-5 text-emerald-400" />} title="Verkeersbronnen" hoverColor="emerald">
                    {loading ? <SkeletonRows count={5} /> : referrers.length === 0 ? (
                        <EmptyState text="Nog geen referrer data" />
                    ) : (
                        <div className="space-y-3">
                            {referrers.slice(0, 8).map((ref, i) => {
                                const maxRef = referrers[0]?.count || 1;
                                return (
                                    <div key={ref.referrer} className="flex items-center gap-3 group/row">
                                        <span className="text-xs font-mono font-medium text-text-muted w-5 text-center opacity-50 group-hover/row:opacity-100">
                                            {i + 1}
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-text-primary truncate max-w-[180px]">
                                                    {ref.referrer || "Direct"}
                                                </span>
                                                <span className="text-text-muted font-mono">{ref.count}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-glass-border/30 rounded-full overflow-hidden">
                                                <div
                                                    style={{ width: `${(ref.count / maxRef) * 100}%` }}
                                                    className={`h-full rounded-full ${i === 0 ? "bg-emerald-500" : "bg-emerald-400/50"}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* ═══════ Device Breakdown + Live Feed ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

                {/* Device Breakdown (Go — server-side UA parsing) */}
                <div className="lg:col-span-4 relative overflow-hidden bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-3xl p-6 shadow-xl">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full -mr-10 -mb-10 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-5">
                            <Smartphone className="w-5 h-5 text-indigo-400" />
                            <span className="text-sm font-bold text-text-primary">Apparaten</span>
                        </div>
                        {loading ? <SkeletonRows count={3} /> : deviceData.length === 0 ? (
                            <EmptyState text="Nog geen device data" />
                        ) : (
                            <div className="space-y-4">
                                {deviceData.map((d) => {
                                    const pct = Math.round((d.count / totalDevices) * 100);
                                    return (
                                        <div key={d.device_type} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <DeviceIcon type={d.device_type} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-medium text-text-primary capitalize">{d.device_type}</span>
                                                    <span className="text-text-muted font-mono">{pct}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-glass-border/30 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-indigo-500/70 transition-all duration-700"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Event Feed (Convex — real-time subscriptions) */}
                <div className="lg:col-span-8 bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-glass-border bg-glass-surface/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-brand-orange" />
                            <span className="text-sm font-bold text-text-primary">Live Event Feed</span>
                            <span className="text-[10px] text-text-muted ml-1">(Convex real-time)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            <span className="text-[10px] uppercase font-bold text-green-500 tracking-wider">Live</span>
                        </div>
                    </div>
                    <div className="divide-y divide-glass-border/40 max-h-[320px] overflow-auto custom-scrollbar">
                        {!recentEvents ? (
                            <div className="p-8 text-center text-text-muted animate-pulse">Laden...</div>
                        ) : recentEvents.length === 0 ? (
                            <div className="p-8 text-center text-xs text-text-muted">Nog geen events geregistreerd</div>
                        ) : (
                            recentEvents.map((event: { _id: string; event: string; path: string; timestamp: number; sessionId: string; metadata?: any }) => (
                                <div key={event._id} className="p-3 px-5 flex items-center gap-4 hover:bg-glass-surface/50 transition-colors">
                                    <div
                                        className="w-8 h-8 rounded-xl flex items-center justify-center border"
                                        style={{
                                            backgroundColor: `${EVENT_COLORS[event.event] || "#6B7280"}15`,
                                            borderColor: `${EVENT_COLORS[event.event] || "#6B7280"}30`,
                                            color: EVENT_COLORS[event.event] || "#6B7280",
                                        }}
                                    >
                                        <EventIcon event={event.event} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-text-primary">
                                            {EVENT_LABELS[event.event] || event.event}
                                        </div>
                                        <div className="text-[11px] text-text-muted truncate">
                                            {event.path}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-text-muted opacity-60 whitespace-nowrap">
                                        {new Date(event.timestamp).toLocaleTimeString("nl-NL", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Reusable Components ───

function GlassCard({ icon, title, hoverColor, children }: {
    icon: React.ReactNode;
    title: string;
    hoverColor: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`relative overflow-hidden bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-3xl p-6 shadow-xl group hover:shadow-2xl transition-all duration-500 hover:border-${hoverColor}-500/30`}>
            <div className={`absolute top-0 right-0 w-48 h-48 bg-${hoverColor}-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none group-hover:bg-${hoverColor}-500/20 transition-all`} />
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                    {icon}
                    <span className="text-sm font-bold text-text-primary">{title}</span>
                </div>
                {children}
            </div>
        </div>
    );
}

function KPICard({ icon, label, value, accent, loading }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    accent: string;
    loading: boolean;
}) {
    return (
        <div className="relative overflow-hidden bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-2xl p-4 md:p-5 group transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full -mr-6 -mt-6 pointer-events-none transition-all duration-500"
                style={{ backgroundColor: `${accent}10` }}
            />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl border"
                        style={{ backgroundColor: `${accent}15`, borderColor: `${accent}30`, color: accent }}
                    >
                        {icon}
                    </div>
                </div>
                {loading ? (
                    <div className="h-9 w-24 bg-glass-border/20 rounded-lg animate-pulse" />
                ) : (
                    <div className="text-3xl md:text-4xl font-display font-bold text-text-primary tracking-tight">
                        {value}
                    </div>
                )}
                <p className="text-xs text-text-muted mt-1 font-medium">{label}</p>
            </div>
        </div>
    );
}

function SkeletonRows({ count }: { count: number }) {
    return (
        <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="h-6 bg-glass-border/20 rounded animate-pulse" />
            ))}
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return <div className="text-center py-8 text-xs text-text-muted">{text}</div>;
}

function EventIcon({ event }: { event: string }) {
    const size = "w-3.5 h-3.5";
    switch (event) {
        case "page_view": return <Eye className={size} />;
        case "registration_started": return <UserPlus className={size} />;
        case "registration_completed": return <Users className={size} />;
        case "gallery_viewed": return <Eye className={size} />;
        case "video_played": return <PlayCircle className={size} />;
        case "donation_intent": return <TrendingUp className={size} />;
        case "route_changed": return <ArrowRight className={size} />;
        default: return <MousePointerClick className={size} />;
    }
}

function DeviceIcon({ type }: { type: string }) {
    const size = "w-3.5 h-3.5";
    switch (type.toLowerCase()) {
        case "mobile": return <Smartphone className={size} />;
        case "tablet": return <Tablet className={size} />;
        case "desktop": return <Monitor className={size} />;
        default: return <Monitor className={size} />;
    }
}
