import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import { addToast } from "../../lib/toast";
import { AdminModal } from "./AdminModal";
import { Loader2, Save } from "lucide-react";

export interface Campaign {
    id: string;
    name: string;
    utm_campaign: string;
    archetype: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
}

const ARCHETYPES = [
    { value: "hero", label: "Hero", desc: "Kracht, overwinning, uitdaging" },
    { value: "ruler", label: "Ruler", desc: "Autoriteit, leiderschap, controle" },
    { value: "caregiver", label: "Caregiver", desc: "Warme, zorgende, ondersteunende toon" },
    { value: "sage", label: "Sage", desc: "Wijsheid, kennis, educatief" },
    { value: "explorer", label: "Explorer", desc: "Avontuur, vrijheid, ontdekking" },
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editingCampaign: Campaign | null;
}

export function XCampaignModal({ isOpen, onClose, onSaved, editingCampaign }: Props) {
    const [name, setName] = useState("");
    const [utmCampaign, setUtmCampaign] = useState("");
    const [archetype, setArchetype] = useState("hero");
    const [active, setActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (editingCampaign) {
            setName(editingCampaign.name);
            setUtmCampaign(editingCampaign.utm_campaign);
            setArchetype(editingCampaign.archetype);
            setActive(editingCampaign.active);
        } else {
            setName("");
            setUtmCampaign("");
            setArchetype("hero");
            setActive(true);
        }
    }, [editingCampaign, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const body = { name, utm_campaign: utmCampaign, archetype, active };
            if (editingCampaign) {
                await apiRequest(`/admin/social/campaigns/${editingCampaign.id}`, {
                    method: "PUT",
                    body: JSON.stringify(body),
                });
            } else {
                await apiRequest("/admin/social/campaigns", {
                    method: "POST",
                    body: JSON.stringify(body),
                });
            }
            addToast(editingCampaign ? "Campagne bijgewerkt" : "Campagne aangemaakt", "success");
            onSaved();
            onClose();
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XCampaign] Save failed:", err);
            addToast("Campagne opslaan mislukt", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingCampaign || !confirm("Weet je zeker dat je deze campagne wilt verwijderen?")) return;
        setDeleting(true);
        try {
            await apiRequest(`/admin/social/campaigns/${editingCampaign.id}`, { method: "DELETE" });
            addToast("Campagne verwijderd", "success");
            onSaved();
            onClose();
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XCampaign] Delete failed:", err);
            addToast("Campagne verwijderen mislukt", "error");
        } finally {
            setDeleting(false);
        }
    };

    // Auto-generate UTM from name
    const handleNameChange = (val: string) => {
        setName(val);
        if (!editingCampaign) {
            setUtmCampaign(val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingCampaign ? "Campagne Bewerken" : "Nieuwe Campagne"}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                    <label htmlFor="xc-name" className="block text-sm font-medium text-text-muted mb-1.5">Campagne Naam</label>
                    <input id="xc-name" type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required
                        className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all text-base md:text-sm"
                        placeholder="bijv. Winterloop 2026" />
                </div>

                {/* UTM */}
                <div>
                    <label htmlFor="xc-utm" className="block text-sm font-medium text-text-muted mb-1.5">UTM Campaign</label>
                    <input id="xc-utm" type="text" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} required
                        className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary font-mono text-base md:text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all"
                        placeholder="winterloop-2026" />
                </div>

                {/* Archetype */}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Storytelling Archetype</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ARCHETYPES.map((a) => (
                            <button
                                key={a.value}
                                type="button"
                                onClick={() => setArchetype(a.value)}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${archetype === a.value
                                    ? "border-brand-orange/50 bg-brand-orange/10"
                                    : "border-glass-border hover:border-glass-border/60 hover:bg-glass-bg/20"
                                    }`}
                            >
                                <p className={`text-sm font-medium ${archetype === a.value ? "text-brand-orange" : "text-text-primary"}`}>{a.label}</p>
                                <p className="text-xs text-text-muted mt-0.5">{a.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setActive(!active)}
                        className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${active ? "bg-green-500" : "bg-glass-border"}`}
                        aria-label="Campagne actief instellen"
                    >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                    <span className="text-sm text-text-muted">{active ? "Actief" : "Inactief"}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-glass-border/50">
                    <div>
                        {editingCampaign && (
                            <button type="button" onClick={handleDelete} disabled={deleting}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {deleting ? "Verwijderen..." : "Verwijderen"}
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-glass-border text-text-muted hover:text-text-primary hover:bg-glass-bg/30 transition-all cursor-pointer text-sm"
                        >
                            Annuleren
                        </button>
                        <button type="submit" disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer disabled:opacity-50 text-sm"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {editingCampaign ? "Bijwerken" : "Aanmaken"}
                        </button>
                    </div>
                </div>
            </form>
        </AdminModal>
    );
}
