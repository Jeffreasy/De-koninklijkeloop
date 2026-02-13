import React, { useState, useCallback, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { $accessToken } from "../../lib/auth";
import { useStore } from "@nanostores/react";
import {
    ClipboardList, Plus, Trash2, MapPinned, Clock, User,
    CheckCircle2, AlertTriangle, X, Loader2, Search,
    ChevronDown, Calendar
} from "lucide-react";

type TaskStatus = "assigned" | "confirmed" | "completed";

const statusConfig: Record<TaskStatus, { label: string; style: string; icon: typeof ClipboardList }> = {
    assigned: { label: "Toegewezen", style: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30", icon: ClipboardList },
    confirmed: { label: "Bevestigd", style: "bg-blue-500/15 text-blue-600 border-blue-500/30", icon: CheckCircle2 },
    completed: { label: "Afgerond", style: "bg-green-500/15 text-green-600 border-green-500/30", icon: CheckCircle2 },
};

export default function VolunteerTasksManager() {
    const accessToken = useStore($accessToken);
    const getVolunteerTasks = useAction(api.adminTasks.getVolunteerTasks);
    const getVolunteerRegistrations = useAction(api.adminTasks.getVolunteerRegistrations);
    const createTask = useAction(api.adminTasks.createTask);
    const deleteTask = useAction(api.adminTasks.deleteTask);
    const updateStatus = useAction(api.adminTasks.updateTaskStatus);

    const [tasks, setTasks] = useState<any[] | undefined>(undefined);
    const [volunteers, setVolunteers] = useState<any[] | undefined>(undefined);

    const fetchData = useCallback(() => {
        if (!accessToken) return;
        getVolunteerTasks({ token: accessToken }).then(setTasks).catch(console.error);
        getVolunteerRegistrations({ token: accessToken }).then(setVolunteers).catch(console.error);
    }, [accessToken]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const token = $accessToken.get() || "";


    const handleDelete = useCallback(async (taskId: string) => {
        if (!confirm("Weet je zeker dat je deze taak wilt verwijderen?")) return;
        setDeletingId(taskId);
        try {
            await deleteTask({ token, taskId: taskId as any });
        } catch (e) {
            console.error("Delete failed:", e);
        } finally {
            setDeletingId(null);
        }
    }, [token, deleteTask]);

    const handleStatusChange = useCallback(async (taskId: string, newStatus: TaskStatus) => {
        setUpdatingId(taskId);
        try {
            await updateStatus({ token, taskId: taskId as any, status: newStatus });
        } catch (e) {
            console.error("Status update failed:", e);
        } finally {
            setUpdatingId(null);
        }
    }, [token, updateStatus]);

    // Filter + search
    const filteredTasks = (tasks || []).filter(t => {
        if (statusFilter !== "all" && t.status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                t.title.toLowerCase().includes(q) ||
                t.volunteerName.toLowerCase().includes(q) ||
                (t.location || "").toLowerCase().includes(q)
            );
        }
        return true;
    });

    // Stats
    const totalTasks = tasks?.length || 0;
    const confirmedTasks = tasks?.filter(t => t.status === "confirmed").length || 0;
    const completedTasks = tasks?.filter(t => t.status === "completed").length || 0;
    const totalVolunteers = volunteers?.length || 0;

    const isLoading = tasks === undefined;

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Totaal Taken" value={totalTasks} icon={ClipboardList} color="text-brand-orange" />
                <StatCard label="Bevestigd" value={confirmedTasks} icon={CheckCircle2} color="text-blue-600" />
                <StatCard label="Afgerond" value={completedTasks} icon={CheckCircle2} color="text-green-600" />
                <StatCard label="Vrijwilligers" value={totalVolunteers} icon={User} color="text-purple-600" />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Zoek op taak, vrijwilliger of locatie..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all placeholder:text-text-muted/40"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                    {(["all", "assigned", "confirmed", "completed"] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${statusFilter === s
                                ? "bg-brand-orange/15 text-brand-orange border-brand-orange/30"
                                : "bg-glass-bg text-text-muted border-glass-border hover:border-glass-border/80"
                                }`}
                        >
                            {s === "all" ? "Alle" : statusConfig[s].label}
                        </button>
                    ))}
                </div>

                {/* Create Button */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={!volunteers || volunteers.length === 0}
                    className="px-4 py-2.5 rounded-xl bg-green-500 text-white font-medium text-sm hover:bg-green-400 transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                    <Plus className="w-4 h-4" />
                    Taak Toewijzen
                </button>
            </div>

            {/* Tasks Table */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-glass-bg rounded-xl animate-pulse border border-glass-border" />
                    ))}
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-16 text-text-muted">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-1">Geen taken gevonden</p>
                    <p className="text-sm opacity-60">
                        {totalTasks === 0
                            ? "Wijs je eerste taak toe aan een vrijwilliger."
                            : "Probeer een ander zoekfilter."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTasks.map(task => {
                        const config = statusConfig[task.status as TaskStatus] || statusConfig.assigned;
                        const StatusIcon = config.icon;
                        const isDeleting = deletingId === task._id;
                        const isUpdating = updatingId === task._id;

                        return (
                            <div
                                key={task._id}
                                className="bg-glass-bg border border-glass-border rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-glass-border/80 transition-all group"
                            >
                                {/* Task Info */}
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                            <ClipboardList className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-text-primary font-semibold text-sm truncate">
                                                {task.title}
                                            </h4>
                                            {task.description && (
                                                <p className="text-text-muted text-xs mt-0.5 line-clamp-1">{task.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {task.volunteerName}
                                    </span>
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

                                {/* Status + Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Status Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task._id, e.target.value as TaskStatus)}
                                            disabled={isUpdating}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border appearance-none pr-7 cursor-pointer outline-none transition-all ${config.style} ${isUpdating ? "opacity-50" : ""}`}
                                        >
                                            <option value="assigned" className="bg-surface text-text-primary">Toegewezen</option>
                                            <option value="confirmed" className="bg-surface text-text-primary">Bevestigd</option>
                                            <option value="completed" className="bg-surface text-text-primary">Afgerond</option>
                                        </select>
                                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(task._id)}
                                        disabled={isDeleting}
                                        className="p-2 rounded-lg text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all md:opacity-0 md:group-hover:opacity-100 cursor-pointer disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                        aria-label="Verwijder taak"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && volunteers && (
                <CreateTaskModal
                    volunteers={volunteers}
                    token={token}

                    onClose={() => setShowCreateModal(false)}
                    createTask={createTask}
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════

function StatCard({ label, value, icon: Icon, color }: {
    label: string;
    value: number;
    icon: typeof ClipboardList;
    color: string;
}) {
    return (
        <div className="bg-glass-bg border border-glass-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-current/10 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
                <p className="text-xs text-text-muted">{label}</p>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// CREATE TASK MODAL
// ═══════════════════════════════════════════════════

interface Volunteer {
    _id: string;
    name: string;
    email: string;
    distance: string;
    status: string;
}

function CreateTaskModal({
    volunteers,
    token,

    onClose,
    createTask,
}: {
    volunteers: Volunteer[];
    token: string;

    onClose: () => void;
    createTask: any;
}) {
    const [form, setForm] = useState({
        registrationId: "",
        title: "",
        description: "",
        location: "",
        startTime: "",
        endTime: "",
    });
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [volunteerSearch, setVolunteerSearch] = useState("");
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
        modalRef.current?.focus();
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    const filteredVolunteers = volunteers.filter(v => {
        if (!volunteerSearch) return true;
        const q = volunteerSearch.toLowerCase();
        return v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q);
    });

    const handleCreate = async () => {
        if (!form.registrationId || !form.title.trim()) {
            setError("Selecteer een vrijwilliger en vul een taaknaam in.");
            return;
        }
        setIsCreating(true);
        setError(null);
        try {
            await createTask({
                token,

                registrationId: form.registrationId as any,
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                location: form.location.trim() || undefined,
                startTime: form.startTime || undefined,
                endTime: form.endTime || undefined,
            });
            onClose();
        } catch (e: any) {
            setError(e.message || "Er ging iets mis. Probeer het opnieuw.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const selectedVolunteer = volunteers.find(v => v._id === form.registrationId);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-task-title"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />

            <div
                ref={modalRef}
                tabIndex={-1}
                className="relative w-full max-w-lg bg-surface/95 dark:bg-surface/90 backdrop-blur-xl rounded-2xl border border-glass-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 outline-none"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-glass-border flex items-center justify-between bg-glass-bg">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 id="create-task-title" className="text-lg font-bold text-text-primary">
                            Taak Toewijzen
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-glass-surface/50 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        aria-label="Sluit modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-600 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Volunteer Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">
                            Vrijwilliger <span className="text-red-400">*</span>
                        </label>

                        {selectedVolunteer ? (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <User className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-text-primary font-medium text-sm truncate">{selectedVolunteer.name}</p>
                                    <p className="text-text-muted text-xs truncate">{selectedVolunteer.email}</p>
                                </div>
                                <button
                                    onClick={() => handleChange("registrationId", "")}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        value={volunteerSearch}
                                        onChange={(e) => setVolunteerSearch(e.target.value)}
                                        placeholder="Zoek vrijwilliger..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-green-400/50 outline-none placeholder:text-text-muted/40"
                                    />
                                </div>
                                <div className="max-h-40 overflow-y-auto rounded-xl border border-glass-border divide-y divide-glass-border">
                                    {filteredVolunteers.length === 0 ? (
                                        <div className="p-4 text-center text-text-muted text-sm">
                                            Geen vrijwilligers gevonden
                                        </div>
                                    ) : (
                                        filteredVolunteers.map(v => (
                                            <button
                                                key={v._id}
                                                onClick={() => {
                                                    handleChange("registrationId", v._id);
                                                    setVolunteerSearch("");
                                                }}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-glass-surface/30 transition-colors text-left cursor-pointer"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-glass-bg flex items-center justify-center shrink-0">
                                                    <User className="w-3.5 h-3.5 text-text-muted" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-text-primary text-sm font-medium truncate">{v.name}</p>
                                                    <p className="text-text-muted text-xs truncate">{v.email}</p>
                                                </div>
                                                <span className="text-xs text-text-muted shrink-0">{v.distance} KM</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Task Title */}
                    <div className="space-y-1.5">
                        <label htmlFor="task-title" className="text-sm font-medium text-text-primary">
                            Taaknaam <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="task-title"
                            type="text"
                            value={form.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="bijv. Waterpost 3, Medische Post, Looproute Begeleiding"
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-green-400/50 outline-none placeholder:text-text-muted/40"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label htmlFor="task-desc" className="text-sm font-medium text-text-primary">Omschrijving</label>
                        <textarea
                            id="task-desc"
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={2}
                            placeholder="Extra informatie over de taak..."
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-green-400/50 outline-none resize-none placeholder:text-text-muted/40"
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                        <label htmlFor="task-location" className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                            <MapPinned className="w-3.5 h-3.5 text-text-muted" />
                            Locatie
                        </label>
                        <input
                            id="task-location"
                            type="text"
                            value={form.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                            placeholder="bijv. Zuiderpark, Ingang West"
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-green-400/50 outline-none placeholder:text-text-muted/40"
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label htmlFor="task-start" className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-text-muted" />
                                Starttijd
                            </label>
                            <input
                                id="task-start"
                                type="time"
                                value={form.startTime}
                                onChange={(e) => handleChange("startTime", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-green-400/50 outline-none cursor-pointer"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="task-end" className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-text-muted" />
                                Eindtijd
                            </label>
                            <input
                                id="task-end"
                                type="time"
                                value={form.endTime}
                                onChange={(e) => handleChange("endTime", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-green-400/50 outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-glass-border bg-glass-bg flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-glass-surface/50 transition-colors font-medium text-sm cursor-pointer"
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isCreating || !form.registrationId || !form.title.trim()}
                        className="px-6 py-2 rounded-xl bg-green-500 text-white font-medium hover:bg-green-400 transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[40px]"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Toewijzen...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                Taak Toewijzen
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
