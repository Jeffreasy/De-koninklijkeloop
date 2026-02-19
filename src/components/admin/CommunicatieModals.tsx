import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SECTORS, REGIOS } from "../../lib/prConstants";
import { AdminModal, AdminModalFooterButtons } from "./AdminModal";
import { Upload } from "lucide-react";

interface Props {
    type: "organization" | "contact" | "import";
    editing?: Record<string, any> | null;
    organizations?: Array<{ _id: string; naam: string }>;
    onClose: () => void;
}

export default function CommunicatieModals({ type, editing, organizations, onClose }: Props) {
    if (type === "organization") return <OrgModal editing={editing} onClose={onClose} />;
    if (type === "contact") return <ContactModal editing={editing} organizations={organizations} onClose={onClose} />;
    if (type === "import") return <ImportModal organizations={organizations} onClose={onClose} />;
    return null;
}

// ═══ ORGANIZATION MODAL ═══
function OrgModal({ editing, onClose }: { editing: Record<string, any> | null | undefined; onClose: () => void }) {
    const createOrg = useMutation(api.prCommunicatie.createOrganization);
    const updateOrg = useMutation(api.prCommunicatie.updateOrganization);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        naam: editing?.naam || "",
        sector: editing?.sector || "overig",
        regio: editing?.regio || "overig",
        type: editing?.type || "",
        website: editing?.website || "",
        notities: editing?.notities || "",
    });

    const handleSubmit = async () => {
        if (!form.naam.trim()) return;
        setLoading(true);
        try {
            if (editing) {
                await updateOrg({ id: editing._id, ...form });
            } else {
                await createOrg(form as any);
            }
            onClose();
        } catch (err) {
            if (import.meta.env.DEV) console.error("Failed to save organization:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminModal
            isOpen={true}
            onClose={onClose}
            title={editing ? "Organisatie bewerken" : "Organisatie toevoegen"}
            size="xl"
            footer={
                <AdminModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={editing ? "Bijwerken" : "Toevoegen"}
                    isLoading={loading}
                    confirmDisabled={!form.naam.trim()}
                />
            }
        >
            <div className="space-y-4">
                <Field label="Naam *">
                    <input
                        type="text"
                        value={form.naam}
                        onChange={(e) => setForm({ ...form, naam: e.target.value })}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all"
                        placeholder="bijv. Radboudumc"
                    />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Sector">
                        <select
                            value={form.sector}
                            onChange={(e) => setForm({ ...form, sector: e.target.value })}
                            className="w-full px-3 pr-10 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all cursor-pointer appearance-none bg-no-repeat bg-size-[16px_16px] bg-position-[right_12px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] [&>option]:bg-gray-900 [&>option]:text-white"
                        >
                            {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </Field>
                    <Field label="Regio">
                        <select
                            value={form.regio}
                            onChange={(e) => setForm({ ...form, regio: e.target.value })}
                            className="w-full px-3 pr-10 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all cursor-pointer appearance-none bg-no-repeat bg-size-[16px_16px] bg-position-[right_12px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] [&>option]:bg-gray-900 [&>option]:text-white"
                        >
                            {REGIOS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </Field>
                </div>
                <Field label="Type (optioneel)">
                    <input
                        type="text"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all"
                        placeholder="bijv. Topklinisch"
                    />
                </Field>
                <Field label="Website (optioneel)">
                    <input
                        type="url"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all"
                        placeholder="https://..."
                    />
                </Field>
                <Field label="Notities (optioneel)">
                    <textarea
                        value={form.notities}
                        onChange={(e) => setForm({ ...form, notities: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all resize-none"
                    />
                </Field>
            </div>
        </AdminModal>
    );
}

// ═══ CONTACT MODAL ═══
function ContactModal({ editing, organizations, onClose }: { editing: Record<string, any> | null | undefined; organizations?: Array<{ _id: string; naam: string }>; onClose: () => void }) {
    const createContact = useMutation(api.prCommunicatie.createContact);
    const updateContact = useMutation(api.prCommunicatie.updateContact);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: editing?.email || "",
        naam: editing?.naam || "",
        functie: editing?.functie || "",
        organizationId: editing?.organizationId || "",
        notities: editing?.notities || "",
    });

    const handleSubmit = async () => {
        if (!form.email.trim()) return;
        setLoading(true);
        try {
            const payload: any = {
                email: form.email,
                naam: form.naam || undefined,
                functie: form.functie || undefined,
                organizationId: form.organizationId || undefined,
                notities: form.notities || undefined,
            };
            if (editing) {
                await updateContact({ id: editing._id, ...payload });
            } else {
                await createContact(payload);
            }
            onClose();
        } catch (err) {
            if (import.meta.env.DEV) console.error("Failed to save contact:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminModal
            isOpen={true}
            onClose={onClose}
            title={editing ? "Contact bewerken" : "Contact toevoegen"}
            size="xl"
            footer={
                <AdminModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={editing ? "Bijwerken" : "Toevoegen"}
                    isLoading={loading}
                    confirmDisabled={!form.email.trim()}
                />
            }
        >
            <div className="space-y-4">
                <Field label="Email *">
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all"
                        placeholder="email@organisatie.nl"
                    />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Naam">
                        <input
                            type="text"
                            value={form.naam}
                            onChange={(e) => setForm({ ...form, naam: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all"
                            placeholder="Voornaam Achternaam"
                        />
                    </Field>
                    <Field label="Functie">
                        <input
                            type="text"
                            value={form.functie}
                            onChange={(e) => setForm({ ...form, functie: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all"
                            placeholder="bijv. PR Manager"
                        />
                    </Field>
                </div>
                <Field label="Organisatie">
                    <select
                        value={form.organizationId}
                        onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                        className="w-full px-3 pr-10 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all cursor-pointer appearance-none bg-no-repeat bg-size-[16px_16px] bg-position-[right_12px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] [&>option]:bg-gray-900 [&>option]:text-white"
                    >
                        <option value="">— Geen organisatie —</option>
                        {organizations?.map((org) => <option key={org._id} value={org._id}>{org.naam}</option>)}
                    </select>
                </Field>
                <Field label="Notities (optioneel)">
                    <textarea
                        value={form.notities}
                        onChange={(e) => setForm({ ...form, notities: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all resize-none"
                    />
                </Field>
            </div>
        </AdminModal>
    );
}

// ═══ CSV IMPORT MODAL ═══
function ImportModal({ organizations, onClose }: { organizations?: Array<{ _id: string; naam: string }>; onClose: () => void }) {
    const bulkImportOrgs = useMutation(api.prCommunicatie.bulkImportOrganizations);
    const bulkImportContacts = useMutation(api.prCommunicatie.bulkImportContacts);
    const [loading, setLoading] = useState(false);
    const [importType, setImportType] = useState<"organizations" | "contacts">("contacts");
    const [preview, setPreview] = useState<any[]>([]);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError("");

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const text = ev.target?.result as string;
                const lines = text.split(/\r?\n/).filter(Boolean);
                if (lines.length < 2) { setError("CSV moet minimaal een header + 1 rij bevatten"); return; }

                const headers = lines[0].split(/[;,]/).map((h) => h.trim().toLowerCase().replace(/"/g, ""));
                const rows = lines.slice(1).map((line) => {
                    const vals = line.split(/[;,]/).map((v) => v.trim().replace(/^"|"$/g, ""));
                    const obj: Record<string, string> = {};
                    headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
                    return obj;
                });

                setPreview(rows.slice(0, 50));
            } catch {
                setError("Kon CSV niet lezen. Controleer het formaat.");
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        setLoading(true);
        setError("");
        try {
            if (importType === "organizations") {
                const orgs = preview.map((row) => ({
                    naam: row.naam || row.name || row.organisatie || "Onbekend",
                    sector: mapSector(row.sector || row.type || ""),
                    regio: mapRegio(row.regio || row.region || row.stad || ""),
                    website: row.website || row.url || undefined,
                    notities: row.notities || row.notes || undefined,
                }));
                await bulkImportOrgs({ organizations: orgs as any });
            } else {
                const contacts = preview.map((row) => ({
                    email: row.email || row["e-mail"] || "",
                    naam: row.naam || row.name || undefined,
                    functie: row.functie || row.function || row.titel || undefined,
                    notities: row.notities || row.notes || undefined,
                })).filter((c) => c.email);
                await bulkImportContacts({ contacts: contacts as any });
            }
            onClose();
        } catch (err: any) {
            setError(err.message || "Import mislukt");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminModal
            isOpen={true}
            onClose={onClose}
            title="CSV Import"
            size="2xl"
            showFooter={preview.length > 0}
            footer={
                <AdminModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleImport}
                    confirmText={`Importeer ${preview.length} ${importType === "contacts" ? "contacten" : "organisaties"}`}
                    isLoading={loading}
                />
            }
        >
            <div className="space-y-4">
                <div className="flex gap-2">
                    {(["contacts", "organizations"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => { setImportType(t); setPreview([]); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${importType === t ? "bg-brand-orange/15 text-brand-orange" : "text-text-muted hover:text-text-primary"
                                }`}
                        >
                            {t === "contacts" ? "Contacten" : "Organisaties"}
                        </button>
                    ))}
                </div>

                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
                    <button onClick={() => fileRef.current?.click()} className="text-sm text-text-muted hover:text-brand-orange transition-colors cursor-pointer">
                        <Upload className="w-6 h-6 mx-auto mb-2" />
                        Klik om CSV bestand te kiezen
                    </button>
                    <p className="text-xs text-text-muted mt-2">
                        {importType === "contacts"
                            ? "Kolommen: email, naam, functie, notities"
                            : "Kolommen: naam, sector, regio, website, notities"}
                    </p>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                {preview.length > 0 && (
                    <>
                        <p className="text-sm text-text-muted">{preview.length} rij(en) gevonden — preview:</p>
                        <div className="max-h-48 overflow-auto rounded-xl border border-border">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-surface/40 border-b border-border">
                                        {Object.keys(preview[0]).map((h) => (
                                            <th key={h} className="px-2 py-1.5 text-left font-semibold text-text-secondary">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="border-b border-border/50">
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} className="px-2 py-1 text-text-primary truncate max-w-[150px]">{val as string}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </AdminModal>
    );
}

// ═══ SHARED ═══

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="text-xs font-medium text-text-secondary mb-1.5 block">{label}</span>
            {children}
        </label>
    );
}

// ═══ HELPERS ═══

function mapSector(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes("academisch") || lower.includes("umc")) return "academisch_ziekenhuis";
    if (lower.includes("ziekenhuis") || lower.includes("hospital")) return "algemeen_ziekenhuis";
    if (lower.includes("ggz") || lower.includes("psychiatr") || lower.includes("mental")) return "ggz";
    if (lower.includes("gehandicapt") || lower.includes("disability")) return "gehandicaptenzorg";
    if (lower.includes("verpleging") || lower.includes("verzorging") || lower.includes("nursing")) return "verpleging_verzorging";
    if (lower.includes("revalidat")) return "revalidatie";
    return "overig";
}

function mapRegio(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes("apeldoorn")) return "apeldoorn";
    if (lower.includes("gelderland") || lower.includes("arnhem") || lower.includes("nijmegen")) return "gelderland";
    if (lower.includes("overijssel") || lower.includes("zwolle") || lower.includes("enschede") || lower.includes("deventer")) return "overijssel";
    return "overig";
}
