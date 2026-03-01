import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

// ── Schemas ──────────────────────────────────────────────────────────────────

const claimSchema = z.object({
    email: z.string().email("Voer een geldig e-mailadres in"),
    password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens zijn"),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
});

type ClaimForm = z.infer<typeof claimSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

type Status = "idle" | "submitting" | "success" | "error";

export default function RegisterIsland() {
    const [mode, setMode] = useState<"claim" | "register">("register");
    const [prefillEmail, setPrefillEmail] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const claimGuest = useAction(api.claimGuest.claimGuestRegistration);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ClaimForm>({
        resolver: zodResolver(claimSchema),
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlMode = params.get("mode");
        const urlEmail = params.get("email");

        if (urlMode === "claim") {
            setMode("claim");
            if (urlEmail) {
                const decoded = decodeURIComponent(urlEmail);
                setPrefillEmail(decoded);
                setValue("email", decoded);
            }
        }
    }, [setValue]);

    const onSubmit = async (data: ClaimForm) => {
        setStatus("submitting");
        setErrorMessage("");

        try {
            await claimGuest({ email: data.email, password: data.password });
            setStatus("success");
        } catch (e: any) {
            setErrorMessage(e.message || "Er ging iets mis. Probeer het later opnieuw.");
            setStatus("error");
        }
    };

    // ── Success state ──────────────────────────────────────────────────────────
    if (status === "success") {
        return (
            <div className="w-full max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 rounded-2xl border border-glass-border shadow-2xl bg-surface/50 backdrop-blur-md text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                        className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <motion.path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            />
                        </svg>
                    </motion.div>

                    <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Account aangemaakt!</h2>
                    <p className="text-text-muted mb-2">
                        Je inschrijving is gekoppeld aan je nieuwe account.
                    </p>
                    <p className="text-text-muted text-sm mb-8">
                        Alle voordelen zijn nu actief: inschrijfhistorie, prioritaire inschrijving en meer.
                    </p>

                    <div className="space-y-3">
                        <a
                            href="/login"
                            className="block w-full py-3.5 rounded-xl bg-linear-to-r from-brand-orange to-red-500 text-white font-bold text-center shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all"
                        >
                            Inloggen met je nieuwe account &rarr;
                        </a>
                        <a
                            href="/"
                            className="block w-full py-3 rounded-xl border border-glass-border text-text-muted text-sm text-center hover:bg-glass-surface transition-colors"
                        >
                            Terug naar home
                        </a>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── Main form ──────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-md mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-2xl border border-glass-border shadow-2xl bg-surface/50 backdrop-blur-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    {mode === "claim" ? (
                        <>
                            <div className="w-14 h-14 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
                                Account aanmaken
                            </h1>
                            <p className="text-text-muted text-sm leading-relaxed">
                                Stel een wachtwoord in om je gast-inschrijving om te zetten naar een
                                volledig account en alle voordelen te activeren.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Registreren</h1>
                            <p className="text-text-muted">Maak een account aan voor De Koninklijke Loop.</p>
                        </>
                    )}
                </div>

                {/* Error banner */}
                <AnimatePresence>
                    {status === "error" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex gap-3 items-start"
                        >
                            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-300/90 text-sm leading-relaxed">{errorMessage}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-secondary ml-1">
                            E-mailadres
                        </label>
                        <input
                            type="email"
                            {...register("email")}
                            readOnly={mode === "claim" && !!prefillEmail}
                            className={[
                                "w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-base text-text-primary",
                                "placeholder:text-text-muted/50 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 transition-all",
                                mode === "claim" && prefillEmail ? "opacity-60 cursor-not-allowed" : "",
                            ].join(" ")}
                            placeholder="jouw@email.nl"
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs ml-1">{errors.email.message}</p>
                        )}
                        {mode === "claim" && prefillEmail && (
                            <p className="text-text-muted/60 text-xs ml-1">
                                Dit is het e-mailadres van je gast-inschrijving.
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-secondary ml-1">
                            Wachtwoord
                        </label>
                        <input
                            type="password"
                            {...register("password")}
                            className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-base text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 transition-all"
                            placeholder="Minimaal 8 tekens"
                        />
                        {errors.password && (
                            <p className="text-red-400 text-xs ml-1">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-secondary ml-1">
                            Bevestig wachtwoord
                        </label>
                        <input
                            type="password"
                            {...register("confirmPassword")}
                            className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-base text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 transition-all"
                            placeholder="Typ het nog eens"
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-400 text-xs ml-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl bg-linear-to-r from-brand-orange to-red-500 text-white font-bold shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                    >
                        {isSubmitting
                            ? "Bezig..."
                            : mode === "claim"
                                ? "Account aanmaken & inschrijving koppelen"
                                : "Account aanmaken"
                        }
                    </button>
                </form>

                {/* Footer links */}
                <div className="mt-6 pt-5 border-t border-glass-border text-center space-y-2">
                    <p className="text-text-muted text-sm">
                        Heb je al een account?{" "}
                        <a href="/login" className="text-brand-orange hover:underline font-medium">
                            Inloggen
                        </a>
                    </p>
                    {mode === "claim" && (
                        <p className="text-text-muted/60 text-xs">
                            Problemen?{" "}
                            <a href="mailto:info@dekoninklijkeloop.nl" className="text-brand-orange/70 hover:underline">
                                Neem contact op
                            </a>
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
