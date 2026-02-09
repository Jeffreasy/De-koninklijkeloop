import { useState, useEffect } from 'react';
import { useStore } from "@nanostores/react";
import { $user, logout } from "../../lib/auth";
import {
    Loader2, Save, User, Shield, Key, LogOut,
    CheckCircle2, XCircle, Pencil, X, Eye, EyeOff, Clock
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
            <div className="flex items-center justify-center p-16 text-text-muted">
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                <span>Profiel laden...</span>
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
