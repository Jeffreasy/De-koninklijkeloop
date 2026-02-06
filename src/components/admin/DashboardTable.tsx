import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { $user, $accessToken } from "../../lib/auth";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Loader2, Users, Map, UserCheck, Calendar, Search } from "lucide-react";

// Types
interface Registration {
    _id: string;
    name: string;
    email: string;
    role?: string;
    distance?: string;
    supportNeeded?: string;
    createdAt: number;
}

export default function DashboardTable() {
    const user = useStore($user);
    const [isMounted, setIsMounted] = useState(false);
    const [registrations, setRegistrations] = useState<Registration[] | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const accessToken = useStore($accessToken);
    const getRegistrations = useAction(api.admin.getRegistrations);

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

    if (!isMounted) return null;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                    <UserCheck className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-text-primary">Toegang Beveiligd</h2>
                    <p className="text-text-muted">Log in om het dashboard te bekijken.</p>
                </div>
                <a href="/login"><Button variant="outline">Inloggen</Button></a>
            </div>
        )
    }

    if (registrations === undefined) {
        return (
            <div
                className="flex items-center justify-center py-20 text-text-muted animate-pulse gap-2"
                role="status"
                aria-live="polite"
            >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Gegevens ophalen...</span>
                <span className="sr-only">Dashboard gegevens laden...</span>
            </div>
        );
    }

    // Filter Logic
    const filteredRegistrations = registrations.filter(reg =>
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
    const paginatedRegistrations = filteredRegistrations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    label="Totaal Inschrijvingen"
                    value={registrations.length.toString()}
                    icon={<Users className="w-5 h-5 text-brand-orange" />}
                    trend="+12% vs vorige maand"
                />
                <StatsCard
                    label="10 KMlopers"
                    value={registrations.filter(r => r.distance === "10").length.toString()}
                    icon={<Map className="w-5 h-5 text-blue-400" />}
                    color="blue"
                />
                <StatsCard
                    label="Vrijwilligers"
                    value={registrations.filter(r => r.role === "vrijwilliger").length.toString()}
                    icon={<UserCheck className="w-5 h-5 text-green-400" />}
                    color="green"
                />
            </div>

            {/* Main Content Panel (Combined Toolbar & Table) */}
            <div className="rounded-2xl md:rounded-3xl border border-glass-border bg-glass-bg/40 backdrop-blur-xl shadow-2xl overflow-hidden">

                {/* Panel Header / Toolbar */}
                <div className="p-4 md:p-5 border-b border-glass-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5">
                    <h3 className="text-base md:text-lg font-display font-semibold text-text-primary hidden sm:block">Recente Inschrijvingen</h3>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-72 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Zoeken..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-9 pr-3 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-brand-orange/50 transition-all min-h-[44px]"
                                aria-label="Zoek in registraties"
                            />
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-glass-border/20 text-xs font-medium text-text-muted border border-glass-border whitespace-nowrap">
                            {filteredRegistrations.length}
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-glass-bg/20 border-b border-glass-border">
                                <th className="py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider">Naam</th>
                                <th className="py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider hidden md:table-cell">Email</th>
                                <th className="py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider">Rol</th>
                                <th className="py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider">Afstand</th>
                                <th className="py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider hidden md:table-cell">Datum</th>
                                <th className="py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border/50">
                            {paginatedRegistrations.map((reg, index) => (
                                <tr
                                    key={reg._id}
                                    className="group hover:bg-white/3 transition-colors duration-200"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-glass-border to-transparent border border-glass-border flex items-center justify-center text-text-primary font-bold text-xs">
                                                {reg.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-medium text-text-primary">{reg.name}</div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-text-muted hidden md:table-cell">{reg.email}</td>
                                    <td className="py-4 px-6">
                                        <Badge role={reg.role} />
                                    </td>
                                    <td className="py-4 px-6 text-text-primary font-mono text-xs">
                                        {reg.distance ? `${reg.distance} KM` : "-"}
                                    </td>
                                    <td className="py-4 px-6 text-text-muted hidden md:table-cell">
                                        {new Date(reg.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-glass-border/30 rounded-lg transition-colors text-text-muted hover:text-text-primary"
                                            aria-label="Bekijk details"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredRegistrations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-text-muted">
                                        Geen resultaten voor "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredRegistrations.length > itemsPerPage && (
                    <div className="px-6 py-4 border-t border-glass-border flex items-center justify-between bg-glass-bg/20">
                        <div className="text-sm text-text-muted">
                            Toont <span className="font-medium text-text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> tot <span className="font-medium text-text-primary">{Math.min(currentPage * itemsPerPage, filteredRegistrations.length)}</span> van <span className="font-medium text-text-primary">{filteredRegistrations.length}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0"
                            >
                                &lt;
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 p-0"
                            >
                                &gt;
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-components for cleanliness
function StatsCard({ label, value, icon, trend, color = "orange" }: { label: string, value: string, icon: React.ReactNode, trend?: string, color?: "orange" | "blue" | "green" }) {
    const gradients = {
        orange: "from-brand-orange/10 to-transparent",
        blue: "from-blue-500/10 to-transparent",
        green: "from-green-500/10 to-transparent"
    };

    // @ts-ignore
    const bgClass = gradients[color];

    return (
        <div className={`relative overflow-hidden bg-glass-bg/30 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl border border-glass-border hover:border-brand-orange/30 transition-all duration-300 group`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${bgClass} blur-2xl opacity-50 -mr-10 -mt-10 pointer-events-none`} />

            <div className="relative flex justify-between items-start">
                <div>
                    <div className="text-sm font-medium text-text-muted mb-1">{label}</div>
                    <div className="text-3xl font-display font-bold text-text-primary tracking-tight">{value}</div>
                </div>
                <div className="p-2 rounded-xl bg-glass-border/20 border border-glass-border/20 text-text-primary">
                    {icon}
                </div>
            </div>
            {trend && (
                <div className="mt-4 pt-4 border-t border-glass-border/50 flex items-center gap-2">
                    <span className="text-xs font-medium text-[rgb(var(--success))] bg-[rgb(var(--success))]/10 px-2 py-0.5 rounded-full">{trend}</span>
                </div>
            )}
        </div>
    );
}

function Badge({ role }: { role?: string }) {
    const r = (role || "").toLowerCase();

    let styles = "bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted))] border-[rgb(var(--muted))]/20";
    let glowClass = "";

    if (r === "admin") {
        styles = "bg-red-500/10 text-red-400 border-red-500/20";
        glowClass = "shadow-[0_0_8px_rgba(239,68,68,0.3)]";
    }
    if (r === "vrijwilliger") {
        styles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        glowClass = "shadow-[0_0_8px_rgba(16,185,129,0.3)]";
    }
    if (r === "begeleider") {
        styles = "bg-[rgb(var(--info))]/10 text-[rgb(var(--info))] border-[rgb(var(--info))]/20";
        glowClass = "shadow-[0_0_8px_rgba(59,130,246,0.3)]";
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${styles} ${glowClass} capitalize transition-all duration-200 hover:scale-105`}>
            {r.replace("_", " ") || "Onbekend"}
        </span>
    );
}
