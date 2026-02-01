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
            <div className="flex items-center justify-center py-20 text-text-muted animate-pulse gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Gegevens ophalen...</span>
            </div>
        );
    }

    // Filter Logic
    const filteredRegistrations = registrations.filter(reg =>
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                    label="Totaal Inschrijvingen"
                    value={registrations.length.toString()}
                    icon={<Users className="w-5 h-5 text-accent-primary" />}
                />
                <StatsCard
                    label="10 KMlopers"
                    value={registrations.filter(r => r.distance === "10").length.toString()}
                    icon={<Map className="w-5 h-5 text-blue-400" />}
                />
                <StatsCard
                    label="Vrijwilligers"
                    value={registrations.filter(r => r.role === "vrijwilliger").length.toString()}
                    icon={<UserCheck className="w-5 h-5 text-green-400" />}
                />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Zoeken op naam of email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-glass-bg border border-glass-border rounded-xl py-2 pl-9 pr-4 text-sm text-text-primary focus:outline-none focus:border-accent-primary/50 transition-colors"
                    />
                </div>
                <div className="text-sm text-text-muted">
                    {filteredRegistrations.length} resultaten
                </div>
            </div>

            {/* Deep Tech Table */}
            <div className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-glass-border bg-glass-bg/50">
                                <th className="py-4 px-6 font-medium text-text-secondary">Naam</th>
                                <th className="py-4 px-6 font-medium text-text-secondary">Email</th>
                                <th className="py-4 px-6 font-medium text-text-secondary">Rol</th>
                                <th className="py-4 px-6 font-medium text-text-secondary">Afstand</th>
                                <th className="py-4 px-6 font-medium text-text-secondary hidden md:table-cell">Registratie</th>
                                <th className="py-4 px-6 font-medium text-text-secondary text-right">Actie</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                            {filteredRegistrations.map((reg) => (
                                <tr key={reg._id} className="group hover:bg-glass-border/30 transition-colors">
                                    <td className="py-4 px-6 font-medium text-text-primary">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary text-xs font-bold">
                                                {reg.name.charAt(0).toUpperCase()}
                                            </div>
                                            {reg.name}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-text-muted">{reg.email}</td>
                                    <td className="py-4 px-6">
                                        <Badge role={reg.role} />
                                    </td>
                                    <td className="py-4 px-6 text-text-primary">
                                        {reg.distance ? `${reg.distance} KM` : "-"}
                                    </td>
                                    <td className="py-4 px-6 text-text-muted hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(reg.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="text-text-muted hover:text-accent-primary transition-colors">
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredRegistrations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-text-muted">
                                        Geen resultaten gevonden voor "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Sub-components for cleanliness
function StatsCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-glass-bg p-5 rounded-2xl border border-glass-border flex items-center justify-between group hover:border-accent-primary/20 transition-colors">
            <div>
                <div className="text-sm font-medium text-text-muted mb-1">{label}</div>
                <div className="text-2xl font-display font-bold text-text-primary">{value}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-glass-border/50 flex items-center justify-center group-hover:bg-accent-primary/10 transition-colors">
                {icon}
            </div>
        </div>
    );
}

function Badge({ role }: { role?: string }) {
    const r = (role || "").toLowerCase();
    let style = "bg-gray-500/10 text-gray-400 border-gray-500/20";

    if (r === "admin") style = "bg-red-500/10 text-red-400 border-red-500/20";
    if (r === "vrijwilliger") style = "bg-green-500/10 text-green-400 border-green-500/20";
    if (r === "begeleider") style = "bg-blue-500/10 text-blue-400 border-blue-500/20";

    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${style} capitalize`}>
            {r.replace("_", " ") || "Onbekend"}
        </span>
    );
}
