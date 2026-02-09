import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import { setAuth } from "../../lib/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const registered = params.get("registered") === "true";
        const emailError = params.get("email_error") === "true";

        if (registered) {
            if (emailError) {
                // Account created, but email failed
                setSuccess("Account aangemaakt, maar de verificatie-email kon niet worden verzonden. Log in of neem contact op.");
            } else {
                // Success
                setSuccess("Account aangemaakt! Controleer je e-mail om je wachtwoord in te stellen.");
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null); // Clear success on submit

        try {
            // 1. Authenticate with LaventeCare
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });



            // API returns PascalCase (Go structs), Frontend expects normalized keys
            // Cookie-based Auth: Token is in HttpOnly cookie, not in body.
            const rawUser = data.User || data.user;

            if (!rawUser) {
                console.error("[LoginForm] 'User' or 'user' key missing in data:", Object.keys(data));
                throw new Error("Ongeldige server reactie (Geen user data)");
            }

            // Normalize User object
            const user = {
                id: rawUser.ID || rawUser.id,
                email: rawUser.Email || rawUser.email,
                role: (rawUser.Role || rawUser.role || "").toLowerCase()
            };

            // 2. If Role is missing (Backend issue), fetch profile
            // This implicitly tests if the HttpOnly cookie was set correctly
            if (!user.role) {
                try {

                    const meData = await apiRequest("/auth/me");
                    if (meData.user && meData.user.role) {
                        user.role = meData.user.role.toLowerCase();

                    }
                } catch (e) {
                    console.error("[LoginForm] Could not fetch profile (Cookie missing?):", e);
                }
            }

            // Fallback
            if (!user.role) user.role = "viewer";

            // 3. Store user state (Token is in Cookie)
            setAuth(null, user);

            // 4. Redirect based on Role
            console.log("[LoginForm] Login successful, redirecting based on role:", user.role);

            if (user.role === "admin" || user.role === "editor") {
                window.location.href = "/admin/dashboard";
            } else {
                window.location.href = "/dashboard";
            }

        } catch (err: any) {
            console.error("[LoginForm] Error:", err);
            // Show real error for debugging if possible, else generic
            setError(err.message || "Ongeldige inloggegevens. Probeer het opnieuw.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [view, setView] = useState<'login' | 'forgot'>('login');

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch('/api/v1/auth/password/forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!res.ok) throw new Error("Kon reset email niet versturen.");

            setSuccess("We hebben een email gestuurd met instructies om je wachtwoord te resetten.");
            setView('login');
        } catch (err: any) {
            console.error(err);
            setError("Er ging iets mis. Controleer je emailadres.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'forgot') {
        return (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Wachtwoord Herstellen</h3>
                    <p className="text-sm text-white/60">Vul je emailadres in om een reset-link te ontvangen.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jouw@email.nl"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    variant="default"
                    className="w-full shadow-lg shadow-brand-primary/20"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Versturen..." : "Reset Link Sturen"}
                </Button>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() => { setView('login'); setError(null); setSuccess(null); }}
                        className="text-sm text-brand-orange hover:underline focus:outline-none"
                    >
                        Terug naar Inloggen
                    </button>
                </div>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
                <div className={`${success.includes("niet") ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" : "bg-green-500/10 border-green-500/20 text-green-400"} border p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2`}>
                    {success.includes("niet") ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 17a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2Z" /><path d="M15 22a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2Z" /><path d="M13.5 8.5V11a5 5 0 1 0-10 0v2.5" /><path d="M7 17a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2Z" /></svg>
                    )}
                    {success}
                </div>
            )}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@dekoninklijkeloop.nl"
                    required
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Wachtwoord</Label>
                    <button
                        type="button"
                        onClick={() => { setView('forgot'); setError(null); setSuccess(null); }}
                        className="text-xs text-brand-orange hover:underline focus:outline-none"
                    >
                        Wachtwoord vergeten?
                    </button>
                </div>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />
            </div>

            <Button
                type="submit"
                variant="default"
                className="w-full shadow-lg shadow-brand-primary/20"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Inloggen..." : "Inloggen"}
            </Button>
        </form>
    );
}
