import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { User, Mail, MapPin, Users, HeartHandshake, CheckCircle2, ChevronRight, Phone, Contact, Camera, Lock, UserPlus, Footprints, Route, Medal, Trophy, XCircle, HelpCircle, AlertTriangle, Building2, Accessibility, Bus, Home, Heart, PlusCircle, Building } from "lucide-react";
import GroupMemberForm, { type GroupMember } from "./GroupMemberForm";

const MAX_GROUP_MEMBERS = 20;

// Zod Schema (Password removed)
const schema = z.object({
    name: z.string().min(2, "Naam is verplicht"),
    email: z.string().email("Ongeldig email adres"),
    role: z.enum(["deelnemer", "begeleider", "vrijwilliger"], {
        required_error: "Kies een rol",
    }),
    distance: z.enum(["2.5", "6", "10", "15"]).optional(),
    supportNeeded: z.enum(["ja", "nee", "anders"]).optional(),
    agreedToTerms: z.literal(true, {
        errorMap: () => ({ message: "Je moet akkoord gaan met de voorwaarden" }),
    }),
    // Password fields removed from validation
    supportDescription: z.string().optional(),
    city: z.string().optional(),
    wheelchairUser: z.boolean().optional(),
    shuttleBus: z.enum(["pendelbus", "eigen-vervoer"]).optional(),
    livesInFacility: z.boolean().optional(),
    participantType: z.enum(["doelgroep", "verwant", "anders"]).optional(),
    iceName: z.string().min(2, "Naam contactpersoon is verplicht"),
    icePhone: z.string().min(10, "Geldig telefoonnummer is verplicht"),
    agreedToMedia: z.boolean().optional(),
    companionName: z.string().optional(),
    companionEmail: z.string().email("Ongeldig e-mailadres").optional().or(z.literal("")),
    /** Hidden boolean — set via setValue when toggling group registration */
    isGroupRegistration: z.boolean().optional(),
}).refine((data) => {
    if (data.role !== "vrijwilliger" && data.supportNeeded === "anders") return !!data.supportDescription && data.supportDescription.length > 0;
    return true;
}, {
    message: "Licht je keuze toe",
    path: ["supportDescription"]
}).refine((data) => {
    if (data.role !== "vrijwilliger" && !data.distance) return false;
    return true;
}, {
    message: "Kies een afstand",
    path: ["distance"]
}).refine((data) => {
    // Skip companionName requirement when using group registration (isGroupRegistration=true)
    if (data.isGroupRegistration) return true;
    if (data.role === "begeleider" && (!data.companionName || data.companionName.trim() === "")) return false;
    return true;
}, {
    message: "Naam van de gekoppelde deelnemer is vereist",
    path: ["companionName"]
});

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
    const registerParticipant = useAction(api.register.registerParticipant);
    const registerGuest = useAction(api.registerGuest.registerGuest);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wantsAccount, setWantsAccount] = useState(false); // Guest by default
    // Groepsregistratie state (alleen voor begeleiders)
    const [isGroupRegistration, setIsGroupRegistration] = useState(false);
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

    const setGroupMode = (enabled: boolean) => {
        setIsGroupRegistration(enabled);
        // Keep Zod in sync — bypasses companionName requirement
        setValue("isGroupRegistration", enabled);
        if (!enabled) setGroupMembers([]);
    };

    const addGroupMember = () => {
        if (groupMembers.length >= MAX_GROUP_MEMBERS) return;
        setGroupMembers(prev => [...prev, { name: "", distance: undefined, wheelchairUser: false, shuttleBus: "eigen-vervoer", supportNeeded: "nee", agreedToMedia: false }]);
    };

    const updateGroupMember = (index: number, updated: GroupMember) => {
        setGroupMembers(prev => prev.map((m, i) => i === index ? updated : m));
    };

    const removeGroupMember = (index: number) => {
        setGroupMembers(prev => prev.filter((_, i) => i !== index));
    };

    const groupMembersValid = !isGroupRegistration ||
        (groupMembers.length > 0 &&
         groupMembers.every(m => m.name.trim().length >= 2 && !!m.distance));

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
            role: "deelnemer",
            agreedToMedia: false,
            wheelchairUser: false,
            livesInFacility: false,
            shuttleBus: "eigen-vervoer",
            participantType: "doelgroep",
        }
    });

    const selectedRole = watch("role");
    const selectedDistance = watch("distance");
    const selectedSupport = watch("supportNeeded");
    const selectedShuttle = watch("shuttleBus");
    const selectedParticipantType = watch("participantType");

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Validate group members before submitting
            if (isGroupRegistration && !groupMembersValid) {
                setError("Vul voor alle deelnemers een naam en afstand in.");
                setIsSubmitting(false);
                return;
            }

            // Build group members payload (strip empty optional strings)
            const groupMembersPayload = isGroupRegistration && data.role === "begeleider"
                ? groupMembers.map(m => ({
                    name: m.name,
                    distance: m.distance,
                    wheelchairUser: m.wheelchairUser,
                    shuttleBus: m.shuttleBus,
                    supportNeeded: m.supportNeeded,
                    supportDescription: m.supportDescription || undefined,
                    livesInFacility: m.livesInFacility,
                    participantType: m.participantType,
                    agreedToMedia: m.agreedToMedia ?? false,
                }))
                : undefined;

            if (wantsAccount) {
                // Authenticated flow: create account via LaventeCare Auth
                const autoGeneratedPassword = crypto.randomUUID() + "-" + Math.random().toString(36).slice(2) + "A!1";

                await registerParticipant({
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    distance: data.distance,
                    supportNeeded: data.supportNeeded,
                    supportDescription: data.supportDescription,
                    city: data.city,
                    wheelchairUser: data.wheelchairUser,
                    shuttleBus: data.shuttleBus,
                    livesInFacility: data.livesInFacility,
                    participantType: data.participantType,
                    iceName: data.iceName,
                    icePhone: data.icePhone,
                    agreedToTerms: data.agreedToTerms,
                    agreedToMedia: !!data.agreedToMedia,
                    companionName: data.role === "begeleider" && !isGroupRegistration ? data.companionName : undefined,
                    companionEmail: data.role === "begeleider" && !isGroupRegistration ? data.companionEmail : undefined,
                    groupMembers: groupMembersPayload,
                    password: autoGeneratedPassword,
                });

                // Trigger Welcome Email with Password Reset + Telegram Notification
                try {
                    const emailRes = await fetch('/api/v1/auth/register-confirmation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: data.name,
                            email: data.email,
                            role: data.role,
                            distance: data.role !== "vrijwilliger" ? (data.distance || '') : '',
                            support_needed: data.role !== "vrijwilliger" && (data.supportNeeded === "ja" || data.supportNeeded === "anders"),
                            support_description: data.role !== "vrijwilliger" ? (data.supportDescription || '') : '',
                            ice_name: data.iceName || '',
                            ice_phone: data.icePhone || '',
                            companion_name: data.role === "begeleider" && !isGroupRegistration ? (data.companionName || '') : '',
                            companion_email: data.role === "begeleider" && !isGroupRegistration ? (data.companionEmail || '') : '',
                            // Groepsregistratie: stuur alle groepsleden mee voor de welkomstmail
                            group_members: groupMembersPayload?.map(m => ({
                                name: m.name,
                                distance: m.distance || '',
                                wheelchair_user: !!m.wheelchairUser,
                            })) ?? [],
                            profile_data: {
                                city: data.role === "deelnemer" ? (data.city || '') : '',
                                wheelchair_user: data.role === "deelnemer" ? !!data.wheelchairUser : false,
                                shuttle_bus: data.role === "deelnemer" ? (data.shuttleBus || 'eigen-vervoer') : '',
                                lives_in_facility: data.role === "deelnemer" ? !!data.livesInFacility : false,
                                participant_type: data.role === "deelnemer" ? (data.participantType || 'doelgroep') : ''
                            },
                            generate_password_reset: true,
                            app_url: window.location.origin
                        })
                    });

                    if (!emailRes.ok) throw new Error("Email sending failed");
                    window.location.href = "/login?registered=true";
                } catch (e) {
                    console.error("Failed to send welcome/notification", e);
                    window.location.href = "/login?registered=true&email_error=true";
                }
            } else {
                // Guest flow: no account, direct registration
                await registerGuest({
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    distance: data.role !== "vrijwilliger" ? data.distance : undefined,
                    supportNeeded: data.role !== "vrijwilliger" ? data.supportNeeded : undefined,
                    supportDescription: data.role !== "vrijwilliger" ? data.supportDescription : undefined,
                    city: data.role === "deelnemer" ? data.city : undefined,
                    wheelchairUser: data.role === "deelnemer" ? data.wheelchairUser : undefined,
                    shuttleBus: data.role === "deelnemer" ? data.shuttleBus : undefined,
                    livesInFacility: data.role === "deelnemer" ? data.livesInFacility : undefined,
                    participantType: data.role === "deelnemer" ? data.participantType : undefined,
                    iceName: data.iceName,
                    icePhone: data.icePhone,
                    agreedToTerms: data.agreedToTerms,
                    agreedToMedia: data.agreedToMedia || false,
                    companionName: data.role === "begeleider" && !isGroupRegistration ? data.companionName : undefined,
                    companionEmail: data.role === "begeleider" && !isGroupRegistration ? data.companionEmail : undefined,
                    groupMembers: groupMembersPayload,
                });

                // Trigger Welcome Email
                try {
                    // Use General Proxy (/api/v1/...) for consistency
                    const emailRes = await fetch('/api/v1/auth/register-confirmation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: data.name,
                            email: data.email,
                            role: data.role,
                            distance: data.role !== "vrijwilliger" ? (data.distance || '') : '',
                            support_needed: data.role !== "vrijwilliger" && (data.supportNeeded === "ja" || data.supportNeeded === "anders"),
                            support_description: data.role !== "vrijwilliger" ? (data.supportDescription || '') : '',
                            ice_name: data.iceName || '',
                            ice_phone: data.icePhone || '',
                            companion_name: data.role === "begeleider" && !isGroupRegistration ? (data.companionName || '') : '',
                            companion_email: data.role === "begeleider" && !isGroupRegistration ? (data.companionEmail || '') : '',
                            // Groepsregistratie: stuur alle groepsleden mee voor de welkomstmail
                            group_members: groupMembersPayload?.map(m => ({
                                name: m.name,
                                distance: m.distance || '',
                                wheelchair_user: !!m.wheelchairUser,
                            })) ?? [],
                            profile_data: {
                                city: data.role === "deelnemer" ? (data.city || '') : '',
                                wheelchair_user: data.role === "deelnemer" ? !!data.wheelchairUser : false,
                                shuttle_bus: data.role === "deelnemer" ? (data.shuttleBus || 'eigen-vervoer') : '',
                                lives_in_facility: data.role === "deelnemer" ? !!data.livesInFacility : false,
                                participant_type: data.role === "deelnemer" ? (data.participantType || 'doelgroep') : ''
                            },
                            generate_password_reset: true,
                            app_url: window.location.origin
                        })
                    });

                    if (!emailRes.ok) throw new Error("Email sending failed");
                    window.location.href = "/registratie-succes";
                } catch (e) {
                    console.error("Failed to send welcome email", e);
                    window.location.href = "/registratie-succes?email_error=true";
                }
            }
        } catch (err: any) {
            console.error(err);
            let errorMessage = err.message || "Er is iets misgegaan bij het registreren.";

            // Strip Convex wrapper text to show only our custom message
            if (errorMessage.includes("Dit e-mailadres is al bekend")) {
                errorMessage = "Dit e-mailadres is al bekend. Log in of gebruik een ander adres.";
            } else if (errorMessage.includes("Dit e-mailadres is al in gebruik")) {
                errorMessage = "Dit e-mailadres is al in gebruik.";
            }

            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto" >
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center animate-fade-in flex items-center justify-center gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
                </div>
            )}

            {/* 1. Contactgegevens */}
            < div className="space-y-6" >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-brand-orange/10 rounded-xl text-brand-orange">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-display text-text-body">Je contactgegevens</h3>
                        <p className="text-sm text-text-muted">Vul je gegevens in om je aan te melden.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2 group/field">
                        <Label htmlFor="name" className="transition-colors group-hover/field:text-brand-orange">Naam</Label>
                        <div className="relative transition-all duration-300">
                            <User className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted/50 transition-colors duration-300 group-focus-within/field:text-brand-orange group-hover/field:text-brand-orange/70" />
                            <Input id="name" {...register("name")} placeholder="Vul je volledige naam in" className="pl-11 transition-all duration-300 group-focus-within/field:ring-brand-orange/50 group-focus-within/field:border-brand-orange group-focus-within/field:shadow-[0_0_20px_-5px_rgba(255,147,40,0.3)] group-hover/field:border-brand-orange/50 group-hover/field:shadow-[0_0_15px_-5px_rgba(255,147,40,0.2)] hover:bg-brand-orange/5" />
                        </div>
                        {errors.name && <p className="text-red-400 text-xs pl-1">{errors.name?.message}</p>}
                    </div>

                    <div className="space-y-2 group/field">
                        <Label htmlFor="email" className="transition-colors group-hover/field:text-brand-orange">E-mailadres</Label>
                        <div className="relative transition-all duration-300">
                            <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted/50 transition-colors duration-300 group-focus-within/field:text-brand-orange group-hover/field:text-brand-orange/70" />
                            <Input id="email" type="email" {...register("email")} placeholder="jouw.email@example.com" className="pl-11 transition-all duration-300 group-focus-within/field:ring-brand-orange/50 group-focus-within/field:border-brand-orange group-focus-within/field:shadow-[0_0_20px_-5px_rgba(255,147,40,0.3)] group-hover/field:border-brand-orange/50 group-hover/field:shadow-[0_0_15px_-5px_rgba(255,147,40,0.2)] hover:bg-brand-orange/5" />
                        </div>
                        {errors.email && <p className="text-red-400 text-xs pl-1">{errors.email?.message}</p>}
                    </div>
                </div>
            </div >

            {/* 2. Kies je rol */}
            < div className="space-y-6" >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-brand-orange/10 rounded-xl text-brand-orange">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-display text-text-body">Kies je rol</h3>
                        <p className="text-sm text-text-muted">Hoe wil je meedoen aan het evenement?</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: "deelnemer", label: "Deelnemer", icon: User, desc: "Ik loop mee" },
                        { id: "begeleider", label: "Begeleider", icon: HeartHandshake, desc: "Ik begeleid iemand" },
                        { id: "vrijwilliger", label: "Vrijwilliger", icon: Users, desc: "Ik help mee" }
                    ].map((role) => (
                        <div
                            key={role.id}
                            onClick={() => setValue("role", role.id as any)}
                            className={cn(
                                "cursor-pointer rounded-2xl border-2 p-3 md:p-4 text-center transition-all duration-300 relative group overflow-hidden flex flex-col justify-center items-center h-full min-h-[120px]",
                                selectedRole === role.id
                                    ? "border-brand-orange bg-brand-orange/5 shadow-lg ring-2 ring-brand-orange/30"
                                    : "border-glass-border glass-card hover:border-brand-orange/50"
                            )}
                        >
                            {selectedRole === role.id && (
                                <div className="absolute inset-0 bg-linear-to-tr from-brand-orange/10 to-transparent pointer-events-none" />
                            )}
                            {selectedRole === role.id && (
                                <div className="absolute top-1 right-1 md:top-2 md:right-2 text-brand-orange animate-in fade-in zoom-in duration-300">
                                    <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 fill-brand-orange/20" />
                                </div>
                            )}
                            <div className="mb-1 md:mb-3 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 filter drop-shadow-md">
                                <role.icon className={cn("w-8 h-8 md:w-10 md:h-10", selectedRole === role.id ? "text-brand-orange" : "text-brand-orange/70")} />
                            </div>
                            <div className={cn("font-bold text-sm md:text-lg transition-colors duration-300", selectedRole === role.id ? "text-brand-orange" : "text-text-body")}>
                                {role.label}
                            </div>
                            <div className="text-[10px] md:text-xs text-text-muted mt-1 group-hover:text-text-body transition-colors leading-tight">{role.desc}</div>
                        </div>
                    ))}
                </div>
                {errors.role && <p className="text-red-400 text-xs pl-1">{errors.role?.message}</p>}
            </div >

            {/* 3. Kies je afstand */}
            {selectedRole !== "vrijwilliger" && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-action-blue/10 rounded-xl text-action-blue">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-display text-text-body">Kies je afstand</h3>
                            <p className="text-sm text-text-muted">Welke route ga je lopen?</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: "2.5", label: "2.5 KM", icon: Footprints, color: "text-green-500" },
                            { id: "6", label: "6 KM", icon: Route, color: "text-blue-500" },
                            { id: "10", label: "10 KM", icon: Medal, color: "text-indigo-500" },
                            { id: "15", label: "15 KM", icon: Trophy, color: "text-orange-500" }
                        ].map((dist) => (
                            <div
                                key={dist.id}
                                onClick={() => setValue("distance", dist.id as any)}
                                className={cn(
                                    "cursor-pointer rounded-2xl border-2 p-3 md:p-4 text-center transition-all duration-300 relative group overflow-hidden flex flex-col justify-center items-center h-full min-h-[100px]",
                                    selectedDistance === dist.id
                                        ? "border-brand-orange bg-brand-orange/5 shadow-lg ring-2 ring-brand-orange/30"
                                        : "border-glass-border glass-card hover:border-brand-orange/50"
                                )}
                            >
                                {selectedDistance === dist.id && (
                                    <div className="absolute inset-0 bg-linear-to-tr from-brand-orange/10 to-transparent pointer-events-none" />
                                )}
                                {selectedDistance === dist.id && (
                                    <div className="absolute top-1 right-1 md:top-2 md:right-2 text-brand-orange animate-in fade-in zoom-in duration-300">
                                        <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 fill-brand-orange/20" />
                                    </div>
                                )}
                                <div className="mb-1 md:mb-2 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 filter drop-shadow-md">
                                    <dist.icon className={cn("w-7 h-7 md:w-8 md:h-8", dist.color)} />
                                </div>
                                <div className={cn("font-bold text-sm md:text-lg transition-colors duration-300", selectedDistance === dist.id ? "text-brand-orange" : "text-text-body")}>
                                    {dist.label}
                                </div>
                            </div>
                        ))}
                    </div>
                    {errors.distance && <p className="text-red-400 text-xs pl-1">{errors.distance?.message}</p>}
                </div>
            )}

            {/* 4. Ondersteuning */}
            {selectedRole !== "vrijwilliger" && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-brand-orange/10 rounded-xl text-brand-orange">
                            <HeartHandshake className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-display text-text-body">Ondersteuning</h3>
                            <p className="text-sm text-text-muted">Heb je extra hulp nodig tijdens het evenement?</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: "ja", label: "Ja, graag", icon: CheckCircle2 },
                            { id: "nee", label: "Nee", icon: XCircle },
                            { id: "anders", label: "Anders", icon: HelpCircle }
                        ].map((opt) => (
                            <div
                                key={opt.id}
                                onClick={() => setValue("supportNeeded", opt.id as any)}
                                className={cn(
                                    "cursor-pointer rounded-2xl border-2 p-3 md:p-4 text-center transition-all duration-300 relative group overflow-hidden flex flex-col justify-center items-center h-full min-h-[100px]",
                                    selectedSupport === opt.id
                                        ? "border-brand-primary bg-brand-primary/5 shadow-lg ring-2 ring-brand-primary/30"
                                        : "border-glass-border glass-card hover:border-brand-orange/50"
                                )}
                            >
                                {selectedSupport === opt.id && (
                                    <div className="absolute inset-0 bg-linear-to-tr from-brand-primary/10 to-transparent pointer-events-none" />
                                )}
                                {selectedSupport === opt.id && (
                                    <div className="absolute top-1 right-1 md:top-2 md:right-2 text-brand-primary animate-in fade-in zoom-in duration-300">
                                        <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 fill-brand-orange/20" />
                                    </div>
                                )}
                                <div className="mb-1 md:mb-2 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 filter drop-shadow-md">
                                    <opt.icon className={cn("w-7 h-7 md:w-8 md:h-8", selectedSupport === opt.id ? "text-brand-orange" : "text-text-muted")} />
                                </div>
                                <div className={cn("font-bold text-sm md:text-lg transition-colors duration-300 leading-tight", selectedSupport === opt.id ? "text-brand-orange" : "text-text-body")}>
                                    {opt.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {
                        selectedSupport === "anders" && (
                            <div className="animate-fade-in origin-top group transition-all duration-300">
                                <Label htmlFor="supportDescription" className="mb-2 block cursor-pointer">Toelichting</Label>
                                <Textarea
                                    id="supportDescription"
                                    {...register("supportDescription")}
                                    placeholder="Waar kunnen we je mee helpen?"
                                    className="min-h-[100px] bg-glass-bg focus-visible:ring-brand-orange/50 focus-visible:border-brand-orange shadow-sm hover:bg-brand-orange/5 transition-all"
                                />
                                {errors.supportDescription && <p className="text-red-400 text-xs pl-1 mt-1">{errors.supportDescription?.message}</p>}
                            </div>
                        )
                    }
                </div>
            )}

            {/* 4.1 Begeleider: kies individueel of groepsregistratie */}
            {selectedRole === "begeleider" && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-brand-orange/10 rounded-xl text-brand-orange">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-display text-text-body">Deelnemer(s) koppelen</h3>
                            <p className="text-sm text-text-muted">Eén persoon of een hele groep aanmelden?</p>
                        </div>
                    </div>

                    {/* Toggle: individueel vs. groep */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                            onClick={() => setGroupMode(false)}
                            className={cn(
                                "cursor-pointer rounded-2xl border-2 p-4 transition-all flex items-center gap-3",
                                !isGroupRegistration
                                    ? "border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/30"
                                    : "border-glass-border glass-card hover:border-brand-orange/50"
                            )}
                        >
                            <User className={cn("w-8 h-8 shrink-0", !isGroupRegistration ? "text-brand-orange" : "text-text-muted")} />
                            <div>
                                <div className={cn("font-bold", !isGroupRegistration ? "text-brand-orange" : "text-text-body")}>1 deelnemer</div>
                                <div className="text-xs text-text-muted">Ik begeleid één persoon</div>
                            </div>
                            {!isGroupRegistration && <CheckCircle2 className="w-5 h-5 text-brand-orange ml-auto shrink-0" />}
                        </div>
                        <div
                            onClick={() => { setGroupMode(true); if (groupMembers.length === 0) addGroupMember(); }}
                            className={cn(
                                "cursor-pointer rounded-2xl border-2 p-4 transition-all flex items-center gap-3",
                                isGroupRegistration
                                    ? "border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/30"
                                    : "border-glass-border glass-card hover:border-brand-orange/50"
                            )}
                        >
                            <Building className={cn("w-8 h-8 shrink-0", isGroupRegistration ? "text-brand-orange" : "text-text-muted")} />
                            <div>
                                <div className={cn("font-bold", isGroupRegistration ? "text-brand-orange" : "text-text-body")}>Groepsregistratie</div>
                                <div className="text-xs text-text-muted">Meerdere cliënten aanmelden</div>
                            </div>
                            {isGroupRegistration && <CheckCircle2 className="w-5 h-5 text-brand-orange ml-auto shrink-0" />}
                        </div>
                    </div>

                    {/* Individueel: classic single companion velden */}
                    {!isGroupRegistration && (
                        <div className="space-y-4">
                            <div className="space-y-2 group/field">
                                <Label htmlFor="companionName" className="transition-colors group-hover/field:text-brand-orange">Naam deelnemer (vereist)</Label>
                                <div className="relative transition-all duration-300">
                                    <User className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted/50 transition-colors duration-300 group-focus-within/field:text-brand-orange group-hover/field:text-brand-orange/70" />
                                    <Input id="companionName" {...register("companionName")} placeholder="Naam van de deelnemer" className="pl-11 transition-all duration-300 group-focus-within/field:ring-brand-orange/50 group-focus-within/field:border-brand-orange group-hover/field:border-brand-orange/50 hover:bg-brand-orange/5" />
                                </div>
                                {errors.companionName && <p className="text-red-400 text-xs pl-1">{errors.companionName?.message}</p>}
                            </div>
                            <div className="space-y-2 group/field">
                                <Label htmlFor="companionEmail" className="transition-colors group-hover/field:text-brand-orange">E-mailadres deelnemer (sterk aanbevolen)</Label>
                                <div className="relative transition-all duration-300">
                                    <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted/50 transition-colors duration-300 group-focus-within/field:text-brand-orange group-hover/field:text-brand-orange/70" />
                                    <Input id="companionEmail" type="email" {...register("companionEmail")} placeholder="E-mail deelnemer (optioneel voor koppeling)" className="pl-11 transition-all duration-300 group-focus-within/field:ring-brand-orange/50 group-focus-within/field:border-brand-orange group-hover/field:border-brand-orange/50 hover:bg-brand-orange/5" />
                                </div>
                                {errors.companionEmail && <p className="text-red-400 text-xs pl-1">{errors.companionEmail?.message}</p>}
                            </div>
                        </div>
                    )}

                    {/* Groepsregistratie: embedded deelnemers */}
                    {isGroupRegistration && (
                        <div className="space-y-4 animate-fade-in">
                            {/* Info banner */}
                            <div className="flex items-start gap-3 p-4 bg-brand-orange/5 border border-brand-orange/20 rounded-xl">
                                <Building2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                                <div className="text-sm text-text-muted">
                                    <span className="font-semibold text-text-body">Instellingsregistratie</span> — Voeg elke cliënt hieronder toe.
                                    Ze worden allemaal gekoppeld aan jouw e-mailadres. Geen eigen email per cliënt nodig.
                                </div>
                            </div>

                            {/* Groepsleden lijst */}
                            {groupMembers.map((member, i) => (
                                <GroupMemberForm
                                    key={i}
                                    member={member}
                                    index={i}
                                    onChange={updateGroupMember}
                                    onRemove={removeGroupMember}
                                />
                            ))}

                            {/* Validatie feedback */}
                            {groupMembers.length === 0 && (
                                <p className="text-amber-400 text-sm text-center py-2">Voeg minimaal één deelnemer toe.</p>
                            )}

                            {/* Deelnemer toevoegen knop */}
                            {groupMembers.length < MAX_GROUP_MEMBERS && (
                                <button
                                    type="button"
                                    onClick={addGroupMember}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-dashed border-brand-orange/40 text-brand-orange hover:bg-brand-orange/5 hover:border-brand-orange transition-all duration-300 font-medium"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    Deelnemer toevoegen ({groupMembers.length}/{MAX_GROUP_MEMBERS})
                                </button>
                            )}

                            {/* Groepstelling */}
                            {groupMembers.length > 0 && (
                                <div className="flex items-center justify-center gap-2 py-2 text-sm text-text-muted">
                                    <Users className="w-4 h-4 text-brand-orange" />
                                    <span><strong className="text-text-body">{groupMembers.length}</strong> deelnemer{groupMembers.length !== 1 ? "s" : ""} toegevoegd</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 4.5. Over jou */}
            {selectedRole === "deelnemer" && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-brand-orange/10 rounded-xl text-brand-orange">
                            <Heart className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-display text-text-body">Over jou</h3>
                            <p className="text-sm text-text-muted">Vertel ons meer zodat we je goed kunnen begeleiden.</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Plaatsnaam */}
                        <div className="space-y-2 group/field">
                            <Label htmlFor="city" className="transition-colors group-hover/field:text-brand-orange">Plaatsnaam</Label>
                            <div className="relative transition-all duration-300">
                                <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted/50 transition-colors duration-300 group-focus-within/field:text-brand-orange group-hover/field:text-brand-orange/70" />
                                <Input id="city" {...register("city")} placeholder="Bijv. Amsterdam, Utrecht..." className="pl-11 transition-all duration-300 group-focus-within/field:ring-brand-orange/50 group-focus-within/field:border-brand-orange group-focus-within/field:shadow-[0_0_20px_-5px_rgba(255,147,40,0.3)] group-hover/field:border-brand-orange/50 group-hover/field:shadow-[0_0_15px_-5px_rgba(255,147,40,0.2)] hover:bg-brand-orange/5" />
                            </div>
                        </div>

                        {/* Rolstoelgebruiker */}
                        <div className="space-y-2">
                            <Label className="block">Rolstoelgebruiker?</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {[{ val: true, label: "Ja", icon: Accessibility }, { val: false, label: "Nee", icon: XCircle }].map((opt) => (
                                    <div
                                        key={String(opt.val)}
                                        onClick={() => setValue("wheelchairUser", opt.val)}
                                        className={cn(
                                            "cursor-pointer rounded-2xl border-2 p-3 text-center transition-all duration-300 relative group overflow-hidden flex flex-col justify-center items-center min-h-[80px]",
                                            watch("wheelchairUser") === opt.val
                                                ? "border-brand-orange bg-brand-orange/5 shadow-lg ring-2 ring-brand-orange/30"
                                                : "border-glass-border glass-card hover:border-brand-orange/50"
                                        )}
                                    >
                                        {watch("wheelchairUser") === opt.val && <div className="absolute inset-0 bg-linear-to-tr from-brand-orange/10 to-transparent pointer-events-none" />}
                                        <opt.icon className={cn("w-6 h-6 mb-1", watch("wheelchairUser") === opt.val ? "text-brand-orange" : "text-text-muted")} />
                                        <div className={cn("font-bold text-sm", watch("wheelchairUser") === opt.val ? "text-brand-orange" : "text-text-body")}>{opt.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pendelbus */}
                        <div className="space-y-2">
                            <Label className="block">Hoe kom je naar de startlocatie?</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: "pendelbus", label: "Pendelbus", icon: Bus, desc: "Ophalen bij Grotekerk -> startlocatie" },
                                    { id: "eigen-vervoer", label: "Eigen vervoer", icon: MapPin, desc: "Ik kom zelf" }
                                ].map((opt) => (
                                    <div
                                        key={opt.id}
                                        onClick={() => setValue("shuttleBus", opt.id as any)}
                                        className={cn(
                                            "cursor-pointer rounded-2xl border-2 p-3 text-center transition-all duration-300 relative group overflow-hidden flex flex-col justify-center items-center min-h-[100px]",
                                            selectedShuttle === opt.id
                                                ? "border-brand-orange bg-brand-orange/5 shadow-lg ring-2 ring-brand-orange/30"
                                                : "border-glass-border glass-card hover:border-brand-orange/50"
                                        )}
                                    >
                                        {selectedShuttle === opt.id && <div className="absolute inset-0 bg-linear-to-tr from-brand-orange/10 to-transparent pointer-events-none" />}
                                        {selectedShuttle === opt.id && (
                                            <div className="absolute top-1 right-1 md:top-2 md:right-2 text-brand-orange animate-in fade-in zoom-in duration-300">
                                                <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 fill-brand-orange/20" />
                                            </div>
                                        )}
                                        <opt.icon className={cn("w-7 h-7 mb-1", selectedShuttle === opt.id ? "text-brand-orange" : "text-text-muted")} />
                                        <div className={cn("font-bold text-sm", selectedShuttle === opt.id ? "text-brand-orange" : "text-text-body")}>{opt.label}</div>
                                        <div className="text-[10px] md:text-xs text-text-muted mt-0.5 leading-tight">{opt.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Wonend in instelling */}
                        <div className="space-y-2">
                            <Label className="block">Wonend in een instelling?</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {[{ val: true, label: "Ja", icon: Building2 }, { val: false, label: "Nee", icon: Home }].map((opt) => (
                                    <div
                                        key={String(opt.val)}
                                        onClick={() => setValue("livesInFacility", opt.val)}
                                        className={cn(
                                            "cursor-pointer rounded-2xl border-2 p-3 text-center transition-all duration-300 relative group overflow-hidden flex flex-col justify-center items-center min-h-[80px]",
                                            watch("livesInFacility") === opt.val
                                                ? "border-brand-orange bg-brand-orange/5 shadow-lg scale-[1.03]"
                                                : "border-glass-border glass-card hover:border-brand-orange/50"
                                        )}
                                    >
                                        {watch("livesInFacility") === opt.val && <div className="absolute inset-0 bg-linear-to-tr from-brand-orange/10 to-transparent pointer-events-none" />}
                                        <opt.icon className={cn("w-6 h-6 mb-1", watch("livesInFacility") === opt.val ? "text-brand-orange" : "text-text-muted")} />
                                        <div className={cn("font-bold text-sm", watch("livesInFacility") === opt.val ? "text-brand-orange" : "text-text-body")}>{opt.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Doelgroep */}
                        <div className="space-y-2">
                            <Label className="block">Wat beschrijft jou het best?</Label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: "doelgroep", label: "Doelgroep", icon: Heart, desc: "Ik hoor bij de doelgroep" },
                                    { id: "verwant", label: "Verwant", icon: Users, desc: "Familie / naaste" },
                                    { id: "anders", label: "Anders", icon: HelpCircle, desc: "Geen van beide" }
                                ].map((opt) => (
                                    <div
                                        key={opt.id}
                                        onClick={() => setValue("participantType", opt.id as any)}
                                        className={cn(
                                            "cursor-pointer rounded-2xl border-2 p-3 text-center transition-all duration-300 relative group overflow-hidden flex flex-col justify-center items-center min-h-[100px]",
                                            selectedParticipantType === opt.id
                                                ? "border-brand-orange bg-brand-orange/5 shadow-lg ring-2 ring-brand-orange/30"
                                                : "border-glass-border glass-card hover:border-brand-orange/50"
                                        )}
                                    >
                                        {selectedParticipantType === opt.id && <div className="absolute inset-0 bg-linear-to-tr from-brand-orange/10 to-transparent pointer-events-none" />}
                                        {selectedParticipantType === opt.id && (
                                            <div className="absolute top-1 right-1 md:top-2 md:right-2 text-brand-orange animate-in fade-in zoom-in duration-300">
                                                <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 fill-brand-orange/20" />
                                            </div>
                                        )}
                                        <opt.icon className={cn("w-7 h-7 mb-1", selectedParticipantType === opt.id ? "text-brand-orange" : "text-text-muted")} />
                                        <div className={cn("font-bold text-sm leading-tight", selectedParticipantType === opt.id ? "text-brand-orange" : "text-text-body")}>{opt.label}</div>
                                        <div className="text-[10px] md:text-xs text-text-muted mt-0.5 leading-tight">{opt.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Noodcontact (ICE) */}
            < div className="space-y-6" >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-brand-orange/10 rounded-xl text-brand-orange">
                        <Phone className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-display text-text-body">Noodcontact</h3>
                        <p className="text-sm text-text-muted">Wie kunnen we bellen in geval van nood?</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2 group/field">
                        <Label htmlFor="iceName" className="transition-colors group-hover/field:text-brand-orange">Naam contactpersoon</Label>
                        <div className="relative transition-all duration-300">
                            <Contact className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted transition-colors duration-300 group-focus-within/field:text-brand-orange group-hover/field:text-brand-orange/70 group-hover/field:scale-110 transform" />
                            <Input id="iceName" {...register("iceName")} placeholder="Naam van partner, ouder, vriend..." className="pl-11 transition-all duration-300 group-focus-within/field:bg-transparent group-focus-within/field:ring-brand-orange/50 group-focus-within/field:border-brand-orange group-focus-within/field:shadow-[0_0_20px_-5px_rgba(255,147,40,0.3)] group-hover/field:border-brand-orange/50 group-hover/field:shadow-[0_0_15px_-5px_rgba(255,147,40,0.2)] hover:bg-brand-orange/5" />
                        </div>
                        {errors.iceName && <p className="text-red-400 text-xs pl-1">{errors.iceName?.message}</p>}
                    </div>

                    <div className="space-y-2 group/field">
                        <Label htmlFor="icePhone" className="transition-colors group-hover/field:text-brand-orange">Telefoonnummer</Label>
                        <div className="relative transition-all duration-300">
                            <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted transition-colors duration-300 group-focus-within/field:text-brand-orange group-hover/field:text-brand-orange/70 group-hover/field:scale-110 transform" />
                            <Input id="icePhone" type="tel" {...register("icePhone")} placeholder="06 12345678" className="pl-11 transition-all duration-300 group-focus-within/field:bg-transparent group-focus-within/field:ring-brand-orange/50 group-focus-within/field:border-brand-orange group-focus-within/field:shadow-[0_0_20px_-5px_rgba(255,147,40,0.3)] group-hover/field:border-brand-orange/50 group-hover/field:shadow-[0_0_15px_-5px_rgba(255,147,40,0.2)] hover:bg-brand-orange/5" />
                        </div>
                        {errors.icePhone && <p className="text-red-400 text-xs pl-1">{errors.icePhone?.message}</p>}
                    </div>
                </div>
            </div >

            {/* 5.5 Account Toggle */}
            < div className="space-y-6 bg-linear-to-br from-brand-orange/5 to-transparent p-6 rounded-2xl border border-brand-orange/20" >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-brand-orange/10 rounded-xl text-brand-orange">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-display text-text-body">Account aanmaken (optioneel)</h3>
                        <p className="text-sm text-text-muted">Kies hoe je wilt deelnemen</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 glass-card border border-glass-border hover:border-brand-orange/30 transition-all cursor-pointer" onClick={() => setWantsAccount(!wantsAccount)}>
                        <div className="pt-1">
                            <input
                                type="checkbox"
                                checked={wantsAccount}
                                onChange={(e) => setWantsAccount(e.target.checked)}
                                className="h-5 w-5 rounded border-glass-border bg-glass-bg text-brand-orange focus:ring-brand-orange cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2 flex-1">
                            <Label className="text-text-body font-bold cursor-pointer flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Ik wil een account aanmaken voor toekomstige edities
                            </Label>
                            {wantsAccount && (
                                <div className="text-sm space-y-1 p-3 bg-brand-orange/5 rounded-lg border border-brand-orange/20 animate-fade-in">
                                    <p className="text-text-muted font-medium flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> Voordelen van een account:</p>
                                    <ul className="text-text-muted text-xs space-y-1 pl-4">
                                        <li>• Toegang tot je persoonlijke dashboard</li>
                                        <li>• Beheer inschrijvingen voor meerdere jaren</li>
                                        <li>• Sneller inschrijven voor volgende edities</li>
                                        <li>• Ontvang updates over je deelname</li>
                                    </ul>
                                </div>
                            )}
                            {!wantsAccount && (
                                <p className="text-sm text-text-muted">
                                    Je schrijft je alleen in voor dit evenement, zonder account.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div >

            {/* 6. Voorwaarden & Submit */}
            < div className="space-y-6 pt-6 border-t border-glass-border" >
                <h3 className="text-lg font-bold font-display text-text-body">Afronden</h3>

                <div className="bg-surface/50 p-4 rounded-xl border border-glass-border space-y-4">
                    {/* Terms */}
                    <div className="flex items-start gap-4">
                        <div className="pt-1">
                            <input
                                type="checkbox"
                                id="terms"
                                {...register("agreedToTerms")}
                                className="h-5 w-5 rounded border-glass-border bg-glass-bg text-brand-primary focus:ring-brand-primary cursor-pointer"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="terms" className="text-text-body font-bold cursor-pointer">
                                Akkoord met de voorwaarden
                            </Label>
                            <p className="text-sm text-text-muted">
                                Ik heb de <a href="/voorwaarden" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline font-medium">Algemene Voorwaarden</a> gelezen en ga hiermee akkoord.
                            </p>
                        </div>
                    </div>
                    {errors.agreedToTerms && <p className="text-red-400 text-xs mt-2 pl-9">{errors.agreedToTerms?.message}</p>}

                    {/* Media Consent */}
                    <div className="flex items-start gap-4 pt-4 border-t border-glass-border/50">
                        <div className="pt-1">
                            <input
                                type="checkbox"
                                id="media"
                                {...register("agreedToMedia")}
                                className="h-5 w-5 rounded border-glass-border bg-glass-bg text-brand-primary focus:ring-brand-primary cursor-pointer"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="media" className="text-text-body font-bold cursor-pointer flex items-center gap-2">
                                <Camera className="w-4 h-4 text-text-muted" /> Foto's & Video
                            </Label>
                            <p className="text-sm text-text-muted">
                                Ik vind het goed dat er tijdens het evenement beelden worden gemaakt voor promotie.
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="default"
                    className="w-full bg-brand-orange text-white shadow-2xl shadow-brand-orange/30 min-h-14 h-auto py-4 text-base md:text-lg rounded-2xl group transition-all duration-500 hover:scale-[1.02] hover:shadow-brand-orange/50 hover:bg-brand-orange/90 relative overflow-hidden whitespace-normal"
                    disabled={isSubmitting}
                >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    {isSubmitting ? (
                        "Bezig met verwerken..."
                    ) : (
                        <span className="flex items-center justify-center gap-2 relative z-10 leading-tight">
                            {wantsAccount ? "Account Aanmaken & Inschrijven" : "Nu Inschrijven (Zonder Account)"} <ChevronRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                        </span>
                    )}
                </Button>

                {/* Info about chosen flow */}
                <p className="text-xs text-text-muted text-center">
                    {wantsAccount
                        ? "Je ontvangt een email om je wachtwoord in te stellen."
                        : "Je kunt later nog een account aanmaken via 'Mijn Deelname'."}
                </p>
            </div >
        </form >
    );
}
