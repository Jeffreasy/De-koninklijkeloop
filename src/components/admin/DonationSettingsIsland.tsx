import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { addToast } from "../../lib/toast";
import { ConvexClientProvider } from "../islands/ConvexClientProvider";
import { Plus, Calendar, Link as LinkIcon, ExternalLink, Activity, CheckCircle2, AlertCircle } from "lucide-react";

function DonationSettingsContent() {
    const campaigns = useQuery(api.donations.getAllCampaigns) || [];
    const createCampaign = useMutation(api.donations.createCampaign);
    const updateCampaign = useMutation(api.donations.updateCampaign);
    const toggleActive = useMutation(api.donations.toggleActive);

    const [isCreating, setIsCreating] = useState(false);
    const [newYear, setNewYear] = useState("2026");
    const [newTitle, setNewTitle] = useState("Samen in Actie 2026");
    const [newUrl, setNewUrl] = useState("");

    // UI State for edits
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleCreate = async () => {
        try {
            await createCampaign({
                year: newYear,
                title: newTitle,
                gofundme_url: newUrl,
                target_amount: 0,
            });
            addToast("Nieuwe campagne aangemaakt!", "success");
            setIsCreating(false);
            setNewYear("2027");
            setNewUrl("");
        } catch (e) {
            addToast("Fout bij aanmaken campagne", "error");
            console.error(e);
        }
    };

    const handleToggle = async (id: any) => {
        try {
            await toggleActive({ id });
            addToast("Actieve campagne gewijzigd", "success");
        } catch (e) {
            addToast("Kon campagne niet activeren", "error");
        }
    };

    const handleUpdateUrl = async (id: any, url: string) => {
        try {
            await updateCampaign({ id, gofundme_url: url });
            addToast("URL bijgewerkt", "success");
            setEditingId(null);
        } catch (e) {
            addToast("Update mislukt", "error");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-primary font-display">Campagnes</h3>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-glass-surface/50 border border-glass-border text-sm font-medium text-text-primary hover:bg-glass-surface transition-all cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nieuw</span>
                </button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <div className="p-5 rounded-2xl bg-glass-bg border border-glass-border shadow-inner space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 text-brand-orange mb-2">
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Nieuwe Campagne</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="text-xs text-text-muted mb-1.5 block">Jaar</label>
                            <input
                                type="text"
                                value={newYear}
                                onChange={(e) => setNewYear(e.target.value)}
                                className="w-full bg-glass-surface/30 border border-glass-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-orange/50 outline-none transition-colors"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-text-muted mb-1.5 block">Titel</label>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full bg-glass-surface/30 border border-glass-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-orange/50 outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-text-muted mb-1.5 block">GoFundMe URL</label>
                        <input
                            type="text"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="https://www.gofundme.com/f/..."
                            className="w-full bg-glass-surface/30 border border-glass-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-orange/50 outline-none transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="flex-1 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-glass-surface/50 transition-colors cursor-pointer"
                        >
                            Annuleren
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!newUrl || !newYear}
                            className="flex-1 py-2 rounded-lg bg-brand-orange text-white text-sm font-medium shadow-lg shadow-brand-orange/20 hover:bg-orange-500 transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer"
                        >
                            Aanmaken
                        </button>
                    </div>
                </div>
            )}

            {/* Campaign List */}
            <div className="space-y-3">
                {campaigns.length === 0 ? (
                    <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-glass-border text-text-muted">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nog geen campagnes gevonden.</p>
                    </div>
                ) : (
                    campaigns.map((camp: any) => (
                        <div
                            key={camp._id}
                            className={`
                                group relative p-4 rounded-2xl border transition-all duration-300
                                ${camp.is_active
                                    ? "bg-linear-to-br from-brand-orange/10 to-transparent border-brand-orange/30 shadow-lg shadow-brand-orange/5"
                                    : "bg-glass-surface/50 border-glass-border/50 hover:border-glass-border hover:bg-glass-surface"
                                }
                            `}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-semibold text-text-primary truncate">{camp.title}</h4>
                                        {camp.is_active && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                LIVE
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-text-muted">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {camp.year}
                                        </span>
                                        {camp.is_active ? (
                                            <span className="text-brand-orange flex items-center gap-1">
                                                <Activity className="w-3 h-3" />
                                                Actief op site
                                            </span>
                                        ) : (
                                            <span>Archief</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleToggle(camp._id)}
                                    disabled={camp.is_active}
                                    title={camp.is_active ? "Dit is de actieve campagne" : "Maak deze campagne actief"}
                                    className={`
                                        shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all
                                        ${camp.is_active
                                            ? "bg-green-500 text-white cursor-default shadow-md shadow-green-500/20"
                                            : "bg-glass-surface/50 text-text-muted hover:bg-glass-surface hover:text-text-primary border border-glass-border/50 cursor-pointer"
                                        }
                                    `}
                                >
                                    {camp.is_active ? <CheckCircle2 className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* URL Editor */}
                            <div className="mt-4 pt-4 border-t border-glass-border/50">
                                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-muted mb-2">
                                    <LinkIcon className="w-3 h-3" />
                                    Widget URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        defaultValue={camp.gofundme_url}
                                        onFocus={() => setEditingId(camp._id)}
                                        onBlur={(e) => {
                                            if (e.target.value !== camp.gofundme_url) {
                                                handleUpdateUrl(camp._id, e.target.value);
                                            }
                                            setEditingId(null);
                                        }}
                                        className={`
                                            w-full bg-glass-surface/30 border rounded-lg px-3 py-2 text-xs text-text-secondary outline-none transition-all
                                            ${editingId === camp._id
                                                ? "border-brand-orange/50 text-text-primary bg-glass-bg"
                                                : "border-glass-border/50 hover:border-glass-border"
                                            }
                                        `}
                                    />
                                    <a
                                        href={camp.gofundme_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-glass-surface/50 border border-glass-border/50 text-text-muted hover:text-brand-orange hover:bg-brand-orange/10 hover:border-brand-orange/20 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default function DonationSettingsIsland() {
    return (
        <ConvexClientProvider>
            <DonationSettingsContent />
        </ConvexClientProvider>
    );
}
