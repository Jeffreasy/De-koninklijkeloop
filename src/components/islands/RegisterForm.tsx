import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { cn } from "../../lib/utils";

// Zod Schema (unchanged)
const schema = z.object({
    name: z.string().min(2, "Naam is verplicht"),
    email: z.string().email("Ongeldig email adres"),
    role: z.enum(["deelnemer", "begeleider", "vrijwilliger"], {
        required_error: "Kies een rol",
    }),
    distance: z.enum(["2.5", "6", "10", "15"], {
        required_error: "Kies een afstand"
    }),
    supportNeeded: z.enum(["ja", "nee", "anders"], {
        required_error: "Maak een keuze"
    }),
    agreedToTerms: z.literal(true, {
        errorMap: () => ({ message: "Je moet akkoord gaan met de voorwaarden" }),
    }),
    password: z.string().min(12, "Wachtwoord moet minimaal 12 tekens zijn"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
    const registerParticipant = useAction(api.register.registerParticipant);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            supportNeeded: "nee",
            role: "deelnemer"
        }
    });

    const selectedRole = watch("role");
    const selectedDistance = watch("distance");
    const selectedSupport = watch("supportNeeded");

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            await registerParticipant({
                name: data.name,
                email: data.email,
                role: data.role,
                distance: data.distance,
                supportNeeded: data.supportNeeded,
                agreedToTerms: data.agreedToTerms,
                password: data.password,
            });

            // Redirect
            window.location.href = "/login?registered=true";
        } catch (err: any) {
            console.error(err);
            // Check if it's a known backend message or generic
            const errorMessage = err.message || "Er is iets misgegaan bij het registreren.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center animate-fade-in">
                    ⚠️ {error}
                </div>
            )}

            {/* 1. Contactgegevens */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-text-body">Je contactgegevens</h3>
                <div className="space-y-2">
                    <Label htmlFor="name">Naam</Label>
                    <Input id="name" {...register("name")} placeholder="Vul je naam in" />
                    {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="Vul je e-mailadres in" />
                    {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Wachtwoord</Label>
                        <Input id="password" type="password" {...register("password")} placeholder="Minimaal 12 tekens" />
                        {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Bevestig Wachtwoord</Label>
                        <Input id="confirmPassword" type="password" {...register("confirmPassword")} placeholder="Herhaal wachtwoord" />
                        {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}
                    </div>
                </div>
            </div>

            {/* 2. Kies je rol */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-text-body">Kies je rol</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                        { id: "deelnemer", label: "Deelnemer", icon: "👥" },
                        { id: "begeleider", label: "Begeleider", icon: "🤝" },
                        { id: "vrijwilliger", label: "Vrijwilliger", icon: "💪" }
                    ].map((role) => (
                        <div
                            key={role.id}
                            onClick={() => setValue("role", role.id as any)}
                            className={cn(
                                "cursor-pointer rounded-xl border p-4 text-center transition-all hover:bg-glass-bg",
                                selectedRole === role.id
                                    ? "bg-brand-primary/20 border-brand-primary ring-1 ring-brand-primary"
                                    : "bg-glass-bg border-glass-border"
                            )}
                        >
                            <div className="text-2xl mb-2">{role.icon}</div>
                            <div className="font-medium text-text-body">{role.label}</div>
                        </div>
                    ))}
                </div>
                {errors.role && <p className="text-red-400 text-xs">{errors.role.message}</p>}
            </div>

            {/* 3. Kies je afstand */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-text-body">Kies je afstand</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { id: "2.5", label: "2.5 KM", icon: "🚶" },
                        { id: "6", label: "6 KM", icon: "🏃" },
                        { id: "10", label: "10 KM", icon: "🏃‍♂️" },
                        { id: "15", label: "15 KM", icon: "🏃‍♀️" }
                    ].map((dist) => (
                        <div
                            key={dist.id}
                            onClick={() => setValue("distance", dist.id as any)}
                            className={cn(
                                "cursor-pointer rounded-xl border p-4 text-center transition-all hover:bg-glass-bg",
                                selectedDistance === dist.id
                                    ? "bg-brand-primary/20 border-brand-primary ring-1 ring-brand-primary"
                                    : "bg-glass-bg border-glass-border"
                            )}
                        >
                            <div className="text-2xl mb-2">{dist.icon}</div>
                            <div className="font-medium text-text-body">{dist.label}</div>
                        </div>
                    ))}
                </div>
                {errors.distance && <p className="text-red-400 text-xs">{errors.distance.message}</p>}
            </div>

            {/* 4. Ondersteuning */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-text-body">Heb je ondersteuning nodig?</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: "ja", label: "Ja", icon: "✅" },
                        { id: "nee", label: "Nee", icon: "❌" },
                        { id: "anders", label: "Anders", icon: "❓" }
                    ].map((opt) => (
                        <div
                            key={opt.id}
                            onClick={() => setValue("supportNeeded", opt.id as any)}
                            className={cn(
                                "cursor-pointer rounded-xl border p-4 text-center transition-all hover:bg-glass-bg",
                                selectedSupport === opt.id
                                    ? "bg-brand-primary/20 border-brand-primary ring-1 ring-brand-primary"
                                    : "bg-glass-bg border-glass-border"
                            )}
                        >
                            <div className="text-2xl mb-2">{opt.icon}</div>
                            <div className="font-medium text-text-body">{opt.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Voorwaarden */}
            <div className="space-y-4 border-t border-glass-border pt-6">
                <h3 className="text-xl font-bold font-display text-text-body">Algemene voorwaarden</h3>
                <p className="text-sm text-text-muted">
                    Je moet eerst de algemene voorwaarden lezen voordat je je kunt inschrijven. <a href="#" className="text-brand-primary hover:underline">Lees de Algemene Voorwaarden</a>
                </p>

                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="terms"
                        {...register("agreedToTerms")}
                        className="mt-1 h-5 w-5 rounded border-glass-border bg-glass-bg text-brand-primary focus:ring-brand-primary focus:ring-offset-0"
                    />
                    <Label htmlFor="terms" className="text-text-body font-normal">
                        Ik heb de algemene voorwaarden gelezen en ga hiermee akkoord
                    </Label>
                </div>
                {errors.agreedToTerms && <p className="text-red-400 text-xs">{errors.agreedToTerms.message}</p>}
            </div>

            <Button
                type="submit"
                variant="default"
                className="w-full shadow-lg shadow-brand-primary/20 h-12 text-lg"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Bezig met verwerken..." : "Inschrijven"}
            </Button>
        </form>
    );
}
