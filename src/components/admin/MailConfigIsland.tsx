import { useState, useEffect } from 'react';
import { Loader2, Save, Server, Shield, Lock, Mail, Trash2, AlertTriangle } from 'lucide-react';

interface MailConfig {
    host: string;
    port: number;
    username: string;
    password?: string;
    from_email: string;
    from_name: string;
    encryption: 'none' | 'ssl' | 'tls';
    admin_email: string; // Optional separate address for admin notifications
}

// BFF proxy URL — uses HttpOnly cookies (no Bearer token exposed to JS)
const API = '/api/admin/mail-config';

export default function MailConfigIsland() {
    const [config, setConfig] = useState<MailConfig>({
        host: '',
        port: 587,
        username: '',
        password: '',
        from_email: '',
        from_name: '',
        encryption: 'tls',
        admin_email: '',
    });
    const [isConfigured, setIsConfigured] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [configError, setConfigError] = useState<string | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch(API, { credentials: 'include' });

                if (response.ok) {
                    const data = await response.json();
                    setConfigError(null);
                    setIsConfigured(!!data.configured);
                    if (data.configured) {
                        const bc = data.config;
                        // Parse RFC5322 "Display Name <email>" or bare "email"
                        const fromRaw: string = bc.from || '';
                        const match = fromRaw.match(/^(.+?)\s*<([^>]+)>$/);
                        setConfig({
                            host: bc.host,
                            port: Number(bc.port),
                            username: bc.user,
                            password: '',
                            from_email: match ? match[2].trim() : fromRaw.trim(),
                            from_name: match ? match[1].trim() : '',
                            encryption: bc.tls_mode === 'tls' ? 'ssl' : 'tls',
                            admin_email: bc.admin_email || '',
                        });
                    }
                } else if (response.status === 401) {
                    setConfigError('Niet geautoriseerd. Log opnieuw in.');
                } else {
                    setConfigError(`Configuratie niet beschikbaar (${response.status}).`);
                }
            } catch {
                setConfigError('Kan geen verbinding maken met de backend.');
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            // Combine name + email into RFC5322 format backend expects
            const fromField = config.from_name?.trim()
                ? `${config.from_name.trim()} <${config.from_email}>`
                : config.from_email;

            // Map frontend → backend tls_mode
            const tlsMode = config.encryption === 'ssl' ? 'tls' : 'starttls';

            const payload: Record<string, unknown> = {
                host: config.host,
                port: Number(config.port),
                user: config.username,
                from: fromField,
                tls_mode: tlsMode,
            };
            // Only include password if the user typed a new one
            if (config.password) payload.password = config.password;
            // Only include admin_email if filled in
            if (config.admin_email?.trim()) payload.admin_email = config.admin_email.trim();

            const response = await fetch(API, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || `Fout bij opslaan (${response.status})`);
            }

            setIsConfigured(true);
            setConfig(c => ({ ...c, password: '' }));
            setStatus({ type: 'success', message: 'SMTP configuratie opgeslagen!' });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error instanceof Error ? error.message.split('\n')[0] : 'Kon instellingen niet opslaan.',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setStatus(null);
        try {
            const response = await fetch(API, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error(`Fout bij verwijderen (${response.status})`);
            setIsConfigured(false);
            setShowDeleteConfirm(false);
            setConfig({ host: '', port: 587, username: '', password: '', from_email: '', from_name: '', encryption: 'tls', admin_email: '' });
            setStatus({ type: 'success', message: 'SMTP configuratie verwijderd. Systeem SMTP wordt gebruikt als fallback.' });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'Kon configuratie niet verwijderen.',
            });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse" aria-hidden="true">
                <div className="premium-glass rounded-2xl md:rounded-3xl p-6 h-[250px]" />
                <div className="premium-glass rounded-2xl md:rounded-3xl p-6 h-[200px]" />
                <div className="flex justify-end"><div className="w-48 h-12 rounded-xl bg-glass-surface/50" /></div>
            </div>
        );
    }

    if (configError) {
        return (
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6 md:p-8">
                <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                        <Server className="w-7 h-7 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">E-mail configuratie niet beschikbaar</h3>
                    <p className="text-text-muted text-sm max-w-md leading-relaxed">{configError}</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status */}
            {status && (
                <div
                    className={`p-4 rounded-xl text-sm ${status.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}
                    role="alert"
                    aria-live="polite"
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

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Encryptie</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <select
                                value={config.encryption}
                                onChange={e => setConfig({ ...config, encryption: e.target.value as 'none' | 'ssl' | 'tls' })}
                                className="w-full pl-10 pr-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 appearance-none [&>option]:bg-gray-900 [&>option]:text-white"
                            >
                                <option value="none">Geen (Onveilig)</option>
                                <option value="ssl">SSL / Implicit TLS (poort 465)</option>
                                <option value="tls">STARTTLS (poort 587)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Credentials */}
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
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
                        <Mail className="w-5 h-5" />
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
                        <label className="block text-sm font-medium text-text-secondary mb-2">E-mail Afzender</label>
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

            {/* Admin Notification Email */}
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">Inschrijvings-notificaties</h2>
                        <p className="text-sm text-text-muted">Aparte ontvanger voor nieuwe inschrijvingen</p>
                    </div>
                </div>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        id="admin-email"
                        type="email"
                        value={config.admin_email}
                        onChange={e => setConfig({ ...config, admin_email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                        placeholder="inschrijving@dekoninklijkeloop.nl"
                    />
                </div>
                <p className="text-xs text-text-muted mt-2">
                    Alleen voor inschrijvingsnotificaties. Contactformulieren gaan altijd naar het afzenderadres (info@).
                    Laat leeg om ook inschrijvingen naar het afzenderadres te sturen.
                </p>
            </div>
            {showDeleteConfirm && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-400">SMTP configuratie verwijderen?</p>
                        <p className="text-xs text-red-400/70 mt-0.5">Het systeem valt terug op de standaard SMTP provider.</p>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 text-xs rounded-lg bg-glass-bg border border-glass-border text-text-muted hover:text-text-primary transition-colors cursor-pointer">Annuleren</button>
                        <button type="button" onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 cursor-pointer">
                            {deleting ? 'Verwijderen...' : 'Ja, verwijder'}
                        </button>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
                {isConfigured && !showDeleteConfirm && (
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        Configuratie verwijderen
                    </button>
                )}
                <div className="sm:ml-auto">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-colors shadow-lg shadow-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>{saving ? 'Opslaan...' : 'Configuratie Opslaan'}</span>
                    </button>
                </div>
            </div>
        </form>
    );
}
