import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useMemo } from "react";
import { Users, Filter, Mail, Phone, MapPin, User, ShieldCheck, UserCircle } from "lucide-react";

type UserType = "all" | "authenticated" | "guest";
type Role = "all" | "deelnemer" | "begeleider" | "vrijwilliger";
type Status = "all" | "pending" | "paid" | "cancelled";

export default function ParticipantsTable() {
    const registrations = useQuery(api.internal.listRegistrations);

    const [userTypeFilter, setUserTypeFilter] = useState<UserType>("all");
    const [roleFilter, setRoleFilter] = useState<Role>("all");
    const [statusFilter, setStatusFilter] = useState<Status>("all");

    // Apply filters
    const filteredRegistrations = useMemo(() => {
        if (!registrations) return [];

        return registrations.filter((reg) => {
            // User Type Filter
            if (userTypeFilter === "authenticated" && reg.userType !== "authenticated") return false;
            if (userTypeFilter === "guest" && reg.userType !== "guest") return false;

            // Role Filter
            if (roleFilter !== "all" && reg.role !== roleFilter) return false;

            // Status Filter
            if (statusFilter !== "all" && reg.status !== statusFilter) return false;

            return true;
        });
    }, [registrations, userTypeFilter, roleFilter, statusFilter]);

    // Stats - Optimized with single reduce instead of 6 filters
    const stats = useMemo(() => {
        if (!registrations) {
            return {
                total: 0,
                deelnemers: 0,
                begeleiders: 0,
                vrijwilligers: 0,
                authenticated: 0,
                guests: 0
            };
        }

        return registrations.reduce((acc, r) => {
            acc.total++;

            // Count roles
            if (r.role === "deelnemer") acc.deelnemers++;
            else if (r.role === "begeleider") acc.begeleiders++;
            else if (r.role === "vrijwilliger") acc.vrijwilligers++;

            // Count user types
            if (r.userType === "authenticated") acc.authenticated++;
            else if (r.userType === "guest" || !r.userType) acc.guests++;

            return acc;
        }, {
            total: 0,
            deelnemers: 0,
            begeleiders: 0,
            vrijwilligers: 0,
            authenticated: 0,
            guests: 0
        });
    }, [registrations]);

    if (!registrations) {
        return (
            <div
                className="flex items-center justify-center py-12"
                role="status"
                aria-live="polite"
            >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
                <span className="sr-only">Deelnemers gegevens laden...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="glass-card p-4">
                    <div className="text-text-muted text-sm mb-1">Totaal</div>
                    <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
                </div>
                <div className="glass-card p-4">
                    <div className="text-text-muted text-sm mb-1">Deelnemers</div>
                    <div className="text-2xl font-bold text-brand-orange">{stats.deelnemers}</div>
                </div>
                <div className="glass-card p-4">
                    <div className="text-text-muted text-sm mb-1">Begeleiders</div>
                    <div className="text-2xl font-bold text-blue-400">{stats.begeleiders}</div>
                </div>
                <div className="glass-card p-4">
                    <div className="text-text-muted text-sm mb-1">Vrijwilligers</div>
                    <div className="text-2xl font-bold text-green-400">{stats.vrijwilligers}</div>
                </div>
                <div className="glass-card p-4 border-2 border-brand-orange/20">
                    <div className="text-text-muted text-sm mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Accounts
                    </div>
                    <div className="text-2xl font-bold text-brand-orange">{stats.authenticated}</div>
                </div>
                <div className="glass-card p-4 border-2 border-purple-500/20">
                    <div className="text-text-muted text-sm mb-1 flex items-center gap-1">
                        <UserCircle className="w-3 h-3" /> Gasten
                    </div>
                    <div className="text-2xl font-bold text-purple-400">{stats.guests}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-6">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Alle Inschrijvingen
                        <span className="text-sm font-normal text-text-muted">({filteredRegistrations.length})</span>
                    </h2>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                        {/* User Type Filter */}
                        <select
                            value={userTypeFilter}
                            onChange={(e) => setUserTypeFilter(e.target.value as UserType)}
                            className="px-3 py-2 rounded-lg bg-glass-border/30 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 transition-all min-h-[44px]"
                            aria-label="Filter deelnemers op gebruikerstype"
                        >
                            <option value="all">🔓 Alle types</option>
                            <option value="authenticated">🔐 Met account</option>
                            <option value="guest">👤 Gasten</option>
                        </select>

                        {/* Role Filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as Role)}
                            className="px-3 py-2 rounded-lg bg-glass-border/30 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 min-h-[44px]"
                            aria-label="Filter deelnemers op rol"
                        >
                            <option value="all">Alle rollen</option>
                            <option value="deelnemer">Deelnemer</option>
                            <option value="begeleider">Begeleider</option>
                            <option value="vrijwilliger">Vrijwilliger</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as Status)}
                            className="px-3 py-2 rounded-lg bg-glass-border/30 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 min-h-[44px]"
                            aria-label="Filter deelnemers op betaalstatus"
                        >
                            <option value="all">Alle statussen</option>
                            <option value="paid">Betaald</option>
                            <option value="pending">In behandeling</option>
                            <option value="cancelled">Geannuleerd</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {filteredRegistrations.length === 0 ? (
                    <div className="text-center py-12">
                        <Filter className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <p className="text-text-muted mb-2">Geen resultaten</p>
                        <p className="text-text-muted/60 text-sm">Pas je filters aan om registraties te zien</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-glass-border">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Type & Rol</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Naam</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted hidden md:table-cell">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted hidden lg:table-cell">Afstand</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted hidden lg:table-cell">ICE Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRegistrations.map((reg) => (
                                    <tr key={reg._id} className="border-b border-glass-border/50 hover:bg-white/5 transition-colors">
                                        {/* Type & Rol - Combined Column */}
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col gap-2">
                                                {/* UserType Badge */}
                                                {reg.userType === "authenticated" ? (
                                                    <div className="flex items-center gap-2 text-brand-orange">
                                                        <ShieldCheck className="w-4 h-4" />
                                                        <span className="text-xs font-medium">Account</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-purple-400">
                                                        <UserCircle className="w-4 h-4" />
                                                        <span className="text-xs font-medium">Gast</span>
                                                    </div>
                                                )}
                                                {/* Role Badge */}
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium w-fit ${reg.role === "deelnemer" ? "bg-brand-orange/10 text-brand-orange" :
                                                    reg.role === "begeleider" ? "bg-[rgb(var(--info))]/10 text-[rgb(var(--info))]" :
                                                        "bg-[rgb(var(--success))]/10 text-[rgb(var(--success))]"
                                                    }`}>
                                                    {reg.role.charAt(0).toUpperCase() + reg.role.slice(1)}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Naam */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-text-muted" />
                                                <span className="font-medium text-text-primary">{reg.name}</span>
                                            </div>
                                        </td>
                                        {/* Email - Hidden on mobile */}
                                        <td className="py-4 px-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-text-muted text-sm">
                                                <Mail className="w-4 h-4" />
                                                {reg.email}
                                            </div>
                                        </td>
                                        {/* Afstand - Hidden on mobile/tablet */}
                                        <td className="py-4 px-4 hidden lg:table-cell">
                                            <div className="flex items-center gap-2 text-text-muted">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm">{reg.distance} km</span>
                                            </div>
                                        </td>
                                        {/* Status */}
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${reg.status === "paid" ? "bg-[rgb(var(--success))]/10 text-[rgb(var(--success))]" :
                                                reg.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                                                    "bg-red-500/10 text-red-400"
                                                }`}>
                                                {reg.status === "paid" ? "Betaald" :
                                                    reg.status === "pending" ? "In behandeling" :
                                                        "Geannuleerd"}
                                            </span>
                                        </td>
                                        {/* ICE Contact - Hidden on mobile/tablet */}
                                        <td className="py-4 px-4 text-sm text-text-muted hidden lg:table-cell">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                <div>
                                                    <div className="font-medium text-text-primary">{reg.iceName}</div>
                                                    <div className="text-xs">{reg.icePhone}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
