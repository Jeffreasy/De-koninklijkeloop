import { Users, Filter, Mail, Phone, MapPin, Search, ChevronLeft, ChevronRight, FileSpreadsheet, ChevronsUpDown, ShieldCheck, User, CheckCircle2, SendHorizonal, Loader2, HeartHandshake, Accessibility, Bus, Building2, Heart, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { $accessToken, $user } from "../../lib/auth";
import { useAction } from "convex/react";
import * as XLSX from "xlsx";
import ParticipantDetailModal from "./ParticipantDetailModal";

type UserType = "all" | "authenticated" | "guest";
type Role = "all" | "deelnemer" | "begeleider" | "vrijwilliger";
type Status = "all" | "pending" | "paid" | "cancelled";
type SupportFilter = "all" | "ja" | "nee" | "anders";
type DistanceFilter = "all" | "2.5" | "6" | "10" | "15";
type ParticipantTypeFilter = "all" | "doelgroep" | "verwant" | "anders";
type SortField = "name" | "createdAt" | "distance" | "status";
type SortDirection = "asc" | "desc";

type ParticipantRole = "deelnemer" | "begeleider" | "vrijwilliger";
type ParticipantStatus = "pending" | "paid" | "cancelled";
type RouteDistance = "2.5" | "6" | "10" | "15";

interface GroupMember {
    name: string;
    distance?: string;
    wheelchairUser?: boolean;
    shuttleBus?: string;
    supportNeeded?: string;
    livesInFacility?: boolean;
    participantType?: string;
}

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
    supportNeeded?: "ja" | "nee" | "anders";
    supportDescription?: string;
    city?: string;
    wheelchairUser?: boolean;
    shuttleBus?: "pendelbus" | "eigen-vervoer";
    livesInFacility?: boolean;
    participantType?: "doelgroep" | "verwant" | "anders";
    createdAt: number;
    notes?: string;
    edition?: string;
    companionName?: string;
    companionEmail?: string;
    /** Embedded groepsleden (begeleider groepsregistratie) */
    groupMembers?: GroupMember[];
    // Confirmation email tracking
    confirmationSentAt?: number;
    confirmationSentBy?: string;
}

export default function ParticipantsTable() {
    const accessToken = useStore($accessToken);
    const user = useStore($user);
    const getRegistrations = useAction(api.admin.getRegistrations);
    const markConfirmationSent = useAction(api.admin.markConfirmationSent);
    const [registrations, setRegistrations] = useState<Registration[] | undefined>(undefined);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [sendingConfirmation, setSendingConfirmation] = useState<string | null>(null); // reg._id being sent
    const [confirmationToast, setConfirmationToast] = useState<{ id: string; type: 'success' | 'error' } | null>(null);

    // Fetch data using Secure Action
    useEffect(() => {
        fetchRegistrations();
    }, [accessToken]);

    const fetchRegistrations = () => {
        if (accessToken) {
            getRegistrations({ token: accessToken })
                .then((data: any) => setRegistrations(data))
                .catch(err => console.error("Admin Auth Failed", err));
        }
    };

    // Send confirmation email and mark in Convex
    const handleSendConfirmation = useCallback(async (reg: Registration, e: React.MouseEvent) => {
        e.stopPropagation(); // Don't open detail modal
        if (!accessToken || sendingConfirmation) return;

        setSendingConfirmation(reg._id);
        try {
            const res = await fetch('/api/send-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: reg.name,
                    email: reg.email,
                    role: reg.role,
                    distance: reg.distance,
                    shuttleBus: reg.shuttleBus,
                    registrationId: reg._id,
                    userType: reg.userType,
                    // Include group members so they appear in the confirmation email
                    groupMembers: reg.groupMembers,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Verzenden mislukt (${res.status})`);
            }

            const { sentAt } = await res.json();

            // Persist tracking in Convex
            await markConfirmationSent({
                token: accessToken,
                id: reg._id as any,
                sentAt,
                sentBy: user?.email || 'admin',
            });

            // Optimistic UI update
            setRegistrations(prev => prev?.map(r =>
                r._id === reg._id ? { ...r, confirmationSentAt: sentAt, confirmationSentBy: user?.email || 'admin' } : r
            ));
            setConfirmationToast({ id: reg._id, type: 'success' });
            setTimeout(() => setConfirmationToast(null), 3000);
        } catch (err) {
            if (import.meta.env.DEV) console.error('[Confirmation] Error:', err);
            setConfirmationToast({ id: reg._id, type: 'error' });
            setTimeout(() => setConfirmationToast(null), 4000);
        } finally {
            setSendingConfirmation(null);
        }
    }, [accessToken, user, sendingConfirmation, markConfirmationSent]);

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [userTypeFilter, setUserTypeFilter] = useState<UserType>("all");
    const [roleFilter, setRoleFilter] = useState<Role>("all");
    const [statusFilter, setStatusFilter] = useState<Status>("all");
    const [supportFilter, setSupportFilter] = useState<SupportFilter>("all");
    const [editionFilter, setEditionFilter] = useState<string>("2026");
    const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>("all");
    const [wheelchairFilter, setWheelchairFilter] = useState(false);
    const [shuttleBusFilter, setShuttleBusFilter] = useState(false);
    const [facilityFilter, setFacilityFilter] = useState(false);
    const [participantTypeFilter, setParticipantTypeFilter] = useState<ParticipantTypeFilter>("all");

    // UI States
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Sort State
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (userTypeFilter !== "all") count++;
        if (roleFilter !== "all") count++;
        if (statusFilter !== "all") count++;
        if (supportFilter !== "all") count++;
        if (distanceFilter !== "all") count++;
        if (wheelchairFilter) count++;
        if (shuttleBusFilter) count++;
        if (facilityFilter) count++;
        if (participantTypeFilter !== "all") count++;
        return count;
    }, [userTypeFilter, roleFilter, statusFilter, supportFilter, distanceFilter, wheelchairFilter, shuttleBusFilter, facilityFilter, participantTypeFilter]);

    // Derived: Filtered & Sorted Registrations
    const processedRegistrations = useMemo(() => {
        if (!registrations) return [];

        let result = registrations.filter((reg) => {
            // Text Search (incl. city and group members)
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = reg.name.toLowerCase().includes(query);
                const matchesEmail = reg.email.toLowerCase().includes(query);
                const matchesID = reg._id.toLowerCase().includes(query);
                const matchesCity = reg.city?.toLowerCase().includes(query);
                const matchesGroupMember = reg.groupMembers?.some(m => m.name.toLowerCase().includes(query));
                if (!matchesName && !matchesEmail && !matchesID && !matchesCity && !matchesGroupMember) return false;
            }

            // Edition Filter (Treat undefined as "2026")
            const itemEdition = reg.edition || "2026";
            if (itemEdition !== editionFilter) return false;

            // User Type Filter
            if (userTypeFilter === "authenticated" && reg.userType !== "authenticated") return false;
            if (userTypeFilter === "guest" && (reg.userType !== "guest" && reg.userType !== undefined)) return false;

            // Role Filter
            if (roleFilter !== "all" && reg.role !== roleFilter) return false;

            // Status Filter
            if (statusFilter !== "all" && reg.status !== statusFilter) return false;

            // Support Filter
            if (supportFilter !== "all" && (reg.supportNeeded || "nee") !== supportFilter) return false;

            // Distance Filter
            if (distanceFilter !== "all" && reg.distance !== distanceFilter) return false;

            // Profile Filters
            if (wheelchairFilter && !reg.wheelchairUser) return false;
            if (shuttleBusFilter && reg.shuttleBus !== "pendelbus") return false;
            if (facilityFilter && !reg.livesInFacility) return false;
            if (participantTypeFilter !== "all" && reg.participantType !== participantTypeFilter) return false;

            return true;
        });

        // Sorting
        result.sort((a, b) => {
            let valA, valB;

            switch (sortField) {
                case "name":
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                    break;
                case "distance":
                    valA = parseFloat(a.distance || "0");
                    valB = parseFloat(b.distance || "0");
                    break;
                case "status":
                    valA = a.status;
                    valB = b.status;
                    break;
                case "createdAt":
                default:
                    valA = a.createdAt;
                    valB = b.createdAt;
                    break;
            }

            if (valA < valB) return sortDirection === "asc" ? -1 : 1;
            if (valA > valB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [registrations, searchQuery, userTypeFilter, roleFilter, statusFilter, supportFilter, sortField, sortDirection, editionFilter, distanceFilter, wheelchairFilter, shuttleBusFilter, facilityFilter, participantTypeFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(processedRegistrations.length / itemsPerPage);
    const paginatedRegistrations = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return processedRegistrations.slice(start, start + itemsPerPage);
    }, [processedRegistrations, currentPage, itemsPerPage]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, userTypeFilter, roleFilter, statusFilter, supportFilter, editionFilter, distanceFilter, wheelchairFilter, shuttleBusFilter, facilityFilter, participantTypeFilter]);

    // Clear all filters
    const clearAllFilters = () => {
        setSearchQuery("");
        setUserTypeFilter("all");
        setRoleFilter("all");
        setStatusFilter("all");
        setSupportFilter("all");
        setDistanceFilter("all");
        setWheelchairFilter(false);
        setShuttleBusFilter(false);
        setFacilityFilter(false);
        setParticipantTypeFilter("all");
    };


    // Handlers
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleExportExcel = () => {
        if (!processedRegistrations.length) return;

        const statusLabel = (s: string) =>
            s === "paid" ? "Geaccepteerd" : s === "pending" ? "In behandeling" : "Geannuleerd";
        const roleLabel = (r: string) =>
            r === "deelnemer" ? "Deelnemer" : r === "begeleider" ? "Begeleider" : "Vrijwilliger";
        const typeLabel = (t?: string) =>
            t === "authenticated" ? "Account" : "Gast";
        const formatDate = (ts: number) => {
            const d = new Date(ts);
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            const hh = String(d.getHours()).padStart(2, "0");
            const min = String(d.getMinutes()).padStart(2, "0");
            return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
        };

        const supportLabel = (s?: string) =>
            s === "ja" ? "Ja" : s === "anders" ? "Anders" : "Nee";
        const shuttleLabel = (s?: string) =>
            s === "pendelbus" ? "Ophaalbus (Kerk → Start)" : "Eigen vervoer";
        const participantLabel = (s?: string) =>
            s === "doelgroep" ? "Doelgroep" : s === "verwant" ? "Verwant" : "Anders";

        const headers = ["Naam", "Email", "Rol", "Afstand", "Status", "Ondersteuning", "Toelichting", "Plaatsnaam", "Rolstoel", "Vervoer", "Instelling", "Doelgroep", "Type", "Aangemaakt", "Noodcontact Naam", "Noodcontact Telefoon", "Gekoppelde Deelnemer (Naam)", "Gekoppelde Deelnemer (Email)", "Groepsleden"];

        const rows: any[][] = [];
        for (const r of processedRegistrations) {
            rows.push([
                r.name,
                r.email,
                roleLabel(r.role),
                r.distance ? `${r.distance} km` : "",
                statusLabel(r.status),
                supportLabel(r.supportNeeded),
                r.supportDescription || "",
                r.city || "",
                r.wheelchairUser ? "Ja" : "Nee",
                shuttleLabel(r.shuttleBus),
                r.livesInFacility ? "Ja" : "Nee",
                participantLabel(r.participantType),
                typeLabel(r.userType),
                formatDate(r.createdAt),
                r.iceName || "",
                r.icePhone || "",
                r.companionName || "",
                r.companionEmail || "",
                r.groupMembers?.length ? `${r.groupMembers.length} personen` : "",
            ]);
            // Extra rijen per groepslid
            if (r.groupMembers && r.groupMembers.length > 0) {
                for (const m of r.groupMembers) {
                    rows.push([
                        `  ↳ ${m.name}`,
                        r.email,
                        "Groepslid (begeleider)",
                        m.distance ? `${m.distance} km` : "",
                        statusLabel(r.status),
                        "",
                        "",
                        "",
                        m.wheelchairUser ? "Ja" : "Nee",
                        shuttleLabel(m.shuttleBus),
                        m.livesInFacility ? "Ja" : "Nee",
                        participantLabel(m.participantType),
                        typeLabel(r.userType),
                        formatDate(r.createdAt),
                        "",
                        "",
                        r.name,
                        "",
                        "",
                    ]);
                }
            }
        }

        // Summary row
        const totalDeelnemers = processedRegistrations.filter(r => r.role === "deelnemer").length;
        const totalBegeleiders = processedRegistrations.filter(r => r.role === "begeleider").length;
        const totalVrijwilligers = processedRegistrations.filter(r => r.role === "vrijwilliger").length;

        rows.push([]); // empty spacer row
        rows.push([`Totaal: ${processedRegistrations.length}`, "", `D: ${totalDeelnemers} | B: ${totalBegeleiders} | V: ${totalVrijwilligers}`, "", "", "", "", "", ""]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        // Column widths (auto-fit based on content)
        const colWidths = headers.map((h, i) => {
            const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] || "").length));
            return { wch: Math.min(maxLen + 4, 40) };
        });
        ws["!cols"] = colWidths;

        // Autofilter on header row
        ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }) };

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Deelnemers");

        const today = new Date().toISOString().split("T")[0];
        XLSX.writeFile(wb, `registraties_export_${today}.xlsx`);
    };

    // History Map (Loyalty)
    const historyMap = useMemo(() => {
        if (!registrations) return new Map<string, string[]>();
        const map = new Map<string, string[]>();
        registrations.forEach(r => {
            const email = r.email.toLowerCase();
            const editions = map.get(email) || [];
            const edition = r.edition || "2026";
            if (!editions.includes(edition)) {
                editions.push(edition);
            }
            map.set(email, editions);
        });
        return map;
    }, [registrations]);

    // Helper to get loyalty info
    const getLoyaltyInfo = (email: string) => {
        const editions = historyMap.get(email.toLowerCase()) || [];
        const count = editions.length;
        return { count, editions };
    };

    // Stats Computation (Based on Edition Filter, ignoring other filters for dashboard feel)
    const stats = useMemo(() => {
        if (!registrations) return { total: 0, deelnemers: 0, begeleiders: 0, vrijwilligers: 0, authenticated: 0, guests: 0, wheelchair: 0, shuttleBus: 0, facility: 0 };

        // Use filtered set based on edition
        const editionRegistrations = registrations.filter(r => (r.edition || "2026") === editionFilter);

        return editionRegistrations.reduce((acc, r) => {
            // Werkelijke deelnemer telling: deelnemer=+1, begeleider=+groepsleden, vrijw=+0
            if (r.role === "deelnemer") {
                acc.total++;
                acc.deelnemers++;
            } else if (r.role === "begeleider") {
                const memberCount = r.groupMembers?.length ?? 0;
                acc.total += memberCount;       // begeleider zelf telt niet mee als deelnemer
                acc.deelnemers += memberCount;  // groepsleden zijn de echte deelnemers
                acc.begeleiders++;
            } else if (r.role === "vrijwilliger") {
                acc.vrijwilligers++;
                // vrijwilliger telt niet mee in totaal deelnemers
            }
            if (r.userType === "authenticated") acc.authenticated++;
            else if (r.userType === "guest") acc.guests++;
            if (r.wheelchairUser) acc.wheelchair++;
            if (r.shuttleBus === "pendelbus") acc.shuttleBus++;
            if (r.livesInFacility) acc.facility++;
            return acc;
        }, { total: 0, deelnemers: 0, begeleiders: 0, vrijwilligers: 0, authenticated: 0, guests: 0, wheelchair: 0, shuttleBus: 0, facility: 0, groupMembers: 0 });
    }, [registrations, editionFilter]);



    if (!registrations) {
        return (
            <div className="space-y-8 animate-fade-in" aria-hidden="true">
                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-3">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="glass-card p-3 border border-glass-border/50 bg-glass-surface/50 h-[82px] animate-pulse" />
                    ))}
                </div>

                {/* Main Action Bar Skeleton */}
                <div className="glass-card border border-glass-border shadow-2xl bg-glass-bg backdrop-blur-xl rounded-2xl overflow-hidden animate-pulse">
                    <div className="p-4 md:p-5">
                        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                            <div className="h-11 w-full flex-1 bg-glass-surface/50 border border-glass-border rounded-xl" />
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <div className="h-[34px] w-[114px] bg-glass-surface border border-glass-border/50 rounded-xl" />
                                <div className="h-[34px] w-[81px] bg-glass-surface border border-glass-border rounded-xl" />
                                <div className="h-[34px] w-[81px] bg-glass-surface border border-brand-orange/20 rounded-xl ml-auto md:ml-0" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Area Skeleton */}
                <div className="glass-card shadow-2xl shadow-black/5 overflow-hidden border border-glass-border rounded-2xl animate-pulse">
                    <div className="h-[500px] w-full bg-glass-bg/60" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stats Cards - Clickable Quick Filters */}
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-3">
                {[
                    { label: "Totaal", value: stats.total, color: "text-text-primary", bg: "bg-glass-surface/50", border: "border-glass-border", activeBorder: "border-glass-border", isActive: false, onClick: () => { } },
                    { label: "Deelnemers", value: stats.deelnemers, color: "text-brand-orange", bg: "bg-brand-orange/5", border: "border-brand-orange/20", activeBorder: "ring-2 ring-brand-orange/50", isActive: roleFilter === "deelnemer", onClick: () => setRoleFilter(roleFilter === "deelnemer" ? "all" : "deelnemer") },
                    { label: "Begeleiders", value: stats.begeleiders, color: "text-blue-600", bg: "bg-blue-500/5", border: "border-blue-500/20", activeBorder: "ring-2 ring-blue-500/50", isActive: roleFilter === "begeleider", onClick: () => setRoleFilter(roleFilter === "begeleider" ? "all" : "begeleider") },
                    { label: "Vrijwilligers", value: stats.vrijwilligers, color: "text-green-600", bg: "bg-green-500/5", border: "border-green-500/20", activeBorder: "ring-2 ring-green-500/50", isActive: roleFilter === "vrijwilliger", onClick: () => setRoleFilter(roleFilter === "vrijwilliger" ? "all" : "vrijwilliger") },
                    { label: "Accounts", value: stats.authenticated, color: "text-emerald-600", bg: "bg-emerald-500/5", border: "border-emerald-500/20", activeBorder: "ring-2 ring-emerald-500/50", icon: ShieldCheck, isActive: userTypeFilter === "authenticated", onClick: () => setUserTypeFilter(userTypeFilter === "authenticated" ? "all" : "authenticated") },
                    { label: "Gasten", value: stats.guests, color: "text-pink-600", bg: "bg-pink-500/5", border: "border-pink-500/20", activeBorder: "ring-2 ring-pink-500/50", icon: User, isActive: userTypeFilter === "guest", onClick: () => setUserTypeFilter(userTypeFilter === "guest" ? "all" : "guest") },
                    { label: "Rolstoel", value: stats.wheelchair, color: "text-indigo-600", bg: "bg-indigo-500/5", border: "border-indigo-500/20", activeBorder: "ring-2 ring-indigo-500/50", icon: Accessibility, isActive: wheelchairFilter, onClick: () => setWheelchairFilter(!wheelchairFilter) },
                    { label: "Ophaalbus", value: stats.shuttleBus, color: "text-cyan-600", bg: "bg-cyan-500/5", border: "border-cyan-500/20", activeBorder: "ring-2 ring-cyan-500/50", icon: Bus, isActive: shuttleBusFilter, onClick: () => setShuttleBusFilter(!shuttleBusFilter) },
                    { label: "Instelling", value: stats.facility, color: "text-amber-600", bg: "bg-amber-500/5", border: "border-amber-500/20", activeBorder: "ring-2 ring-amber-500/50", icon: Building2, isActive: facilityFilter, onClick: () => setFacilityFilter(!facilityFilter) },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={stat.onClick}
                        className={`glass-card p-3 border ${stat.border} ${stat.bg} relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer select-none ${stat.isActive ? stat.activeBorder : ""}`}
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            {stat.icon ? <stat.icon className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                        </div>
                        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-0.5 font-medium z-10 relative">{stat.label}</div>
                        <div className={`text-xl font-bold font-display ${stat.color} z-10 relative`}>{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Action Bar */}
            <div className="glass-card border border-glass-border shadow-2xl bg-glass-bg backdrop-blur-xl rounded-2xl overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-5">
                    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                        {/* Search */}
                        <div className="relative flex-1 w-full group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Zoek op naam, email, stad of ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-glass-border rounded-xl leading-5 bg-glass-surface/50 text-text-primary placeholder-text-muted focus:outline-none focus:bg-glass-surface focus:ring-1 focus:ring-brand-orange/50 focus:border-brand-orange/50 sm:text-sm transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            {/* Edition Toggle */}
                            <div className="flex bg-glass-surface/30 rounded-xl p-1 border border-glass-border/50">
                                {["2026", "2025"].map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => setEditionFilter(year)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${editionFilter === year ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20" : "text-text-muted hover:text-text-primary hover:bg-glass-surface/50"}`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>

                            {/* Filter Toggle Button */}
                            <button
                                onClick={() => setShowFilterPanel(!showFilterPanel)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${showFilterPanel || activeFilterCount > 0 ? "bg-brand-orange/10 text-brand-orange border-brand-orange/30" : "bg-glass-surface/50 text-text-muted border-glass-border hover:text-text-primary hover:bg-glass-surface"}`}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-orange text-white min-w-[18px] text-center">{activeFilterCount}</span>
                                )}
                                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showFilterPanel ? "rotate-180" : ""}`} />
                            </button>

                            {/* Result Count */}
                            <span className="text-xs text-text-muted hidden md:inline-flex items-center gap-1">
                                <span className="font-bold text-text-primary">{processedRegistrations.length}</span> van {stats.total}
                            </span>

                            {/* Export Button */}
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-linear-to-r from-brand-orange/10 to-brand-orange/5 border border-brand-orange/20 text-brand-orange hover:from-brand-orange/20 hover:to-brand-orange/10 transition-all text-xs font-medium whitespace-nowrap shadow-lg shadow-brand-orange/5 group cursor-pointer ml-auto md:ml-0"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Collapsible Filter Panel */}
                <AnimatePresence>
                    {showFilterPanel && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0 border-t border-glass-border/50">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-4">
                                    {/* Role */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider ml-1">Rol</label>
                                        <select
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value as Role)}
                                            className="w-full px-3 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-xs focus:ring-1 focus:ring-brand-orange/50 outline-none cursor-pointer hover:bg-glass-surface transition-colors"
                                        >
                                            <option value="all" className="bg-surface">Alle rollen</option>
                                            <option value="deelnemer" className="bg-surface">Deelnemer</option>
                                            <option value="begeleider" className="bg-surface">Begeleider</option>
                                            <option value="vrijwilliger" className="bg-surface">Vrijwilliger</option>
                                        </select>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider ml-1">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value as Status)}
                                            className="w-full px-3 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-xs focus:ring-1 focus:ring-brand-orange/50 outline-none cursor-pointer hover:bg-glass-surface transition-colors"
                                        >
                                            <option value="all" className="bg-surface">Alle statussen</option>
                                            <option value="paid" className="bg-surface">Geaccepteerd</option>
                                            <option value="pending" className="bg-surface">In behandeling</option>
                                            <option value="cancelled" className="bg-surface">Geannuleerd</option>
                                        </select>
                                    </div>

                                    {/* User Type */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider ml-1">Type</label>
                                        <select
                                            value={userTypeFilter}
                                            onChange={(e) => setUserTypeFilter(e.target.value as UserType)}
                                            className="w-full px-3 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-xs focus:ring-1 focus:ring-brand-orange/50 outline-none cursor-pointer hover:bg-glass-surface transition-colors"
                                        >
                                            <option value="all" className="bg-surface">Alle types</option>
                                            <option value="authenticated" className="bg-surface">Accounts</option>
                                            <option value="guest" className="bg-surface">Gasten</option>
                                        </select>
                                    </div>

                                    {/* Support */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider ml-1">Ondersteuning</label>
                                        <select
                                            value={supportFilter}
                                            onChange={(e) => setSupportFilter(e.target.value as SupportFilter)}
                                            className="w-full px-3 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-xs focus:ring-1 focus:ring-brand-orange/50 outline-none cursor-pointer hover:bg-glass-surface transition-colors"
                                        >
                                            <option value="all" className="bg-surface">Alle</option>
                                            <option value="ja" className="bg-surface">Ja - nodig</option>
                                            <option value="anders" className="bg-surface">Anders</option>
                                            <option value="nee" className="bg-surface">Nee</option>
                                        </select>
                                    </div>

                                    {/* Distance */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider ml-1">Afstand</label>
                                        <select
                                            value={distanceFilter}
                                            onChange={(e) => setDistanceFilter(e.target.value as DistanceFilter)}
                                            className="w-full px-3 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-xs focus:ring-1 focus:ring-brand-orange/50 outline-none cursor-pointer hover:bg-glass-surface transition-colors"
                                        >
                                            <option value="all" className="bg-surface">Alle afstanden</option>
                                            <option value="2.5" className="bg-surface">2.5 km</option>
                                            <option value="6" className="bg-surface">6 km</option>
                                            <option value="10" className="bg-surface">10 km</option>
                                            <option value="15" className="bg-surface">15 km</option>
                                        </select>
                                    </div>

                                    {/* Participant Type */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider ml-1">Doelgroep</label>
                                        <select
                                            value={participantTypeFilter}
                                            onChange={(e) => setParticipantTypeFilter(e.target.value as ParticipantTypeFilter)}
                                            className="w-full px-3 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-xs focus:ring-1 focus:ring-brand-orange/50 outline-none cursor-pointer hover:bg-glass-surface transition-colors"
                                        >
                                            <option value="all" className="bg-surface">Alle types</option>
                                            <option value="doelgroep" className="bg-surface">Doelgroep</option>
                                            <option value="verwant" className="bg-surface">Verwant</option>
                                            <option value="anders" className="bg-surface">Anders</option>
                                        </select>
                                    </div>

                                    {/* Profile Toggle Chips */}
                                    <div className="space-y-1 col-span-2 md:col-span-3 lg:col-span-4">
                                        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider ml-1">Profiel</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setWheelchairFilter(!wheelchairFilter)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${wheelchairFilter ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/30 ring-1 ring-indigo-500/30" : "bg-glass-surface/50 text-text-muted border-glass-border hover:bg-glass-surface"}`}
                                            >
                                                <Accessibility className="w-3.5 h-3.5" /> Rolstoel
                                            </button>
                                            <button
                                                onClick={() => setShuttleBusFilter(!shuttleBusFilter)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${shuttleBusFilter ? "bg-cyan-500/10 text-cyan-600 border-cyan-500/30 ring-1 ring-cyan-500/30" : "bg-glass-surface/50 text-text-muted border-glass-border hover:bg-glass-surface"}`}
                                            >
                                                <Bus className="w-3.5 h-3.5" /> Ophaalbus
                                            </button>
                                            <button
                                                onClick={() => setFacilityFilter(!facilityFilter)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${facilityFilter ? "bg-amber-500/10 text-amber-600 border-amber-500/30 ring-1 ring-amber-500/30" : "bg-glass-surface/50 text-text-muted border-glass-border hover:bg-glass-surface"}`}
                                            >
                                                <Building2 className="w-3.5 h-3.5" /> Instelling
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Clear All */}
                                {activeFilterCount > 0 && (
                                    <div className="flex justify-end pt-3 mt-3 border-t border-glass-border/30">
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-xs text-text-muted hover:text-brand-orange transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                            <X className="w-3 h-3" /> Wis alle filters ({activeFilterCount})
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active Filter Chips Bar */}
                {activeFilterCount > 0 && !showFilterPanel && (
                    <div className="px-4 md:px-5 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        <span className="text-[10px] text-text-muted uppercase tracking-wider shrink-0">Actief:</span>
                        {roleFilter !== "all" && (
                            <button onClick={() => setRoleFilter("all")} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-brand-orange/10 text-brand-orange border border-brand-orange/20 hover:bg-brand-orange/20 transition-colors cursor-pointer shrink-0">
                                Rol: {roleFilter} <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                        {statusFilter !== "all" && (
                            <button onClick={() => setStatusFilter("all")} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-pointer shrink-0">
                                Status: {statusFilter === "paid" ? "Geaccepteerd" : statusFilter === "pending" ? "Wachtend" : "Geannuleerd"} <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                        {userTypeFilter !== "all" && (
                            <button onClick={() => setUserTypeFilter("all")} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer shrink-0">
                                {userTypeFilter === "authenticated" ? "Accounts" : "Gasten"} <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                        {supportFilter !== "all" && (
                            <button onClick={() => setSupportFilter("all")} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors cursor-pointer shrink-0">
                                Ondersteuning: {supportFilter} <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                        {distanceFilter !== "all" && (
                            <button onClick={() => setDistanceFilter("all")} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer shrink-0">
                                {distanceFilter} km <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                        {wheelchairFilter && (
                            <button onClick={() => setWheelchairFilter(false)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors cursor-pointer shrink-0">
                                <Accessibility className="w-2.5 h-2.5" /> Rolstoel <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                        {shuttleBusFilter && (
                            <button onClick={() => setShuttleBusFilter(false)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors cursor-pointer shrink-0">
                                <Bus className="w-2.5 h-2.5" /> Ophaalbus <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                        {facilityFilter && (
                            <button onClick={() => setFacilityFilter(false)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer shrink-0">
                                <Building2 className="w-2.5 h-2.5" /> Instelling <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                        {participantTypeFilter !== "all" && (
                            <button onClick={() => setParticipantTypeFilter("all")} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-brand-orange/10 text-brand-orange border border-brand-orange/20 hover:bg-brand-orange/20 transition-colors cursor-pointer shrink-0">
                                <Heart className="w-2.5 h-2.5" /> {participantTypeFilter} <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                        <button onClick={clearAllFilters} className="text-[10px] text-text-muted hover:text-brand-orange transition-colors cursor-pointer shrink-0 ml-1">
                            Wis alles
                        </button>
                    </div>
                )}
            </div>

            {/* Data Display (Desktop Table / Mobile Cards) */}
            <div className="glass-card overflow-hidden border border-glass-border shadow-2xl bg-glass-bg backdrop-blur-xl rounded-2xl min-h-[400px]">
                {processedRegistrations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-glass-surface/50 rounded-full flex items-center justify-center mb-4 border border-glass-border">
                            <Filter className="w-8 h-8 text-text-muted opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">Geen deelnemers gevonden</h3>
                        <p className="text-text-muted max-w-md">Geen resultaten voor de huidige filters. Probeer een andere zoekopdracht of pas de filters aan.</p>
                        <button
                            onClick={clearAllFilters}
                            className="mt-6 px-6 py-2 bg-glass-surface/50 border border-glass-border text-text-primary rounded-xl hover:bg-glass-surface transition-colors text-sm font-medium cursor-pointer"
                        >
                            Filters wissen
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View (Hidden on mobile) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 z-10">
                                    <tr className="border-b border-glass-border bg-glass-surface/80 backdrop-blur-sm">
                                        <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors group select-none" onClick={() => handleSort("name")}>
                                            <div className="flex items-center gap-2">Naam & Rol <ChevronsUpDown className={`w-3 h-3 ${sortField === "name" ? "text-brand-orange" : "text-text-muted/50 group-hover:text-text-muted"}`} /></div>
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Contact</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors group select-none hidden lg:table-cell" onClick={() => handleSort("distance")}>
                                            <div className="flex items-center gap-2">Afstand <ChevronsUpDown className={`w-3 h-3 ${sortField === "distance" ? "text-brand-orange" : "text-text-muted/50 group-hover:text-text-muted"}`} /></div>
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors group select-none" onClick={() => handleSort("status")}>
                                            <div className="flex items-center gap-2">Status <ChevronsUpDown className={`w-3 h-3 ${sortField === "status" ? "text-brand-orange" : "text-text-muted/50 group-hover:text-text-muted"}`} /></div>
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider hidden lg:table-cell">Ondersteuning</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider hidden xl:table-cell">Profiel</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors group select-none hidden xl:table-cell" onClick={() => handleSort("createdAt")}>
                                            <div className="flex items-center justify-end gap-2">Datum <ChevronsUpDown className={`w-3 h-3 ${sortField === "createdAt" ? "text-brand-orange" : "text-text-muted/50 group-hover:text-text-muted"}`} /></div>
                                        </th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border/50">
                                    <AnimatePresence mode="popLayout">
                                        {paginatedRegistrations.map((reg, idx) => {
                                            const { count, editions } = getLoyaltyInfo(reg.email);
                                            return (
                                                <motion.tr
                                                    key={reg._id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    onClick={() => setSelectedRegistration(reg)}
                                                    className="group hover:bg-linear-to-r hover:from-brand-orange/5 hover:to-transparent transition-colors cursor-pointer"
                                                >
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-glass-border/50 ${reg.userType === 'authenticated' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-glass-surface/50 text-text-muted'}`}>
                                                                {reg.userType === 'authenticated' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-text-primary group-hover:text-brand-orange transition-colors flex items-center gap-2">
                                                                    {reg.name}
                                                                    {count > 1 && (
                                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${count >= 3 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`} title={`Deelnames: ${editions.join(", ")}`}>
                                                                            {count}x
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-text-muted flex items-center gap-2 mt-1">
                                                                    <span className={`capitalize px-2 py-0.5 rounded-md bg-glass-surface/50 ${reg.role === "deelnemer" ? "text-brand-orange bg-brand-orange/5" :
                                                                        reg.role === "begeleider" ? "text-blue-600 bg-blue-500/5" : "text-green-600 bg-green-500/5"
                                                                        }`}>{reg.role}</span>
                                                                    {reg.role === "begeleider" && reg.groupMembers && reg.groupMembers.length > 0 && (
                                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold" title={`Groepsregistratie: ${reg.groupMembers.length} deelnemers`}>
                                                                            👥 {reg.groupMembers.length} leden
                                                                        </span>
                                                                    )}
                                                                    <span className="font-mono opacity-40">#{reg._id.slice(-6)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col gap-1 text-sm">
                                                            <div className="flex items-center gap-2 text-text-secondary group-hover:text-text-primary transition-colors">
                                                                <Mail className="w-3.5 h-3.5 text-text-muted" />
                                                                <span className="truncate max-w-[180px]">{reg.email}</span>
                                                            </div>
                                                            {reg.icePhone && (
                                                                <div className="flex items-center gap-2 text-text-muted text-xs">
                                                                    <Phone className="w-3 h-3" />
                                                                    <span>ICE: {reg.icePhone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 hidden lg:table-cell">
                                                        {reg.distance ? <span className="text-sm font-medium text-text-primary">{reg.distance} km</span> : <span className="text-text-muted text-sm">-</span>}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${reg.status === "paid" ? "bg-green-500/10 text-green-700 border-green-500/20" :
                                                                reg.status === "pending" ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" :
                                                                    "bg-red-500/10 text-red-600 border-red-500/20"
                                                                }`}>
                                                                {reg.status === "paid" ? "Geaccepteerd" : reg.status === "pending" ? "In behandeling" : "Geannuleerd"}
                                                            </span>

                                                            {/* Mail confirmation tracking */}
                                                            {reg.confirmationSentAt ? (
                                                                <span
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-500/10 text-green-600 border border-green-500/20"
                                                                    title={`Verstuurd door ${reg.confirmationSentBy || 'admin'}`}
                                                                >
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    Mail {new Date(reg.confirmationSentAt).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })}
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => handleSendConfirmation(reg, e)}
                                                                    disabled={sendingConfirmation === reg._id}
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-orange/10 text-brand-orange border border-brand-orange/20 hover:bg-brand-orange/20 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                                                    title="Stuur bevestigingsmail"
                                                                >
                                                                    {sendingConfirmation === reg._id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <SendHorizonal className="w-3 h-3" />
                                                                    )}
                                                                    Accepteren
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 hidden lg:table-cell">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${(reg.supportNeeded || "nee") === "ja" ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20" :
                                                            (reg.supportNeeded || "nee") === "anders" ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" :
                                                                "bg-green-500/10 text-green-700 border-green-500/20"
                                                            }`} title={reg.supportDescription || ""}>
                                                            <HeartHandshake className="w-3 h-3" />
                                                            {(reg.supportNeeded || "nee") === "ja" ? "Ja" : (reg.supportNeeded || "nee") === "anders" ? "Anders" : "Nee"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 hidden xl:table-cell">
                                                        <div className="flex items-center gap-1.5 flex-wrap" title={[reg.city, reg.wheelchairUser ? "Rolstoel" : null, reg.shuttleBus === "pendelbus" ? "Ophaalbus (Kerk → Start)" : null, reg.livesInFacility ? "Instelling" : null, reg.participantType === "doelgroep" ? "Doelgroep" : reg.participantType === "verwant" ? "Verwant" : null].filter(Boolean).join(" · ") || "Geen profiel"}>
                                                            {reg.city && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-600 border border-blue-500/15" title={reg.city}><MapPin className="w-2.5 h-2.5" />{reg.city.length > 8 ? reg.city.slice(0, 8) + ".." : reg.city}</span>}
                                                            {reg.wheelchairUser && <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 border border-indigo-500/15" title="Rolstoelgebruiker"><Accessibility className="w-3 h-3" /></span>}
                                                            {reg.shuttleBus === "pendelbus" && <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 border border-cyan-500/15" title="Ophaalbus (Kerk → Start)"><Bus className="w-3 h-3" /></span>}
                                                            {reg.livesInFacility && <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/15" title="Wonend in instelling"><Building2 className="w-3 h-3" /></span>}
                                                            {reg.participantType && reg.participantType !== "anders" && <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${reg.participantType === "doelgroep" ? "bg-brand-orange/10 text-brand-orange border-brand-orange/15" : "bg-pink-500/10 text-pink-600 border-pink-500/15"}`}><Heart className="w-2.5 h-2.5" />{reg.participantType === "doelgroep" ? "DG" : "VW"}</span>}
                                                            {!reg.city && !reg.wheelchairUser && reg.shuttleBus !== "pendelbus" && !reg.livesInFacility && <span className="text-text-muted/40 text-[10px]">—</span>}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-right text-text-muted text-sm hidden xl:table-cell font-mono">
                                                        {new Date(reg.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand-orange opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View (Visible on mobile) */}
                        <div className="md:hidden p-4 space-y-4">
                            <AnimatePresence mode="popLayout">
                                {paginatedRegistrations.map((reg, idx) => {
                                    const { count } = getLoyaltyInfo(reg.email);
                                    return (
                                        <motion.div
                                            key={reg._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setSelectedRegistration(reg)}
                                            className="bg-glass-surface/50 border border-glass-border rounded-xl p-4 active:scale-[0.98] transition-all cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-glass-border/50 ${reg.userType === 'authenticated' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-glass-surface/50 text-text-muted'}`}>
                                                        {reg.userType === 'authenticated' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-text-primary text-base">{reg.name}</div>
                                                        <div className="text-xs text-text-muted flex gap-2 items-center">
                                                            <span className="capitalize text-brand-orange">{reg.role}</span>
                                                            {count > 1 && <span className="bg-glass-surface px-1.5 rounded text-[10px]">{count}x</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${reg.status === "paid" ? "bg-green-500/10 text-green-700 border-green-500/20" :
                                                    reg.status === "pending" ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" :
                                                        "bg-red-500/10 text-red-600 border-red-500/20"
                                                    }`}>
                                                    {reg.status === "paid" ? "OK" : reg.status === "pending" ? "Wacht" : "Nee"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                                <div className="bg-glass-bg rounded-lg p-2.5 border border-glass-border/50">
                                                    <div className="text-text-muted mb-0.5 text-[10px] uppercase tracking-wider">Email</div>
                                                    <div className="text-text-primary truncate">{reg.email}</div>
                                                </div>
                                                <div className="bg-glass-bg rounded-lg p-2.5 border border-glass-border/50">
                                                    <div className="text-text-muted mb-0.5 text-[10px] uppercase tracking-wider">Afstand</div>
                                                    <div className="text-text-primary font-medium">{reg.distance ? `${reg.distance} km` : '-'}</div>
                                                </div>
                                            </div>

                                            {/* Profile Icons Row */}
                                            {(reg.city || reg.wheelchairUser || reg.shuttleBus === "pendelbus" || reg.livesInFacility || (reg.participantType && reg.participantType !== "anders")) && (
                                                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                                    {reg.city && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-600 border border-blue-500/15"><MapPin className="w-2.5 h-2.5" />{reg.city}</span>}
                                                    {reg.wheelchairUser && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-indigo-500/10 text-indigo-600 border border-indigo-500/15"><Accessibility className="w-3 h-3" /></span>}
                                                    {reg.shuttleBus === "pendelbus" && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-cyan-500/10 text-cyan-600 border border-cyan-500/15"><Bus className="w-3 h-3" /></span>}
                                                    {reg.livesInFacility && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/15"><Building2 className="w-3 h-3" /></span>}
                                                    {reg.participantType && reg.participantType !== "anders" && <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${reg.participantType === "doelgroep" ? "bg-brand-orange/10 text-brand-orange border-brand-orange/15" : "bg-pink-500/10 text-pink-600 border-pink-500/15"}`}><Heart className="w-2.5 h-2.5" />{reg.participantType === "doelgroep" ? "Doelgroep" : "Verwant"}</span>}
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center pt-2 border-t border-glass-border/50">
                                                <span className="text-[10px] text-text-muted font-mono">{new Date(reg.createdAt).toLocaleDateString()}</span>
                                                <div className="flex items-center gap-1 text-xs text-brand-orange font-medium">
                                                    Details <ChevronRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </>
                )}

                {/* Pagination Footer */}
                <div className="px-4 md:px-6 py-3 md:py-4 border-t border-glass-border flex flex-col md:flex-row items-center justify-between gap-3 bg-glass-surface/20">
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                        <span className="text-xs text-text-muted">
                            <span className="font-bold text-text-primary">{processedRegistrations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span>–<span className="font-bold text-text-primary">{Math.min(currentPage * itemsPerPage, processedRegistrations.length)}</span> van <span className="font-bold text-text-primary">{processedRegistrations.length}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider">Rijen:</span>
                            {([10, 25, 50] as const).map(n => (
                                <button
                                    key={n}
                                    onClick={() => setItemsPerPage(n)}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${itemsPerPage === n ? "bg-brand-orange text-white" : "text-text-muted hover:text-text-primary hover:bg-glass-surface/50"}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-glass-surface/30 p-1 rounded-xl border border-glass-border/50">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg hover:bg-glass-surface text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-[10px] font-medium px-2"
                        >
                            1
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg hover:bg-glass-surface text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-medium px-2 text-text-primary min-w-8 text-center">
                            {currentPage}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            className="p-1.5 rounded-lg hover:bg-glass-surface text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        {totalPages > 1 && (
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage >= totalPages}
                                className="p-1.5 rounded-lg hover:bg-glass-surface text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-[10px] font-medium px-2"
                            >
                                {totalPages}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedRegistration && (
                    <ParticipantDetailModal
                        registration={selectedRegistration}
                        onClose={() => setSelectedRegistration(null)}
                        onUpdate={fetchRegistrations}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
