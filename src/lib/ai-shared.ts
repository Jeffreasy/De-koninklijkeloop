/**
 * Shared AI infrastructure for email and social content generation.
 * Extracted from /api/admin/social/posts/generate.ts to enable reuse.
 */

import { getConvexClient } from './convex-server';
import { api } from '../../convex/_generated/api';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AIProvider {
    name: string;
    url: string;
    key: string;
    model: string;
}

export interface EventData {
    finish_location: string;
    location_city: string;
    event_date_display: string;
    max_participants: number | null;
    current_participants: number;
    available_distances: Array<{ km: string; label: string; description?: string }>;
    campaignTitle: string | null;
    campaignAmount: number | null;
    campaignTarget: number | null;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";

const EVENT_DATA_DEFAULTS: EventData = {
    finish_location: "Grote Kerk Apeldoorn",
    location_city: "Apeldoorn",
    event_date_display: "zaterdag 16 mei 2026",
    max_participants: 150,
    current_participants: 0,
    available_distances: [
        { km: "2.5", label: "Roll & Stroll" },
        { km: "6", label: "Hoog Soeren" },
        { km: "10", label: "Asselse Heide" },
        { km: "15.6", label: "Kootwijk – Apeldoorn" },
    ],
    campaignTitle: "Sportclub Only Friends",
    campaignAmount: null,
    campaignTarget: null,
};

// ─── Event data ─────────────────────────────────────────────────────────────

export async function fetchEventData(): Promise<EventData> {
    try {
        const convex = getConvexClient();
        const [settings, campaign] = await Promise.all([
            convex.query(api.eventSettings.getActiveSettings),
            convex.query(api.donations.getActiveCampaign),
        ]);

        return {
            finish_location: settings?.finish_location || EVENT_DATA_DEFAULTS.finish_location,
            location_city: settings?.location_city || EVENT_DATA_DEFAULTS.location_city,
            event_date_display: settings?.event_date_display || EVENT_DATA_DEFAULTS.event_date_display,
            max_participants: settings?.max_participants ?? EVENT_DATA_DEFAULTS.max_participants,
            current_participants: settings?.current_participants ?? 0,
            available_distances: settings?.available_distances?.length
                ? settings.available_distances
                : EVENT_DATA_DEFAULTS.available_distances,
            campaignTitle: campaign?.title || EVENT_DATA_DEFAULTS.campaignTitle,
            campaignAmount: campaign?.current_amount ?? null,
            campaignTarget: campaign?.target_amount ?? null,
        };
    } catch (err) {
        console.error("[EventData] Convex fetch failed, using defaults:", err);
        return EVENT_DATA_DEFAULTS;
    }
}

export function buildEventContext(data: EventData): string {
    const routeLines = data.available_distances.map(d =>
        `- ${d.km} km "${d.label}"${d.description ? `: ${d.description}` : ""}`
    ).join("\n");

    const campaignLine = data.campaignAmount !== null
        ? `\nHuidig opgehaald bedrag: €${data.campaignAmount.toLocaleString("nl-NL")}${data.campaignTarget ? ` (doel: €${data.campaignTarget.toLocaleString("nl-NL")})` : ""}`
        : "";

    return `=== EVENEMENT: DE KONINKLIJKE LOOP (DKL) ===

KERNIDENTITEIT:
De Koninklijke Loop is een inclusief wandelevenement en sponsorloop in ${data.location_city.toUpperCase()}.
Het is GEEN hardloopwedstrijd. Het is een wandelevenement waar inclusiviteit,
verbinding en rolstoelvriendelijkheid centraal staan.

Op ${data.event_date_display} (3e editie) brengt De Koninklijke Loop verleden, heden en toekomst samen.
Deelnemers wandelen over de Koninklijke Weg — een rolstoelvriendelijke route bedacht
door oud-wethouder Aalt van de Glind (rond 2006-2010, hij overleed in 2018) — richting
de finish bij ${data.finish_location}.

HET VERHAAL (KERN — altijd gebruiken):
Wat dit evenement uniek maakt, is de organisatie: een samenwerking tussen de
Apeldoornse rapper Salih Toprak en de bewoners van 's Heeren Loo.
De bewoners staan niet aan de zijlijn, maar nemen de leiding.
Samen halen zij geld op voor ${data.campaignTitle || "Sportclub Only Friends"}, zodat ook andere jongeren
met een beperking de kracht van sport kunnen ervaren.
Een evenement voor iedereen, door iedereen.

FEITEN (NIET WIJZIGEN):
- Datum: ${data.event_date_display}
- Locatie: ${data.location_city.toUpperCase()}
- Finish: ${data.finish_location}
- Route: De Koninklijke Weg, bedacht door Aalt van de Glind (~2006-2010)
- Deelname: GRATIS
- Website: www.dekoninklijkeloop.nl
- Organisatie: Salih Toprak + bewoners van 's Heeren Loo
- Schaal: Compact evenement, max ~${data.max_participants || 150} deelnemers${data.current_participants > 0 ? ` (huidig: ${data.current_participants} aangemeld)` : ""}

Routes:
${routeLines}

Goede doel 2026: ${data.campaignTitle || "Sportclub Only Friends"}${campaignLine}`;
}

// ─── Provider setup ─────────────────────────────────────────────────────────

export function getProviders(): AIProvider[] {
    const providers: AIProvider[] = [];
    const gatewayKey = import.meta.env.AI_GATEWAY_API_KEY;
    const xaiKey = import.meta.env.XAI_API_KEY;

    if (gatewayKey) {
        providers.push({
            name: "ai-gateway",
            url: AI_GATEWAY_URL,
            key: gatewayKey,
            model: "xai/grok-3",
        });
    }
    if (xaiKey) {
        providers.push({
            name: "xai-direct",
            url: "https://api.x.ai/v1/chat/completions",
            key: xaiKey,
            model: "grok-3",
        });
    }
    return providers;
}

// ─── AI call with fallback ──────────────────────────────────────────────────

export async function callAI(
    providers: AIProvider[],
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number,
    temperature: number = 0.7,
): Promise<string> {
    for (const provider of providers) {
        try {
            const response = await fetch(provider.url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${provider.key}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: provider.model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt },
                    ],
                    max_tokens: maxTokens,
                    temperature,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`[AI:${provider.name}] Error ${response.status}: ${errText.substring(0, 200)}`);
                continue;
            }

            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content?.trim() || "";

            if (text) return text;
        } catch (err) {
            console.error(`[AI:${provider.name}] Fetch failed:`, err);
            continue;
        }
    }
    throw new Error("AI generation failed across all providers");
}

// ─── Budget management ──────────────────────────────────────────────────────

const API_URL = import.meta.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";

export async function checkBudget(token: string): Promise<{ allowed: boolean; remaining: number }> {
    try {
        const tenantID = import.meta.env.PUBLIC_TENANT_ID || 'b2727666-7230-4689-b58b-ceab8c2898d5';
        const res = await fetch(`${API_URL}/admin/social/budget`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-Tenant-ID": tenantID,
            },
        });
        if (res.status === 401 || res.status === 403) return { allowed: false, remaining: 0 };
        if (!res.ok) return { allowed: false, remaining: 0 };
        const data = await res.json();
        return { allowed: (data.remaining ?? 0) > 0, remaining: data.remaining ?? 0 };
    } catch {
        return { allowed: false, remaining: 0 };
    }
}

export async function recordBudgetUsage(token: string): Promise<void> {
    try {
        const tenantID = import.meta.env.PUBLIC_TENANT_ID || 'b2727666-7230-4689-b58b-ceab8c2898d5';
        await fetch(`${API_URL}/admin/social/budget`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-Tenant-ID": tenantID,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "record_generation" }),
        });
    } catch {
        console.error("[Budget] Failed to record AI generation usage");
    }
}
