import type { APIRoute } from 'astro';

export const prerender = false;

// Allow up to 30s for vision analysis
export const maxDuration = 30;

/**
 * AI Vision Metadata Generator
 *
 * Accepts an ImageKit image URL, sends it to xAI Grok Vision,
 * and returns SEO-optimized alt text, title, and tags in Dutch.
 */

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";

const SYSTEM_PROMPT = `Je bent een professionele SEO-specialist voor De Koninklijke Loop (DKL), een inclusief wandelevenement en sponsorloop in Apeldoorn.

Je analyseert foto's en genereert:
1. **alt_text**: Een beschrijvende, SEO-geoptimaliseerde alt tekst (50-125 karakters, Nederlands)
2. **title**: Een korte, pakkende titel voor de foto (max 60 karakters, Nederlands)
3. **tags**: 3-5 relevante tags (geen hashtags, kleine letters)

CONTEXT OVER HET EVENEMENT:
- De Koninklijke Loop is een WANDELevenement (GEEN hardlopen!)
- Locatie: Apeldoorn, over de Koninklijke Weg door de Veluwe
- Finish: Grote Kerk Apeldoorn (NIET Paleis Het Loo)
- Organisatie: Salih Toprak + bewoners van 's Heeren Loo
- Goede doel: Sportclub Only Friends
- Routes: 2.5km Roll & Stroll, 6km Hoog Soeren, 10km Asselse Heide, 15.6km Kootwijk-Apeldoorn
- Het evenement is inclusief en rolstoelvriendelijk
- Deelname is GRATIS

SEO REGELS:
- Begin NOOIT met "Foto van" of "Afbeelding van"
- Beschrijf wat je ZIET: mensen, locatie, actie, sfeer
- Gebruik relevante zoekwoorden: wandelen, Apeldoorn, Veluwe, inclusief, Koninklijke Weg, Grote Kerk
- Wees specifiek en uniek per foto
- Alt text moet nuttig zijn voor screenreaders

ANTWOORD ALTIJD in exact dit JSON format (geen markdown, geen uitleg):
{"alt_text": "...", "title": "...", "tags": ["...", "..."]}`;

const USER_PROMPT_TEMPLATE = `Analyseer deze foto en genereer professionele SEO metadata.

Bestandsnaam: {filename}
Map: {folder}

Geef ALLEEN valid JSON terug: {"alt_text": "...", "title": "...", "tags": ["...", "..."]}`;

const jsonHeaders = { "Content-Type": "application/json" };

export const POST: APIRoute = async ({ request, cookies }) => {
    // Auth check
    const token = cookies.get("access_token")?.value || cookies.get("dkl_auth_token")?.value;
    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    // Parse request
    let body: { imageUrl?: string; filename?: string; folder?: string };
    try {
        body = await request.json();
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return new Response(JSON.stringify({ error: "Request body must be a JSON object" }), { status: 400, headers: jsonHeaders });
        }
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: jsonHeaders });
    }

    const { imageUrl, filename, folder } = body;

    if (!imageUrl) {
        return new Response(JSON.stringify({ error: "imageUrl is required" }), { status: 400, headers: jsonHeaders });
    }

    // C1: SSRF protection — only allow ImageKit URLs
    if (!imageUrl.startsWith('https://ik.imagekit.io/')) {
        return new Response(JSON.stringify({ error: "Invalid image URL — only ImageKit URLs allowed" }), { status: 400, headers: jsonHeaders });
    }

    // Get API key
    const xaiKey = import.meta.env.XAI_API_KEY;
    if (!xaiKey) {
        return new Response(JSON.stringify({ error: "XAI_API_KEY not configured" }), { status: 500, headers: jsonHeaders });
    }

    // L2: Sanitize filename against prompt injection
    const safeFilename = (filename || "onbekend").replace(/[^\w\s.\-()]/g, '').substring(0, 100);
    const safeFolder = (folder || "onbekend").replace(/[^\w\s/\-']/g, '').substring(0, 200);

    // Build user prompt
    const userPrompt = USER_PROMPT_TEMPLATE
        .replace("{filename}", safeFilename)
        .replace("{folder}", safeFolder);

    // Try vision models in order
    const VISION_MODELS = ["grok-2-vision-1212", "grok-2-vision"];

    for (const model of VISION_MODELS) {
        try {
            const response = await fetch(XAI_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${xaiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "image_url",
                                    image_url: { url: imageUrl },
                                },
                                {
                                    type: "text",
                                    text: userPrompt,
                                },
                            ],
                        },
                    ],
                    max_tokens: 300,
                    temperature: 0.3, // Low temp for consistent SEO output
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                if (import.meta.env.DEV) console.error(`[AI Vision:${model}] Error ${response.status}: ${errText.substring(0, 200)}`);
                continue; // Try next model
            }

            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content?.trim() || "";

            if (!text) continue;

            // Parse JSON response from AI
            try {
                // Strip markdown code fences if present
                const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
                const parsed = JSON.parse(cleaned);

                // Validate structure
                if (!parsed.alt_text || typeof parsed.alt_text !== "string") {
                    throw new Error("Missing or invalid alt_text");
                }

                return new Response(JSON.stringify({
                    alt_text: parsed.alt_text.trim(),
                    title: (parsed.title || "").trim(),
                    tags: Array.isArray(parsed.tags) ? parsed.tags.map((t: string) => t.trim().toLowerCase()) : [],
                    model,
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            } catch (parseErr) {
                if (import.meta.env.DEV) console.error(`[AI Vision:${model}] JSON parse failed:`, parseErr, "Raw:", text.substring(0, 300));
                // Try to extract alt_text even if JSON parsing fails
                const altMatch = text.match(/"alt_text"\s*:\s*"([^"]+)"/);
                if (altMatch) {
                    return new Response(JSON.stringify({
                        alt_text: altMatch[1].trim(),
                        title: "",
                        tags: [],
                        model,
                        warning: "Partial parse — only alt_text extracted",
                    }), {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                continue;
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error(`[AI Vision:${model}] Fetch failed:`, err);
            continue;
        }
    }

    return new Response(JSON.stringify({ error: "AI Vision generation failed across all models" }), { status: 502, headers: jsonHeaders });
};
