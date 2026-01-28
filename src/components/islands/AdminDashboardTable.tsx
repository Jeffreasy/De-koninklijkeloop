import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { $user, $accessToken } from "../../lib/auth";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export default function AdminDashboardTable() {
    // Check local auth (LaventeCare)
    const user = useStore($user);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Simple client-side protection
        if (!user && window.location.pathname.startsWith('/admin')) {
            // In a real app, we would also verify token validity with backend
            // For now, redirect to login if no user in store
            // window.location.href = "/login";
        }
    }, [user]);

    // Fetch data using Action (Secure)
    const getRegistrations = useAction(api.admin.getRegistrations);
    const [registrations, setRegistrations] = useState<any[] | undefined>(undefined);
    const accessToken = useStore($accessToken);

    useEffect(() => {
        if (accessToken) {
            getRegistrations({ token: accessToken })
                .then(data => setRegistrations(data))
                .catch(err => console.error("Auth Failed", err));
        }
    }, [accessToken, getRegistrations]);

    if (!isMounted) return null;

    if (!user) {
        return (
            <div className="text-center py-20 space-y-4">
                <h2 className="text-xl font-bold">Toegang Geweigerd</h2>
                <p className="text-text-muted">Je moet ingelogd zijn om deze pagina te bekijken.</p>
                <a href="/login"><Button>Inloggen</Button></a>
            </div>
        )
    }

    if (registrations === undefined) {
        return <div className="text-text-muted">Data laden...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-4 mb-6">
                <div className="bg-glass-bg p-4 rounded-xl border border-glass-border">
                    <div className="text-sm text-text-muted">Totaal Inschrijvingen</div>
                    <div className="text-2xl font-bold text-text-body">{registrations.length}</div>
                </div>
                <div className="bg-glass-bg p-4 rounded-xl border border-glass-border">
                    <div className="text-sm text-text-muted">Totaal 10KM</div>
                    <div className="text-2xl font-bold text-text-body">
                        {registrations.filter(r => r.distance === "10").length}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-text-muted border-b border-glass-border">
                        <tr>
                            <th className="pb-3 px-4">Naam</th>
                            <th className="pb-3 px-4">Email</th>
                            <th className="pb-3 px-4">Rol</th>
                            <th className="pb-3 px-4">Afstand</th>
                            <th className="pb-3 px-4">Support</th>
                            <th className="pb-3 px-4">Datum</th>
                        </tr>
                    </thead>
                    <tbody className="text-text-body">
                        {registrations.map((reg) => (
                            <tr key={reg._id} className="border-b border-glass-border hover:bg-glass-bg transition-colors">
                                <td className="py-3 px-4 font-medium">{reg.name}</td>
                                <td className="py-3 px-4 text-text-muted">{reg.email}</td>
                                <td className="py-3 px-4 capitalize">{(reg.role || "").replace("_", " ")}</td>
                                <td className="py-3 px-4">{reg.distance} KM</td>
                                <td className="py-3 px-4">{reg.supportNeeded}</td>
                                <td className="py-3 px-4 text-text-muted">
                                    {new Date(reg.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {registrations.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-text-muted">
                                    Nog geen inschrijvingen.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
