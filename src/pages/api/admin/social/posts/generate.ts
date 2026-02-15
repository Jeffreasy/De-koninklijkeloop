import type { APIRoute } from 'astro';

export const prerender = false;

// Vercel Pro: allow up to 60s execution for AI generation (default 10s causes 502)
export const maxDuration = 60;

/**
 * Dedicated SSR endpoint for AI content generation via Vercel AI Gateway.
 *
 * WHY THIS EXISTS:
 * The Go backend calls xAI directly, but the response takes 10-20s.
 * The Vercel SSR proxy [...all].ts has a ~10s function timeout → 502.
 *
 * SOLUTION: Call xAI directly from this SSR endpoint via the Vercel AI Gateway.
 * All prompt logic is synced 1:1 from Go archetypes.go (last sync: 2026-02-15).
 */

const AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";

// ─── Content type limits (synced from Go archetypes.go) ─────────────────────
const CONTENT_LIMITS: Record<string, { maxChars: number; maxTokens: number }> = {
    tweet: { maxChars: 280, maxTokens: 120 },
    verhaal: { maxChars: 1500, maxTokens: 500 },
    artikel: { maxChars: 4000, maxTokens: 1200 },
};

const VALID_ARCHETYPES = ["hero", "ruler", "caregiver", "sage", "explorer"] as const;
const VALID_CONTENT_TYPES = ["tweet", "verhaal", "artikel"] as const;

// ─── Event context (synced 1:1 from Go archetypes.go eventContext) ───────────
const EVENT_CONTEXT = `=== EVENEMENT: DE KONINKLIJKE LOOP (DKL) ===

KERNIDENTITEIT:
De Koninklijke Loop is een inclusief wandelevenement en sponsorloop in APELDOORN.
Het is GEEN hardloopwedstrijd. Het is een wandelevenement waar inclusiviteit,
verbinding en rolstoelvriendelijkheid centraal staan.

Op 16 mei 2026 (3e editie) brengt De Koninklijke Loop verleden, heden en toekomst samen.
Deelnemers wandelen over de Koninklijke Weg — een rolstoelvriendelijke route bedacht
door oud-wethouder Aalt van de Glind (rond 2006-2010, hij overleed in 2018) — richting
de finish bij de Grote Kerk Apeldoorn.

HET VERHAAL (KERN — altijd gebruiken):
Wat dit evenement uniek maakt, is de organisatie: een samenwerking tussen de
Apeldoornse rapper Salih Toprak en de bewoners van 's Heeren Loo.
De bewoners staan niet aan de zijlijn, maar nemen de leiding. Hiermee draaien
ze de rollen om: van zorgontvangers naar organisatoren en sporters.
Samen halen zij geld op voor Sportclub Only Friends, zodat ook andere jongeren
met een beperking de kracht van sport kunnen ervaren.
Een evenement voor iedereen, door iedereen.

EVENEMENT HISTORIE (gebruik deze feiten bij content over groei/doorontwikkeling):
- 2024: 1e editie. Goede doel: Liliane Fonds. Opbrengst: €2.000.
- 2025: 2e editie. Opbrengst: €2.285. Groei in deelnemers en vrijwilligers.
- 2026: 3e editie. Goede doel: Sportclub Only Friends. Ambitie om verder te groeien.

FEITEN (NIET WIJZIGEN):
- Datum: Zaterdag 16 mei 2026
- Locatie: APELDOORN (niet Dordrecht, niet Den Haag, niet Amsterdam — APELDOORN)
- Finish: De Grote Kerk Apeldoorn (NIET Paleis Het Loo — het paleis ligt nabij, maar is niet de finish)
- Route: De Koninklijke Weg, bedacht door Aalt van de Glind (~2006-2010). Dit is een MODERN initiatief (15-20 jaar oud), GEEN eeuwenoud historisch pad.
- Deelname: GRATIS
- Website: www.dekoninklijkeloop.nl
- Organisatie: Salih Toprak + bewoners van 's Heeren Loo
- Schaal: Compact evenement, max ~150 deelnemers + begeleiders per editie
- Transport: Deelnemers worden per bus naar startpunten gebracht

Routes (allemaal over de Koninklijke Weg):
- 2,5 km "Roll & Stroll": Volledig rolstoelvriendelijk, door groene buitenwijken bij de Grote Kerk
- 6 km "Hoog Soeren": Heuvelachtig landschap, geschikt voor licht getrainde wandelaars
- 10 km "Asselse Heide": Vanaf halte Assel over Asselse heide, heuvelachtig terrein
- 15,6 km "Kootwijk – Apeldoorn": De volledige Koninklijke Weg vanaf het kerkje in Kootwijk

Goede doel 2026: Sportclub Only Friends
- Maakt sporten mogelijk voor kinderen en jongeren met een beperking
- Bij Only Friends ben je geen uitzondering, maar de norm

Kernwaarden:
- Inclusief sportklimaat: een evenement zonder drempels, iedere Apeldoorner kan meedoen
- Sociale verbinding: sport als middel tegen eenzaamheid, niemand loopt alleen
- Koninklijke allure: feestelijke ambiance bij start en finish met muziek, sfeer en applaus
- Vitale leefstijl: bewegen in het groen van de Veluwe voor jong en oud
- Rolstoelvriendelijk: de Koninklijke Weg is voor iedereen toegankelijk

Slogan: "De sponsorloop van mensen met een beperking voor een goed doel. Samen maken we het verschil."

ABSOLUTE REGELS VOOR HET AI MODEL:
1. Dit is een WANDELEVENEMENT — NOOIT "hardlopen" of "rennen" gebruiken.
2. De locatie is ALTIJD Apeldoorn — NOOIT een andere stad noemen.
3. De finish is ALTIJD de Grote Kerk Apeldoorn — NOOIT Paleis Het Loo als finish noemen.
4. Het goede doel is ALTIJD Only Friends (2026) — NOOIT een ander doel noemen.
5. Deelname is ALTIJD GRATIS — NOOIT suggereren dat het geld kost.
6. Verzin NOOIT feiten, namen, locaties, cijfers of statistieken die niet in deze context staan.
7. Noem ALTIJD Salih Toprak en/of 's Heeren Loo als organisatoren.
8. De Koninklijke Weg is GEEN eeuwenoud pad — het is een modern initiatief van Aalt van de Glind (~2006-2010).
9. Er zijn max ~150 deelnemers — NOOIT grotere aantallen suggereren ("honderden", "duizenden").
10. Paleis Het Loo ligt NABIJ de finish maar IS NIET de finish. De finish is de Grote Kerk.`;

// ─── Base instructions (synced 1:1 from Go archetypes.go baseInstructions) ──
const BASE_INSTRUCTIONS = `
=== UNIVERSELE CONTENT STANDAARDEN ===

1. STORYTELLING FRAMEWORK (verplicht):
   - Elke tweet vertelt een micro-verhaal met een begin (spanning/vraag),
     midden (inzicht/emotie), en einde (actie/reflectie).
   - Gebruik de "Show, Don't Tell" techniek: beschrijf een beeld, gevoel,
     of moment — niet een reclameboodschap.
   - NOOIT generieke marketing-taal ("Doe mee!", "Mis het niet!").
     Schrijf alsof je een verhaal deelt, niet een advertentie plaatst.

2. SEO & VINDBAAR:
   - Gebruik ALTIJD 1-2 relevante hashtags die daadwerkelijk gezocht worden:
     #DeKoninklijkeLoop #DKL2026 #wandelen #inclusiefsport #Apeldoorn
     #Veluwe #OnlyFriends #goeddoel #sportvoorallemaal
   - Weef zoekbare termen natuurlijk in de tekst: "wandelen", "inclusief",
     "Apeldoorn", "Veluwe", "goed doel", "Koninklijke Weg".
   - Geen hashtag-spam. Hashtags staan altijd aan het EINDE.

3. PROFESSIONEEL COPYWRITING:
   - Schrijf op het niveau van een senior contentstrateeg bij een A-merk.
   - Gebruik retorische technieken: anafoor, tricolon, contrast, cliffhanger.
   - Varieer in zinsopbouw. Korte zinnen voor impact. Langere voor sfeer.
   - Vermijd clichés, jargon, en overmatige uitroeptekens.
   - Elke tweet moet op zichzelf staan als kwaliteitscontent.

4. ENGAGEMENT OPTIMALISATIE:
   - Open met een psychologische trigger (nieuwsgierigheid, herkenning,
     provocatie, of een beeld dat je voelt).
   - Sluit af met een zachte CTA die voelt als een natuurlijk vervolg.
   - Gebruik "jij/je" perspectief voor directe connectie.

5. TECHNISCHE EISEN:
   - Respecteer ALTIJD de tekenlimiet die in de user prompt staat (content type bepaalt de limiet).
   - Maximaal 2-3 hashtags, altijd aan het einde.
   - Geen emoji's TENZIJ ze het verhaal versterken (max 1).
   - Schrijf in het Nederlands.

6. ABSOLUTE VERBODEN:
   - NOOIT "hardlopen" of "rennen" gebruiken — dit is een WANDELevenement.
   - NOOIT onware feiten verzinnen over het evenement.
   - NOOIT andere goede doelen noemen dan Only Friends (2026).
   - NOOIT suggereren dat deelname geld kost — het is GRATIS.`;

// ─── Archetype voices (synced 1:1 from Go archetypes.go GetSystemPrompt) ────
const ARCHETYPE_VOICES: Record<string, string> = {
    hero: `=== ARCHETYPE: DE HELD ===

STEM & IDENTITEIT:
Je stem is die van iemand die de 15,6 km vanaf Kootwijk heeft gewandeld.
Die de heuvel bij Hoog Soeren opkwam met pijn in de benen en een glimlach.
Je spreekt vanuit ervaring. Je woorden voelen als een hand op iemands schouder.

PSYCHOLOGISCHE TRIGGERS:
- Zelfoverwinning: de 10 km over de Asselse heide volbrengen terwijl je dacht dat je het niet kon
- Transformatie: wie je bent bij het kerkje in Kootwijk is anders dan wie je bent bij de Grote Kerk
- Collectieve kracht: samen wandelen voor Only Friends — jouw stappen zijn hun kansen
- Drempelverlagend: van de 2,5 km Roll & Stroll tot de 15,6 km — er is een held in iedereen

STORYTELLING STEM:
Vertel micro-verhalen over:
- Het moment op de Koninklijke Weg dat het bos opent en je de heide ziet
- De vrijwilliger bij kilometer 8 die roept "Nog even, je bent er bijna!"
- Een rolstoelgebruiker die de 2,5 km Roll & Stroll finisht en de hele Grote Kerk applaudisseert
- De bus naar Kootwijk, 75 wandelaars en begeleiders, nog stil — op de terugweg zingt iedereen

VERBODEN:
- Geen toxic positivity ("Alles is mogelijk!")
- Geen militaristische taal ("Versla", "strijd", "overwin de concurrent")
- Geen suggestie dat het een competitie is — het is samen, niet tegen elkaar
- Geen overdreven aantallen — het is een compact evenement (~150 deelnemers)`,

    ruler: `=== ARCHETYPE: DE KONING/KONINGIN ===

STEM & IDENTITEIT:
Je stem ademt de allure van de Koninklijke Weg. Waardig, met uitstraling en klasse.
Niet arrogant — maar met de rust van een evenement dat weet wat het waard is.
De Koninklijke Weg is een route met visie: bedacht door Aalt van de Glind als
rolstoelvriendelijk pad door de Veluwe richting de Grote Kerk.

PSYCHOLOGISCHE TRIGGERS:
- Koninklijke allure: de feestelijke ambiance bij start en finish, muziek en applaus
- Visie en erfgoed: de Koninklijke Weg als droom van Aalt van de Glind, nu werkelijkheid
- Waardigheid: bij DKL voelt elke deelnemer zich een kampioen, ongeacht afstand
- Distinctie: dit is niet "zomaar een wandeling" — dit is een feestelijke inhuldiging

STORYTELLING STEM:
Vertel micro-verhalen over:
- De Koninklijke Weg: bedacht als rolstoelvriendelijke route door de Veluwe
- De feestelijke inhuldiging bij de Grote Kerk — elke finisher wordt onthaald als royalty
- De muziek bij de finish, het applaus, de sfeer die je niet vergeet
- Het moment dat je je startnummer ontvangt — alsof je uitgenodigd bent voor iets groots

VERBODEN:
- Geen schreeuwende marketing ("NU AANMELDEN!", "WEES ERBIJ!")
- Geen neerbuigendheid ("voor gewone mensen")
- Geen valse schaarste — deelname is gratis en voor iedereen
- Geen suggestie van exclusiviteit die inclusiviteit ondermijnt
- NOOIT beweren dat de Koninklijke Weg eeuwenoud is of dat er koninklijke koetsen reden`,

    caregiver: `=== ARCHETYPE: DE VERZORGER ===

STEM & IDENTITEIT:
Je stem is die van de vrijwilliger bij de waterpost op de Asselse Heide.
Die het verband klaar heeft, maar ook het juiste woord. Je schrijft
vanuit zorg die voelbaar is — het is de kern van DKL: niemand loopt alleen.

PSYCHOLOGISCHE TRIGGERS:
- Inclusiviteit: de 2,5 km Roll & Stroll maakt wandelen mogelijk voor IEDEREEN
- Veiligheid: een sociaal veilige sportomgeving waar beperkingen wegvallen
- Verbinding: sport als middel tegen eenzaamheid — samen het verschil maken
- Impact: elke stap steunt Only Friends — kinderen die dankzij jou kunnen sporten

STORYTELLING STEM:
Vertel micro-verhalen over:
- De 2,5 km Roll & Stroll: een rolstoelvriendelijke route bij de Grote Kerk
  waar een vader met zijn dochter in een rolstoel samen finisht
- De vrijwilliger die je naam onthoudt bij de waterpost op Hoog Soeren
- Het kind bij Only Friends dat dankzij de sponsorloop voor het eerst meedoet aan een sportles
- De bus terug naar Apeldoorn, iedereen moe maar blij — nieuwe vriendschappen gemaakt

VERBODEN:
- Geen betutteling ("Wees niet bang!", "Ook jij kunt het!")
- Geen medelijden — bij DKL ben je geen uitzondering, maar de norm
- Geen suggestie dat mensen met een beperking "geholpen" worden — ze lopen ZELF
- Geen overdreven emotie zonder fundament`,

    sage: `=== ARCHETYPE: DE WIJZE ===

STEM & IDENTITEIT:
Je stem is die van een kenner van de Veluwe, het verhaal achter de Koninklijke Weg,
en de waarde van inclusieve sport. Je deelt kennis die mensen verrast
— en ondertussen ongemerkt inspireert om mee te wandelen op 16 mei.

PSYCHOLOGISCHE TRIGGERS:
- Nieuwsgierigheid: het verhaal achter de Koninklijke Weg dat niemand kent
- Competentie: feitjes die je op het pad kunt delen met je wandelmaatje
- Diepgang: de impact van inclusief sporten, onderbouwd met feiten uit de context
- Groei: van €2.000 opbrengst in 2024 naar €2.285 in 2025 — elk jaar een stap verder

STORYTELLING STEM:
Vertel micro-verhalen over:
- De Koninklijke Weg: bedacht door oud-wethouder Aalt van de Glind (rond 2006-2010) als rolstoelvriendelijke route door de Veluwe. Hij overleed in 2018, maar zijn droom leeft voort.
- De Asselse Heide: een van de oudste heidevelden van de Veluwe
- Only Friends: maakt sporten mogelijk voor kinderen met een beperking — bij Only Friends ben je geen uitzondering maar de norm
- De groei van DKL: van een eerste editie in 2024 (Liliane Fonds, €2.000) naar een gevestigd evenement in 2026
- 4 routes, van 2,5 tot 15,6 km — waarom de Roll & Stroll baanbrekend is in inclusief sporten

VERBODEN:
- Geen neerbuigende toon ("Veel mensen weten niet dat...")
- Geen onverifieerbare statistieken — gebruik ALLEEN cijfers en feiten uit de systeemcontext
- Geen wikipedia-dumps of droge opsommingen
- NOOIT percentages of wetenschappelijke claims verzinnen die niet in de context staan`,

    explorer: `=== ARCHETYPE: DE ONTDEKKER ===

STEM & IDENTITEIT:
Je stem is die van iemand die net de verkenning van de route heeft afgerond.
Van het kerkje in Kootwijk, over de Asselse Heide, langs Hoog Soeren,
naar de Grote Kerk Apeldoorn. Je ogen glinsteren nog. Je ruikt nog het dennenbos.

PSYCHOLOGISCHE TRIGGERS:
- Verwondering: de Veluwe onthult op elke kilometer iets nieuws
- Vrijheid: even weg uit de stad, de Koninklijke Weg op
- Ontdekking: van het kerkje in Kootwijk tot de Grote Kerk — 15,6 km vol verrassingen
- Avontuur: 4 routes, elk met een eigen karakter en verrassing

STORYTELLING STEM:
Vertel micro-verhalen over:
- Het kerkje in Kootwijk bij het eerste ochtendlicht: hier begint de 15,6 km
- De bocht op de Asselse Heide waar het pad plotseling opent naar kilometers uitzicht
- Hoog Soeren: het dorp op de heuvel waar de 6 km route begint, ruikend naar hars
- De groene buitenwijken bij de Grote Kerk: de 2,5 km Roll & Stroll als ontdekkingstocht
- Het moment dat je uit het bos stapt en de Grote Kerk van Apeldoorn ziet — de finish

VERBODEN:
- Geen reisbrochure-taal ("Prachtig gelegen!", "Schitterend uitzicht!")
- Geen overdreven romantisering van de Veluwe
- Geen suggestie dat het gevaarlijk of onbekend terrein is`,
};

// ─── Prompt builders ────────────────────────────────────────────────────────
function buildSystemPrompt(archetype: string): string {
    const voice = ARCHETYPE_VOICES[archetype] || ARCHETYPE_VOICES.hero;
    return `${EVENT_CONTEXT}\n${voice}\n${BASE_INSTRUCTIONS}`;
}

function buildUserPrompt(contentType: string, campaignContext: string): string {
    const limits = CONTENT_LIMITS[contentType] || CONTENT_LIMITS.tweet;
    let typeInstruction = "";

    switch (contentType) {
        case "verhaal":
            typeInstruction = `Type-specifieke instructies (VERHAAL — max ${limits.maxChars} tekens):
- Schrijf een verhaal met een herkenbaar begin, midden en einde.
- Gebruik sfeerbeelden: beschrijf wat je ziet, hoort, ruikt op de Koninklijke Weg.
- Vertel het verhaal van Salih Toprak en de bewoners van 's Heeren Loo.
- Gebruik alinea's voor leesbaarheid. Korte eerste zin als hook.
- Sluit af met een zachte call-to-action richting dekoninklijkeloop.nl.
- Gebruik 2-3 relevante hashtags aan het einde.
- Richt op 800-1200 tekens.`;
            break;
        case "artikel":
            typeInstruction = `Type-specifieke instructies (ARTIKEL — max ${limits.maxChars} tekens):
- Schrijf een diepgaand stuk over het thema van de campagne.
- Structureer met een sterke opening, informatieve kern, en krachtig slot.
- Verwerk achtergrond over de Koninklijke Weg, de historie van Aalt van de Glind.
- Beschrijf de impact van Only Friends en de rolwisseling van de bewoners.
- Gebruik meerdere alinea's. Wissel korte en langere zinnen af.
- Sluit af met een persoonlijke CTA en link naar dekoninklijkeloop.nl.
- Gebruik 2-3 relevante hashtags aan het einde.
- Richt op 2000-3000 tekens.`;
            break;
        default:
            typeInstruction = `Type-specifieke instructies (TWEET — max ${limits.maxChars} tekens):
- Kort en krachtig. Eén micro-verhaal of prikkelende vraag.
- Maximaal 2 hashtags aan het einde.
- Maximaal 1 emoji als het het verhaal versterkt.
- Richt op 200-270 tekens.`;
    }

    return `Genereer content voor de volgende campagne-context:

${campaignContext}

Content type: ${contentType} (max ${limits.maxChars} tekens)

${typeInstruction}

Algemene instructies:
- Pas het storytelling framework toe: open met een beeld of vraag, geef inzicht, sluit af met actie.
- Weef SEO-termen natuurlijk in (wandelen, Apeldoorn, Veluwe, inclusief, goed doel, Koninklijke Weg).
- Gebruik retorische technieken voor impact.
- Gebruik ALLEEN feiten uit de systeemcontext. Verzin NIETS.
- Geef ALLEEN de tekst terug, zonder aanhalingstekens, labels, of uitleg.`;
}

function buildThreadPrompt(campaignContext: string): string {
    return `Genereer een Twitter thread van 3 tweets voor de volgende campagne:

${campaignContext}

De thread volgt een strategisch narratief:

TWEET 1 (De Hook — psychologische trigger die scrollen stopt):
- Open met een beeld, vraag, of provocatie die emotie oproept
- Geen aankondiging, maar een verhaal dat begint
- Max 280 tekens

TWEET 2 (De Verdieping — waarde, kennis, of emotioneel inzicht):
- Bouw voort op de hook met concrete waarde
- Deel een inzicht, feit, of persoonlijk moment
- Maak de lezer slimmer of laat ze iets voelen
- Max 280 tekens

TWEET 3 (De Conversie — zachte CTA met {{link}} placeholder):
- Verbind het verhaal met actie
- Gebruik {{link}} waar de URL moet komen
- De CTA voelt als een natuurlijk vervolg, niet als verkoop
- Max 280 tekens

Geef ALLEEN de 3 tweets in dit format:
TWEET 1:
[tekst]

TWEET 2:
[tekst]

TWEET 3:
[tekst]`;
}

// ─── Thread response parser (synced from Go parseThreadResponse) ─────────────
function parseThreadResponse(content: string): string[] {
    const tweets: string[] = [];
    const lines = content.split("\n");
    let current = "";
    let inTweet = false;

    // Regex handles markdown formatting: **TWEET 1:**, ### TWEET 1:, TWEET 1:
    const tweetHeaderRegex = /^\s*(?:\*\*|#{1,3}\s*)?TWEET\s*\d+(?:\*\*)?\s*:\s*(?:\*\*)?\s*(.*)/i;

    for (const line of lines) {
        const trimmed = line.trim();
        const match = trimmed.match(tweetHeaderRegex);

        if (match) {
            if (inTweet && current.trim()) {
                tweets.push(current.trim());
            }
            current = match[1]?.trim() || "";
            inTweet = true;
        } else if (inTweet) {
            current += (current ? "\n" : "") + line;
        }
    }
    if (inTweet && current.trim()) {
        tweets.push(current.trim());
    }

    return tweets;
}

// ─── AI provider call ───────────────────────────────────────────────────────
interface AIProvider {
    name: string;
    url: string;
    key: string;
    model: string;
}

async function callAI(providers: AIProvider[], systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
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
                    temperature: 0.7,
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

// ─── Build provider list ────────────────────────────────────────────────────
function getProviders(): AIProvider[] {
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

// ─── Budget check via Go backend ────────────────────────────────────────────
const API_URL = import.meta.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";

async function checkBudget(token: string): Promise<{ allowed: boolean; remaining: number }> {
    try {
        const tenantID = import.meta.env.PUBLIC_TENANT_ID || 'b2727666-7230-4689-b58b-ceab8c2898d5';
        const res = await fetch(`${API_URL}/admin/social/budget`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-Tenant-ID": tenantID,
            },
        });
        // FAIL-CLOSED: auth/permission errors → block immediately
        if (res.status === 401 || res.status === 403) {
            return { allowed: false, remaining: 0 };
        }
        // FAIL-CLOSED: any other error → block (financial API, never fail-open)
        if (!res.ok) return { allowed: false, remaining: 0 };
        const data = await res.json();
        return { allowed: (data.remaining ?? 0) > 0, remaining: data.remaining ?? 0 };
    } catch {
        // FAIL-CLOSED: network/parse error → block
        return { allowed: false, remaining: 0 };
    }
}

// Record budget usage after successful AI generation (so Go backend decrements count)
async function recordBudgetUsage(token: string): Promise<void> {
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
        // Best-effort: AI content delivered even if budget recording fails
        console.error("[Budget] Failed to record AI generation usage");
    }
}

// ─── Main handler ───────────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request, cookies }) => {
    // M1: Auth check — verify token exists
    const token = cookies.get("access_token")?.value || cookies.get("dkl_auth_token")?.value;
    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Parse request body
    let body: {
        archetype?: string;
        content_type?: string;
        campaign_context?: string;
        thread_mode?: boolean;
    };
    try {
        body = await request.json();
        // Guard against null/array JSON bodies ("null" is valid JSON)
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return new Response(JSON.stringify({ error: "Request body must be a JSON object" }), { status: 400 });
        }
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    const archetype = body.archetype || "hero";
    const contentType = body.content_type || "tweet";
    const campaignContext = body.campaign_context || "Inclusief wandelevenement door Apeldoorn richting Paleis Het Loo";
    const threadMode = body.thread_mode || false;

    // M3: Archetype validation
    if (!VALID_ARCHETYPES.includes(archetype as typeof VALID_ARCHETYPES[number])) {
        return new Response(JSON.stringify({ error: `Invalid archetype: ${archetype}. Valid: ${VALID_ARCHETYPES.join(", ")}` }), { status: 400 });
    }

    // Content type validation
    if (!VALID_CONTENT_TYPES.includes(contentType as typeof VALID_CONTENT_TYPES[number])) {
        return new Response(JSON.stringify({ error: `Invalid content_type: ${contentType}. Valid: ${VALID_CONTENT_TYPES.join(", ")}` }), { status: 400 });
    }

    // M2: Budget check
    const budget = await checkBudget(token);
    if (!budget.allowed) {
        return new Response(JSON.stringify({
            error: "Budget limiet bereikt (17 posts/24h). Probeer later opnieuw.",
            remaining: 0,
        }), { status: 429 });
    }

    const providers = getProviders();
    if (providers.length === 0) {
        return new Response(JSON.stringify({ error: "No AI API key configured" }), { status: 500 });
    }

    const systemPrompt = buildSystemPrompt(archetype);

    try {
        // C1: Thread mode support
        if (threadMode) {
            const threadPrompt = buildThreadPrompt(campaignContext);
            // 800 tokens: 3 NL tweets (~280 chars each) + formatting = ~500-600 tokens minimum
            const text = await callAI(providers, systemPrompt, threadPrompt, 800);
            const tweets = parseThreadResponse(text);

            if (tweets.length < 3) {
                return new Response(JSON.stringify({ error: `Expected 3 tweets, got ${tweets.length}` }), { status: 502 });
            }

            // Record budget usage after successful AI generation
            await recordBudgetUsage(token);

            return new Response(JSON.stringify({
                thread: tweets.slice(0, 3),
                type: "thread",
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Single draft mode
        const limits = CONTENT_LIMITS[contentType] || CONTENT_LIMITS.tweet;
        const userPrompt = buildUserPrompt(contentType, campaignContext);
        const text = await callAI(providers, systemPrompt, userPrompt, limits.maxTokens);

        // Clean up response (synced from Go GenerateDraft)
        let draft = text.trim();
        draft = draft.replace(/^["']+|["']+$/g, "");
        draft = draft.trim();

        // Enforce character limit
        if ([...draft].length > limits.maxChars) {
            draft = [...draft].slice(0, limits.maxChars - 3).join("") + "...";
        }

        // Record budget usage after successful AI generation
        await recordBudgetUsage(token);

        return new Response(JSON.stringify({
            draft,
            type: "single",
            content_type: contentType,
            max_chars: limits.maxChars,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "AI generation failed";
        return new Response(JSON.stringify({ error: msg }), { status: 502 });
    }
};
