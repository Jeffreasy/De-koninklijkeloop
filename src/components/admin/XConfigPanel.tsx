import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../../lib/api";
import { addToast } from "../../lib/toast";
import { Shield, Trash2, TestTube, Save, Loader2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

interface XConfig {
    configured: boolean;
    api_key_masked?: string;
    access_token_masked?: string;
    enabled?: boolean;
}

export default function XConfigPanel() {
    const [config, setConfig] = useState<XConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [testResult, setTestResult] = useState<{ status: string; message?: string; error?: string } | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [apiKey, setApiKey] = useState("");
    const [apiSecret, setApiSecret] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [accessSecret, setAccessSecret] = useState("");
    const [enabled, setEnabled] = useState(true);

    const fetchConfig = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiRequest("/admin/x-config");
            setConfig(data);
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XConfig] Failed to load:", err);
            setConfig({ configured: false });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConfig(); }, [fetchConfig]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTestResult(null);
        try {
            await apiRequest("/admin/x-config", {
                method: "POST",
                body: JSON.stringify({
                    api_key: apiKey,
                    api_secret: apiSecret,
                    access_token: accessToken,
                    access_secret: accessSecret,
                    enabled,
                }),
            });
            addToast("X configuratie opgeslagen", "success");
            setShowForm(false);
            setApiKey(""); setApiSecret(""); setAccessToken(""); setAccessSecret("");
            await fetchConfig();
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XConfig] Save failed:", err);
            const message = err instanceof Error ? err.message : "Opslaan mislukt";
            setTestResult({ status: "failed", error: message });
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const data = await apiRequest("/admin/x-config/test", { method: "POST" });
            setTestResult(data);
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XConfig] Test failed:", err);
            const message = err instanceof Error ? err.message : "Verbinding testen mislukt";
            setTestResult({ status: "failed", error: message });
        } finally {
            setTesting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Weet je zeker dat je de X configuratie wilt verwijderen?")) return;
        setDeleting(true);
        try {
            await apiRequest("/admin/x-config", { method: "DELETE" });
            addToast("X configuratie verwijderd", "success");
            setConfig({ configured: false });
            setTestResult(null);
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XConfig] Delete failed:", err);
            const message = err instanceof Error ? err.message : "Verwijderen mislukt";
            setTestResult({ status: "failed", error: message });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <div className="premium-glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">X / Twitter Configuratie</h3>
                        <p className="text-sm text-text-muted">OAuth credentials voor automatisch posten</p>
                    </div>
                </div>

                {config?.configured ? (
                    <div className="space-y-4">
                        {/* Credential display */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-glass-bg/30 border border-glass-border">
                                <p className="text-xs text-text-muted mb-1">API Key</p>
                                <p className="text-sm font-mono text-text-primary">{config.api_key_masked}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-glass-bg/30 border border-glass-border">
                                <p className="text-xs text-text-muted mb-1">Access Token</p>
                                <p className="text-sm font-mono text-text-primary">{config.access_token_masked}</p>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${config.enabled ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="text-sm text-text-muted">
                                {config.enabled ? "Actief" : "Uitgeschakeld"}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                onClick={handleTest}
                                disabled={testing}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-all text-sm font-medium cursor-pointer disabled:opacity-50"
                            >
                                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                                Test Verbinding
                            </button>
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange hover:bg-brand-orange/20 transition-all text-sm font-medium cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                Bijwerken
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium cursor-pointer disabled:opacity-50"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Verwijderen
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 space-y-4">
                        <p className="text-text-muted">Nog niet geconfigureerd. Voeg je X API credentials toe om te beginnen.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer"
                        >
                            <Shield className="w-4 h-4" />
                            Configureren
                        </button>
                    </div>
                )}

                {/* Test Result */}
                {testResult && (
                    <div className={`mt-4 p-4 rounded-xl border ${testResult.status === "success"
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-red-500/10 border-red-500/20"
                        }`}>
                        <div className="flex items-center gap-2">
                            {testResult.status === "success"
                                ? <CheckCircle className="w-5 h-5 text-green-400" />
                                : <XCircle className="w-5 h-5 text-red-400" />
                            }
                            <p className={`text-sm font-medium ${testResult.status === "success" ? "text-green-400" : "text-red-400"}`}>
                                {testResult.message || testResult.error}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Credential Form */}
            {showForm && (
                <div className="premium-glass rounded-2xl p-6">
                    <h4 className="text-base font-bold text-text-primary mb-4">API Credentials Invoeren</h4>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="xc-api-key" className="block text-sm font-medium text-text-muted mb-1.5">API Key</label>
                                <input id="xc-api-key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} required
                                    className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all text-sm"
                                    placeholder="Jouw X API Key" />
                            </div>
                            <div>
                                <label htmlFor="xc-api-secret" className="block text-sm font-medium text-text-muted mb-1.5">API Secret</label>
                                <input id="xc-api-secret" type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} required
                                    className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all text-sm"
                                    placeholder="Jouw X API Secret" />
                            </div>
                            <div>
                                <label htmlFor="xc-access-token" className="block text-sm font-medium text-text-muted mb-1.5">Access Token</label>
                                <input id="xc-access-token" type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} required
                                    className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all text-sm"
                                    placeholder="Jouw Access Token" />
                            </div>
                            <div>
                                <label htmlFor="xc-access-secret" className="block text-sm font-medium text-text-muted mb-1.5">Access Secret</label>
                                <input id="xc-access-secret" type="password" value={accessSecret} onChange={(e) => setAccessSecret(e.target.value)} required
                                    className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all text-sm"
                                    placeholder="Jouw Access Secret" />
                            </div>
                        </div>

                        {/* Enabled Toggle */}
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setEnabled(!enabled)}
                                className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${enabled ? "bg-green-500" : "bg-glass-border"}`}
                                aria-label="Schakel X posting in of uit"
                            >
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-0.5"}`} />
                            </button>
                            <span className="text-sm text-text-muted">{enabled ? "Posting ingeschakeld" : "Posting uitgeschakeld"}</span>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={saving}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Opslaan
                            </button>
                            <button type="button" onClick={() => { setShowForm(false); setTestResult(null); }}
                                className="px-6 py-2.5 rounded-xl border border-glass-border text-text-muted hover:text-text-primary hover:bg-glass-bg/30 transition-all cursor-pointer"
                            >
                                Annuleren
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
