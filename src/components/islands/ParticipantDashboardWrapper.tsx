import React, { useEffect, useState, useCallback, Suspense } from "react";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { $accessToken, logout } from "../../lib/auth";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import type { Doc } from "../../../convex/_generated/dataModel";

interface DashboardData {
    user: { email: string; id: string };
    registration: Doc<"registrations"> | null;
}

export default function ParticipantDashboardWrapper() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            let t = $accessToken.get();

            if (!t) {
                try {
                    const { apiRequest } = await import("../../lib/api");
                    const res = await apiRequest("/auth/token");
                    if (res.token) {
                        t = res.token;
                        $accessToken.set(t);
                    }
                } catch (e) {
                    console.error("Session recovery failed:", e);
                }
            }

            if (!t) {
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
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

import ParticipantEditModal from "./ParticipantEditModal";
import { RefreshCw, Edit2, Calendar, MapPin, Footprints, Users, HeartHandshake, Camera, Clock, Navigation, ExternalLink, Shield, Loader2 } from "lucide-react";
import { routes } from "../../lib/routeData";

const RouteMapInner = React.lazy(() => import("./RouteMapInner"));

function DashboardContent({ token }: { token: string }) {
    const getDashboardData = useAction(api.participant.getDashboardData);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const tenantId = import.meta.env.PUBLIC_TENANT_ID ||
        import.meta.env.PUBLIC_DEV_TENANT_ID ||
        "b2727666-7230-4689-b58b-ceab8c2898d5";

    const eventSettings = useQuery(api.eventSettings.getActiveSettings);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getDashboardData({ token, tenantId });
            setData(result);
            setError(null);
        } catch (err: any) {
            console.error("Dashboard load error:", err);
            if (err.message.includes("Unauthorized") || err.message.includes("Auth verification failed")) {
                logout();
                setError("Toegang geweigerd. Log opnieuw in.");
            } else {
                setError("Kon gegevens niet ophalen.");
            }
        } finally {
            setLoading(false);
        }
    }, [token, tenantId, getDashboardData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleLogout = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (e) {
            console.error("Logout failed:", e);
            setIsLoggingOut(false);
        }
    }, []);

    // Skeleton loader
    if (loading && !data) {
        return (
            <div className="space-y-8 animate-pulse" role="status" aria-live="polite" aria-label="Dashboard laden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="h-8 w-48 bg-glass-bg rounded-lg" />
                        <div className="h-5 w-64 bg-glass-bg rounded-lg" />
                        <div className="bg-glass-bg rounded-xl p-6 space-y-4 border border-glass-border">
                            <div className="flex justify-between items-center border-b border-glass-border pb-4">
                                <div className="h-4 w-20 bg-glass-surface/50 rounded" />
                                <div className="h-7 w-16 bg-glass-surface/50 rounded" />
                            </div>
                            <div className="flex justify-between items-center border-b border-glass-border pb-4">
                                <div className="h-4 w-16 bg-glass-surface/50 rounded" />
                                <div className="h-6 w-24 bg-glass-surface/50 rounded-full" />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="h-4 w-28 bg-glass-surface/50 rounded" />
                                <div className="h-4 w-12 bg-glass-surface/50 rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-glass-bg rounded-xl p-6 border border-glass-border h-32" />
                        <div className="h-11 bg-glass-bg rounded-xl" />
                    </div>
                </div>
                <span className="sr-only">Dashboard wordt geladen...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center space-y-4" role="alert">
                <div className="text-red-400">{error}</div>
                <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    aria-label="Probeer opnieuw om gegevens te laden"
                    className="min-h-[44px] cursor-pointer"
                >
                    Opnieuw proberen
                </Button>
            </div>
        );
    }

    if (!data?.registration) {
        return (
            <div className="text-center space-y-4">
                <div className="text-text-muted">
                    Je bent ingelogd, maar we kunnen geen actieve registratie vinden voor dit account.
                </div>
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    disabled={isLoggingOut}
                    aria-label="Uitloggen van je account"
                    className="min-h-[44px] cursor-pointer"
                >
                    {isLoggingOut ? "Uitloggen..." : "Uitloggen"}
                </Button>
            </div>
        );
    }

    const { registration } = data;
    const safeName = registration.name.trim().substring(0, 100);
    const eventDate = eventSettings?.event_date_display || "Datum volgt";

    // Match route data to registration distance
    const matchedRoute = routes.find(r => {
        const dist = registration.distance;
        if (dist === "2.5") return r.id === "2.5km";
        if (dist === "6") return r.id === "6km";
        if (dist === "10") return r.id === "10km";
        if (dist === "15") return r.id === "15km";
        return false;
    });

    const roleLabels: Record<string, { label: string; icon: typeof Users }> = {
        deelnemer: { label: "Deelnemer", icon: Footprints },
        begeleider: { label: "Begeleider", icon: Users },
        vrijwilliger: { label: "Vrijwilliger", icon: HeartHandshake },
    };

    const roleInfo = roleLabels[registration.role] || roleLabels.deelnemer;
    const RoleIcon = roleInfo.icon;

    const registrationDate = new Date(registration.createdAt).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Google Maps directions link using first waypoint
    const googleMapsUrl = matchedRoute
        ? `https://www.google.com/maps/dir/?api=1&destination=${matchedRoute.points[0].lat},${matchedRoute.points[0].lng}&travelmode=walking`
        : null;

    return (
        <div className="space-y-8 animate-fade-in relative z-10" aria-label="Deelnemer dashboard">
            {/* Welcome + Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-text-body mb-2">
                                Hallo, {safeName}!
                            </h2>
                            <div className="flex items-center gap-2 text-text-muted">
                                <RoleIcon className="w-4 h-4 text-brand-orange" />
                                <span>
                                    Geregistreerd als{" "}
                                    <span className="text-text-body font-medium capitalize">
                                        {roleInfo.label}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Registration Details Card */}
                    <div className="bg-glass-bg rounded-xl p-4 md:p-6 space-y-4 border border-glass-border">
                        <div className="flex justify-between items-center border-b border-glass-border pb-4">
                            <span className="text-text-muted">Afstand</span>
                            <span className="text-xl md:text-2xl font-bold text-brand-primary">
                                {registration.distance} KM
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-glass-border pb-4">
                            <span className="text-text-muted">Status</span>
                            <StatusBadge status={registration.status} />
                        </div>
                        <div className="flex justify-between items-center border-b border-glass-border pb-4">
                            <span className="text-text-muted">Ondersteuning</span>
                            <span className="text-text-body capitalize">
                                {registration.supportNeeded || 'Nee'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-glass-border pb-4">
                            <span className="text-text-muted flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> Ingeschreven
                            </span>
                            <span className="text-text-body text-sm">
                                {registrationDate}
                            </span>
                        </div>
                        {registration.agreedToMedia && (
                            <div className="flex justify-between items-center">
                                <span className="text-text-muted flex items-center gap-1.5">
                                    <Camera className="w-3.5 h-3.5" /> Media toestemming
                                </span>
                                <span className="text-green-400 text-sm font-medium">Ja</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Event Info + Actions */}
                <div className="space-y-6">
                    {/* Event Date Card */}
                    <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-4 md:p-6">
                        <h3 className="text-lg font-bold text-text-body mb-2 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-brand-orange" />
                            {eventDate}
                        </h3>
                        {eventSettings?.location_city && (
                            <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
                                <MapPin className="w-4 h-4 text-brand-orange/80" />
                                {eventSettings.location_city}
                            </div>
                        )}
                        <p className="text-text-muted text-sm">
                            Zet het in je agenda! Meer informatie over starttijden en routes volgt binnenkort via e-mail.
                        </p>
                    </div>

                    {/* Emergency Contact Quick View */}
                    {registration.iceName && (
                        <div className="bg-glass-bg border border-glass-border rounded-xl p-4 md:p-6">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-brand-orange" />
                                Noodcontact
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-body font-medium">{registration.iceName}</p>
                                    {registration.icePhone && (
                                        <p className="text-text-muted text-sm">{registration.icePhone}</p>
                                    )}
                                </div>
                                <Button
                                    onClick={() => setShowEditModal(true)}
                                    variant="ghost"
                                    className="text-text-muted hover:text-brand-orange text-xs cursor-pointer"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => setShowEditModal(true)}
                            variant="default"
                            className="bg-brand-orange text-white hover:bg-orange-400 w-full min-h-[44px] shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Edit2 className="w-4 h-4" />
                            Wijzig Gegevens
                        </Button>

                        <div className="flex justify-center md:justify-end">
                            <Button
                                onClick={handleLogout}
                                variant="ghost"
                                disabled={isLoggingOut}
                                aria-label="Uitloggen van je account"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 min-h-[44px] w-full md:w-auto cursor-pointer"
                            >
                                {isLoggingOut ? "Uitloggen..." : "Uitloggen"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Route Card */}
            {matchedRoute && (
                <div className="bg-glass-bg border border-glass-border rounded-xl p-4 md:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-text-body flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-brand-orange" />
                            Jouw Route
                        </h3>
                        <span
                            className="px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: matchedRoute.color }}
                        >
                            {matchedRoute.distance}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <p className="text-text-body font-medium">{matchedRoute.name}</p>
                        <p className="text-text-muted text-sm">{matchedRoute.description}</p>
                    </div>

                    {/* Route Preview Map (Leaflet) */}
                    <div className="rounded-xl overflow-hidden border border-glass-border bg-black/20 h-[280px] md:h-[350px]">
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-full text-brand-orange bg-surface/50">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        }>
                            <RouteMapInner route={matchedRoute} />
                        </Suspense>
                    </div>

                    {googleMapsUrl && (
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-brand-orange hover:text-orange-400 transition-colors font-medium cursor-pointer"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open startpunt in Google Maps
                        </a>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <ParticipantEditModal
                    registration={registration}
                    token={token}
                    tenantId={tenantId}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={loadData}
                />
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config = {
        pending: {
            style: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
            label: "In behandeling"
        },
        paid: {
            style: "bg-green-500/20 text-green-400 border-green-500/50",
            label: "Bevestigd"
        },
        cancelled: {
            style: "bg-red-500/20 text-red-400 border-red-500/50",
            label: "Geannuleerd"
        }
    };

    const { style, label } = config[status as keyof typeof config] || config.pending;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${style}`}>
            {label}
        </span>
    );
}
