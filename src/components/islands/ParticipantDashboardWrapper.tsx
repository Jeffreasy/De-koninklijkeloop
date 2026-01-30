import { useEffect, useState } from "react";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { $accessToken, logout } from "../../lib/auth";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";

export default function ParticipantDashboardWrapper() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            let t = $accessToken.get();

            if (!t) {
                try {
                    // Cookie-based Auth: Fetch the token specifically for Convex integration
                    // This uses the HttpOnly cookie to authenticate this request
                    const { apiRequest } = await import("../../lib/api");
                    const res = await apiRequest("/auth/token");
                    if (res.token) {
                        t = res.token;
                        // Optional: update store, or just use local state? 
                        // Updating store might help other components
                        $accessToken.set(t);
                    }
                } catch (e) {
                    console.error("Failed to recover session:", e);
                }
            }

            if (!t) {
                window.location.href = "/login";
            } else {
                setToken(t);
            }
        };

        initAuth();
    }, []);

    if (!token) return null;

    return (
        <ConvexClientProvider>
            <DashboardContent token={token} />
        </ConvexClientProvider>
    );
}

function DashboardContent({ token }: { token: string }) {
    const getDashboardData = useAction(api.participant.getDashboardData);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const result = await getDashboardData({ token });
                setData(result);
            } catch (err: any) {
                console.error("Dashboard Data Load Error:", err);
                if (err.message.includes("Unauthorized")) {
                    // STOP AUTO-LOGOUT FOR DEBUGGING
                    console.error("Would satisfy logout() condition (Unauthorized), but pausing for debug.");
                    // logout(); 
                    setError("Unauthorized access. Please check console.");
                } else {
                    setError("Kon gegevens niet ophalen.");
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [token, getDashboardData]);

    if (loading) {
        return <div className="text-text-body text-center p-10 animate-pulse">Gegevens laden...</div>;
    }

    if (error) {
        return (
            <div className="text-center space-y-4">
                <div className="text-red-400">{error}</div>
                <Button onClick={() => window.location.reload()} variant="outline">Opnieuw proberen</Button>
            </div>
        );
    }

    if (!data?.registration) {
        return (
            <div className="text-center space-y-4">
                <div className="text-text-muted">Je bent ingelogd, maar we kunnen geen actieve registratie vinden voor dit account.</div>
                <Button onClick={() => logout()} variant="outline">Uitloggen</Button>
            </div>
        );
    }

    const { registration } = data;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Status Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-text-body mb-2">Hallo, {registration.name}! 👋</h2>
                        <p className="text-text-muted">Je bent geregistreerd als <span className="text-text-body font-medium capitalize">{registration.role}</span>.</p>
                    </div>

                    <div className="bg-glass-bg rounded-xl p-6 space-y-4 border border-glass-border">
                        <div className="flex justify-between items-center border-b border-glass-border pb-4">
                            <span className="text-text-muted">Afstand</span>
                            <span className="text-2xl font-bold text-brand-primary">{registration.distance} KM</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-glass-border pb-4">
                            <span className="text-text-muted">Status</span>
                            <StatusBadge status={registration.status} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-text-muted">Ondersteuning</span>
                            <span className="text-text-body capitalize">{registration.supportNeeded}</span>
                        </div>
                    </div>
                </div>

                {/* Actions / Info */}
                <div className="space-y-6">
                    <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-text-body mb-2">🗓️ Zondag 26 April 2026</h3>
                        <p className="text-text-muted text-sm">
                            Zet het in je agenda! Meer informatie over starttijden en routes volgt binnenkort via e-mail.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => logout()} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            Uitloggen
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
        paid: "bg-green-500/20 text-green-400 border-green-500/50",
        cancelled: "bg-red-500/20 text-red-400 border-red-500/50",
    };
    const labels = {
        pending: "In behandeling",
        paid: "Bevestigd",
        cancelled: "Geannuleerd"
    };

    const s = status as keyof typeof styles;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[s] || styles.pending}`}>
            {labels[s] || status}
        </span>
    );
}
