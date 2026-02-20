import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { $user, $accessToken } from "../../lib/auth";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
    Loader2, Map, UserCheck, Search, TrendingUp, Mail, ShieldCheck,
    UserCircle, Globe, ArrowRight, Users, Settings,
    Heart, UserPlus, ChevronRight, CalendarDays, Award
} from "lucide-react";
import { useDashboardStats } from "./DashboardStats";
import ParticipantDetailModal from "./ParticipantDetailModal";

// Types
type ParticipantRole = "deelnemer" | "begeleider" | "vrijwilliger";
type ParticipantStatus = "pending" | "paid" | "cancelled";
type RouteDistance = "2.5" | "6" | "10" | "15";

interface Registration {
    _id: string;
    name: string;
    email: string;
    role: ParticipantRole;
    distance?: RouteDistance;
    status: ParticipantStatus;
    userType?: string;
    iceName?: string;
    icePhone?: string;
    createdAt: number;
    edition?: string;
    companionName?: string;
    companionEmail?: string;
}

export default function DashboardTable() {
    const user = useStore($user);
    const [isMounted, setIsMounted] = useState(false);
    const [registrations, setRegistrations] = useState<Registration[] | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "authenticated" | "guest">("all");
    const [editionFilter, setEditionFilter] = useState<string>("2026");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const accessToken = useStore($accessToken);
    const getRegistrations = useAction(api.admin.getRegistrations);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

    // Filter by Edition before stats & list
    const filteredByEdition = registrations?.filter(reg => (reg.edition || "2026") === editionFilter);

    const stats = useDashboardStats(filteredByEdition);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, typeFilter, editionFilter]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (accessToken) {
            getRegistrations({ token: accessToken })
                .then((data: any) => setRegistrations(data))
                .catch(err => console.error("Auth Failed", err));
        }
    }, [accessToken, getRegistrations]);

    const skeletonLayout = (
        <div className="space-y-6 pb-12" aria-hidden="true">
            {/* CLS skeleton matching final layout */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-7 w-48 bg-glass-border/30 rounded-lg animate-pulse" />
                    <div className="h-4 w-32 bg-glass-border/20 rounded animate-pulse" />
                </div>
                <div className="h-9 w-32 bg-glass-border/30 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-glass-bg/40 border border-glass-border rounded-2xl p-5 h-[116px] animate-pulse" />
                <div className="bg-glass-bg/40 border border-glass-border rounded-2xl p-5 h-[116px] animate-pulse" />
                <div className="bg-glass-bg/40 border border-glass-border rounded-2xl p-5 h-[116px] animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-glass-bg/40 border border-glass-border rounded-3xl p-6 h-56 animate-pulse" />
                <div className="bg-glass-bg/40 border border-glass-border rounded-3xl p-6 h-56 animate-pulse" />
                <div className="bg-glass-bg/40 border border-glass-border rounded-3xl p-6 h-56 animate-pulse" />
            </div>
            <div className="bg-glass-bg/40 border border-glass-border rounded-3xl h-[600px] animate-pulse" />
        </div>
    );

    if (!isMounted) return skeletonLayout;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-4 backdrop-blur-md border border-red-500/20 shadow-lg">
                    <UserCheck className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-display font-bold text-text-primary">Toegang Beveiligd</h2>
                    <p className="text-text-muted mt-2 max-w-md mx-auto">Je moet ingelogd zijn als beheerder om toegang te krijgen tot deze gevoelige informatie.</p>
                </div>
                <a href="/login"><Button className="mt-6 bg-brand-orange hover:bg-orange-600 text-white rounded-xl px-8 py-6 text-lg shadow-xl shadow-brand-orange/20 transition-all hover:scale-105">Inloggen</Button></a>
            </div>
        )
    }

    if (registrations === undefined) {
        return skeletonLayout;
    }

    // Filter Logic for List View
    const filteredRegistrations = (filteredByEdition || []).filter(reg => {
        const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.email.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesType = true;
        if (typeFilter === "authenticated") matchesType = reg.userType === "authenticated";
        if (typeFilter === "guest") matchesType = reg.userType !== "authenticated";

        return matchesSearch && matchesType;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
    const paginatedRegistrations = filteredRegistrations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate days until event (May 16, 2026)
    const eventDate = new Date('2026-05-16');
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Role labels
    const roleLabels: Record<string, string> = {
        deelnemer: "Deelnemers",
        begeleider: "Begeleiders",
        vrijwilliger: "Vrijwilligers"
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">

            {/* ═══════ 0. Edition Toolbar ═══════ */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-text-primary">
                        Overzicht {editionFilter}
                    </h2>
                    {editionFilter === "2026" && daysUntilEvent > 0 && (
                        <div className="flex items-center gap-2 mt-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-brand-orange" />
                            <span className="text-xs text-text-muted">
                                Nog <strong className="text-text-primary">{daysUntilEvent}</strong> dagen tot het evenement
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex bg-glass-border/30 rounded-xl p-1 border border-glass-border">
                    <button
                        onClick={() => setEditionFilter("2026")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${editionFilter === "2026" ? "bg-brand-orange text-white shadow-lg" : "text-text-muted hover:text-text-primary"}`}
                    >
                        2026
                    </button>
                    <button
                        onClick={() => setEditionFilter("2025")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${editionFilter === "2025" ? "bg-brand-orange text-white shadow-lg" : "text-text-muted hover:text-text-primary"}`}
                    >
                        2025
                    </button>
                </div>
            </div>

            {/* ═══════ 1. Hero Stats Row ═══════ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {/* Totaal Deelnemers */}
                <div className="relative overflow-hidden bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-2xl p-4 md:p-5 group hover:border-brand-orange/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/8 blur-2xl rounded-full -mr-6 -mt-6 pointer-events-none group-hover:bg-brand-orange/15 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange border border-brand-orange/20">
                                <Users className="w-4 h-4" />
                            </div>
                            {stats.newToday > 0 && (
                                <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                    +{stats.newToday} vandaag
                                </span>
                            )}
                        </div>
                        <div className="text-3xl md:text-4xl font-display font-bold text-text-primary">
                            {stats.totalParticipants}
                        </div>
                        <p className="text-xs text-text-muted mt-1 font-medium">Totaal Deelnemers</p>
                    </div>
                </div>

                {/* Nieuw Vandaag */}
                <div className="relative overflow-hidden bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-2xl p-4 md:p-5 group hover:border-green-500/30 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/8 blur-2xl rounded-full -ml-6 -mb-6 pointer-events-none group-hover:bg-green-500/15 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-green-500/10 rounded-xl text-green-400 border border-green-500/20">
                                <UserPlus className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-3xl md:text-4xl font-display font-bold text-text-primary">
                            {stats.newToday}
                        </div>
                        <p className="text-xs text-text-muted mt-1 font-medium">Nieuw Vandaag</p>
                    </div>
                </div>

                {/* Rolverdeling Compact */}
                <div className="relative overflow-hidden bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-2xl p-4 md:p-5 group hover:border-sky-500/30 transition-all duration-300">
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-sky-500/8 blur-2xl rounded-full -mr-6 -mb-6 pointer-events-none group-hover:bg-sky-500/15 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
                                <Award className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            {Object.entries(stats.participantsByRole).map(([role, count]) => (
                                <div key={role} className="flex items-center justify-between">
                                    <span className="text-[11px] text-text-muted capitalize">{roleLabels[role] || role}</span>
                                    <span className="text-sm font-bold text-text-primary font-mono">{count}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-text-muted mt-2 font-medium">Rolverdeling</p>
                    </div>
                </div>
            </div>

            {/* ═══════ 2. Quick Actions ═══════ */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                {[
                    { href: "/admin/deelnemers", label: "Inschrijvingen", icon: Users, color: "brand-orange" },
                    { href: "/admin/donaties", label: "Donaties", icon: Heart, color: "pink-500" },
                    { href: "/admin/email", label: "E-mail", icon: Mail, color: "blue-500" },
                    { href: "/admin/settings", label: "Instellingen", icon: Settings, color: "gray-400" },
                ].map((action) => (
                    <a
                        key={action.href}
                        href={action.href}
                        className="flex items-center gap-2 px-4 py-2.5 bg-glass-bg/30 border border-glass-border rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:border-glass-border/80 hover:bg-glass-bg/60 transition-all duration-200 whitespace-nowrap cursor-pointer group"
                    >
                        <action.icon className={`w-3.5 h-3.5 text-${action.color} group-hover:scale-110 transition-transform`} />
                        {action.label}
                        <ChevronRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                ))}
            </div>

            {/* ═══════ 3. KPI Bento Grid ═══════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">

                {/* A. Audience Reach (Unique Emails) - 4 cols */}
                <div className="lg:col-span-4 relative overflow-hidden bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-3xl p-6 group shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-brand-orange/30">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-brand-orange/10 to-transparent blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-brand-orange/20 transition-all duration-700"></div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-brand-orange/10 rounded-2xl text-brand-orange border border-brand-orange/20">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold uppercase tracking-wider">
                                <TrendingUp className="w-3 h-3" />
                                <span>Groei</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-5xl font-display font-bold text-text-primary">
                                {stats.uniqueReach}
                            </h3>
                            <p className="text-sm font-medium text-text-muted mt-1">Unieke E-mailadressen ({editionFilter})</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-glass-border/50">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-muted">Conversie ratio</span>
                                <span className="text-text-primary font-mono font-medium">
                                    {Math.round((stats.uniqueReach / (stats.totalParticipants || 1)) * 100)}%
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-glass-border/30 rounded-full mt-2 overflow-hidden">
                                <div style={{ width: `${(stats.uniqueReach / (stats.totalParticipants || 1)) * 100}%` }} className="h-full bg-brand-orange rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* B. Account Health (Auth vs Guest) - 4 cols */}
                <div className="lg:col-span-4 relative overflow-hidden bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-3xl p-6 group shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-teal-500/30">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-tr from-teal-500/10 to-transparent blur-3xl rounded-full -ml-16 -mb-16 pointer-events-none group-hover:bg-teal-500/20 transition-all duration-700"></div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-400 border border-teal-500/20">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Gebruikers types</span>
                        </div>

                        <div className="space-y-4">
                            {/* Authenticated */}
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-glass-surface/50 border border-glass-border/30 hover:bg-glass-surface transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-text-primary">Geregistreerd</div>
                                        <div className="text-[10px] text-text-muted">Met account (veilig)</div>
                                    </div>
                                </div>
                                <span className="text-xl font-display font-bold text-text-primary">{stats.participantsByUserType.authenticated}</span>
                            </div>

                            {/* Guest */}
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-glass-surface/50 border border-glass-border/30 hover:bg-glass-surface transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-glass-border flex items-center justify-center text-text-muted">
                                        <UserCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-text-primary">Gast</div>
                                        <div className="text-[10px] text-text-muted">Eenmalige deelname</div>
                                    </div>
                                </div>
                                <span className="text-xl font-display font-bold text-text-primary">{stats.participantsByUserType.guest}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* C. Email Analytics (Domains) - 4 cols */}
                <div className="lg:col-span-4 relative overflow-hidden bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-3xl p-6 group shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-blue-500/30">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>

                    <div className="flex items-center gap-2 mb-6">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-bold text-text-primary">Top Email Domeinen</span>
                    </div>

                    <div className="space-y-3">
                        {stats.topDomains.map((item, i) => (
                            <div key={item.domain} className="flex items-center gap-3 group/row">
                                <span className="text-xs font-mono font-medium text-text-muted w-6 text-center text-opacity-50 group-hover/row:text-opacity-100">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-text-primary">{item.domain}</span>
                                        <span className="text-text-muted">{item.count}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-glass-border/30 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${(item.count / (stats.uniqueReach || 1)) * 100}%` }}
                                            className={`h-full rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-blue-400/50'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {stats.topDomains.length === 0 && (
                            <div className="text-center py-6 text-xs text-text-muted">Nog geen data beschikbaar</div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════ 4. Main Dashboard Content ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                {/* Left Column: Recent Registrations Feed + Distance */}
                <div className="lg:col-span-1 space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-display font-semibold text-text-primary px-1">Live Activiteit</h3>
                        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] uppercase font-bold text-green-500 tracking-wider">Live</span>
                        </div>
                    </div>

                    <div className="bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-3xl p-1 overflow-hidden shadow-lg">
                        <div className="divide-y divide-glass-border/40">
                            {stats.recentRegistrations.map((reg) => (
                                <div key={reg._id} className="p-4 hover:bg-glass-surface/50 transition-colors flex items-center gap-4 group cursor-default">
                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-glass-border to-transparent border border-glass-border flex items-center justify-center text-text-primary font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
                                        {reg.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-bold text-text-primary truncate">{reg.name}</p>
                                            <span className="text-[10px] font-mono text-text-muted opacity-50">{new Date(reg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                                            <span className={`px-1.5 py-0.5 rounded-[4px] ${reg.userType === 'authenticated' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-glass-border/30 text-text-muted'}`}>
                                                {reg.userType === 'authenticated' ? 'Account' : 'Gast'}
                                            </span>
                                            {reg.distance && (
                                                <span>• {reg.distance}km</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {stats.recentRegistrations.length === 0 && (
                                <div className="py-8 text-center text-sm text-text-muted">Nog geen recente activiteit</div>
                            )}
                        </div>
                        <div className="p-2 border-t border-glass-border/40 bg-glass-surface/50">
                            <a href="/admin/deelnemers" className="w-full py-2 text-xs font-semibold text-text-secondary hover:text-brand-orange transition-colors flex items-center justify-center gap-2 rounded-xl hover:bg-glass-surface/50 cursor-pointer">
                                Alle inschrijvingen bekijken <ArrowRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    {/* Distance Distribution Mini-Card */}
                    <div className="bg-glass-bg/40 backdrop-blur-xl border border-glass-border rounded-3xl p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <Map className="w-4 h-4 text-sky-400" />
                            <span className="text-sm font-bold text-text-primary">Afstand Populariteit</span>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(stats.participantsByDistance).map(([dist, count]) => {
                                const percentage = Math.round((count / (stats.totalParticipants || 1)) * 100);
                                const isLeading = count === Math.max(...Object.values(stats.participantsByDistance));
                                return (
                                    <div key={dist} className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium text-text-secondary">
                                                {dist} km
                                                {isLeading && count > 0 && (
                                                    <span className="ml-1.5 text-[10px] text-brand-orange font-bold uppercase">populair</span>
                                                )}
                                            </span>
                                            <span className="text-text-muted font-mono">{count} <span className="opacity-60">({percentage}%)</span></span>
                                        </div>
                                        <div className="h-2 w-full bg-glass-border/30 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${percentage}%` }}
                                                className={`h-full rounded-full transition-all duration-1000 ${isLeading && count > 0 ? 'bg-linear-to-r from-brand-orange to-red-500' : 'bg-sky-400/60'}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Full Table */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-display font-semibold text-text-primary px-1">Deelnemerslijst</h3>

                        <div className="flex items-center bg-glass-bg/50 border border-glass-border p-1 rounded-full w-full sm:w-auto shadow-sm backdrop-blur-md">
                            <button
                                onClick={() => setTypeFilter("all")}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${typeFilter === "all" ? "bg-glass-surface text-text-primary shadow-md" : "text-text-muted hover:text-text-primary"}`}
                            >
                                Alles
                            </button>
                            <button
                                onClick={() => setTypeFilter("authenticated")}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${typeFilter === "authenticated" ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" : "text-text-muted hover:text-text-primary"}`}
                            >
                                Accounts
                            </button>
                            <button
                                onClick={() => setTypeFilter("guest")}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${typeFilter === "guest" ? "bg-gray-500 text-white shadow-md" : "text-text-muted hover:text-text-primary"}`}
                            >
                                Gasten
                            </button>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-glass-border bg-glass-bg/40 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col h-[600px] relative">
                        {/* decorative background blur */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-brand-orange/5 blur-3xl pointer-events-none"></div>

                        {/* Toolbar */}
                        <div className="p-4 border-b border-glass-border bg-glass-surface/50 flex gap-4 z-10 relative">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Zoeken op naam of e-mail..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-9 pr-3 py-2.5 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 transition-all font-medium backdrop-blur-sm"
                                />
                            </div>
                            <div className="hidden sm:flex items-center text-xs text-text-muted bg-glass-bg/30 px-3 rounded-xl border border-glass-border">
                                {filteredRegistrations.length} resultaten
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-auto flex-1 custom-scrollbar z-10 relative">
                            <table className="w-full text-left text-sm">
                                <thead className="sticky top-0 bg-glass-bg/95 backdrop-blur-md z-10 shadow-sm">
                                    <tr className="border-b border-glass-border">
                                        <th className="py-3 px-5 font-bold text-text-primary text-[11px] uppercase tracking-wider">Deelnemer</th>
                                        <th className="py-3 px-5 font-bold text-text-primary text-[11px] uppercase tracking-wider hidden sm:table-cell">Rol & Info</th>
                                        <th className="py-3 px-5 font-bold text-text-primary text-[11px] uppercase tracking-wider">Type</th>
                                        <th className="py-3 px-5 font-bold text-text-primary text-[11px] uppercase tracking-wider text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border/40 text-text-secondary">
                                    {paginatedRegistrations.map((reg) => (
                                        <tr key={reg._id} className="group hover:bg-glass-surface/50 transition-colors">
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border shadow-sm transition-transform group-hover:scale-105 border-glass-border bg-linear-to-br from-white/10 to-transparent text-text-primary">
                                                        {reg.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-text-primary text-sm tracking-tight">{reg.name}</div>
                                                        <div className="text-[11px] text-text-muted mt-0.5 opacity-80">{reg.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 hidden sm:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded
                                                            ${reg.role === 'vrijwilliger' ? 'bg-blue-500/10 text-blue-500' :
                                                                reg.role === 'begeleider' ? 'bg-amber-500/10 text-amber-500' :
                                                                    'bg-glass-border/40 text-text-primary'}
                                                        `}>
                                                            {reg.role}
                                                        </span>
                                                    </div>
                                                    {reg.distance && (
                                                        <span className="text-[11px] font-mono text-text-muted">
                                                            → {reg.distance}km loper
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-5">
                                                <AccountTypeBadge type={reg.userType} />
                                            </td>
                                            <td className="py-3 px-5 text-right">
                                                <button
                                                    onClick={() => setSelectedRegistration(reg)}
                                                    className="text-xs text-text-muted hover:text-brand-orange font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-orange/5 border border-transparent hover:border-brand-orange/20 cursor-pointer"
                                                >
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredRegistrations.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center text-text-muted">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <Search className="w-8 h-8 opacity-20" />
                                                    <p>Geen deelnemers gevonden die aan de criteria voldoen.</p>
                                                    <button onClick={() => { setSearchTerm(""); setTypeFilter("all") }} className="text-xs text-brand-orange hover:underline cursor-pointer">Filters wissen</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Pagination */}
                        <div className="p-3 border-t border-glass-border bg-glass-surface/50 flex items-center justify-between text-xs text-text-muted backdrop-blur-md z-10">
                            <span className="pl-2">
                                Pagina <strong>{currentPage}</strong> van {Math.max(1, totalPages)}
                                <span className="hidden sm:inline ml-2 opacity-60">• {filteredRegistrations.length} deelnemers</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg border border-glass-border hover:bg-glass-surface disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Vorige
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-3 py-1.5 rounded-lg border border-glass-border hover:bg-glass-surface disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Volgende
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Detail Modal */}
            {selectedRegistration && (
                <ParticipantDetailModal
                    registration={selectedRegistration}
                    onClose={() => setSelectedRegistration(null)}
                    onUpdate={() => {
                        setSelectedRegistration(null);
                        if (accessToken) {
                            getRegistrations({ token: accessToken })
                                .then((data: any) => setRegistrations(data))
                                .catch(err => console.error("Refresh failed", err));
                        }
                    }}
                />
            )}
        </div>
    );
}

// Helpers
function AccountTypeBadge({ type }: { type?: string }) {
    if (type === 'authenticated') {
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shadow-[0_0_10px_rgba(255,107,0,0.1)]">
            <UserCheck className="w-3 h-3" /> Account
        </span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-500/10 text-gray-400 border border-gray-500/20">
        <UserCircle className="w-3 h-3" /> Gast
    </span>;
}
