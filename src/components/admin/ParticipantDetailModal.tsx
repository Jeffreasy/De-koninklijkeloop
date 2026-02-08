import { X, User, Mail, Phone, MapPin, Calendar, CreditCard, Shield, StickyNote, Save, Trash2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useStore } from "@nanostores/react";
import { $accessToken } from "../../lib/auth";

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
}

interface Props {
    registration: Registration;
    onClose: () => void;
    onUpdate: () => void;
}

export default function ParticipantDetailModal({ registration, onClose, onUpdate }: Props) {
    const accessToken = useStore($accessToken);
    const [notes, setNotes] = useState(registration.notes || "");
    const [status, setStatus] = useState(registration.status);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const updateRegistration = useAction(api.admin.updateRegistration);
    const deleteRegistration = useAction(api.admin.deleteRegistration);

    const handleSave = async () => {
        if (!accessToken) return;
        setIsLoading(true);
        try {
            await updateRegistration({
                token: accessToken,
                id: registration._id as Id<"registrations">,
                status,
                notes
            });
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to update registration", error);
            alert("Kon wijzigingen niet opslaan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!accessToken) return;
        setIsLoading(true);
        setIsDeleting(true);
        try {
            await deleteRegistration({
                token: accessToken,
                id: registration._id as Id<"registrations">
            });
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error("Failed to delete registration", error);
            alert(`Kon registratie niet verwijderen: ${error.message || "Onbekende fout"}`);
            setIsDeleting(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (showDeleteConfirm) {
        return (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
                <div className="relative bg-surface border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">Registratie Verwijderen?</h3>
                            <p className="text-sm text-text-muted mt-1">
                                Weet je zeker dat je <strong>{registration.name}</strong> wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full mt-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-primary transition-colors text-sm font-medium"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                {isDeleting ? "Verwijderen..." : "Verwijderen"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-2xl bg-surface/95 dark:bg-surface/90 backdrop-blur-xl rounded-2xl border border-glass-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-glass-border flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                            {registration.name}
                            {registration.userType === 'authenticated' && (
                                <span className="p-1 rounded-full bg-brand-orange/10 text-brand-orange" title="Geverifieerd Account">
                                    <Shield className="w-4 h-4" />
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-text-muted flex items-center gap-2 mt-1">
                            <span>ID: <span className="font-mono text-xs">{registration._id.slice(-8)}</span></span>
                            <span>•</span>
                            <span>{new Date(registration.createdAt).toLocaleDateString()}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Key Stats / Status Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Status Selection */}
                        <div className="p-4 rounded-xl bg-white/5 border border-glass-border space-y-3">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                <Shield className="w-4 h-4 text-brand-orange" />
                                Deelname Status
                            </label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-app-bg px-4 py-3 rounded-xl border border-glass-border text-text-primary text-sm font-medium focus:ring-2 focus:ring-brand-orange/50 transition-all outline-none appearance-none"
                                >
                                    <option value="paid" className="bg-slate-900 text-gray-100">✅ Geaccepteerd</option>
                                    <option value="pending" className="bg-slate-900 text-gray-100">⏳ In behandeling</option>
                                    <option value="cancelled" className="bg-slate-900 text-gray-100">❌ Geannuleerd</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Distance Display (Could be editable) */}
                        <div className="p-4 rounded-xl bg-white/5 border border-glass-border space-y-2">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Afstand & Rol
                            </label>
                            <div className="flex items-center gap-2 text-text-primary font-medium">
                                <div className="px-2.5 py-1 rounded-md bg-brand-orange/10 text-brand-orange text-sm">
                                    {registration.distance || 'N/A'} km
                                </div>
                                <span className="text-text-muted">•</span>
                                <div className="text-sm capitalize">
                                    {registration.role}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-text-primary border-b border-glass-border pb-2">
                            Contactgegevens
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-text-muted text-xs">Email</span>
                                <div className="flex items-center gap-2 text-text-primary font-medium truncate">
                                    <Mail className="w-4 h-4 text-text-muted shrink-0" />
                                    <a href={`mailto:${registration.email}`} className="hover:text-brand-orange hover:underline truncate">
                                        {registration.email}
                                    </a>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-text-muted text-xs">Telefoon (N/A)</span>
                                <div className="flex items-center gap-2 text-text-muted italic">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span>Niet opgegeven</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ICE Contact */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-text-primary border-b border-glass-border pb-2">
                            Noodcontact (ICE)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-text-muted text-xs">Naam</span>
                                <div className="flex items-center gap-2 text-text-primary font-medium">
                                    <User className="w-4 h-4 text-text-muted shrink-0" />
                                    <span>{registration.iceName || '-'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-text-muted text-xs">Telefoonnummer</span>
                                <div className="flex items-center gap-2 text-text-primary font-medium">
                                    <Phone className="w-4 h-4 text-text-muted shrink-0" />
                                    <a href={`tel:${registration.icePhone}`} className="hover:text-brand-orange hover:underline">
                                        {registration.icePhone || '-'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-text-primary border-b border-glass-border pb-2 flex items-center gap-2">
                            <StickyNote className="w-4 h-4" />
                            Admin Notities
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Voeg interne opmerkingen toe..."
                            className="w-full min-h-[100px] bg-white/5 border border-glass-border rounded-xl p-3 text-sm text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none resize-none placeholder:text-text-muted/50"
                        />
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-glass-border bg-white/5 flex items-center justify-between">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Verwijderen
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Annuleren
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-6 py-2 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-colors shadow-lg shadow-brand-orange/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading && !isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Opslaan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Opslaan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
