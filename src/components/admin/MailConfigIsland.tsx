import { useState, useEffect } from 'react';
import { useStore } from "@nanostores/react";
import { $accessToken } from "../../lib/auth";
import { Loader2, Save, Server, Shield, Lock, Mail, User } from "lucide-react";

interface MailConfig {
    provider: string; // 'smtp'
    host: string;
    port: number;
    username: string;
    password?: string; // Only on update
    from_email: string;
    from_name: string;
    encryption: 'none' | 'ssl' | 'tls';
    auth_type: 'none' | 'plain' | 'login';
}

export default function MailConfigIsland() {
    const accessToken = useStore($accessToken);
    const [config, setConfig] = useState<MailConfig>({
        provider: 'smtp',
        host: '',
        port: 587,
        username: '',
        password: '',
        from_email: '',
        from_name: '',
        encryption: 'tls',
        auth_type: 'plain'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Fetch configuration
    useEffect(() => {
        const fetchConfig = async () => {
            if (!accessToken) return;

            try {
                const response = await fetch('/api/v1/admin/mail-config', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.configured) {
                        const backendConfig = data.config;
                        // Map Backend -> Frontend
                        setConfig({
                            provider: 'smtp', // Default
                            host: backendConfig.host,
                            port: Number(backendConfig.port),
                            username: backendConfig.user,
                            password: '', // Don't preset password, it's sensitive
                            from_email: backendConfig.from,
                            from_name: '', // Backend doesn't store name? Or stores "Name <email>"? Backend just stores string.
                            // Map TLS Mode
                            // Backend 'starttls' -> Frontend 'tls' (Label: TLS (STARTTLS))
                            // Backend 'tls' -> Frontend 'ssl' (Label: SSL)
                            // Default to 'tls'
                            encryption: backendConfig.tls_mode === 'tls' ? 'ssl' : 'tls',
                            auth_type: 'login' // Default/Ignored
                        });
                    }
                } else {
                    console.error("Failed to fetch mail config");
                }
            } catch (error) {
                console.error("Error fetching mail config:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            // Map Frontend -> Backend
            // Frontend 'tls' (STARTTLS) -> Backend 'starttls'
            // Frontend 'ssl' (Implicit) -> Backend 'tls'
            const tlsMode = config.encryption === 'ssl' ? 'tls' : 'starttls';

            const payload = {
                host: config.host,
                port: Number(config.port),
                user: config.username,
                password: config.password,
                from: config.from_email,
                tls_mode: tlsMode
            };

            const response = await fetch('/api/v1/admin/mail-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Kon instellingen niet opslaan");
            }

            setStatus({ type: 'success', message: 'E-mail instellingen opgeslagen!' });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'Kon instellingen niet opslaan'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 text-text-muted">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Configuratie laden...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Message */}
            {status && (
                <div
                    className={`p-4 rounded-xl text-sm ${status.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}
                >
                    {status.message}
                </div>
            )}

            {/* Server Settings */}
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                        <Server className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">SMTP Server</h2>
                        <p className="text-sm text-text-muted">Verbindingsgegevens van de mailserver</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-2">Host</label>
                            <input
                                type="text"
                                value={config.host}
                                onChange={e => setConfig({ ...config, host: e.target.value })}
                                className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                                placeholder="smtp.example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Poort</label>
                            <input
                                type="number"
                                value={config.port}
                                onChange={e => setConfig({ ...config, port: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                                placeholder="587"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Encryptie</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <select
                                value={config.encryption}
                                onChange={e => setConfig({ ...config, encryption: e.target.value as any })}
                                className="w-full pl-10 pr-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 appearance-none"
                            >
                                <option value="none">Geen (Onveilig)</option>
                                <option value="ssl">SSL</option>
                                <option value="tls">TLS (STARTTLS)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Authenticatie</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <select
                                value={config.auth_type}
                                onChange={e => setConfig({ ...config, auth_type: e.target.value as any })}
                                className="w-full pl-10 pr-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 appearance-none"
                            >
                                <option value="none">Geen</option>
                                <option value="plain">PLAIN</option>
                                <option value="login">LOGIN</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Credentials */}
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">Inloggegevens</h2>
                        <p className="text-sm text-text-muted">Authenticatie voor de mailserver</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Gebruikersnaam</label>
                        <input
                            type="text"
                            value={config.username}
                            onChange={e => setConfig({ ...config, username: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Wachtwoord</label>
                        <input
                            type="password"
                            value={config.password}
                            onChange={e => setConfig({ ...config, password: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                            placeholder="••••••••••••"
                        />
                        <p className="text-xs text-text-muted mt-1">Laat leeg om huidig wachtwoord te behouden</p>
                    </div>
                </div>
            </div>

            {/* Sender Info */}
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">Afzender</h2>
                        <p className="text-sm text-text-muted">Hoe e-mails verschijnen bij de ontvanger</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Naam Afzender</label>
                        <input
                            type="text"
                            value={config.from_name}
                            onChange={e => setConfig({ ...config, from_name: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                            placeholder="De Koninklijke Loop"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Email Afzender</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="email"
                                value={config.from_email}
                                onChange={e => setConfig({ ...config, from_email: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                                placeholder="noreply@dekoninklijkeloop.nl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-colors shadow-lg shadow-brand-orange/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{saving ? 'Opslaan...' : 'Configuratie Opslaan'}</span>
                </button>
            </div>
        </form>
    );
}
