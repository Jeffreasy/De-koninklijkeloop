import type { APIRoute } from 'astro';
import {
    callAI, fetchEventData, buildEventContext,
    getProviders, checkBudget, recordBudgetUsage,
} from '../../../../lib/ai-shared';

export const prerender = false;
export const maxDuration = 60;

// Tone → archetype mapping for consistent brand voice
const TONE_CONFIG = {
    formal: {
        archetype: 'ruler',
        temperature: 0.5,
        instruction: `Schrijf in een formele, professionele toon. Gebruik "u" als aanspreekvorming.
Pas bij: uitnodigingsbrieven, gemeentecommunicatie, subsidieaanvragen, sponsorverzoeken.`,
    },
    warm: {
        archetype: 'caregiver',
        temperature: 0.65,
        instruction: `Schrijf in een warme, persoonlijke toon. Gebruik "je/jullie" als aanspreekvorming.
Pas bij: vrijwilligerscommunicatie, bedankjes, community updates.`,
    },
    informative: {
        archetype: 'sage',
        temperature: 0.4,
        instruction: `Schrijf in een zakelijke, informatieve toon. Focus op feiten en concrete details.
Pas bij: persberichten, updates aan zorgpartners, rapportages.`,
    },
} as const;

type Tone = keyof typeof TONE_CONFIG;

function buildEmailSystemPrompt(eventContext: string, tone: Tone, recipientContext?: string, threadContext?: string): string {
    const config = TONE_CONFIG[tone];

    return `Je bent een professionele e-mailschrijver voor De Koninklijke Loop (DKL).

${config.instruction}

REGELS:
- Schrijf in het Nederlands
- Begin met een passende begroeting (Beste [naam/organisatie], Geacht team, etc.)
- Structureer de e-mail in duidelijke alinea's (max 3-4 zinnen per alinea)
- Eindig met een gepaste afsluiting en "Met vriendelijke groet," gevolgd door regelafbreking en "Team De Koninklijke Loop"
- Maximaal 5000 tekens
- Gebruik GEEN emoji's in de e-mail body
- Verwijs naar het goede doel en de unieke samenwerking met bewoners van 's Heeren Loo
- Alle feiten moeten kloppen (data, locaties, routes)
- Noem de website: www.dekoninklijkeloop.nl

${recipientContext ? `CONTEXT ONTVANGER:\n${recipientContext}\n` : ''}
${threadContext ? `${threadContext}\n\nBELANGRIJK: Je schrijft een ANTWOORD op bovenstaand bericht. Reageer direct op de inhoud ervan.\n` : ''}
${eventContext}`;
}

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const token = cookies.get('auth_token')?.value;
        if (!token) {
            return new Response(JSON.stringify({ error: 'Niet ingelogd' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Budget check (shared with social)
        const budget = await checkBudget(token);
        if (!budget.allowed) {
            return new Response(JSON.stringify({
                error: 'AI budget is op',
                remaining: budget.remaining,
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const body = await request.json();
        const { subject, tone = 'formal', recipientContext, threadContext, mode: draftMode } = body as {
            subject: string;
            tone?: Tone;
            recipientContext?: string;
            threadContext?: string;
            mode?: 'compose' | 'reply';
        };

        if (!subject?.trim()) {
            return new Response(JSON.stringify({ error: 'Onderwerp is verplicht' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (tone && !TONE_CONFIG[tone]) {
            return new Response(JSON.stringify({ error: 'Ongeldige toon' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Fetch live event data
        const eventData = await fetchEventData();
        const eventContext = buildEventContext(eventData);

        const providers = getProviders();
        if (providers.length === 0) {
            return new Response(JSON.stringify({ error: 'Geen AI providers geconfigureerd' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const systemPrompt = buildEmailSystemPrompt(eventContext, tone, recipientContext, threadContext);
        const userPrompt = draftMode === 'reply' && threadContext
            ? `Schrijf een professioneel antwoord op het originele bericht. Het onderwerp is: "${subject}"

Lever ALLEEN de antwoord-body (geen onderwerpregel, geen meta-info). Reageer relevant op de inhoud van het origineel.`
            : `Schrijf een professionele e-mail met het onderwerp: "${subject}"

Lever ALLEEN de e-mail body (geen onderwerpregel, geen meta-info).`;

        const config = TONE_CONFIG[tone];
        const draft = await callAI(providers, systemPrompt, userPrompt, 2000, config.temperature);

        // Record budget usage
        await recordBudgetUsage(token);

        return new Response(JSON.stringify({
            draft,
            tone,
            remaining: budget.remaining - 1,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Onbekende fout';
        console.error('[Email Draft] Generation failed:', message);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
