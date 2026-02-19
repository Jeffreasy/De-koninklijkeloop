import { useState, useEffect, useRef } from 'react';
import { useStore } from "@nanostores/react";
import { $user, $accessToken, logout } from "../../lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import {
    Loader2, Save, User, Shield, Key, LogOut,
    CheckCircle2, XCircle, Pencil, X, Eye, EyeOff, Clock,
    Download, Trash2, AlertTriangle, FileJson
} from "lucide-react";

interface ProfileData {
    user: {
        id: string;
        email: string;
        full_name: string;
        role: string;
        is_email_verified: boolean;
        member_since: string;
        created_at: string;
        updated_at: string;
    };
    tenant: {
        name: string;
        slug: string;
    };
    security: {
        mfa_enabled: boolean;
    };
}

const roleLabels: Record<string, string> = {
    admin: "Administrator",
    editor: "Editor",
    user: "Gebruiker",
    viewer: "Viewer",
    deelnemer: "Deelnemer",
    begeleider: "Begeleider",
    vrijwilliger: "Vrijwilliger"
};

const roleBadgeColors: Record<string, string> = {
    admin: "bg-red-500/15 text-red-400 border-red-500/25",
    editor: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    user: "bg-sky-500/15 text-sky-400 border-sky-500/25",
    viewer: "bg-slate-500/15 text-slate-400 border-slate-500/25",
    deelnemer: "bg-green-500/15 text-green-400 border-green-500/25",
    begeleider: "bg-teal-500/15 text-teal-400 border-teal-500/25",
    vrijwilliger: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25"
};

export default function ProfileIsland() {
    const localUser = useStore($user);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch('/api/auth/profile', { credentials: 'include' });
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            if (!res.ok) throw new Error(`Fout ${res.status}`);
            const data = await res.json();
            setProfile(data);
            setError(null);
        } catch (e) {
            setError("Kan profiel niet laden. Probeer opnieuw.");
            console.error("Profile fetch error:", e);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse" aria-hidden="true">
                {/* Profile Header Skeleton */}
                <div className="premium-glass rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-glass-surface/50 border border-glass-border shrink-0" />
                    <div className="flex-1 space-y-3 w-full flex flex-col items-center sm:items-start">
                        <div className="h-7 w-48 bg-glass-surface/50 rounded-lg" />
                        <div className="h-4 w-64 bg-glass-surface/30 rounded" />
                        <div className="flex gap-2 pt-1">
                            <div className="h-6 w-24 bg-glass-surface/40 rounded-full" />
                            <div className="h-6 w-32 bg-glass-surface/40 rounded-full" />
                        </div>
                    </div>
                </div>
                {/* Sections Skeletons */}
                <div className="premium-glass rounded-2xl md:rounded-3xl p-6 h-[104px]" />
                <div className="premium-glass rounded-2xl md:rounded-3xl p-6 h-[264px]" />
                <div className="premium-glass rounded-2xl md:rounded-3xl p-6 h-[120px]" />
                <div className="rounded-2xl md:rounded-3xl p-6 h-[160px] border-2 border-red-500/10 bg-red-500/5" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="premium-glass rounded-2xl md:rounded-3xl p-8">
                <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <XCircle className="w-7 h-7 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Profiel niet beschikbaar</h3>
                    <p className="text-text-muted text-sm max-w-md">{error}</p>
                </div>
            </div>
        );
    }

    const { user, tenant, security } = profile;
    const initials = (user.full_name || user.email || "?")
        .split(" ")
        .map(w => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const memberSince = user.member_since
        ? new Date(user.member_since).toLocaleDateString("nl-NL", {
            year: "numeric", month: "long", day: "numeric"
        })
        : null;

    return (
        <div className="space-y-6">
            {/* ═══ Profile Header Card ═══ */}
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-brand-orange to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-orange/20">
                            {initials}
                        </div>
                        {user.is_email_verified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-app-bg flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left space-y-1.5">
                        <h1 className="text-2xl font-bold text-text-primary font-display">
                            {user.full_name || "Geen naam ingesteld"}
                        </h1>
                        <p className="text-text-muted">{user.email}</p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleBadgeColors[user.role] || roleBadgeColors.viewer}`}>
                                <Shield className="w-3 h-3" />
                                {roleLabels[user.role] || user.role}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-text-muted bg-glass-bg/30 border border-glass-border">
                                {tenant.name}
                            </span>
                        </div>
                        {memberSince && (
                            <p className="text-xs text-text-muted flex items-center gap-1.5 justify-center sm:justify-start pt-1">
                                <Clock className="w-3 h-3" />
                                Lid sinds {memberSince}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Sections ═══ */}
            <EditNameSection
                currentName={user.full_name || ""}
                onSuccess={(newName) => {
                    setProfile(prev => prev ? {
                        ...prev,
                        user: { ...prev.user, full_name: newName }
                    } : null);
                }}
            />

            <ChangePasswordSection />

            <DataExportSection />

            <AccountDeletionSection />
        </div>
    );
}

// ═══════════════════════════════════════════════════
// Edit Name Section
// ═══════════════════════════════════════════════════
function EditNameSection({ currentName, onSuccess }: {
    currentName: string;
    onSuccess: (name: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(currentName);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => { setName(currentName); }, [currentName]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || name.trim() === currentName) {
            setEditing(false);
            return;
        }

        setSaving(true);
        setStatus(null);

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ full_name: name.trim() })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Fout ${res.status}`);
            }

            setStatus({ type: 'success', message: 'Naam bijgewerkt!' });
            onSuccess(name.trim());
            setEditing(false);
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus({
                type: 'error',
                message: err instanceof Error ? err.message : 'Kon naam niet opslaan'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">Naam</h2>
                        <p className="text-sm text-text-muted">Je weergavenaam in het systeem</p>
                    </div>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Bewerken
                    </button>
                )}
            </div>

            {status && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm mb-4 ${status.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {status.message}
                </div>
            )}

            {editing ? (
                <form onSubmit={handleSave} className="flex items-end gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                            placeholder="Je volledige naam"
                            autoFocus
                            required
                            minLength={2}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Opslaan
                    </button>
                    <button
                        type="button"
                        onClick={() => { setEditing(false); setName(currentName); setStatus(null); }}
                        className="p-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </form>
            ) : (
                <p className="text-text-primary text-base pl-1">
                    {currentName || <span className="text-text-muted italic">Nog geen naam ingesteld</span>}
                </p>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// Change Password Section
// ═══════════════════════════════════════════════════
function ChangePasswordSection() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const passwordValid = newPassword.length >= 12;
    const passwordsMatch = newPassword === confirmPassword;
    const canSubmit = oldPassword && passwordValid && passwordsMatch;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSaving(true);
        setStatus(null);

        try {
            const res = await fetch('/api/auth/security/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Fout ${res.status}`);
            }

            setStatus({ type: 'success', message: 'Wachtwoord gewijzigd! Je wordt nu uitgelogd op alle apparaten...' });

            // Nuclear Option: all sessions revoked — redirect to login after delay
            setTimeout(() => {
                window.location.href = '/login?password_changed=true';
            }, 2500);
        } catch (err) {
            setStatus({
                type: 'error',
                message: err instanceof Error ? err.message : 'Kon wachtwoord niet wijzigen'
            });
            setSaving(false);
        }
    };

    return (
        <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400">
                    <Key className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-text-primary">Wachtwoord Wijzigen</h2>
                    <p className="text-sm text-text-muted">Minimaal 12 tekens. Je wordt uitgelogd op alle apparaten.</p>
                </div>
            </div>

            {status && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm mb-5 ${status.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {status.type === 'success'
                        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                        : <XCircle className="w-4 h-4 shrink-0" />
                    }
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Huidig Wachtwoord</label>
                    <div className="relative">
                        <input
                            type={showOld ? 'text' : 'password'}
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                            placeholder="••••••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowOld(!showOld)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        >
                            {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Nieuw Wachtwoord</label>
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className={`w-full px-4 py-2.5 pr-10 bg-glass-bg/50 border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 ${newPassword && !passwordValid
                                    ? 'border-red-500/40'
                                    : newPassword && passwordValid
                                        ? 'border-green-500/40'
                                        : 'border-glass-border'
                                    }`}
                                placeholder="Min. 12 tekens"
                                required
                                minLength={12}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            >
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {newPassword && !passwordValid && (
                            <p className="text-xs text-red-400 mt-1">Minimaal 12 tekens ({newPassword.length}/12)</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Bevestig Nieuw Wachtwoord</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className={`w-full px-4 py-2.5 bg-glass-bg/50 border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 ${confirmPassword && !passwordsMatch
                                ? 'border-red-500/40'
                                : confirmPassword && passwordsMatch
                                    ? 'border-green-500/40'
                                    : 'border-glass-border'
                                }`}
                            placeholder="Herhaal wachtwoord"
                            required
                        />
                        {confirmPassword && !passwordsMatch && (
                            <p className="text-xs text-red-400 mt-1">Wachtwoorden komen niet overeen</p>
                        )}
                    </div>
                </div>

                {/* Warning + Submit */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                    <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-500/5 rounded-lg px-3 py-2 border border-amber-500/10">
                        <LogOut className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Na wijziging word je uitgelogd op alle apparaten</span>
                    </div>

                    <button
                        type="submit"
                        disabled={saving || !canSubmit}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/80 text-white font-medium hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                        Wachtwoord Wijzigen
                    </button>
                </div>
            </form>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// Data Export Section (GDPR Art. 20)
// ═══════════════════════════════════════════════════
function DataExportSection() {
    const token = useStore($accessToken);
    const [exporting, setExporting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleExport = async () => {
        setExporting(true);
        setStatus(null);

        try {
            // 1. Fetch Go backend profile data
            const goRes = await fetch('/api/auth/account/export', { credentials: 'include' });
            if (!goRes.ok) {
                if (goRes.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error(`Profiel export mislukt (${goRes.status})`);
            }
            const goData = await goRes.json();

            // 2. Fetch Convex domain data (via secure action)
            let convexData = null;
            try {
                const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
                if (convexUrl && token) {
                    const convex = new ConvexHttpClient(convexUrl);
                    convexData = await convex.action(api.gdpr.exportUserData, { token });
                }
            } catch (convexErr) {
                console.warn('[GDPR Export] Convex data fetch failed (non-blocking):', convexErr);
            }

            // 3. Merge into single export
            const exportData = {
                exported_at: new Date().toISOString(),
                gdpr_article: "Art. 20 - Right to Data Portability",
                profile: goData,
                ...(convexData ? { domain_data: convexData } : {}),
            };

            // 4. Trigger browser download
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `mijn-data-${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus({ type: 'success', message: 'Data succesvol gedownload!' });
            setTimeout(() => setStatus(null), 5000);
        } catch (err) {
            setStatus({
                type: 'error',
                message: err instanceof Error ? err.message : 'Kon data niet exporteren'
            });
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="premium-glass rounded-2xl md:rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400">
                    <FileJson className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-text-primary">Mijn Data Downloaden</h2>
                    <p className="text-sm text-text-muted">Download al je persoonlijke gegevens als JSON bestand (GDPR Art. 20)</p>
                </div>
            </div>

            {status && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm mb-4 ${status.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {status.message}
                </div>
            )}

            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <p className="text-sm text-text-muted">
                        Je export bevat: profielgegevens, registraties, donaties, berichten en feedback.
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500/80 text-white font-medium hover:bg-sky-500 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {exporting ? 'Exporteren...' : 'Download'}
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// Account Deletion Section (GDPR Art. 17)
// ═══════════════════════════════════════════════════
function AccountDeletionSection() {
    const token = useStore($accessToken);
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [step, setStep] = useState<'idle' | 'convex' | 'go' | 'done'>('idle');
    const [error, setError] = useState<string | null>(null);

    const canConfirm = password.length > 0 && confirmation === 'VERWIJDEREN';

    const handleDelete = async () => {
        if (!canConfirm) return;

        setDeleting(true);
        setError(null);

        try {
            // Step 1: Clean Convex data first — if this fails, account stays intact
            setStep('convex');
            const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
            if (!convexUrl || !token) {
                throw new Error('Configuratie ontbreekt. Neem contact op met support.');
            }
            const convex = new ConvexHttpClient(convexUrl);
            await convex.action(api.gdpr.deleteUserData, { token });

            // Step 2: Delete account via Go backend
            setStep('go');
            const res = await fetch('/api/auth/account', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (res.status === 401) {
                    throw new Error('Onjuist wachtwoord. Probeer het opnieuw.');
                }
                throw new Error(data.error || `Verwijdering mislukt (${res.status})`);
            }

            // Step 3: Cleanup & redirect
            setStep('done');

            // Clear local auth state
            await fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });

            // Redirect after brief delay to show success
            setTimeout(() => {
                window.location.href = '/?account_deleted=true';
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Er ging iets mis');
            setDeleting(false);
            setStep('idle');
        }
    };

    const resetModal = () => {
        setShowModal(false);
        setPassword('');
        setConfirmation('');
        setError(null);
        setStep('idle');
    };

    return (
        <>
            {/* Danger Zone Card */}
            <div className="rounded-2xl md:rounded-3xl p-6 border-2 border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400">
                        <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-red-400">Account Verwijderen</h2>
                        <p className="text-sm text-text-muted">Permanent en onomkeerbaar (GDPR Art. 17)</p>
                    </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10 mb-4">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-300/80 space-y-1">
                        <p>Dit verwijdert permanent je account, registraties, donaties en alle gekoppelde data.</p>
                        <p>Chatberichten worden geanonimiseerd. Deze actie kan niet ongedaan gemaakt worden.</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-medium border border-red-500/30 hover:bg-red-500/30 hover:text-red-300 transition-colors cursor-pointer"
                >
                    <Trash2 className="w-4 h-4" />
                    Account Verwijderen...
                </button>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={!deleting ? resetModal : undefined}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-md premium-glass rounded-2xl p-6 border border-red-500/20 shadow-2xl">
                        {step === 'done' ? (
                            // Success State
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-text-primary mb-2">Account Verwijderd</h3>
                                <p className="text-text-muted text-sm">Je wordt doorgestuurd naar de homepage...</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-text-primary">Weet je het zeker?</h3>
                                            <p className="text-xs text-text-muted">Deze actie is permanent</p>
                                        </div>
                                    </div>
                                    {!deleting && (
                                        <button
                                            onClick={resetModal}
                                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4 bg-red-500/10 border border-red-500/20 text-red-400">
                                        <XCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Bevestig met je wachtwoord</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                            placeholder="Je huidige wachtwoord"
                                            disabled={deleting}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Type VERWIJDEREN */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">
                                            Type <span className="font-mono text-red-400 font-bold">VERWIJDEREN</span> ter bevestiging
                                        </label>
                                        <input
                                            type="text"
                                            value={confirmation}
                                            onChange={e => setConfirmation(e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-glass-bg/50 border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-red-500/50 ${confirmation && confirmation !== 'VERWIJDEREN'
                                                ? 'border-red-500/40'
                                                : confirmation === 'VERWIJDEREN'
                                                    ? 'border-green-500/40'
                                                    : 'border-glass-border'
                                                }`}
                                            placeholder="VERWIJDEREN"
                                            disabled={deleting}
                                        />
                                    </div>

                                    {/* Progress indicator */}
                                    {deleting && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                            {step === 'convex' && 'Domeindata opruimen...'}
                                            {step === 'go' && 'Account verwijderen...'}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={resetModal}
                                            disabled={deleting}
                                            className="flex-1 px-4 py-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 border border-glass-border transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            Annuleren
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={!canConfirm || deleting}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/80 text-white font-medium hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            Definitief Verwijderen
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
