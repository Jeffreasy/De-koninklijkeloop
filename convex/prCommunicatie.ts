import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════
// SECTOR & REGIO CONSTANTS (shared with frontend)
// ═══════════════════════════════════════════════════════════

export const SECTORS = [
    { value: "academisch_ziekenhuis", label: "Academisch Ziekenhuis" },
    { value: "algemeen_ziekenhuis", label: "Algemeen Ziekenhuis" },
    { value: "ggz", label: "GGZ" },
    { value: "gehandicaptenzorg", label: "Gehandicaptenzorg" },
    { value: "verpleging_verzorging", label: "Verpleging & Verzorging" },
    { value: "revalidatie", label: "Revalidatie" },
    { value: "overig", label: "Overig" },
] as const;

export const REGIOS = [
    { value: "apeldoorn", label: "Apeldoorn" },
    { value: "gelderland", label: "Gelderland" },
    { value: "overijssel", label: "Overijssel" },
    { value: "overig", label: "Overig" },
] as const;

// Validators
const sectorValidator = v.union(
    v.literal("academisch_ziekenhuis"),
    v.literal("algemeen_ziekenhuis"),
    v.literal("ggz"),
    v.literal("gehandicaptenzorg"),
    v.literal("verpleging_verzorging"),
    v.literal("revalidatie"),
    v.literal("overig")
);

const regioValidator = v.union(
    v.literal("apeldoorn"),
    v.literal("gelderland"),
    v.literal("overijssel"),
    v.literal("overig")
);

// ═══════════════════════════════════════════════════════════
// ORGANIZATIONS
// ═══════════════════════════════════════════════════════════

export const listOrganizations = query({
    args: {
        sector: v.optional(sectorValidator),
        regio: v.optional(regioValidator),
        search: v.optional(v.string()),
        activeOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        let orgs;

        if (args.sector && args.regio) {
            orgs = await ctx.db
                .query("pr_organizations")
                .withIndex("by_sector_regio", (q) =>
                    q.eq("sector", args.sector!).eq("regio", args.regio!)
                )
                .collect();
        } else if (args.sector) {
            orgs = await ctx.db
                .query("pr_organizations")
                .withIndex("by_sector", (q) => q.eq("sector", args.sector!))
                .collect();
        } else if (args.regio) {
            orgs = await ctx.db
                .query("pr_organizations")
                .withIndex("by_regio", (q) => q.eq("regio", args.regio!))
                .collect();
        } else {
            orgs = await ctx.db.query("pr_organizations").collect();
        }

        // Filter by active status
        if (args.activeOnly) {
            orgs = orgs.filter((o) => o.isActive);
        }

        // Filter by search term
        if (args.search) {
            const term = args.search.toLowerCase();
            orgs = orgs.filter(
                (o) =>
                    o.naam.toLowerCase().includes(term) ||
                    o.notities?.toLowerCase().includes(term) ||
                    o.website?.toLowerCase().includes(term)
            );
        }

        return orgs.sort((a, b) => a.naam.localeCompare(b.naam));
    },
});

export const getOrganization = query({
    args: { id: v.id("pr_organizations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const createOrganization = mutation({
    args: {
        naam: v.string(),
        sector: sectorValidator,
        regio: regioValidator,
        type: v.optional(v.string()),
        website: v.optional(v.string()),
        notities: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("pr_organizations", {
            ...args,
            isActive: true,
            created_at: now,
            updated_at: now,
        });
    },
});

export const updateOrganization = mutation({
    args: {
        id: v.id("pr_organizations"),
        naam: v.optional(v.string()),
        sector: v.optional(sectorValidator),
        regio: v.optional(regioValidator),
        type: v.optional(v.string()),
        website: v.optional(v.string()),
        notities: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Organization not found");

        // Filter out undefined values
        const cleanUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                cleanUpdates[key] = value;
            }
        }

        await ctx.db.patch(id, {
            ...cleanUpdates,
            updated_at: Date.now(),
        });
    },
});

export const deleteOrganization = mutation({
    args: { id: v.id("pr_organizations") },
    handler: async (ctx, args) => {
        // Check for linked contacts
        const contacts = await ctx.db
            .query("pr_contacts")
            .withIndex("by_organization", (q) => q.eq("organizationId", args.id))
            .collect();

        if (contacts.length > 0) {
            // Unlink contacts instead of blocking delete
            for (const contact of contacts) {
                await ctx.db.patch(contact._id, { organizationId: undefined });
            }
        }

        await ctx.db.delete(args.id);
    },
});

// ═══════════════════════════════════════════════════════════
// CONTACTS
// ═══════════════════════════════════════════════════════════

export const listContacts = query({
    args: {
        organizationId: v.optional(v.id("pr_organizations")),
        search: v.optional(v.string()),
        activeOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        let contacts;

        if (args.organizationId) {
            contacts = await ctx.db
                .query("pr_contacts")
                .withIndex("by_organization", (q) =>
                    q.eq("organizationId", args.organizationId!)
                )
                .collect();
        } else {
            contacts = await ctx.db.query("pr_contacts").collect();
        }

        if (args.activeOnly) {
            contacts = contacts.filter((c) => c.isActive);
        }

        if (args.search) {
            const term = args.search.toLowerCase();
            contacts = contacts.filter(
                (c) =>
                    c.email.toLowerCase().includes(term) ||
                    c.naam?.toLowerCase().includes(term) ||
                    c.functie?.toLowerCase().includes(term)
            );
        }

        // Enrich with organization name
        const enriched = await Promise.all(
            contacts.map(async (c) => {
                const org = c.organizationId
                    ? await ctx.db.get(c.organizationId)
                    : null;
                return {
                    ...c,
                    organizationNaam: org?.naam ?? null,
                    organizationSector: org?.sector ?? null,
                    organizationRegio: org?.regio ?? null,
                };
            })
        );

        return enriched.sort((a, b) => {
            const nameA = a.naam || a.email;
            const nameB = b.naam || b.email;
            return nameA.localeCompare(nameB);
        });
    },
});

export const createContact = mutation({
    args: {
        email: v.string(),
        naam: v.optional(v.string()),
        functie: v.optional(v.string()),
        organizationId: v.optional(v.id("pr_organizations")),
        tags: v.optional(v.array(v.string())),
        notities: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("pr_contacts", {
            ...args,
            isActive: true,
            created_at: now,
            updated_at: now,
        });
    },
});

export const updateContact = mutation({
    args: {
        id: v.id("pr_contacts"),
        email: v.optional(v.string()),
        naam: v.optional(v.string()),
        functie: v.optional(v.string()),
        organizationId: v.optional(v.id("pr_organizations")),
        tags: v.optional(v.array(v.string())),
        notities: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
        laatstGecontacteerd: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Contact not found");

        const cleanUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                cleanUpdates[key] = value;
            }
        }

        await ctx.db.patch(id, {
            ...cleanUpdates,
            updated_at: Date.now(),
        });
    },
});

export const deleteContact = mutation({
    args: { id: v.id("pr_contacts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// ═══════════════════════════════════════════════════════════
// BCC GENERATOR
// ═══════════════════════════════════════════════════════════

export const getEmailsByFilter = query({
    args: {
        sector: v.optional(sectorValidator),
        regio: v.optional(regioValidator),
        activeOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        // Get organizations matching filter
        let orgs;

        if (args.sector && args.regio) {
            orgs = await ctx.db
                .query("pr_organizations")
                .withIndex("by_sector_regio", (q) =>
                    q.eq("sector", args.sector!).eq("regio", args.regio!)
                )
                .collect();
        } else if (args.sector) {
            orgs = await ctx.db
                .query("pr_organizations")
                .withIndex("by_sector", (q) => q.eq("sector", args.sector!))
                .collect();
        } else if (args.regio) {
            orgs = await ctx.db
                .query("pr_organizations")
                .withIndex("by_regio", (q) => q.eq("regio", args.regio!))
                .collect();
        } else {
            orgs = await ctx.db.query("pr_organizations").collect();
        }

        if (args.activeOnly !== false) {
            orgs = orgs.filter((o) => o.isActive);
        }

        const orgIds = new Set(orgs.map((o) => o._id));

        // Get all active contacts
        const allContacts = await ctx.db
            .query("pr_contacts")
            .withIndex("by_active", (q) => q.eq("isActive", true))
            .collect();

        // Filter contacts belonging to matching orgs (or unlinked)
        const filteredContacts = allContacts.filter((c) => {
            if (!c.organizationId) return false; // Skip unlinked for BCC
            return orgIds.has(c.organizationId);
        });

        // Deduplicate emails
        const emailSet = new Set<string>();
        const results: Array<{
            email: string;
            naam: string | null;
            organizationNaam: string | null;
        }> = [];

        for (const contact of filteredContacts) {
            if (!emailSet.has(contact.email.toLowerCase())) {
                emailSet.add(contact.email.toLowerCase());
                const org = contact.organizationId
                    ? orgs.find((o) => o._id === contact.organizationId)
                    : null;
                results.push({
                    email: contact.email,
                    naam: contact.naam ?? null,
                    organizationNaam: org?.naam ?? null,
                });
            }
        }

        return {
            emails: results.map((r) => r.email),
            details: results,
            count: results.length,
        };
    },
});

// ═══════════════════════════════════════════════════════════
// SEND HISTORY
// ═══════════════════════════════════════════════════════════

export const logSend = mutation({
    args: {
        onderwerp: v.string(),
        segment: v.string(),
        aantalOntvangers: v.number(),
        emailLijst: v.array(v.string()),
        notities: v.optional(v.string()),
        verzondenDoor: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("pr_send_history", {
            ...args,
            verzondenOp: now,
            created_at: now,
        });
    },
});

export const listSendHistory = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("pr_send_history")
            .withIndex("by_date")
            .order("desc")
            .collect();
    },
});

// ═══════════════════════════════════════════════════════════
// STATS (Dashboard KPIs)
// ═══════════════════════════════════════════════════════════

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const orgs = await ctx.db.query("pr_organizations").collect();
        const contacts = await ctx.db.query("pr_contacts").collect();
        const history = await ctx.db.query("pr_send_history").collect();

        const activeOrgs = orgs.filter((o) => o.isActive).length;
        const activeContacts = contacts.filter((c) => c.isActive).length;
        const uniqueEmails = new Set(
            contacts.filter((c) => c.isActive).map((c) => c.email.toLowerCase())
        ).size;

        // Sector breakdown
        const bySector: Record<string, number> = {};
        for (const org of orgs.filter((o) => o.isActive)) {
            bySector[org.sector] = (bySector[org.sector] || 0) + 1;
        }

        // Regio breakdown
        const byRegio: Record<string, number> = {};
        for (const org of orgs.filter((o) => o.isActive)) {
            byRegio[org.regio] = (byRegio[org.regio] || 0) + 1;
        }

        return {
            totalOrganizations: orgs.length,
            activeOrganizations: activeOrgs,
            totalContacts: contacts.length,
            activeContacts,
            uniqueEmails,
            totalCampaigns: history.length,
            bySector,
            byRegio,
        };
    },
});

// ═══════════════════════════════════════════════════════════
// BULK IMPORT
// ═══════════════════════════════════════════════════════════

export const bulkImportOrganizations = mutation({
    args: {
        organizations: v.array(
            v.object({
                naam: v.string(),
                sector: sectorValidator,
                regio: regioValidator,
                type: v.optional(v.string()),
                website: v.optional(v.string()),
                notities: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const ids = [];
        for (const org of args.organizations) {
            const id = await ctx.db.insert("pr_organizations", {
                ...org,
                isActive: true,
                created_at: now,
                updated_at: now,
            });
            ids.push(id);
        }
        return { imported: ids.length };
    },
});

export const bulkImportContacts = mutation({
    args: {
        contacts: v.array(
            v.object({
                email: v.string(),
                naam: v.optional(v.string()),
                functie: v.optional(v.string()),
                organizationId: v.optional(v.id("pr_organizations")),
                tags: v.optional(v.array(v.string())),
                notities: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const ids = [];
        for (const contact of args.contacts) {
            const id = await ctx.db.insert("pr_contacts", {
                ...contact,
                isActive: true,
                created_at: now,
                updated_at: now,
            });
            ids.push(id);
        }
        return { imported: ids.length };
    },
});
