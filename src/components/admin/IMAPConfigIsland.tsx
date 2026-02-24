import { useState, useEffect } from 'react';
import { Loader2, Save, Server, Shield, Lock, User, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

interface IMAPAccount {
    account_type: 'info' | 'inschrijving';
    host: string;
    port: number;
    username: string;
    password?: string;
    tls_mode: 'ssl' | 'starttls';
}

interface IMAPAccountStatus {
    account_type: string;
    host: string;
    port: number;
    user: string;
    tls_mode: string;
    is_active: boolean;
}

const API = '/api/admin/imap-config';
const ACCOUNT_LABELS: Record<string, string> = {
    info: 'info@dekoninklijkeloop.nl',
    inschrijving: 'inschrijving@dekoninklijkeloop.nl',
};

export default function IMAPConfigIsland() {
    const [accounts, setAccounts] = useState<IMAPAccountStatus[]>([]);
    const [editAccount, setEditAccount] = useState<IMAPAccount>({
        account_type: 'info',
        host: '',
        port: 993,
        username: '',
        password: '',
        tls_mode: 'ssl',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [configError, setConfigError] = useState<string | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const fetchAccounts = async () => {
        try {
            const response = await fetch(API, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setAccounts(Array.isArray(data) ? data : data.accounts ?? []);
                setConfigError(null);
            } else if (response.status === 401) {
                setConfigError('Niet geautoriseerd. Log opnieuw in.');
            } else {
                setConfigError(`IMAP configuratie niet beschikbaar (${response.status}).`);
            }
        } catch {
            setConfigError('Kan geen verbinding maken met de backend.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAccounts(); }, []);

    const handleEdit = (account: IMAPAccountStatus) => {
        setEditAccount({
            account_type: account.account_type as 'info' | 'inschrijving',
            host: account.host,
            port: account.port,
            username: account.user,
            password: '',
            tls_mode: account.tls_mode as 'ssl' | 'starttls',
        });
        setStatus(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);
        try {
            const payload: Record<string, unknown> = {
                account_type: editAccount.account_type,
                host: editAccount.host,
                port: Number(editAccount.port),
                user: editAccount.username,
                tls_mode: editAccount.tls_mode,
            };
            if (editAccount.password) payload.password = editAccount.password;

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

            setStatus({ type: 'success', message: `IMAP account "${editAccount.account_type}" opgeslagen!` });
            setEditAccount(a => ({ ...a, password: '' }));
            await fetchAccounts();
        } catch (error) {
            setStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'Kon IMAP account niet opslaan.',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (accountType: string) => {
        setDeleting(accountType);
        setStatus(null);
        try {
            const response = await fetch(`${API}?account_type=${accountType}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error(`Fout bij verwijderen (${response.status})`);
            setShowDeleteConfirm(null);
            setStatus({ type: 'success', message: `IMAP account "${accountType}" deactivated.` });
            await fetchAccounts();
        } catch (error) {
            setStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'Kon account niet verwijderen.',
            });
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse" aria-hidden="true">
                <div className="premium-glass rounded-2xl p-6 h-[180px]" />
                <div className="premium-glass rounded-2xl p-6 h-[300px]" />
            </div>
        );
    }

    if (configError) {
        return (
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
                <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                        <Server className="w-7 h-7 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">IMAP configuratie niet beschikbaar</h3>
                    <p className="text-text-muted text-sm max-w-md">{configError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Status */}
            {status && (
                <div
                    className={`p-4 rounded-xl text-sm flex items-center gap-2 ${status.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}
                    role="alert"
                    aria-live="polite"
                >
                    {status.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
                    {status.message}
                </div>
            )}

            {/* Configured accounts overview */}
            {accounts.length > 0 && (
                <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Geconfigureerde Accounts</h2>
                    <div className="space-y-3">
                        {accounts.map(acc => (
                            <div key={acc.account_type} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-glass-bg/40 border border-glass-border rounded-xl">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${acc.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                            {acc.is_active ? '● Actief' : '○ Inactief'}
                                        </span>
                                        <span className="text-sm font-medium text-text-primary">{ACCOUNT_LABELS[acc.account_type] ?? acc.account_type}</span>
                                    </div>
                                    <p className="text-xs text-text-muted mt-1">{acc.host}:{acc.port} — {acc.tls_mode.toUpperCase()}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(acc)}
                                        className="px-3 py-1.5 text-xs rounded-lg bg-glass-bg border border-glass-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                                    >
                                        Bewerken
                                    </button>
                                    {showDeleteConfirm === acc.account_type ? (
                                        <div className="flex gap-1.5">
                                            <button type="button" onClick={() => setShowDeleteConfirm(null)} className="px-2 py-1.5 text-xs rounded-lg bg-glass-bg border border-glass-border text-text-muted cursor-pointer">Annuleer</button>
                                            <button type="button" onClick={() => handleDelete(acc.account_type)} disabled={!!deleting} className="px-2 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 disabled:opacity-50 cursor-pointer">
                                                {deleting === acc.account_type ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Verwijder'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(acc.account_type)}
                                            className="p-1.5 text-xs rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                            aria-label={`Verwijder ${acc.account_type} account`}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add/Edit form */}
            <form onSubmit={handleSubmit} className="premium-glass rounded-2xl md:rounded-3xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                        <Server className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">IMAP Account Configureren</h2>
                        <p className="text-sm text-text-muted">Inkomende e-mail polling per mailbox</p>
                    </div>
                </div>

                {/* Account type */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Account</label>
                    <select
                        value={editAccount.account_type}
                        onChange={e => setEditAccount({ ...editAccount, account_type: e.target.value as 'info' | 'inschrijving' })}
                        className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 [&>option]:bg-gray-900 [&>option]:text-white"
                    >
                        <option value="info">info@dekoninklijkeloop.nl</option>
                        <option value="inschrijving">inschrijving@dekoninklijkeloop.nl</option>
                    </select>
                </div>

                {/* Host + Port */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-secondary mb-2">IMAP Host</label>
                        <input
                            type="text"
                            value={editAccount.host}
                            onChange={e => setEditAccount({ ...editAccount, host: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                            placeholder="imap.example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Poort</label>
                        <input
                            type="number"
                            value={editAccount.port}
                            onChange={e => setEditAccount({ ...editAccount, port: Number(e.target.value) })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                            placeholder="993"
                            required
                        />
                    </div>
                </div>

                {/* TLS Mode */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Verbindingstype</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <select
                            value={editAccount.tls_mode}
                            onChange={e => setEditAccount({ ...editAccount, tls_mode: e.target.value as 'ssl' | 'starttls' })}
                            className="w-full pl-10 pr-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 appearance-none [&>option]:bg-gray-900 [&>option]:text-white"
                        >
                            <option value="ssl">SSL / Implicit TLS (poort 993)</option>
                            <option value="starttls">STARTTLS (poort 143)</option>
                        </select>
                    </div>
                </div>

                {/* Credentials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            <User className="inline w-3.5 h-3.5 mr-1" />
                            Gebruikersnaam
                        </label>
                        <input
                            type="text"
                            value={editAccount.username}
                            onChange={e => setEditAccount({ ...editAccount, username: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                            placeholder="info@dekoninklijkeloop.nl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            <Lock className="inline w-3.5 h-3.5 mr-1" />
                            Wachtwoord
                        </label>
                        <input
                            type="password"
                            value={editAccount.password}
                            onChange={e => setEditAccount({ ...editAccount, password: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                            placeholder="••••••••••••"
                        />
                        <p className="text-xs text-text-muted mt-1">Laat leeg om huidig wachtwoord te behouden</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-colors shadow-lg shadow-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>{saving ? 'Opslaan...' : 'Account Opslaan'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
