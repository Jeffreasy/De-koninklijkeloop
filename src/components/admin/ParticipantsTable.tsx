import { Users, Filter, Mail, Phone, MapPin, Search, ChevronLeft, ChevronRight, Download, ChevronsUpDown, ShieldCheck, UserCircle, User, Archive, Calendar, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { useState, useMemo, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $accessToken } from "../../lib/auth";
import { useAction } from "convex/react";
import ParticipantDetailModal from "./ParticipantDetailModal";

type UserType = "all" | "authenticated" | "guest";
type Role = "all" | "deelnemer" | "begeleider" | "vrijwilliger";
type Status = "all" | "pending" | "paid" | "cancelled";
type SortField = "name" | "createdAt" | "distance" | "status";
type SortDirection = "asc" | "desc";

// Mimic the type from DashboardTable or define it
interface Registration {
    _id: string;
    name: string;
    email: string;
    role: string;
    distance?: string;
    status: string;
    userType?: string;
    iceName?: string;
    icePhone?: string;
    createdAt: number;
    notes?: string;
    edition?: string;
}

export default function ParticipantsTable() {
    const accessToken = useStore($accessToken);
    const getRegistrations = useAction(api.admin.getRegistrations);
    const [registrations, setRegistrations] = useState<Registration[] | undefined>(undefined);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

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

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [userTypeFilter, setUserTypeFilter] = useState<UserType>("all");
    const [roleFilter, setRoleFilter] = useState<Role>("all");
    const [statusFilter, setStatusFilter] = useState<Status>("all");
    const [editionFilter, setEditionFilter] = useState<string>("2026");

    // Actions
    const import2025 = useAction(api.archive.import2025);
    const [isImporting, setIsImporting] = useState(false);

    const handleImport2025 = async () => {
        if (!accessToken || !confirm("Weet je zeker dat je de 2025 data wilt importeren?")) return;
        setIsImporting(true);
        try {
            const res = await import2025({ token: accessToken });
            alert(res);
            fetchRegistrations();
        } catch (err) {
            console.error(err);
            alert("Import mislukt. Check console.");
        } finally {
            setIsImporting(false);
        }
    };

    // Sort State
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Derived: Filtered & Sorted Registrations
    const processedRegistrations = useMemo(() => {
        if (!registrations) return [];

        let result = registrations.filter((reg) => {
            // Text Search
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = reg.name.toLowerCase().includes(query);
                const matchesEmail = reg.email.toLowerCase().includes(query);
                const matchesID = reg._id.toLowerCase().includes(query);
                if (!matchesName && !matchesEmail && !matchesID) return false;
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
    }, [registrations, searchQuery, userTypeFilter, roleFilter, statusFilter, sortField, sortDirection, editionFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(processedRegistrations.length / itemsPerPage);
    const paginatedRegistrations = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return processedRegistrations.slice(start, start + itemsPerPage);
    }, [processedRegistrations, currentPage]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, userTypeFilter, roleFilter, statusFilter, editionFilter]);


    // Handlers
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleExportCSV = () => {
        if (!processedRegistrations.length) return;

        const headers = ["ID,Naam,Email,Rol,Afstand,Status,Type,Aangemaakt,ICE Naam,ICE Telefoon"];
        const rows = processedRegistrations.map(r =>
            `"${r._id}","${r.name}","${r.email}","${r.role}","${r.distance || ''}","${r.status}","${r.userType || 'guest'}","${new Date(r.createdAt).toISOString()}","${r.iceName || ''}","${r.icePhone || ''}"`
        );

        const csvContent = headers.concat(rows).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `registraties_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        if (!registrations) return { total: 0, deelnemers: 0, begeleiders: 0, vrijwilligers: 0, authenticated: 0, guests: 0 };

        // Use filtered set based on edition
        const editionRegistrations = registrations.filter(r => (r.edition || "2026") === editionFilter);

        return editionRegistrations.reduce((acc, r) => {
            acc.total++;
            if (r.role === "deelnemer") acc.deelnemers++;
            else if (r.role === "begeleider") acc.begeleiders++;
            else if (r.role === "vrijwilliger") acc.vrijwilligers++;
            if (r.userType === "authenticated") acc.authenticated++;
            else if (r.userType === "guest") acc.guests++;
            return acc;
        }, { total: 0, deelnemers: 0, begeleiders: 0, vrijwilligers: 0, authenticated: 0, guests: 0 });
    }, [registrations, editionFilter]);


    if (!registrations) {
        return (
            <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
                <span className="sr-only">Deelnemers gegevens laden...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stats Cards - Premium Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: "Totaal", value: stats.total, color: "text-white", bg: "bg-white/5", border: "border-white/10" },
                    { label: "Deelnemers", value: stats.deelnemers, color: "text-brand-orange", bg: "bg-brand-orange/5", border: "border-brand-orange/20" },
                    { label: "Begeleiders", value: stats.begeleiders, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20" },
                    { label: "Vrijwilligers", value: stats.vrijwilligers, color: "text-green-400", bg: "bg-green-500/5", border: "border-green-500/20" },
                    { label: "Accounts", value: stats.authenticated, color: "text-purple-300", bg: "bg-purple-500/5", border: "border-purple-500/20", icon: ShieldCheck },
                    { label: "Gasten", value: stats.guests, color: "text-pink-300", bg: "bg-pink-500/5", border: "border-pink-500/20", icon: User }
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`glass-card p-4 border ${stat.border} ${stat.bg} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-default`}
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            {stat.icon ? <stat.icon className="w-8 h-8" /> : <Users className="w-8 h-8" />}
                        </div>
                        <div className="text-text-muted text-xs uppercase tracking-wider mb-1 font-medium z-10 relative">{stat.label}</div>
                        <div className={`text-2xl font-bold font-display ${stat.color} z-10 relative`}>{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Action Bar */}
            <div className="glass-card p-5 space-y-5 border border-glass-border shadow-2xl bg-glass-bg backdrop-blur-xl rounded-2xl">
                <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                    {/* Search & Filters Group */}
                    <div className="flex flex-col md:flex-row gap-3 flex-1 w-full">
                        {/* Search */}
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Zoek op naam, email of ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-glass-border rounded-xl leading-5 bg-glass-surface/50 text-text-primary placeholder-text-muted focus:outline-none focus:bg-glass-surface focus:ring-1 focus:ring-brand-orange/50 focus:border-brand-orange/50 sm:text-sm transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
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

                            {/* Import Button (2025 only) */}
                            {editionFilter === "2025" && (
                                <button
                                    onClick={handleImport2025}
                                    disabled={isImporting}
                                    className="px-3 py-2 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-xs font-medium flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                                >
                                    <Archive className="w-3.5 h-3.5" />
                                    {isImporting ? "Bezig..." : "Importeer"}
                                </button>
                            )}

                            {/* Filters */}
                            <select
                                value={userTypeFilter}
                                onChange={(e) => setUserTypeFilter(e.target.value as UserType)}
                                className="px-3 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-xs focus:ring-1 focus:ring-brand-orange/50 outline-none cursor-pointer hover:bg-glass-surface transition-colors"
                            >
                                <option value="all" className="bg-slate-900">Alle types</option>
                                <option value="authenticated" className="bg-slate-900">Accounts</option>
                                <option value="guest" className="bg-slate-900">Gasten</option>
                            </select>

                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value as Role)}
                                className="px-3 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-xs focus:ring-1 focus:ring-brand-orange/50 outline-none cursor-pointer hover:bg-glass-surface transition-colors"
                            >
                                <option value="all" className="bg-slate-900">Alle rollen</option>
                                <option value="deelnemer" className="bg-slate-900">Deelnemer</option>
                                <option value="begeleider" className="bg-slate-900">Begeleider</option>
                                <option value="vrijwilliger" className="bg-slate-900">Vrijwilliger</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as Status)}
                                className="px-3 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-xs focus:ring-1 focus:ring-brand-orange/50 outline-none cursor-pointer hover:bg-glass-surface transition-colors"
                            >
                                <option value="all" className="bg-slate-900">Alle statussen</option>
                                <option value="paid" className="bg-slate-900">Geaccepteerd</option>
                                <option value="pending" className="bg-slate-900">In behandeling</option>
                                <option value="cancelled" className="bg-slate-900">Geannuleerd</option>
                            </select>
                        </div>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-brand-orange/10 to-brand-orange/5 border border-brand-orange/20 text-brand-orange hover:from-brand-orange/20 hover:to-brand-orange/10 transition-all text-sm font-medium whitespace-nowrap shadow-lg shadow-brand-orange/5 group cursor-pointer"
                    >
                        <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Export CSV
                    </button>
                </div>
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
                            onClick={() => { setSearchQuery(""); setUserTypeFilter("all"); setRoleFilter("all"); setStatusFilter("all"); }}
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
                                <thead>
                                    <tr className="border-b border-glass-border bg-glass-surface/30">
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
                                                                        reg.role === "begeleider" ? "text-blue-400 bg-blue-500/5" : "text-green-400 bg-green-500/5"
                                                                        }`}>{reg.role}</span>
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
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${reg.status === "paid" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                            reg.status === "pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                                "bg-red-500/10 text-red-500 border-red-500/20"
                                                            }`}>
                                                            {reg.status === "paid" ? "Geaccepteerd" : reg.status === "pending" ? "In behandeling" : "Geannuleerd"}
                                                        </span>
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
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${reg.status === "paid" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                    reg.status === "pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                        "bg-red-500/10 text-red-500 border-red-500/20"
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
                <div className="px-6 py-4 border-t border-glass-border flex flex-col md:flex-row items-center justify-between gap-4 bg-glass-surface/20">
                    <span className="text-xs text-text-muted text-center md:text-left">
                        Tonen <span className="font-bold text-text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-text-primary">{Math.min(currentPage * itemsPerPage, processedRegistrations.length)}</span> van <span className="font-bold text-text-primary">{processedRegistrations.length}</span>
                    </span>
                    <div className="flex items-center gap-2 bg-glass-surface/30 p-1 rounded-xl border border-glass-border/50">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-glass-surface text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-medium px-3 text-text-primary min-w-12 text-center">
                            {currentPage} / {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-glass-surface text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
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
