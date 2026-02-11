import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

const passwordSchema = z.object({
    password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens zijn"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ResetPasswordIsland() {
    const [token, setToken] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'input' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema)
    });

    useEffect(() => {
        // 1. Get Token from URL
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");

        if (!urlToken) {
            setStatus('error');
            setErrorMessage("Geen geldige reset-token gevonden via de link.");
            return;
        }

        setToken(urlToken);
        setStatus('input'); // Ready for input
    }, []);

    const onSubmit = async (data: PasswordForm) => {
        if (!token) return;

        try {
            // 2. Submit new password to backend
            // Using General Proxy /api/v1/... to ensure headers are correct (like RegisterForm)
            const res = await fetch('/api/v1/auth/password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    password: data.password
                })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Reset mislukt");
            }

            setStatus('success');
        } catch (e: any) {
            console.error(e);
            setErrorMessage("Er ging iets mis bij het opslaan van je nieuwe wachtwoord. Is de link verlopen?");
            setStatus('error');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-2xl border border-glass-border shadow-2xl bg-surface/50 backdrop-blur-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Wachtwoord Resetten</h1>
                    <p className="text-text-muted">Kies een nieuw veilig wachtwoord voor je account.</p>
                </div>

                {status === 'loading' && (
                    <div className="text-center py-10">
                        <div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-text-muted">Token controleren...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-red-400 font-bold mb-1">Foutmelding</h3>
                        <p className="text-red-300/80 text-sm">{errorMessage}</p>
                        <a href="/login" className="mt-4 inline-block text-sm text-brand-orange hover:underline">Terug naar inloggen</a>
                    </div>
                )}

                {status === 'success' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-text-primary font-bold text-xl mb-2">Wachtwoord Aangepast!</h3>
                        <p className="text-text-muted mb-6">Je kunt nu inloggen met je nieuwe wachtwoord.</p>
                        <a
                            href="/login"
                            className="block w-full py-3 rounded-xl bg-brand-orange text-white font-bold text-center hover:bg-brand-orange/90 transition-colors shadow-lg shadow-brand-orange/20"
                        >
                            Ga naar Inloggen
                        </a>
                    </div>
                )}

                {status === 'input' && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary ml-1">Nieuw Wachtwoord</label>
                            <input
                                type="password"
                                {...register("password")}
                                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 transition-all"
                                placeholder="Minimaal 8 tekens"
                            />
                            {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary ml-1">Bevestig Wachtwoord</label>
                            <input
                                type="password"
                                {...register("confirmPassword")}
                                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 transition-all"
                                placeholder="Typ het nog eens"
                            />
                            {errors.confirmPassword && <p className="text-red-400 text-xs ml-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-xl bg-linear-to-r from-brand-orange to-red-500 text-white font-bold shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Opslaan..." : "Wachtwoord Opslaan"}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
