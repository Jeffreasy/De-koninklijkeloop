import { Users, Filter, Mail, Phone, MapPin, Search, ChevronLeft, ChevronRight, Download, ChevronsUpDown, ShieldCheck, UserCircle, User, Archive, Calendar } from "lucide-react";
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
            // @ts-ignore
            if (roleFilter !== "all" && reg.role !== roleFilter) return false;

            // Status Filter
            // @ts-ignore
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

    // Stats Computation
    const stats = useMemo(() => {
        if (!registrations) return { total: 0, deelnemers: 0, begeleiders: 0, vrijwilligers: 0, authenticated: 0, guests: 0 };
        return registrations.reduce((acc, r) => {
            acc.total++;
            if (r.role === "deelnemer") acc.deelnemers++;
            else if (r.role === "begeleider") acc.begeleiders++;
            else if (r.role === "vrijwilliger") acc.vrijwilligers++;
            if (r.userType === "authenticated") acc.authenticated++;
            else if (r.userType === "guest") acc.guests++;
            return acc;
        }, { total: 0, deelnemers: 0, begeleiders: 0, vrijwilligers: 0, authenticated: 0, guests: 0 });
    }, [registrations]);


    if (!registrations) {
        return (
            <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
                <span className="sr-only">Deelnemers gegevens laden...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards - Compact Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="glass-card p-3 md:p-4">
                    <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Totaal</div>
                    <div className="text-xl md:text-2xl font-bold text-text-primary">{stats.total}</div>
                </div>
                <div className="glass-card p-3 md:p-4">
                    <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Deelnemers</div>
                    <div className="text-xl md:text-2xl font-bold text-brand-orange">{stats.deelnemers}</div>
                </div>
                <div className="glass-card p-3 md:p-4">
                    <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Begeleiders</div>
                    <div className="text-xl md:text-2xl font-bold text-blue-400">{stats.begeleiders}</div>
                </div>
                <div className="glass-card p-3 md:p-4">
                    <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Vrijwilligers</div>
                    <div className="text-xl md:text-2xl font-bold text-green-400">{stats.vrijwilligers}</div>
                </div>
                <div className="glass-card p-3 md:p-4 border-2 border-brand-orange/20">
                    <div className="text-text-muted text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                        Accounts
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-brand-orange">{stats.authenticated}</div>
                </div>
                <div className="glass-card p-3 md:p-4 border-2 border-purple-500/20">
                    <div className="text-text-muted text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                        Gasten
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-purple-400">{stats.guests}</div>
                </div>
            </div>

            {/* Main Action Bar */}
            <div className="glass-card p-4 space-y-4">
                <div className="flex flex-col xl:flex-row gap-4 justify-between">
                    {/* Search & Filters Group */}
                    <div className="flex flex-col md:flex-row gap-3 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Zoek op naam, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-glass-border/30 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all"
                            />
                        </div>

                        {/* Edition Toggle */}
                        <div className="flex bg-glass-border/30 rounded-xl p-1 border border-glass-border">
                            <button
                                onClick={() => setEditionFilter("2026")}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${editionFilter === "2026" ? "bg-brand-orange text-white shadow-lg" : "text-text-muted hover:text-text-primary"}`}
                            >
                                2026
                            </button>
                            <button
                                onClick={() => setEditionFilter("2025")}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${editionFilter === "2025" ? "bg-brand-orange text-white shadow-lg" : "text-text-muted hover:text-text-primary"}`}
                            >
                                2025
                            </button>
                        </div>

                        {/* Import Button (Only visible in 2025 view) */}
                        {editionFilter === "2025" && (
                            <button
                                onClick={handleImport2025}
                                disabled={isImporting}
                                className="px-3 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-sm flex items-center gap-2"
                            >
                                <Archive className="w-4 h-4" />
                                {isImporting ? "Bezig..." : "Importeer Data"}
                            </button>
                        )}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            <select
                                value={userTypeFilter}
                                onChange={(e) => setUserTypeFilter(e.target.value as UserType)}
                                className="px-3 py-2.5 rounded-xl bg-glass-border/30 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none cursor-pointer"
                            >
                                <option value="all">Alle types</option>
                                <option value="authenticated">Accounts</option>
                                <option value="guest">Gasten</option>
                            </select>

                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value as Role)}
                                className="px-3 py-2.5 rounded-xl bg-glass-border/30 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none cursor-pointer"
                            >
                                <option value="all">Alle rollen</option>
                                <option value="deelnemer">Deelnemer</option>
                                <option value="begeleider">Begeleider</option>
                                <option value="vrijwilliger">Vrijwilliger</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as Status)}
                                className="px-3 py-2 rounded-lg bg-glass-border/30 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 min-h-[44px]"
                                aria-label="Filter deelnemers op status"
                            >
                                <option value="all">Alle statussen</option>
                                <option value="paid">Geaccepteerd</option>
                                <option value="pending">In behandeling</option>
                                <option value="cancelled">Geannuleerd</option>
                            </select>
                        </div>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-glass-border text-text-primary hover:bg-white/10 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="glass-card overflow-hidden">
                {processedRegistrations.length === 0 ? (
                    <div className="text-center py-16">
                        <Filter className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-text-primary">Geen resultaten gevonden</h3>
                        <p className="text-text-muted mt-1">Probeer een andere zoekopdracht of filter.</p>
                        <button
                            onClick={() => { setSearchQuery(""); setUserTypeFilter("all"); setRoleFilter("all"); setStatusFilter("all"); }}
                            className="mt-4 px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-lg hover:bg-brand-orange/20 transition-colors text-sm font-medium"
                        >
                            Filters wissen
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-glass-border bg-white/5">
                                        <th
                                            className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-brand-orange transition-colors group"
                                            onClick={() => handleSort("name")}
                                        >
                                            <div className="flex items-center gap-1">
                                                Naam & Rol
                                                <ChevronsUpDown className={`w-3 h-3 ${sortField === "name" ? "text-brand-orange" : "text-text-muted/50 group-hover:text-brand-orange/50"}`} />
                                            </div>
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Contact</th>
                                        <th
                                            className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-brand-orange transition-colors group hidden lg:table-cell"
                                            onClick={() => handleSort("distance")}
                                        >
                                            <div className="flex items-center gap-1">
                                                Afstand
                                                <ChevronsUpDown className={`w-3 h-3 ${sortField === "distance" ? "text-brand-orange" : "text-text-muted/50 group-hover:text-brand-orange/50"}`} />
                                            </div>
                                        </th>
                                        <th
                                            className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-brand-orange transition-colors group"
                                            onClick={() => handleSort("status")}
                                        >
                                            <div className="flex items-center gap-1">
                                                Status
                                                <ChevronsUpDown className={`w-3 h-3 ${sortField === "status" ? "text-brand-orange" : "text-text-muted/50 group-hover:text-brand-orange/50"}`} />
                                            </div>
                                        </th>
                                        <th
                                            className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-brand-orange transition-colors group hidden sm:table-cell"
                                            onClick={() => handleSort("createdAt")}
                                        >
                                            <div className="flex items-center justify-end gap-1">
                                                Datum
                                                <ChevronsUpDown className={`w-3 h-3 ${sortField === "createdAt" ? "text-brand-orange" : "text-text-muted/50 group-hover:text-brand-orange/50"}`} />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {paginatedRegistrations.map((reg) => (
                                        <tr
                                            key={reg._id}
                                            onClick={() => setSelectedRegistration(reg)}
                                            className="hover:bg-brand-orange/5 transition-colors cursor-pointer group"
                                        >
                                            {/* Name & Role */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${reg.userType === 'authenticated' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-white/10 text-text-muted'}`}>
                                                        {reg.userType === 'authenticated' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-text-primary group-hover:text-brand-orange transition-colors">
                                                            {reg.name}
                                                        </div>
                                                        <div className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                                                            <span className={`capitalize ${reg.role === "deelnemer" ? "text-brand-orange" :
                                                                reg.role === "begeleider" ? "text-blue-400" : "text-green-400"
                                                                }`}>
                                                                {reg.role}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="font-mono opacity-60">#{reg._id.slice(-6)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact (Hidden on mobile) */}
                                            <td className="py-4 px-4 hidden md:table-cell">
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <div className="flex items-center gap-2 text-text-primary">
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

                                            {/* Distance */}
                                            <td className="py-4 px-4 hidden lg:table-cell">
                                                {reg.distance ? (
                                                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-glass-border text-sm font-medium">
                                                        {reg.distance} km
                                                    </span>
                                                ) : (
                                                    <span className="text-text-muted text-sm">-</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${reg.status === "paid" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                    reg.status === "pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                        "bg-red-500/10 text-red-500 border-red-500/20"
                                                    }`}>
                                                    {reg.status === "paid" ? "Geaccepteerd" :
                                                        reg.status === "pending" ? "In behandeling" :
                                                            "Geannuleerd"}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="py-4 px-4 text-right text-text-muted text-sm hidden sm:table-cell">
                                                {new Date(reg.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="px-6 py-4 border-t border-glass-border flex items-center justify-between">
                            <span className="text-sm text-text-muted">
                                Tonen <span className="font-medium text-text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> tot <span className="font-medium text-text-primary">{Math.min(currentPage * itemsPerPage, processedRegistrations.length)}</span> van <span className="font-medium text-text-primary">{processedRegistrations.length}</span> resultaten
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg hover:bg-white/5 text-text-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-sm font-medium px-2">Pagina {currentPage}</span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg hover:bg-white/5 text-text-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {selectedRegistration && (
                <ParticipantDetailModal
                    registration={selectedRegistration}
                    onClose={() => setSelectedRegistration(null)}
                    onUpdate={fetchRegistrations}
                />
            )}
        </div>
    );
}
