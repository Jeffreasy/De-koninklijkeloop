import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import { setAuth } from "../../lib/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auth Views Map
    type ViewState = 'login' | 'forgot' | 'mfa_verify' | 'mfa_setup';
    const [view, setView] = useState<ViewState>('login');

    // MFA States
    const [mfaCode, setMfaCode] = useState("");
    const [preAuthToken, setPreAuthToken] = useState<string | null>(null);
    const [mfaSecret, setMfaSecret] = useState<string | null>(null);
    const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const registered = params.get("registered") === "true";
        const emailError = params.get("email_error") === "true";

        if (registered) {
            if (emailError) {
                setSuccess("Account aangemaakt, maar de verificatie-email kon niet worden verzonden.");
            } else {
                setSuccess("Account aangemaakt! Controleer je e-mail.");
            }
        }
    }, []);

    const clearState = () => {
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearState();

        try {
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            const rawUser = data.User || data.user;
            if (!rawUser) throw new Error("Ongeldige server reactie.");

            // Check if MFA is required (intercept standard flow)
            if (data.mfa_required) {
                setPreAuthToken(data.pre_auth_token);
                // IF user has MFA already enabled, they just need to insert the code to verify
                if (rawUser.MfaEnabled || rawUser.mfa_enabled) {
                    setView('mfa_verify');
                } else {
                    // IF user does NOT have MFA enabled, they must set it up first
                    // We call the setup API endpoint immediately using the PreAuthToken
                    try {
                        const setupData = await apiRequest("/auth/mfa/setup", {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${data.pre_auth_token}`
                            },
                        });
                        setMfaSecret(setupData.secret);
                        setMfaQrCode(`data:image/png;base64,${setupData.qr_code}`);
                        setBackupCodes(setupData.backup_codes || []);
                        setView('mfa_setup');
                    } catch (mfaErr: any) {
                        setError(mfaErr.message || "Fout bij opzetten MFA.");
                    }
                }
                return; // Stop execution here, wait for MFA input
            }

            const user = {
                id: rawUser.ID || rawUser.id,
                email: rawUser.Email || rawUser.email,
                role: (rawUser.Role || rawUser.role || "").toLowerCase()
            };

            // Fetch profile if role missing 
            if (!user.role) {
                try {
                    const meData = await apiRequest("/auth/me");
                    if (meData.user?.role) user.role = meData.user.role.toLowerCase();
                } catch (e) {
                    console.error("Profile fetch failed:", e);
                }
            }

            // Fallback to viewer if still no role found
            if (!user.role) user.role = "viewer";

            setAuth(null, user);

            // Redirect
            if (user.role === "admin" || user.role === "editor") {
                window.location.href = "/admin/dashboard";
            } else {
                window.location.href = "/dashboard";
            }

        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Ongeldige inloggegevens.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearState();

        try {
            await apiRequest('/auth/password/forgot', {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            setSuccess("Check je email voor de reset-link.");
            setTimeout(() => setView('login'), 3000);
        } catch (err: any) {
            setError(err.message || "Kon geen reset-link versturen.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMfaSetupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearState();

        try {
            await apiRequest("/auth/mfa/activate", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${preAuthToken}`
                },
                body: JSON.stringify({
                    secret: mfaSecret,
                    code: mfaCode,
                    backup_codes: backupCodes
                }),
            });

            setSuccess("MFA ingericht! Je wordt ingelogd...");
            // Now actually login the user with the pre auth token
            await processMfaLogin();
        } catch (err: any) {
            setError(err.message || "Fout bij verifiëren van de code.");
            setIsSubmitting(false);
        }
    };

    const handleMfaVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearState();

        try {
            await processMfaLogin();
        } catch (err: any) {
            setError(err.message || "Ongeldige verificatiecode.");
            setIsSubmitting(false);
        }
    };

    const processMfaLogin = async () => {
        const data = await apiRequest("/auth/mfa/verify", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${preAuthToken}`
            },
            body: JSON.stringify({
                code: mfaCode
            }),
        });

        const rawUser = data.User || data.user;
        const user = {
            id: rawUser.ID || rawUser.id,
            email: rawUser.Email || rawUser.email,
            role: (rawUser.Role || rawUser.role || "").toLowerCase()
        };

        if (!user.role) {
            try {
                const meData = await apiRequest("/auth/me");
                if (meData.user?.role) user.role = meData.user.role.toLowerCase();
            } catch (e) { }
        }
        if (!user.role) user.role = "viewer";

        setAuth(null, user);

        if (user.role === "admin" || user.role === "editor") {
            window.location.href = "/admin/dashboard";
        } else {
            window.location.href = "/dashboard";
        }
    };

    return (
        <div className="w-full max-w-md mx-auto relative perspective-1000">
            <div className="relative z-10 bg-surface/50 backdrop-blur-xl border border-glass-border shadow-2xl rounded-2xl p-8 overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <AnimatePresence mode="wait">
                    {view === 'login' ? (
                        <motion.form
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2 mb-8">
                                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Welkom terug</h1>
                                <p className="text-sm text-text-muted">Log in om je dashboard te beheren</p>
                            </div>

                            {/* Status Messages */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center gap-3"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-sm flex items-center gap-3"
                                    >
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        {success}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs uppercase tracking-wider text-text-muted font-semibold ml-1">Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="naam@voorbeeld.nl"
                                            className="pl-10 bg-glass-bg border-glass-border focus:border-brand-orange/50 focus:ring-brand-orange/20 rounded-xl h-12 text-text-primary placeholder:text-text-muted/50 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label htmlFor="password" className="text-xs uppercase tracking-wider text-text-muted font-semibold">Wachtwoord</Label>
                                        <button
                                            type="button"
                                            onClick={() => { setView('forgot'); clearState(); }}
                                            className="text-xs text-brand-orange hover:text-orange-400 transition-colors bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            Wachtwoord vergeten?
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-10 bg-glass-bg border-glass-border focus:border-brand-orange/50 focus:ring-brand-orange/20 rounded-xl h-12 text-text-primary placeholder:text-text-muted/50 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-linear-to-r from-brand-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Inloggen"}
                            </Button>
                        </motion.form>
                    ) : view === 'mfa_verify' ? (
                        <motion.form
                            key="mfa_verify"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleMfaVerifySubmit}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2 mb-8">
                                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Tweestapsverificatie</h1>
                                <p className="text-sm text-text-muted">Voer de code uit je authenticator app in.</p>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center gap-3"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <Label htmlFor="mfa-verify-code" className="text-xs uppercase tracking-wider text-text-muted font-semibold ml-1">Zescijferige code</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                                    <Input
                                        id="mfa-verify-code"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value)}
                                        placeholder="123456"
                                        className="pl-10 bg-glass-bg border-glass-border focus:border-brand-orange/50 focus:ring-brand-orange/20 rounded-xl h-12 text-text-primary placeholder:text-text-muted/50 transition-all text-base tracking-widest text-center"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || mfaCode.length < 6}
                                className="w-full h-12 bg-linear-to-r from-brand-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verifiëren"}
                            </Button>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setView('login'); clearState(); setPreAuthToken(null); }}
                                    className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Terug naar inloggen
                                </button>
                            </div>
                        </motion.form>
                    ) : view === 'mfa_setup' ? (
                        <motion.form
                            key="mfa_setup"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleMfaSetupSubmit}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2 mb-4">
                                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Instellen MFA</h1>
                                <p className="text-sm text-text-muted">Jouw beheerdersrol vereist extra beveiliging.</p>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center gap-3"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                                {mfaQrCode ? (
                                    <img src={mfaQrCode} alt="MFA QR Code" className="w-40 h-40 bg-white p-2 rounded-lg" />
                                ) : (
                                    <div className="w-40 h-40 flex items-center justify-center border border-dashed border-white/20 rounded-lg">
                                        <Loader2 className="w-8 h-8 animate-spin text-text-muted" />
                                    </div>
                                )}
                                <p className="text-xs text-center text-text-muted px-4">
                                    Scan deze code met Google Authenticator of Authy.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mfa-setup-code" className="text-xs uppercase tracking-wider text-text-muted font-semibold ml-1">Controle Code</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                                    <Input
                                        id="mfa-setup-code"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value)}
                                        placeholder="123456"
                                        className="pl-10 bg-glass-bg border-glass-border focus:border-brand-orange/50 focus:ring-brand-orange/20 rounded-xl h-12 text-text-primary placeholder:text-text-muted/50 transition-all text-base tracking-widest text-center"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || mfaCode.length < 6}
                                className="w-full h-12 bg-linear-to-r from-brand-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Koppelen & Doorgaan"}
                            </Button>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setView('login'); clearState(); setPreAuthToken(null); }}
                                    className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Terug naar inloggen
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="forgot"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleForgotSubmit}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2 mb-8">
                                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Herstel toegang</h1>
                                <p className="text-sm text-text-muted">Vul je email in voor een reset-link</p>
                            </div>

                            {/* Status Messages */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center gap-3"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-sm flex items-center gap-3"
                                    >
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        {success}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <Label htmlFor="reset-email" className="text-xs uppercase tracking-wider text-text-muted font-semibold ml-1">Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="naam@voorbeeld.nl"
                                        className="pl-10 bg-glass-bg border-glass-border focus:border-brand-orange/50 focus:ring-brand-orange/20 rounded-xl h-12 text-text-primary placeholder:text-text-muted/50 transition-all text-base"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-linear-to-r from-brand-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verstuur Reset Link"}
                            </Button>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setView('login'); clearState(); }}
                                    className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Terug naar inloggen
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
