import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Dedicated SSR endpoint for AI content generation via Vercel AI Gateway.
 *
 * WHY THIS EXISTS:
 * The Go backend calls xAI directly, but the response takes 10-20s.
 * The Vercel SSR proxy [...all].ts has a ~10s function timeout → 502.
 *
 * SOLUTION: Call xAI directly from this SSR endpoint via the Vercel AI Gateway
 * (https://ai-gateway.vercel.sh/v1). The AI Gateway handles long requests
 * natively with no timeout issues.
 *
 * The prompt-building logic is replicated from the Go backend's archetypes.go.
 */

const AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";

// Content type limits (mirrored from Go archetypes.go)
const CONTENT_LIMITS: Record<string, { maxChars: number; maxTokens: number }> = {
    tweet: { maxChars: 280, maxTokens: 120 },
    verhaal: { maxChars: 1500, maxTokens: 500 },
    artikel: { maxChars: 4000, maxTokens: 1200 },
};

// Archetype voice descriptions (mirrored from Go archetypes.go)
const ARCHETYPE_VOICES: Record<string, string> = {
    hero: `ARCHETYPE: DE HELD
Je stem is die van iemand die de 15 km vanaf Kootwijk heeft gewandeld.
Die de heuvel bij Hoog Soeren opkwam met pijn in de benen en een glimlach.
Je spreekt vanuit ervaring. Je woorden voelen als een hand op iemands schouder.
Focus op zelfoverwinning, transformatie, en collectieve kracht.`,

    ruler: `ARCHETYPE: DE BESTUURDER
Je stem is die van Apeldoorn zelf. De stad die zegt: "Dit is van ons."
Je spreekt met trots over wat de stad bereikt. Je benoemt concrete resultaten.
Focus op impact, leiderschap, en gemeenschapstrots.`,

    caregiver: `ARCHETYPE: DE VERZORGER
Je stem is die van iemand die vanochtend een bewoner van 's Heeren Loo
heeft geholpen met aankleden, en vanavond naast hen bij de finish staat.
Focus op menselijke verbinding, empathie, en zorg.`,

    sage: `ARCHETYPE: DE WIJZE
Je stem is die van iemand die het grotere plaatje ziet.
Die het historische belang van de Koninklijke Weg naar Paleis Het Loo kent.
Focus op kennis, context, en diepere betekenis.`,

    explorer: `ARCHETYPE: DE ONTDEKKER
Je stem is die van iemand die voor het eerst op de Veluwe wandelt.
Alles is nieuw, alles is mooi, alles is een avontuur.
Focus op ontdekking, verwondering, en de schoonheid van de route.`,
};

// Core event context (mirrored from Go archetypes.go)
const EVENT_CONTEXT = `=== EVENEMENT: DE KONINKLIJKE LOOP (DKL) ===

KERNIDENTITEIT:
De Koninklijke Loop is een inclusief wandelevenement en sponsorloop in APELDOORN.
Het is GEEN hardloopwedstrijd. Het is een wandelevenement waar inclusiviteit,
verbinding en rolstoelvriendelijkheid centraal staan.

Op 16 mei 2026 brengt De Koninklijke Loop verleden, heden en toekomst samen.
Deelnemers wandelen het laatste stuk van de historische, rolstoelvriendelijke
'Koninklijke Weg' richting de finish bij Paleis Het Loo.

HET VERHAAL:
Dit evenement is een samenwerking tussen de Apeldoornse rapper Salih Toprak
en de bewoners van 's Heeren Loo. De bewoners staan niet aan de zijlijn,
maar nemen de leiding. Samen halen zij geld op voor Sportclub Only Friends.

FEITEN:
- Datum: Zaterdag 16 mei 2026
- Locatie: APELDOORN
- Finish: Paleis Het Loo in Apeldoorn
- Route: Het laatste stuk van de historische Koninklijke Weg
- Deelname: GRATIS
- Website: www.dekoninklijkeloop.nl
- Organisatie: Salih Toprak + bewoners van 's Heeren Loo

Routes:
- 2,5 km "Roll & Stroll": Volledig rolstoelvriendelijk
- 6 km "Hoog Soeren": Heuvelachtig landschap
- 10 km "Asselse Heide": Over de Asselse heide
- 15 km "Kootwijk – Apeldoorn": De volledige Koninklijke Weg

Goede doel 2026: Sportclub Only Friends

ABSOLUTE REGELS:
1. Dit is een WANDELEVENEMENT — NOOIT "hardlopen" of "rennen".
2. De locatie is ALTIJD Apeldoorn.
3. De finish is ALTIJD Paleis Het Loo.
4. Het goede doel is ALTIJD Only Friends.
5. Deelname is ALTIJD GRATIS.
6. Schrijf in het Nederlands.`;

const BASE_INSTRUCTIONS = `UNIVERSELE CONTENT STANDAARDEN:
1. Elke post vertelt een micro-verhaal met begin, midden, en einde.
2. Gebruik "Show, Don't Tell" — beschrijf een beeld, geen reclameboodschap.
3. NOOIT generieke marketing-taal ("Doe mee!", "Mis het niet!").
4. Gebruik 1-2 relevante hashtags aan het EINDE: #DeKoninklijkeLoop #DKL2026
5. Schrijf op senior contentstrateeg niveau.
6. Open met een psychologische trigger (nieuwsgierigheid, herkenning).
7. Maximaal 2-3 hashtags, geen emoji's tenzij ze het verhaal versterken (max 1).
8. NOOIT "hardlopen" of "rennen" — dit is een WANDELevenement.`;

function buildSystemPrompt(archetype: string): string {
    const voice = ARCHETYPE_VOICES[archetype] || ARCHETYPE_VOICES.hero;
    return `${EVENT_CONTEXT}\n\n${voice}\n\n${BASE_INSTRUCTIONS}`;
}

function buildUserPrompt(contentType: string, campaignContext: string): string {
    const limits = CONTENT_LIMITS[contentType] || CONTENT_LIMITS.tweet;
    let typeInstruction = "";

    switch (contentType) {
        case "verhaal":
            typeInstruction = `Schrijf een VERHAAL (storytelling format) van maximaal ${limits.maxChars} tekens.
Gebruik alinea's, sfeer, en een narratieve boog. Dit is een langere vertelling,
geen korte tweet. Bouw spanning op en sluit af met een emotioneel moment.`;
            break;
        case "artikel":
            typeInstruction = `Schrijf een ARTIKEL van maximaal ${limits.maxChars} tekens.
Gebruik een sterke kop, inleiding, middenstuk met feiten, en een krachtige afsluiting.
Dit is een diepgaand stuk dat informeert en inspireert.`;
            break;
        default:
            typeInstruction = `Schrijf een TWEET van maximaal ${limits.maxChars} tekens.
Kort, krachtig, en impactvol. Elke letter telt.`;
    }

    return `${typeInstruction}

Context/thema: ${campaignContext}

BELANGRIJK: Geef ALLEEN de uiteindelijke tekst terug. Geen uitleg, geen opties, geen "hier is...".
Maximaal ${limits.maxChars} tekens. Tel zorgvuldig.`;
}

export const POST: APIRoute = async ({ request, cookies }) => {
    // Auth check
    const token = cookies.get("access_token")?.value || cookies.get("dkl_auth_token")?.value;
    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Parse request body
    let body: { archetype?: string; content_type?: string; campaign_context?: string; thread_mode?: boolean };
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    const archetype = body.archetype || "hero";
    const contentType = body.content_type || "tweet";
    const campaignContext = body.campaign_context || "Inclusief wandelevenement door Apeldoorn richting Paleis Het Loo";
    const limits = CONTENT_LIMITS[contentType] || CONTENT_LIMITS.tweet;

    // Get the AI Gateway API key from environment
    const gatewayKey = import.meta.env.AI_GATEWAY_API_KEY;
    const xaiKey = import.meta.env.XAI_API_KEY;

    if (!gatewayKey && !xaiKey) {
        return new Response(JSON.stringify({ error: "No AI API key configured" }), { status: 500 });
    }

    const systemPrompt = buildSystemPrompt(archetype);
    const userPrompt = buildUserPrompt(contentType, campaignContext);

    // Try AI Gateway first, then direct xAI as fallback
    const providers = [];
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

    let draft = "";
    let usedProvider = "";

    for (const provider of providers) {
        try {
            const aiResponse = await fetch(provider.url, {
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
                    max_tokens: limits.maxTokens,
                    temperature: 0.8,
                }),
            });

            if (!aiResponse.ok) {
                const errText = await aiResponse.text();
                console.error(`[AI:${provider.name}] Error ${aiResponse.status}: ${errText.substring(0, 200)}`);
                continue;
            }

            const data = await aiResponse.json();
            draft = data?.choices?.[0]?.message?.content?.trim() || "";

            if (draft) {
                usedProvider = provider.name;
                break;
            }
        } catch (err) {
            console.error(`[AI:${provider.name}] Fetch failed:`, err);
            continue;
        }
    }

    if (!draft) {
        return new Response(JSON.stringify({ error: "AI generation failed across all providers" }), { status: 502 });
    }

    // Enforce character limit
    if ([...draft].length > limits.maxChars) {
        draft = [...draft].slice(0, limits.maxChars - 3).join("") + "...";
    }

    if (import.meta.env.DEV) {
        console.log(`[AI] Generated via ${usedProvider}: ${draft.substring(0, 80)}...`);
    }

    return new Response(JSON.stringify({
        draft,
        type: "single",
        content_type: contentType,
        max_chars: limits.maxChars,
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
