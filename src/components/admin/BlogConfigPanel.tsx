import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../../lib/api";
import { Settings, Save, Loader2, CheckCircle } from "lucide-react";

interface BlogConfig {
    enabled: boolean;
    comments_enabled: boolean;
    posts_per_page: number;
}

export default function BlogConfigPanel() {
    const [config, setConfig] = useState<BlogConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const fetchConfig = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiRequest("/blog/config");
            setConfig(data);
        } catch (err) {
            console.error("[BlogConfig] Failed to load:", err);
            setConfig({ enabled: false, comments_enabled: true, posts_per_page: 12 });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConfig(); }, [fetchConfig]);

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        setSaved(false);
        try {
            await apiRequest("/blog/config", {
                method: "POST",
                body: JSON.stringify(config),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("[BlogConfig] Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !config) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
            </div>
        );
    }

    return (
        <div className="premium-glass rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-primary">Blog Configuratie</h3>
                    <p className="text-sm text-text-muted">Beheer blogplatform instellingen</p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Blog Enabled */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-glass-bg/30 border border-glass-border">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Blog Ingeschakeld</p>
                        <p className="text-xs text-text-muted mt-0.5">Maak het blogplatform publiek zichtbaar</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                        className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${config.enabled ? "bg-green-500" : "bg-glass-border"}`}
                        aria-label="Blog inschakelen"
                    >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${config.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                </div>

                {/* Comments Enabled */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-glass-bg/30 border border-glass-border">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Reacties Ingeschakeld</p>
                        <p className="text-xs text-text-muted mt-0.5">Sta bezoekers toe om reacties te plaatsen</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setConfig({ ...config, comments_enabled: !config.comments_enabled })}
                        className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${config.comments_enabled ? "bg-green-500" : "bg-glass-border"}`}
                        aria-label="Reacties inschakelen"
                    >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${config.comments_enabled ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                </div>

                {/* Posts Per Page */}
                <div className="p-4 rounded-xl bg-glass-bg/30 border border-glass-border">
                    <label htmlFor="bc-ppp" className="block text-sm font-medium text-text-primary mb-1">Posts per Pagina</label>
                    <p className="text-xs text-text-muted mb-3">Aantal posts dat getoond wordt op de blogpagina</p>
                    <input
                        id="bc-ppp"
                        type="number"
                        min={1}
                        max={100}
                        value={config.posts_per_page}
                        onChange={(e) => setConfig({ ...config, posts_per_page: parseInt(e.target.value) || 12 })}
                        className="w-24 px-3 py-2 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-base sm:text-sm focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 pt-2">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Opslaan
                </button>
                {saved && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" /> Opgeslagen
                    </span>
                )}
            </div>
        </div>
    );
}
