import React, { useEffect, useState, useCallback, Suspense } from "react";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { $accessToken, logout } from "../../lib/auth";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import type { Doc } from "../../../convex/_generated/dataModel";

interface DashboardData {
    user: { email: string; id: string };
    registration: Doc<"registrations"> | null;
    linkedDeelnemer: Doc<"registrations"> | null;
    volunteerTasks: Doc<"volunteer_tasks">[];
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
import {
    Edit2, Calendar, MapPin, Footprints, Users, HeartHandshake,
    Camera, Clock, Navigation, ExternalLink, Shield, Loader2,
    ClipboardList, CheckCircle2, MapPinned, UserCheck, AlertTriangle
} from "lucide-react";
import { routes } from "../../lib/routeData";

const RouteMapInner = React.lazy(() => import("./RouteMapInner"));

function DashboardContent({ token }: { token: string }) {
    const getDashboardData = useAction(api.participant.getDashboardData);
    const confirmTask = useAction(api.participant.confirmVolunteerTask);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [confirmingTaskId, setConfirmingTaskId] = useState<string | null>(null);

    const tenantId = import.meta.env.PUBLIC_TENANT_ID ||
        import.meta.env.PUBLIC_DEV_TENANT_ID ||
        "b2727666-7230-4689-b58b-ceab8c2898d5";

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getDashboardData({ token, tenantId });
            setData(result);
            setError(null);
        } catch (err: any) {
            console.error("Dashboard load error:", err);
            if (err.message?.includes("Unauthorized") || err.message?.includes("Auth verification failed")) {
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

    const handleConfirmTask = useCallback(async (taskId: string) => {
        setConfirmingTaskId(taskId);
        try {
            await confirmTask({ token, tenantId, taskId: taskId as any });
            await loadData();
        } catch (e) {
            console.error("Task confirm failed:", e);
        } finally {
            setConfirmingTaskId(null);
        }
    }, [token, tenantId, confirmTask, loadData]);

    // Skeleton loader
    if (loading && !data) {
        return (
            <div className="space-y-8 animate-pulse" role="status" aria-live="polite" aria-label="Dashboard laden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="h-8 w-48 bg-glass-bg rounded-lg" />
                        <div className="h-5 w-64 bg-glass-bg rounded-lg" />
                        <div className="bg-glass-bg rounded-xl p-6 space-y-4 border border-glass-border">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center border-b border-glass-border pb-4">
                                    <div className="h-4 w-20 bg-glass-surface/50 rounded" />
                                    <div className="h-6 w-24 bg-glass-surface/50 rounded-full" />
                                </div>
                            ))}
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
                <Button onClick={() => window.location.reload()} variant="outline" className="min-h-[44px] cursor-pointer">
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
                <Button onClick={handleLogout} variant="outline" disabled={isLoggingOut} className="min-h-[44px] cursor-pointer">
                    {isLoggingOut ? "Uitloggen..." : "Uitloggen"}
                </Button>
            </div>
        );
    }

    const { registration, linkedDeelnemer, volunteerTasks } = data;

    return (
        <div className="space-y-8 animate-fade-in relative z-10" aria-label="Deelnemer dashboard">
            {/* Shared: Welcome + Registration Details */}
            <SharedWelcomeSection
                registration={registration}
                onEdit={() => setShowEditModal(true)}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
            />

            {/* Role-Specific Sections */}
            {registration.role === "begeleider" && (
                <BegeleiderSection
                    registration={registration}
                    linkedDeelnemer={linkedDeelnemer}
                />
            )}

            {registration.role === "vrijwilliger" && (
                <VrijwilligerSection
                    tasks={volunteerTasks}
                    onConfirmTask={handleConfirmTask}
                    confirmingTaskId={confirmingTaskId}
                />
            )}

            {/* Shared: Route Card */}
            <SharedRouteCard registration={registration} />

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

// ═══════════════════════════════════════════════════
// SHARED COMPONENTS (All 3 roles)
// ═══════════════════════════════════════════════════

const roleConfig = {
    deelnemer: { label: "Deelnemer", icon: Footprints, color: "text-brand-orange" },
    begeleider: { label: "Begeleider", icon: Users, color: "text-blue-400" },
    vrijwilliger: { label: "Vrijwilliger", icon: HeartHandshake, color: "text-green-400" },
};

function SharedWelcomeSection({
    registration,
    onEdit,
    onLogout,
    isLoggingOut
}: {
    registration: Doc<"registrations">;
    onEdit: () => void;
    onLogout: () => void;
    isLoggingOut: boolean;
}) {
    const safeName = registration.name.trim().substring(0, 100);
    const role = roleConfig[registration.role] || roleConfig.deelnemer;
    const RoleIcon = role.icon;

    const registrationDate = new Date(registration.createdAt).toLocaleDateString("nl-NL", {
        day: "numeric", month: "long", year: "numeric"
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-text-body mb-2">
                        Hallo, {safeName}!
                    </h2>
                    <div className="flex items-center gap-2 text-text-muted">
                        <RoleIcon className={`w-4 h-4 ${role.color}`} />
                        <span>
                            Geregistreerd als{" "}
                            <span className={`font-medium capitalize ${role.color}`}>
                                {role.label}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Registration Details Card */}
                <div className="bg-glass-bg rounded-xl p-4 md:p-6 space-y-4 border border-glass-border">
                    <DetailRow label="Afstand" value={
                        <span className="text-xl md:text-2xl font-bold text-brand-primary">{registration.distance} KM</span>
                    } />
                    <DetailRow label="Status" value={<StatusBadge status={registration.status} />} />
                    <DetailRow label="Ondersteuning" value={
                        <span className="text-text-body capitalize">{registration.supportNeeded || "Nee"}</span>
                    } />
                    <DetailRow icon={<Clock className="w-3.5 h-3.5" />} label="Ingeschreven" value={
                        <span className="text-text-body text-sm">{registrationDate}</span>
                    } />
                    {registration.agreedToMedia && (
                        <DetailRow icon={<Camera className="w-3.5 h-3.5" />} label="Media toestemming" value={
                            <span className="text-green-400 text-sm font-medium">Ja</span>
                        } border={false} />
                    )}
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                {/* ICE Card */}
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
                            <Button onClick={onEdit} variant="ghost" className="text-text-muted hover:text-brand-orange text-xs cursor-pointer">
                                <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <Button
                        onClick={onEdit}
                        variant="default"
                        className="bg-brand-orange text-white hover:bg-orange-400 w-full min-h-[44px] shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Edit2 className="w-4 h-4" />
                        Wijzig Gegevens
                    </Button>
                    <div className="flex justify-center md:justify-end">
                        <Button
                            onClick={onLogout}
                            variant="ghost"
                            disabled={isLoggingOut}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 min-h-[44px] w-full md:w-auto cursor-pointer"
                        >
                            {isLoggingOut ? "Uitloggen..." : "Uitloggen"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SharedRouteCard({ registration }: { registration: Doc<"registrations"> }) {
    const matchedRoute = routes.find(r => {
        const dist = registration.distance;
        if (dist === "2.5") return r.id === "2.5km";
        if (dist === "6") return r.id === "6km";
        if (dist === "10") return r.id === "10km";
        if (dist === "15") return r.id === "15km";
        return false;
    });

    if (!matchedRoute) return null;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${matchedRoute.points[0].lat},${matchedRoute.points[0].lng}&travelmode=walking`;

    return (
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

            <div className="rounded-xl overflow-hidden border border-glass-border bg-black/20 h-[280px] md:h-[350px]">
                <Suspense fallback={
                    <div className="flex items-center justify-center h-full text-brand-orange bg-surface/50">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                }>
                    <RouteMapInner route={matchedRoute} />
                </Suspense>
            </div>

            <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-brand-orange hover:text-orange-400 transition-colors font-medium cursor-pointer"
            >
                <ExternalLink className="w-4 h-4" />
                Open startpunt in Google Maps
            </a>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// BEGELEIDER-SPECIFIC SECTION
// ═══════════════════════════════════════════════════

function BegeleiderSection({
    registration,
    linkedDeelnemer
}: {
    registration: Doc<"registrations">;
    linkedDeelnemer: Doc<"registrations"> | null;
}) {
    return (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 md:p-6 space-y-4">
            <h3 className="text-lg font-bold text-text-body flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Mijn Deelnemer(s)
            </h3>

            {registration.companionName || registration.companionEmail ? (
                <div className="space-y-4">
                    {/* Companion Info Card */}
                    <div className="bg-glass-bg border border-glass-border rounded-xl p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                            <UserCheck className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-text-body font-medium">
                                {registration.companionName || "Naam niet opgegeven"}
                            </p>
                            {registration.companionEmail && (
                                <p className="text-text-muted text-sm truncate">
                                    {registration.companionEmail}
                                </p>
                            )}
                            {/* Show linked deelnemer status if found */}
                            {linkedDeelnemer ? (
                                <div className="mt-2 flex items-center gap-2">
                                    <StatusBadge status={linkedDeelnemer.status} />
                                    <span className="text-text-muted text-xs">
                                        {linkedDeelnemer.distance} KM
                                    </span>
                                </div>
                            ) : registration.companionEmail ? (
                                <p className="text-yellow-400/80 text-xs mt-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Nog geen registratie gevonden voor dit e-mailadres
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 text-text-muted">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Je hebt nog geen deelnemer gekoppeld.</p>
                    <p className="text-xs mt-1 opacity-60">
                        Gebruik "Wijzig Gegevens" om de naam en het e-mailadres van je deelnemer in te vullen.
                    </p>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// VRIJWILLIGER-SPECIFIC SECTION
// ═══════════════════════════════════════════════════

const taskStatusConfig = {
    assigned: { label: "Toegewezen", style: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: ClipboardList },
    confirmed: { label: "Bevestigd", style: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle2 },
    completed: { label: "Afgerond", style: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
};

function VrijwilligerSection({
    tasks,
    onConfirmTask,
    confirmingTaskId
}: {
    tasks: Doc<"volunteer_tasks">[];
    onConfirmTask: (taskId: string) => void;
    confirmingTaskId: string | null;
}) {
    return (
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-body flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-green-400" />
                    Mijn Taken
                </h3>
                {tasks.length > 0 && (
                    <span className="text-xs text-text-muted bg-glass-bg px-2 py-1 rounded-full border border-glass-border">
                        {tasks.filter(t => t.status === "confirmed" || t.status === "completed").length}/{tasks.length} bevestigd
                    </span>
                )}
            </div>

            {tasks.length > 0 ? (
                <div className="space-y-3">
                    {tasks.map(task => {
                        const config = taskStatusConfig[task.status] || taskStatusConfig.assigned;
                        const StatusIcon = config.icon;
                        const isConfirming = confirmingTaskId === task._id;

                        return (
                            <div key={task._id} className="bg-glass-bg border border-glass-border rounded-xl p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-text-body font-medium">{task.title}</p>
                                        {task.description && (
                                            <p className="text-text-muted text-sm mt-1">{task.description}</p>
                                        )}
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 flex items-center gap-1 ${config.style}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {config.label}
                                    </span>
                                </div>

                                {/* Time & Location */}
                                <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                                    {(task.startTime || task.endTime) && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {task.startTime}{task.endTime ? ` – ${task.endTime}` : ""}
                                        </span>
                                    )}
                                    {task.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPinned className="w-3 h-3" />
                                            {task.location}
                                        </span>
                                    )}
                                </div>

                                {/* Confirm Button (only for "assigned" tasks) */}
                                {task.status === "assigned" && (
                                    <Button
                                        onClick={() => onConfirmTask(task._id)}
                                        disabled={isConfirming}
                                        variant="ghost"
                                        className="text-green-400 hover:text-green-300 hover:bg-green-500/10 text-xs w-full min-h-[36px] cursor-pointer"
                                    >
                                        {isConfirming ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                        ) : (
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                        )}
                                        {isConfirming ? "Bevestigen..." : "Bevestig Deelname"}
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-6 text-text-muted">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Er zijn nog geen taken aan je toegewezen.</p>
                    <p className="text-xs mt-1 opacity-60">
                        De organisatie zal binnenkort taken toewijzen. Check regelmatig terug!
                    </p>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════

function DetailRow({
    label,
    value,
    icon,
    border = true
}: {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
    border?: boolean;
}) {
    return (
        <div className={`flex justify-between items-center ${border ? "border-b border-glass-border pb-4" : ""}`}>
            <span className="text-text-muted flex items-center gap-1.5">
                {icon}
                {label}
            </span>
            {value}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config = {
        pending: { style: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", label: "In behandeling" },
        paid: { style: "bg-green-500/20 text-green-400 border-green-500/50", label: "Bevestigd" },
        cancelled: { style: "bg-red-500/20 text-red-400 border-red-500/50", label: "Geannuleerd" },
    };
    const { style, label } = config[status as keyof typeof config] || config.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${style}`}>{label}</span>;
}
