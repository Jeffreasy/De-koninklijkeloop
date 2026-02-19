import { useState, useEffect } from 'react';
import { useStore } from "@nanostores/react";
import { $accessToken } from "../../lib/auth";
import { Loader2, Save, Bot, MessageSquare, Bell, Send, Trash2, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";

interface TelegramConfig {
    configured: boolean;
    chat_id: string;
    bot_token_masked: string;
    enabled: boolean;
    notify_contact: boolean;
    notify_registration: boolean;
    notify_email: boolean;
}

export default function TelegramConfigIsland() {
    const accessToken = useStore($accessToken);
    const [config, setConfig] = useState<TelegramConfig | null>(null);
    const [botToken, setBotToken] = useState('');
    const [chatId, setChatId] = useState('');
    const [enabled, setEnabled] = useState(true);
    const [notifyContact, setNotifyContact] = useState(true);
    const [notifyRegistration, setNotifyRegistration] = useState(true);
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [configError, setConfigError] = useState<string | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            if (!accessToken) {
                setLoading(false);
                setConfigError("Niet geautoriseerd. Log opnieuw in.");
                return;
            }

            try {
                const response = await fetch('/api/v1/admin/telegram-config', {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });

                if (response.ok) {
                    const data: TelegramConfig = await response.json();
                    setConfig(data);
                    setConfigError(null);
                    if (data.configured) {
                        setChatId(data.chat_id || '');
                        setEnabled(data.enabled);
                        setNotifyContact(data.notify_contact);
                        setNotifyRegistration(data.notify_registration);
                        setNotifyEmail(data.notify_email);
                    }
                } else if (response.status === 404 || response.status === 502) {
                    setConfigError("Telegram configuratie is niet beschikbaar. De backend server ondersteunt deze functie mogelijk nog niet.");
                } else {
                    const errorText = await response.text().catch(() => 'Onbekende fout');
                    setConfigError(`Kan configuratie niet ophalen (${response.status}): ${errorText}`);
                }
            } catch (error) {
                if (import.meta.env.DEV) console.error("Error fetching telegram config:", error);
                setConfigError("Kan geen verbinding maken met de backend. Controleer of de server draait.");
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, [accessToken]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            const payload: Record<string, unknown> = {
                chat_id: chatId.trim(),
                enabled,
                notify_contact: notifyContact,
                notify_registration: notifyRegistration,
                notify_email: notifyEmail
            };

            if (botToken.trim()) {
                payload.bot_token = botToken.trim();
            }

            const response = await fetch('/api/v1/admin/telegram-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || "Kon instellingen niet opslaan");
            }

            setStatus({ type: 'success', message: 'Telegram configuratie opgeslagen!' });
            setBotToken('');

            // Refresh config
            const refreshed = await fetch('/api/v1/admin/telegram-config', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (refreshed.ok) {
                const data = await refreshed.json();
                setConfig(data);
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error instanceof Error ? error.message.split('\n')[0] : 'Kon instellingen niet opslaan'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setStatus(null);

        try {
            const response = await fetch('/api/v1/admin/telegram-config/test', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || "Test bericht mislukt");
            }

            setStatus({ type: 'success', message: 'Test bericht verzonden! Controleer je Telegram groep.' });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error instanceof Error ? error.message.split('\n')[0] : 'Test bericht mislukt'
            });
        } finally {
            setTesting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Weet je zeker dat je de Telegram configuratie wilt verwijderen?')) return;

        setDeleting(true);
        setStatus(null);

        try {
            const response = await fetch('/api/v1/admin/telegram-config', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || "Kon configuratie niet verwijderen");
            }

            setStatus({ type: 'success', message: 'Telegram configuratie verwijderd.' });
            setConfig({
                configured: false,
                chat_id: '',
                bot_token_masked: '',
                enabled: false,
                notify_contact: true,
                notify_registration: true,
                notify_email: true,
            });
            setChatId('');
            setBotToken('');
            setEnabled(true);
            setNotifyContact(true);
            setNotifyRegistration(true);
            setNotifyEmail(true);
        } catch (error) {
            setStatus({
                type: 'error',
                message: error instanceof Error ? error.message.split('\n')[0] : 'Kon configuratie niet verwijderen'
            });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse" aria-hidden="true">
                <div className="premium-glass rounded-2xl md:rounded-3xl p-6 h-[250px]" />
                <div className="premium-glass rounded-2xl md:rounded-3xl p-6 h-[280px]" />
                <div className="flex justify-end">
                    <div className="w-full sm:w-48 h-12 rounded-xl bg-glass-surface/50" />
                </div>
            </div>
        );
    }

    if (configError) {
        return (
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6 md:p-8">
                <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                        <Bot className="w-7 h-7 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Telegram configuratie niet beschikbaar</h3>
                    <p className="text-text-muted text-sm max-w-md leading-relaxed">{configError}</p>
                    <p className="text-xs text-text-muted mt-4 opacity-60">
                        Deze functie vereist de LaventeCare backend server met Telegram ondersteuning.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {/* Status Message */}
            {status && (
                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm ${status.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}
                    role="alert"
                    aria-live="polite"
                >
                    {status.type === 'success'
                        ? <CheckCircle2 className="w-5 h-5 shrink-0" />
                        : <XCircle className="w-5 h-5 shrink-0" />
                    }
                    {status.message}
                </div>
            )}

            {/* Connection Status Badge */}
            {config?.configured && (
                <div className="flex items-center gap-3 text-sm">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.enabled
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
                        {config.enabled ? 'Actief' : 'Gepauzeerd'}
                    </div>
                    {config.bot_token_masked && (
                        <span className="text-text-muted font-mono text-xs">
                            Token: {config.bot_token_masked}
                        </span>
                    )}
                </div>
            )}

            {/* Bot Configuration */}
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">Bot Configuratie</h2>
                        <p className="text-sm text-text-muted">Verbind @DKL26bot met je Telegram groep</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Bot Token</label>
                        <div className="relative">
                            <input
                                type={showToken ? 'text' : 'password'}
                                value={botToken}
                                onChange={e => setBotToken(e.target.value)}
                                className="w-full px-4 py-2 pr-10 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-sky-500/50 font-mono text-sm"
                                placeholder={config?.configured ? '••••••••••• (ongewijzigd)' : '8350411200:AAE...'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                            >
                                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                            {config?.configured
                                ? 'Laat leeg om huidige token te behouden'
                                : 'Verkrijg via @BotFather op Telegram'
                            }
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Chat ID</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                value={chatId}
                                onChange={e => setChatId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-sky-500/50 font-mono text-sm"
                                placeholder="-100XXXXXXXXX"
                                required
                            />
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                            Groep ID (negatief getal). Gebruik /getUpdates om te achterhalen.
                        </p>
                    </div>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">Meldingen</h2>
                        <p className="text-sm text-text-muted">Kies welke berichten naar Telegram worden gestuurd</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Master Toggle */}
                    <ToggleRow
                        label="Bot Ingeschakeld"
                        description="Schakel alle Telegram meldingen in of uit"
                        checked={enabled}
                        onChange={setEnabled}
                        accentColor="sky"
                    />

                    <div className="h-px bg-glass-border/40 my-2" />

                    {/* Notification Toggles */}
                    <div className={`space-y-4 transition-opacity duration-200 ${enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <ToggleRow
                            label="Contactformulier"
                            description="Ontvang een melding bij nieuw contactbericht"
                            checked={notifyContact}
                            onChange={setNotifyContact}
                        />
                        <ToggleRow
                            label="Nieuwe Inschrijving"
                            description="Ontvang een melding bij nieuwe deelnemer registratie"
                            checked={notifyRegistration}
                            onChange={setNotifyRegistration}
                        />
                        <ToggleRow
                            label="E-mail Activiteit"
                            description="Ontvang een melding bij inkomende e-mail"
                            checked={notifyEmail}
                            onChange={setNotifyEmail}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex gap-2">
                    {config?.configured && (
                        <>
                            <button
                                type="button"
                                onClick={handleTest}
                                disabled={testing || saving}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium text-sm hover:bg-sky-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {testing ? 'Verzenden...' : 'Test Bericht'}
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting || saving}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-medium text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Verwijder
                            </button>
                        </>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={saving || !chatId.trim()}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-colors shadow-lg shadow-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{saving ? 'Opslaan...' : 'Configuratie Opslaan'}</span>
                </button>
            </div>
        </form>
    );
}

// Toggle Row Component
function ToggleRow({ label, description, checked, onChange, accentColor = 'brand-orange' }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    accentColor?: string;
}) {
    const activeClasses = accentColor === 'sky'
        ? 'bg-sky-500 border-sky-400'
        : 'bg-brand-orange border-brand-orange';
    const dotActiveClass = 'translate-x-5 bg-white';

    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-muted mt-0.5">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0 cursor-pointer border ${checked ? activeClasses : 'bg-glass-bg border-glass-border'
                    }`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${checked ? dotActiveClass : 'translate-x-1 bg-text-muted'
                    }`} />
            </button>
        </div>
    );
}
