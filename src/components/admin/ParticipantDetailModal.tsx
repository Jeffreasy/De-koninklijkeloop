import { X, User, Mail, Phone, MapPin, StickyNote, Save, Trash2, AlertTriangle, Shield, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useStore } from "@nanostores/react";
import { $accessToken } from "../../lib/auth";

type ParticipantRole = "deelnemer" | "begeleider" | "vrijwilliger";
type ParticipantStatus = "pending" | "paid" | "cancelled";
type RouteDistance = "2.5" | "6" | "10" | "15";

interface Registration {
    _id: string;
    name: string;
    email: string;
    role: ParticipantRole;
    distance?: RouteDistance;
    status: ParticipantStatus;
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

    // Form State
    const [formData, setFormData] = useState({
        name: registration.name,
        email: registration.email,
        role: registration.role,
        distance: registration.distance || "6", // Default to 6km
        status: registration.status,
        iceName: registration.iceName || "",
        icePhone: registration.icePhone || "",
        notes: registration.notes || ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const updateRegistration = useAction(api.admin.updateRegistration);
    const deleteRegistration = useAction(api.admin.deleteRegistration);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!accessToken) return;
        setIsLoading(true);
        try {
            await updateRegistration({
                token: accessToken,
                id: registration._id as Id<"registrations">,
                ...formData
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

    // Close on escape + iOS-safe scroll lock
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);

        const scrollY = window.scrollY;
        const body = document.body;
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEsc);
            body.style.position = '';
            body.style.top = '';
            body.style.left = '';
            body.style.right = '';
            body.style.overflow = '';
            window.scrollTo(0, scrollY);
        };
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
                                className="flex-1 px-4 py-2 rounded-xl bg-glass-surface/50 hover:bg-glass-surface text-text-primary transition-colors text-sm font-medium cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full h-dvh md:h-auto max-w-2xl bg-surface/95 dark:bg-surface/90 backdrop-blur-xl md:rounded-2xl border-0 md:border md:border-glass-border shadow-2xl overflow-hidden flex flex-col md:max-h-[90dvh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-glass-border flex items-center justify-between bg-glass-surface/30">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                            Deelnemer Bewerken
                            {registration.userType === 'authenticated' && (
                                <span className="p-1 rounded-full bg-brand-orange/10 text-brand-orange" title="Geverifieerd Account">
                                    <Shield className="w-4 h-4" />
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-text-muted mt-0.5">
                            ID: <span className="font-mono text-xs">{registration._id.slice(-8)}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-glass-surface/50 text-text-muted hover:text-text-primary transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable Form */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain">

                    {/* Primary Info Group */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Persoonlijke Gegevens</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted ml-1">Naam</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all placeholder:text-text-muted/30"
                                        placeholder="Volledige naam"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all placeholder:text-text-muted/30"
                                        placeholder="Email adres"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Participation Details */}
                    <div className="space-y-4 pt-2 border-t border-glass-border/50">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Deelname Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted ml-1">Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => handleChange("role", e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none cursor-pointer appearance-none"
                                >
                                    <option value="deelnemer" className="bg-surface">Deelnemer</option>
                                    <option value="begeleider" className="bg-surface">Begeleider</option>
                                    <option value="vrijwilliger" className="bg-surface">Vrijwilliger</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted ml-1">Afstand</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <select
                                        value={formData.distance}
                                        onChange={(e) => handleChange("distance", e.target.value)}
                                        className="w-full pl-10 pr-8 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none cursor-pointer appearance-none"
                                    >
                                        <option value="2.5" className="bg-surface">2.5 km</option>
                                        <option value="6" className="bg-surface">6 km</option>
                                        <option value="10" className="bg-surface">10 km</option>
                                        <option value="15" className="bg-surface">15 km</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted ml-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                    className={`w-full px-3 py-2 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-brand-orange/50 outline-none cursor-pointer appearance-none ${formData.status === 'paid' ? 'bg-green-500/10 text-green-700 border-green-500/30' :
                                        formData.status === 'pending' ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' :
                                            'bg-red-500/10 text-red-600 border-red-500/30'
                                        }`}
                                >
                                    <option value="paid" className="bg-surface text-text-primary">✅ Geaccepteerd</option>
                                    <option value="pending" className="bg-surface text-text-primary">⏳ In behandeling</option>
                                    <option value="cancelled" className="bg-surface text-text-primary">❌ Geannuleerd</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ICE Contact */}
                    <div className="space-y-4 pt-2 border-t border-glass-border/50">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Noodcontact (ICE)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted ml-1">Naam Contactpersoon</label>
                                <input
                                    type="text"
                                    value={formData.iceName}
                                    onChange={(e) => handleChange("iceName", e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all placeholder:text-text-muted/30"
                                    placeholder="Naam ICE"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted ml-1">Telefoonnummer</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        type="tel"
                                        value={formData.icePhone}
                                        onChange={(e) => handleChange("icePhone", e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-glass-surface/50 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all placeholder:text-text-muted/30"
                                        placeholder="06 12345678"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-3 pt-2 border-t border-glass-border/50">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-2">
                            <StickyNote className="w-3.5 h-3.5" />
                            Interne Notities
                        </h3>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Interne notities voor de organisatie..."
                            className="w-full min-h-[80px] bg-glass-surface/50 border border-glass-border rounded-xl p-3 text-sm text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none resize-none placeholder:text-text-muted/30"
                        />
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-glass-border bg-glass-surface/30 flex items-center justify-between backdrop-blur-md">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium flex items-center gap-2 group"
                    >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">Verwijderen</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-glass-surface/50 transition-colors text-sm font-medium cursor-pointer min-h-[44px]"
                        >
                            Annuleren
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 min-h-[44px]"
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
