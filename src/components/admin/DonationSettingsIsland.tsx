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
                <h3 className="text-xl font-bold text-white font-display">Campagnes</h3>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nieuw</span>
                </button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 shadow-inner space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 text-brand-orange mb-2">
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Nieuwe Campagne</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="text-xs text-gray-400 mb-1.5 block">Jaar</label>
                            <input
                                type="text"
                                value={newYear}
                                onChange={(e) => setNewYear(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-orange/50 outline-none transition-colors"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-400 mb-1.5 block">Titel</label>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-orange/50 outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">GoFundMe URL</label>
                        <input
                            type="text"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="https://www.gofundme.com/f/..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-orange/50 outline-none transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Annuleren
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!newUrl || !newYear}
                            className="flex-1 py-2 rounded-lg bg-brand-orange text-white text-sm font-medium shadow-lg shadow-brand-orange/20 hover:bg-orange-500 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            Aanmaken
                        </button>
                    </div>
                </div>
            )}

            {/* Campaign List */}
            <div className="space-y-3">
                {campaigns.length === 0 ? (
                    <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-white/10 text-gray-500">
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
                                    : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
                                }
                            `}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-semibold text-white truncate">{camp.title}</h4>
                                        {camp.is_active && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                LIVE
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
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
                                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                                        }
                                    `}
                                >
                                    {camp.is_active ? <CheckCircle2 className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* URL Editor */}
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 mb-2">
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
                                            w-full bg-black/20 border rounded-lg px-3 py-2 text-xs text-gray-300 outline-none transition-all
                                            ${editingId === camp._id
                                                ? "border-brand-orange/50 text-white bg-black/40"
                                                : "border-white/5 hover:border-white/10"
                                            }
                                        `}
                                    />
                                    <a
                                        href={camp.gofundme_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 hover:border-brand-orange/20 transition-all"
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
