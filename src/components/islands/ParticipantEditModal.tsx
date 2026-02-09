import { X, User, Phone, AlertCircle, Save } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface Registration {
    iceName?: string;
    icePhone?: string;
    supportNeeded?: string;
    supportDescription?: string;
}

interface Props {
    registration: Registration;
    token: string;
    tenantId: string;
    onClose: () => void;
    onUpdate: () => void;
}

export default function ParticipantEditModal({ registration, token, tenantId, onClose, onUpdate }: Props) {
    const [formData, setFormData] = useState({
        iceName: registration.iceName || "",
        icePhone: registration.icePhone || "",
        supportNeeded: registration.supportNeeded || "nee",
        supportDescription: registration.supportDescription || ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const updateProfile = useAction(api.participant.updateProfile);

    // Escape key + scroll lock
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        // Focus trap: focus the modal on mount
        modalRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await updateProfile({
                token,
                tenantId,
                iceName: formData.iceName,
                icePhone: formData.icePhone,
                supportNeeded: formData.supportNeeded as "ja" | "nee" | "anders",
                supportDescription: formData.supportDescription
            });
            onUpdate();
            onClose();
        } catch (err: any) {
            console.error("Update failed", err);
            setError("Er ging iets mis bij het opslaan. Probeer het later opnieuw.");
        } finally {
            setIsLoading(false);
        }
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
        >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                onClick={onClose}
                aria-label="Sluit modal"
            />

            <div
                ref={modalRef}
                tabIndex={-1}
                className="relative w-full max-w-lg bg-surface/95 dark:bg-surface/90 backdrop-blur-xl rounded-2xl border border-glass-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 outline-none"
            >

                {/* Header */}
                <div className="px-6 py-4 border-b border-glass-border flex items-center justify-between bg-glass-bg">
                    <h2 id="edit-modal-title" className="text-xl font-bold text-text-primary">Gegevens Wijzigen</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-glass-surface/50 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        aria-label="Sluit modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* ICE Contact */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider border-b border-glass-border pb-2">
                            Noodcontact (ICE)
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="edit-iceName" className="text-sm font-medium text-text-primary">Naam Contactpersoon</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        id="edit-iceName"
                                        type="text"
                                        value={formData.iceName}
                                        onChange={(e) => handleChange("iceName", e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all placeholder:text-text-muted/30"
                                        placeholder="Naam van contactpersoon"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="edit-icePhone" className="text-sm font-medium text-text-primary">Telefoonnummer</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        id="edit-icePhone"
                                        type="tel"
                                        value={formData.icePhone}
                                        onChange={(e) => handleChange("icePhone", e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all placeholder:text-text-muted/30"
                                        placeholder="06 12345678"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider border-b border-glass-border pb-2">
                            Medische / Ondersteuning Info
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="edit-support" className="text-sm font-medium text-text-primary">Heb je extra ondersteuning nodig?</label>
                                <select
                                    id="edit-support"
                                    value={formData.supportNeeded}
                                    onChange={(e) => handleChange("supportNeeded", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none cursor-pointer appearance-none"
                                >
                                    <option value="nee" className="bg-surface text-text-primary">Nee</option>
                                    <option value="ja" className="bg-surface text-text-primary">Ja</option>
                                    <option value="anders" className="bg-surface text-text-primary">Anders</option>
                                </select>
                            </div>

                            {(formData.supportNeeded === 'ja' || formData.supportNeeded === 'anders') && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                    <label htmlFor="edit-supportDesc" className="text-sm font-medium text-text-primary">Toelichting</label>
                                    <textarea
                                        id="edit-supportDesc"
                                        value={formData.supportDescription}
                                        onChange={(e) => handleChange("supportDescription", e.target.value)}
                                        className="w-full min-h-[100px] px-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none resize-none placeholder:text-text-muted/30"
                                        placeholder="Beschrijf hier wat we moeten weten..."
                                    />
                                </div>
                            )}
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
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 cursor-pointer"
                    >
                        {isLoading ? (
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
    );

    return createPortal(modalContent, document.body);
}
