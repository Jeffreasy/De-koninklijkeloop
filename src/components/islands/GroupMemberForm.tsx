import { cn } from "../../lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Trash2, User, Footprints, Route, Medal, Trophy, Accessibility, XCircle, Bus, MapPin, CheckCircle2, Building2, Home, Heart, Users, HelpCircle } from "lucide-react";

export type GroupMember = {
    name: string;
    distance?: "2.5" | "6" | "10" | "15";
    wheelchairUser?: boolean;
    shuttleBus?: "pendelbus" | "eigen-vervoer";
    supportNeeded?: "ja" | "nee" | "anders";
    supportDescription?: string;
    livesInFacility?: boolean;
    participantType?: "doelgroep" | "verwant" | "anders";
    agreedToMedia?: boolean;
};

type Props = {
    member: GroupMember;
    index: number;
    onChange: (index: number, updated: GroupMember) => void;
    onRemove: (index: number) => void;
};

const DISTANCES: { id: GroupMember["distance"]; label: string; icon: typeof Footprints; color: string }[] = [
    { id: "2.5", label: "2.5 KM", icon: Footprints, color: "text-green-500" },
    { id: "6",   label: "6 KM",   icon: Route,      color: "text-blue-500" },
    { id: "10",  label: "10 KM",  icon: Medal,      color: "text-indigo-500" },
    { id: "15",  label: "15 KM",  icon: Trophy,     color: "text-orange-500" },
];

export default function GroupMemberForm({ member, index, onChange, onRemove }: Props) {
    const update = (patch: Partial<GroupMember>) => onChange(index, { ...member, ...patch });

    return (
        <div className="glass-card rounded-2xl p-5 border border-glass-border space-y-5 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-orange/10 rounded-lg text-brand-orange">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-text-body">Deelnemer {index + 1}</span>
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    aria-label="Verwijder deelnemer"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Naam */}
            <div className="space-y-1.5">
                <Label>Naam deelnemer *</Label>
                <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted/50" />
                    <Input
                        value={member.name}
                        onChange={e => update({ name: e.target.value })}
                        placeholder="Voornaam achternaam"
                        className="pl-10"
                    />
                </div>
                {!member.name && <p className="text-red-400 text-xs">Naam is verplicht</p>}
            </div>

            {/* Afstand */}
            <div className="space-y-1.5">
                <Label>Afstand *</Label>
                <div className="grid grid-cols-4 gap-2">
                    {DISTANCES.map(d => (
                        <div
                            key={d.id}
                            onClick={() => update({ distance: d.id })}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-2 text-center transition-all flex flex-col items-center gap-1",
                                member.distance === d.id
                                    ? "border-brand-orange bg-brand-orange/5 ring-1 ring-brand-orange/30"
                                    : "border-glass-border glass-card hover:border-brand-orange/50"
                            )}
                        >
                            <d.icon className={cn("w-5 h-5", d.color)} />
                            <span className={cn("text-xs font-bold", member.distance === d.id ? "text-brand-orange" : "text-text-body")}>
                                {d.label}
                            </span>
                        </div>
                    ))}
                </div>
                {!member.distance && <p className="text-red-400 text-xs">Kies een afstand</p>}
            </div>

            {/* Rolstoel */}
            <div className="space-y-1.5">
                <Label>Rolstoelgebruiker?</Label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { val: true,  label: "Ja", icon: Accessibility },
                        { val: false, label: "Nee", icon: XCircle },
                    ].map(opt => (
                        <div
                            key={String(opt.val)}
                            onClick={() => update({ wheelchairUser: opt.val })}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-2 text-center transition-all flex items-center justify-center gap-2",
                                member.wheelchairUser === opt.val
                                    ? "border-brand-orange bg-brand-orange/5"
                                    : "border-glass-border glass-card hover:border-brand-orange/50"
                            )}
                        >
                            <opt.icon className={cn("w-4 h-4", member.wheelchairUser === opt.val ? "text-brand-orange" : "text-text-muted")} />
                            <span className={cn("text-sm font-medium", member.wheelchairUser === opt.val ? "text-brand-orange" : "text-text-body")}>{opt.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pendelbus */}
            <div className="space-y-1.5">
                <Label>Vervoer naar startlocatie</Label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: "pendelbus" as const,     label: "Pendelbus",     icon: Bus },
                        { id: "eigen-vervoer" as const, label: "Eigen vervoer", icon: MapPin },
                    ].map(opt => (
                        <div
                            key={opt.id}
                            onClick={() => update({ shuttleBus: opt.id })}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-2 text-center transition-all flex items-center justify-center gap-2",
                                member.shuttleBus === opt.id
                                    ? "border-brand-orange bg-brand-orange/5"
                                    : "border-glass-border glass-card hover:border-brand-orange/50"
                            )}
                        >
                            <opt.icon className={cn("w-4 h-4", member.shuttleBus === opt.id ? "text-brand-orange" : "text-text-muted")} />
                            <span className={cn("text-sm font-medium", member.shuttleBus === opt.id ? "text-brand-orange" : "text-text-body")}>{opt.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ondersteuning */}
            <div className="space-y-1.5">
                <Label>Ondersteuning nodig?</Label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: "ja" as const,     label: "Ja" },
                        { id: "nee" as const,    label: "Nee" },
                        { id: "anders" as const, label: "Anders" },
                    ].map(opt => (
                        <div
                            key={opt.id}
                            onClick={() => update({ supportNeeded: opt.id })}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-2 text-center transition-all text-sm font-medium",
                                member.supportNeeded === opt.id
                                    ? "border-brand-orange bg-brand-orange/5 text-brand-orange"
                                    : "border-glass-border glass-card text-text-body hover:border-brand-orange/50"
                            )}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
                {member.supportNeeded === "anders" && (
                    <Textarea
                        value={member.supportDescription ?? ""}
                        onChange={e => update({ supportDescription: e.target.value })}
                        placeholder="Omschrijf de benodigde ondersteuning..."
                        className="mt-2 min-h-[80px]"
                    />
                )}
            </div>

            {/* Wonend in instelling */}
            <div className="space-y-1.5">
                <Label>Wonend in een instelling?</Label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { val: true,  label: "Ja",  icon: Building2 },
                        { val: false, label: "Nee", icon: Home },
                    ].map(opt => (
                        <div
                            key={String(opt.val)}
                            onClick={() => update({ livesInFacility: opt.val })}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-2 text-center transition-all flex items-center justify-center gap-2",
                                member.livesInFacility === opt.val
                                    ? "border-brand-orange bg-brand-orange/5"
                                    : "border-glass-border glass-card hover:border-brand-orange/50"
                            )}
                        >
                            <opt.icon className={cn("w-4 h-4", member.livesInFacility === opt.val ? "text-brand-orange" : "text-text-muted")} />
                            <span className={cn("text-sm font-medium", member.livesInFacility === opt.val ? "text-brand-orange" : "text-text-body")}>{opt.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Doelgroep type */}
            <div className="space-y-1.5">
                <Label>Wat beschrijft deelnemer het best?</Label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: "doelgroep" as const, label: "Doelgroep", icon: Heart },
                        { id: "verwant"   as const, label: "Verwant",   icon: Users },
                        { id: "anders"   as const, label: "Anders",    icon: HelpCircle },
                    ].map(opt => (
                        <div
                            key={opt.id}
                            onClick={() => update({ participantType: opt.id })}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-2 text-center transition-all flex flex-col items-center gap-1",
                                member.participantType === opt.id
                                    ? "border-brand-orange bg-brand-orange/5"
                                    : "border-glass-border glass-card hover:border-brand-orange/50"
                            )}
                        >
                            <opt.icon className={cn("w-4 h-4", member.participantType === opt.id ? "text-brand-orange" : "text-text-muted")} />
                            <span className={cn("text-xs font-medium", member.participantType === opt.id ? "text-brand-orange" : "text-text-body")}>{opt.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Media toestemming */}
            <div className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl border border-glass-border">
                <input
                    type="checkbox"
                    id={`media-${index}`}
                    checked={member.agreedToMedia ?? false}
                    onChange={e => update({ agreedToMedia: e.target.checked })}
                    className="h-4 w-4 rounded border-glass-border text-brand-orange"
                />
                <Label htmlFor={`media-${index}`} className="text-sm cursor-pointer">
                    Akkoord met foto/video opname tijdens het evenement
                </Label>
            </div>
        </div>
    );
}
