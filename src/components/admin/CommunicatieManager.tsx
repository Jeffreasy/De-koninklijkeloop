import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { SECTORS, REGIOS } from "../../lib/prConstants";
import { PaginationControls } from "./PaginationControls";
import { PAGINATION } from "./constants";
import CommunicatieModals from "./CommunicatieModals";
import { AdminModal, AdminModalFooterButtons } from "./AdminModal";
import {
    Building2, Users, Mail, Send, Search, Plus, Upload,
    Pencil, Trash2, Copy, Check, History, Loader2, AlertTriangle
} from "lucide-react";

// Typed records from Convex
interface OrgRecord {
    _id: Id<"pr_organizations">;
    naam: string;
    sector: string;
    regio: string;
    type?: string;
    website?: string;
    notities?: string;
    isActive: boolean;
    created_at: number;
    updated_at: number;
}

interface ContactRecord {
    _id: Id<"pr_contacts">;
    email: string;
    naam?: string;
    functie?: string;
    organizationId?: Id<"pr_organizations">;
    tags?: string[];
    isActive: boolean;
    notities?: string;
    organizationNaam: string | null;
    organizationSector: string | null;
    organizationRegio: string | null;
    created_at: number;
    updated_at: number;
}

type Tab = "organisaties" | "contacten" | "bcc" | "historie";

const TAB_CONFIG: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
    { key: "organisaties", label: "Organisaties", icon: <Building2 className="w-4 h-4" /> },
    { key: "contacten", label: "Contacten", icon: <Users className="w-4 h-4" /> },
    { key: "bcc", label: "BCC Generator", icon: <Copy className="w-4 h-4" /> },
    { key: "historie", label: "Verzendhistorie", icon: <History className="w-4 h-4" /> },
];

const PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE;

export default function CommunicatieManager() {
    const [activeTab, setActiveTab] = useState<Tab>("organisaties");
    const [sectorFilter, setSectorFilter] = useState("");
    const [regioFilter, setRegioFilter] = useState("");
    const [search, setSearch] = useState("");
    const [orgPage, setOrgPage] = useState(1);
    const [contactPage, setContactPage] = useState(1);

    // Modal state
    const [showOrgModal, setShowOrgModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingOrg, setEditingOrg] = useState<OrgRecord | null>(null);
    const [editingContact, setEditingContact] = useState<ContactRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ type: "org" | "contact"; id: string; name: string } | null>(null);

    // Queries
    const stats = useQuery(api.prCommunicatie.getStats);
    const organizations = useQuery(api.prCommunicatie.listOrganizations, {
        sector: sectorFilter || undefined,
        regio: regioFilter || undefined,
        search: search || undefined,
    } as any);
    const contacts = useQuery(api.prCommunicatie.listContacts, {
        search: search || undefined,
        sector: sectorFilter || undefined,
        regio: regioFilter || undefined,
    } as any);
    const sendHistory = useQuery(api.prCommunicatie.listSendHistory);

    // BCC query
    const bccResults = useQuery(api.prCommunicatie.getEmailsByFilter, {
        sector: sectorFilter || undefined,
        regio: regioFilter || undefined,
        activeOnly: true,
    } as any);

    // Mutations
    const deleteOrg = useMutation(api.prCommunicatie.deleteOrganization);
    const deleteContact = useMutation(api.prCommunicatie.deleteContact);
    const logSend = useMutation(api.prCommunicatie.logSend);

    const [copied, setCopied] = useState(false);
    const [bccSubject, setBccSubject] = useState("");
    const [bccNotes, setBccNotes] = useState("");

    // Pagination
    const paginatedOrgs = useMemo(() => {
        if (!organizations) return { items: [], totalPages: 0 };
        const totalPages = Math.max(1, Math.ceil(organizations.length / PAGE_SIZE));
        const start = (orgPage - 1) * PAGE_SIZE;
        return { items: organizations.slice(start, start + PAGE_SIZE), totalPages };
    }, [organizations, orgPage]);

    const paginatedContacts = useMemo(() => {
        if (!contacts) return { items: [], totalPages: 0 };
        const totalPages = Math.max(1, Math.ceil(contacts.length / PAGE_SIZE));
        const start = (contactPage - 1) * PAGE_SIZE;
        return { items: contacts.slice(start, start + PAGE_SIZE), totalPages };
    }, [contacts, contactPage]);

    // Reset pagination when filters change
    const handleSectorFilter = (v: string) => { setSectorFilter(v); setOrgPage(1); setContactPage(1); };
    const handleRegioFilter = (v: string) => { setRegioFilter(v); setOrgPage(1); setContactPage(1); };
    const handleSearch = (v: string) => { setSearch(v); setOrgPage(1); setContactPage(1); };

    const handleCopyBCC = async () => {
        if (!bccResults?.emails.length) return;
        await navigator.clipboard.writeText(bccResults.emails.join("; "));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogAndCopy = async () => {
        if (!bccResults?.emails.length || !bccSubject.trim()) return;
        await handleCopyBCC();
        const segmentParts: string[] = [];
        if (sectorFilter) {
            const s = SECTORS.find((s) => s.value === sectorFilter);
            segmentParts.push(s?.label || sectorFilter);
        }
        if (regioFilter) {
            const r = REGIOS.find((r) => r.value === regioFilter);
            segmentParts.push(r?.label || regioFilter);
        }
        await logSend({
            onderwerp: bccSubject,
            segment: segmentParts.length ? segmentParts.join(" — ") : "Alle contacten",
            aantalOntvangers: bccResults.emails.length,
            emailLijst: bccResults.emails,
            notities: bccNotes || undefined,
            verzondenDoor: "Admin", // TODO: replace with actual user identity from auth context
        });
        setBccSubject("");
        setBccNotes("");
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        if (deleteTarget.type === "org") {
            await deleteOrg({ id: deleteTarget.id as Id<"pr_organizations"> });
        } else {
            await deleteContact({ id: deleteTarget.id as Id<"pr_contacts"> });
        }
        setDeleteTarget(null);
    };

    const sectorLabel = (val: string) => SECTORS.find((s) => s.value === val)?.label ?? val;
    const regioLabel = (val: string) => REGIOS.find((r) => r.value === val)?.label ?? val;

    // Loading state
    const isLoading = activeTab === "organisaties" ? organizations === undefined
        : activeTab === "contacten" ? contacts === undefined
            : activeTab === "historie" ? sendHistory === undefined
                : false;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                        PR/Communicatie
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Contactdatabase en outreach management
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="px-4 py-2.5 rounded-xl border border-border bg-surface/60 text-text-secondary hover:text-text-primary hover:border-brand-orange/30 transition-all duration-200 text-sm font-medium cursor-pointer"
                    >
                        <Upload className="w-4 h-4 mr-1.5 inline-block align-[-2px]" />
                        CSV Import
                    </button>
                </div>
            </header>

            {/* KPI Stats with Glass Inset Glow */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Organisaties", value: stats?.activeOrganizations ?? 0, icon: <Building2 className="w-4 h-4" />, color: "from-orange-500/10" },
                    { label: "Contacten", value: stats?.activeContacts ?? 0, icon: <Users className="w-4 h-4" />, color: "from-blue-500/10" },
                    { label: "Unieke Emails", value: stats?.uniqueEmails ?? 0, icon: <Mail className="w-4 h-4" />, color: "from-emerald-500/10" },
                    { label: "Campagnes", value: stats?.totalCampaigns ?? 0, icon: <Send className="w-4 h-4" />, color: "from-purple-500/10" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-4"
                    >
                        {/* Glass Inset Glow (Pattern 3.14) */}
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${stat.color} to-transparent blur-2xl opacity-60 -mr-8 -mt-8 pointer-events-none`} />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-brand-orange">{stat.icon}</span>
                                <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
                                    {stat.label}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation — responsive with overflow scroll */}
            <div className="overflow-x-auto -mx-1 px-1">
                <div className="flex gap-1 p-1 rounded-xl bg-surface/40 border border-border/50 w-fit min-w-full sm:min-w-0">
                    {TAB_CONFIG.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === tab.key
                                ? "bg-brand-orange/15 text-brand-orange shadow-sm"
                                : "text-text-muted hover:text-text-primary hover:bg-surface/60"
                                }`}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters (shared between tabs) */}
            {(activeTab === "organisaties" || activeTab === "contacten" || activeTab === "bcc") && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Zoeken..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all"
                        />
                    </div>
                    <select
                        value={sectorFilter}
                        onChange={(e) => handleSectorFilter(e.target.value)}
                        className="px-3 pr-10 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm cursor-pointer focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all appearance-none bg-no-repeat bg-size-[16px_16px] bg-position-[right_12px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] [&>option]:bg-gray-900 [&>option]:text-white"
                    >
                        <option value="">Alle sectoren</option>
                        {SECTORS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                    <select
                        value={regioFilter}
                        onChange={(e) => handleRegioFilter(e.target.value)}
                        className="px-3 pr-10 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary text-sm cursor-pointer focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all appearance-none bg-no-repeat bg-size-[16px_16px] bg-position-[right_12px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] [&>option]:bg-gray-900 [&>option]:text-white"
                    >
                        <option value="">Alle regio's</option>
                        {REGIOS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Loading State (Pattern 3.23.2) */}
            {/* Loading State Skeleton */}
            {isLoading && (
                <div className="space-y-4 animate-pulse transition-opacity duration-300" aria-hidden="true">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="h-5 w-32 bg-surface/50 rounded" />
                        <div className="h-[42px] w-[200px] bg-surface/50 rounded-xl" />
                    </div>
                    <div className="rounded-2xl border border-border overflow-hidden">
                        <div className="h-[45px] bg-surface/40 border-b border-border" />
                        <div className="divide-y divide-border/50">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-[65px] bg-surface/10" />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ TAB: ORGANISATIES ═══ */}
            {activeTab === "organisaties" && !isLoading && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-text-muted">
                            {organizations?.length ?? 0} organisatie(s) gevonden
                        </p>
                        <button
                            onClick={() => { setEditingOrg(null); setShowOrgModal(true); }}
                            className="px-4 py-2.5 rounded-xl bg-brand-orange text-white font-medium text-sm hover:bg-brand-orange/90 transition-colors cursor-pointer"
                        >
                            <Plus className="w-4 h-4 mr-1.5 inline-block align-[-2px]" />
                            Organisatie toevoegen
                        </button>
                    </div>

                    <div className="rounded-2xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-surface/40">
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Naam</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Sector</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary hidden lg:table-cell">Website</th>
                                        <th className="text-right px-4 py-3 font-semibold text-text-secondary">Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedOrgs.items.map((org: OrgRecord) => (
                                        <tr key={org._id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-text-primary">{org.naam}</td>
                                            {/* Multi-Badge Column Stacking (Pattern 3.11) */}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="inline-flex w-fit px-2 py-0.5 rounded-md bg-brand-orange/10 text-brand-orange text-xs font-medium">
                                                        {sectorLabel(org.sector)}
                                                    </span>
                                                    <span className="inline-flex w-fit px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium">
                                                        {regioLabel(org.regio)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                {org.website && (
                                                    <a href={org.website} target="_blank" rel="noopener" className="text-brand-orange hover:underline text-xs truncate max-w-[200px] inline-block">
                                                        {org.website.replace(/^https?:\/\//, "")}
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => { setEditingOrg(org); setShowOrgModal(true); }}
                                                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface/60 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                                        title="Bewerken"
                                                        aria-label={`Bewerk ${org.naam}`}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget({ type: "org", id: org._id, name: org.naam })}
                                                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                                                        title="Verwijderen"
                                                        aria-label={`Verwijder ${org.naam}`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {organizations?.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-text-muted">
                                                Geen organisaties gevonden. Voeg er een toe of importeer via CSV.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {paginatedOrgs.totalPages > 1 && (
                        <PaginationControls
                            currentPage={orgPage}
                            totalPages={paginatedOrgs.totalPages}
                            totalItems={organizations?.length ?? 0}
                            onPageChange={setOrgPage}
                        />
                    )}
                </div>
            )}

            {/* ═══ TAB: CONTACTEN ═══ */}
            {activeTab === "contacten" && !isLoading && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-text-muted">
                            {contacts?.length ?? 0} contact(en) gevonden
                        </p>
                        <button
                            onClick={() => { setEditingContact(null); setShowContactModal(true); }}
                            className="px-4 py-2.5 rounded-xl bg-brand-orange text-white font-medium text-sm hover:bg-brand-orange/90 transition-colors cursor-pointer"
                        >
                            <Plus className="w-4 h-4 mr-1.5 inline-block align-[-2px]" />
                            Contact toevoegen
                        </button>
                    </div>

                    <div className="rounded-2xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-surface/40">
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Email</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary hidden sm:table-cell">Naam</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary hidden md:table-cell">Organisatie</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary hidden lg:table-cell">Functie</th>
                                        <th className="text-right px-4 py-3 font-semibold text-text-secondary">Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedContacts.items.map((contact: ContactRecord) => (
                                        <tr key={contact._id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-text-primary text-xs sm:text-sm break-all">{contact.email}</td>
                                            <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{contact.naam || "—"}</td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                {contact.organizationNaam ? (
                                                    <span className="text-text-secondary">{contact.organizationNaam}</span>
                                                ) : (
                                                    <span className="text-text-muted italic">Geen</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-text-muted hidden lg:table-cell">{contact.functie || "—"}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => { setEditingContact(contact); setShowContactModal(true); }}
                                                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface/60 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                                        title="Bewerken"
                                                        aria-label={`Bewerk ${contact.email}`}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget({ type: "contact", id: contact._id, name: contact.naam || contact.email })}
                                                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                                                        title="Verwijderen"
                                                        aria-label={`Verwijder ${contact.email}`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {contacts?.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                                                Geen contacten gevonden. Voeg er een toe of importeer via CSV.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {paginatedContacts.totalPages > 1 && (
                        <PaginationControls
                            currentPage={contactPage}
                            totalPages={paginatedContacts.totalPages}
                            totalItems={contacts?.length ?? 0}
                            onPageChange={setContactPage}
                        />
                    )}
                </div>
            )}

            {/* ═══ TAB: BCC GENERATOR ═══ */}
            {activeTab === "bcc" && (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-text-primary">
                                Gegenereerde BCC Lijst
                            </h3>
                            <span className="text-sm font-medium text-brand-orange">
                                {bccResults?.count ?? 0} email(s)
                            </span>
                        </div>

                        {/* Email list preview */}
                        <div className="max-h-48 overflow-y-auto rounded-xl bg-body/50 border border-border/50 p-3">
                            {bccResults?.details?.length ? (
                                <div className="space-y-1">
                                    {bccResults.details.map((d: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-surface/40">
                                            <span className="text-text-primary font-medium">{d.email}</span>
                                            <span className="text-text-muted truncate ml-3 max-w-[200px]">{d.organizationNaam}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-text-muted py-6 text-sm">
                                    {sectorFilter || regioFilter
                                        ? "Geen contacten gevonden voor deze filters."
                                        : "Selecteer sector en/of regio om een BCC lijst te genereren."}
                                </p>
                            )}
                        </div>

                        {/* Log + Copy controls */}
                        <div className="space-y-3 pt-2">
                            <input
                                type="text"
                                placeholder="Onderwerp van de email..."
                                value={bccSubject}
                                onChange={(e) => setBccSubject(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-brand-orange/50"
                            />
                            <textarea
                                placeholder="Notities (optioneel)..."
                                value={bccNotes}
                                onChange={(e) => setBccNotes(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-brand-orange/50 resize-none"
                            />
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleCopyBCC}
                                    disabled={!bccResults?.emails.length}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface/60 text-text-primary font-medium text-sm hover:border-brand-orange/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {copied ? <Check className="w-4 h-4 mr-1.5 inline-block align-[-2px]" /> : <Copy className="w-4 h-4 mr-1.5 inline-block align-[-2px]" />}
                                    {copied ? "Gekopieerd!" : "Kopieer BCC"}
                                </button>
                                <button
                                    onClick={handleLogAndCopy}
                                    disabled={!bccResults?.emails.length || !bccSubject.trim()}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-brand-orange text-white font-medium text-sm hover:bg-brand-orange/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4 mr-1.5 inline-block align-[-2px]" />
                                    Kopieer + Log
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ TAB: VERZENDHISTORIE ═══ */}
            {activeTab === "historie" && !isLoading && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-text-muted">
                            {sendHistory?.length ?? 0} verzending(en)
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-surface/40">
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Datum</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary">Onderwerp</th>
                                        <th className="text-left px-4 py-3 font-semibold text-text-secondary hidden md:table-cell">Segment</th>
                                        <th className="text-right px-4 py-3 font-semibold text-text-secondary">Ontvangers</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sendHistory?.map((entry: any) => (
                                        <tr key={entry._id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                                            <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                                                {new Date(entry.verzondenOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-4 py-3 text-text-primary font-medium">{entry.onderwerp}</td>
                                            <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{entry.segment}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="inline-flex px-2 py-0.5 rounded-md bg-brand-orange/10 text-brand-orange text-xs font-medium">
                                                    {entry.aantalOntvangers}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {sendHistory?.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-text-muted">
                                                Nog geen verzendingen gelogd. Gebruik de BCC Generator om je eerste verzending te loggen.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showOrgModal && (
                <CommunicatieModals
                    type="organization"
                    editing={editingOrg}
                    onClose={() => { setShowOrgModal(false); setEditingOrg(null); }}
                />
            )}
            {showContactModal && (
                <CommunicatieModals
                    type="contact"
                    editing={editingContact}
                    organizations={organizations ?? []}
                    onClose={() => { setShowContactModal(false); setEditingContact(null); }}
                />
            )}
            {showImportModal && (
                <CommunicatieModals
                    type="import"
                    organizations={organizations ?? []}
                    onClose={() => setShowImportModal(false)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <AdminModal
                    isOpen={true}
                    onClose={() => setDeleteTarget(null)}
                    title="Verwijderen bevestigen"
                    size="md"
                    footer={
                        <AdminModalFooterButtons
                            onCancel={() => setDeleteTarget(null)}
                            onConfirm={handleConfirmDelete}
                            cancelText="Annuleren"
                            confirmText="Verwijderen"
                        />
                    }
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-red-500/10">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <p className="text-text-primary font-medium">
                                Weet je zeker dat je <strong>{deleteTarget.name}</strong> wilt verwijderen?
                            </p>
                            <p className="text-text-muted text-sm mt-1">
                                {deleteTarget.type === "org"
                                    ? "Gekoppelde contacten worden losgekoppeld maar niet verwijderd."
                                    : "Dit contact wordt permanent verwijderd."}
                            </p>
                        </div>
                    </div>
                </AdminModal>
            )}
        </div>
    );
}
