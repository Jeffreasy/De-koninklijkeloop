import React, { useEffect, useState, useCallback, Suspense } from "react";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { $accessToken, logout } from "../../lib/auth";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
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
    ClipboardList, CheckCircle2, MapPinned, UserCheck, AlertTriangle,
    Download, Trash2, FileJson, XCircle, X
} from "lucide-react";
import { routes, loadRoutePoints, START_POINT, type Route, type RoutePoint } from "../../lib/routeData";

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

            {/* Shared: Account & GDPR Section */}
            <SharedAccountSection
                email={data.user.email}
                authUserId={data.user.id}
            />

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

    const [points, setPoints] = useState<RoutePoint[] | null>(null);

    useEffect(() => {
        if (!matchedRoute) return;
        let cancelled = false;
        loadRoutePoints(matchedRoute.id).then(pts => {
            if (!cancelled) setPoints(pts);
        });
        return () => { cancelled = true; };
    }, [matchedRoute?.id]);

    if (!matchedRoute) return null;

    const fullRoute: Route | null = points ? { ...matchedRoute, points } : null;
    const startCoord = points?.[0] ?? START_POINT;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${startCoord.lat},${startCoord.lng}&travelmode=walking`;

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
                    {fullRoute ? (
                        <RouteMapInner route={fullRoute} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-brand-orange bg-surface/50">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    )}
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
// SHARED: ACCOUNT & GDPR SECTION
// ═══════════════════════════════════════════════════

function SharedAccountSection({ email, authUserId }: { email: string; authUserId: string }) {
    const deleteConvexData = useMutation(api.gdpr.deleteUserData);
    const [exporting, setExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteStep, setDeleteStep] = useState<'idle' | 'convex' | 'go' | 'done'>('idle');
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const canConfirmDelete = password.length > 0 && confirmation === 'VERWIJDEREN';

    const handleExport = async () => {
        setExporting(true);
        setExportStatus(null);
        try {
            const goRes = await fetch('/api/auth/account/export', { credentials: 'include' });
            if (!goRes.ok) {
                if (goRes.status === 401) { window.location.href = '/login'; return; }
                throw new Error(`Export mislukt (${goRes.status})`);
            }
            const goData = await goRes.json();

            let convexData = null;
            try {
                const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
                if (convexUrl) {
                    const convex = new ConvexHttpClient(convexUrl);
                    convexData = await convex.query(api.gdpr.exportUserData, { email, authUserId });
                }
            } catch { /* non-blocking */ }

            const exportData = {
                exported_at: new Date().toISOString(),
                gdpr_article: "Art. 20 - Right to Data Portability",
                profile: goData,
                ...(convexData ? { domain_data: convexData } : {}),
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mijn-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setExportStatus({ type: 'success', message: 'Data gedownload!' });
            setTimeout(() => setExportStatus(null), 5000);
        } catch (err) {
            setExportStatus({ type: 'error', message: err instanceof Error ? err.message : 'Export mislukt' });
        } finally {
            setExporting(false);
        }
    };

    const handleDelete = async () => {
        if (!canConfirmDelete) return;
        setDeleting(true);
        setDeleteError(null);

        try {
            setDeleteStep('convex');
            const stats = await deleteConvexData({ email, authUserId });
            console.log('[GDPR] Convex cleanup stats:', stats);

            setDeleteStep('go');
            const res = await fetch('/api/auth/account', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password }),
            });

            if (!res.ok) {
                if (res.status === 401) throw new Error('Onjuist wachtwoord.');
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Verwijdering mislukt (${res.status})`);
            }

            setDeleteStep('done');
            await fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
            setTimeout(() => { window.location.href = '/?account_deleted=true'; }, 1500);
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Er ging iets mis');
            setDeleting(false);
            setDeleteStep('idle');
        }
    };

    const resetDeleteModal = () => {
        setShowDeleteModal(false);
        setPassword('');
        setConfirmation('');
        setDeleteError(null);
        setDeleteStep('idle');
    };

    return (
        <>
            <div className="bg-glass-bg border border-glass-border rounded-xl p-4 md:p-6 space-y-5">
                <h3 className="text-lg font-bold text-text-body flex items-center gap-2">
                    <Shield className="w-5 h-5 text-text-muted" />
                    Mijn Account
                </h3>

                {/* Data Export */}
                <div className="flex items-center justify-between gap-4 p-4 bg-glass-surface/30 rounded-xl border border-glass-border">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-sky-500/15 flex items-center justify-center shrink-0">
                            <FileJson className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-text-body text-sm font-medium">Mijn Data Downloaden</p>
                            <p className="text-text-muted text-xs">Profiel, registraties, donaties als JSON</p>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/80 text-white text-sm font-medium hover:bg-sky-500 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
                    >
                        {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        {exporting ? 'Bezig...' : 'Download'}
                    </button>
                </div>

                {exportStatus && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg text-xs ${exportStatus.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                        {exportStatus.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {exportStatus.message}
                    </div>
                )}

                {/* Danger Zone */}
                <div className="border-t border-glass-border pt-4">
                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                                <Trash2 className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-red-400 text-sm font-medium">Account Verwijderen</p>
                                <p className="text-text-muted text-xs">Permanent en onomkeerbaar</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Verwijderen
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!deleting ? resetDeleteModal : undefined} />
                    <div className="relative w-full max-w-md bg-glass-bg border border-red-500/20 rounded-2xl p-6 shadow-2xl">
                        {deleteStep === 'done' ? (
                            <div className="text-center py-4">
                                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-7 h-7 text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-text-body mb-1">Account Verwijderd</h3>
                                <p className="text-text-muted text-sm">Je wordt doorgestuurd...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                                            <AlertTriangle className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-text-body">Weet je het zeker?</h3>
                                            <p className="text-xs text-text-muted">Dit verwijdert al je data permanent</p>
                                        </div>
                                    </div>
                                    {!deleting && (
                                        <button onClick={resetDeleteModal} className="p-1.5 rounded-lg text-text-muted hover:text-text-body hover:bg-white/5 cursor-pointer">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {deleteError && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4 bg-red-500/10 border border-red-500/20 text-red-400">
                                        <XCircle className="w-4 h-4 shrink-0" />
                                        {deleteError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-2">Bevestig met je wachtwoord</label>
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-glass-surface/50 border border-glass-border rounded-xl text-text-body focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                            placeholder="Je wachtwoord" disabled={deleting} autoFocus />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-2">
                                            Type <span className="font-mono text-red-400 font-bold">VERWIJDEREN</span> ter bevestiging
                                        </label>
                                        <input type="text" value={confirmation} onChange={e => setConfirmation(e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-glass-surface/50 border rounded-xl text-text-body focus:outline-none focus:ring-2 focus:ring-red-500/50 ${confirmation && confirmation !== 'VERWIJDEREN' ? 'border-red-500/40'
                                                : confirmation === 'VERWIJDEREN' ? 'border-green-500/40' : 'border-glass-border'
                                                }`} placeholder="VERWIJDEREN" disabled={deleting} />
                                    </div>

                                    {deleting && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                            {deleteStep === 'convex' && 'Data opruimen...'}
                                            {deleteStep === 'go' && 'Account verwijderen...'}
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button onClick={resetDeleteModal} disabled={deleting}
                                            className="flex-1 px-4 py-2.5 rounded-xl text-text-muted hover:text-text-body hover:bg-white/5 border border-glass-border transition-colors cursor-pointer disabled:opacity-50">
                                            Annuleren
                                        </button>
                                        <button onClick={handleDelete} disabled={!canConfirmDelete || deleting}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/80 text-white font-medium hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            Definitief Verwijderen
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
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
