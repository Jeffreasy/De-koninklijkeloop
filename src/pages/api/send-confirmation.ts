// POST /api/send-confirmation
// Sends a confirmation email to a participant and returns sentAt timestamp.
// Called by the admin UI "Accepteren" button.

import type { APIRoute } from "astro";
import { getAuthContext, getApiUrl, unauthorizedResponse } from "./_email-proxy-utils";

export const POST: APIRoute = async ({ request, cookies }) => {
    const auth = getAuthContext(cookies);
    if (!auth) return unauthorizedResponse();

    let body: {
        name: string;
        email: string;
        role: string;
        distance?: string;
        registrationId: string;
    };

    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { name, email, role, distance, registrationId } = body;

    if (!name || !email || !registrationId) {
        return new Response(JSON.stringify({ error: "name, email en registrationId zijn verplicht" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Build the confirmation email content
    const roleLabel = role === "begeleider" ? "Begeleider" : role === "vrijwilliger" ? "Vrijwilliger" : "Deelnemer";
    const distanceText = distance ? `van ${distance} km ` : "";
    const eventDate = "zaterdag 17 mei 2025";

    const subject = `Bevestiging inschrijving De Koninklijke Loop 2026 — ${name}`;
    const emailBody = `Beste ${name},

Hartelijk dank voor je inschrijving voor De Koninklijke Loop 2026!

Je inschrijving als ${roleLabel} ${distanceText}is bevestigd. We verheugen ons erop je te verwelkomen op ${eventDate} in Apeldoorn.

Bewaar deze email als bevestiging van je deelname.

Wanneer je vragen hebt, kun je contact opnemen via info@dekoninklijkeloop.nl.

Met vriendelijke groet,
Team De Koninklijke Loop

---
Inschrijvingsnummer: ${registrationId}
`;

    try {
        // Use the same email send endpoint as ComposeModal
        const apiUrl = getApiUrl();
        const sendUrl = `${apiUrl}/mail/send`;

        const response = await fetch(sendUrl, {
            method: "POST",
            headers: auth.headers,
            body: JSON.stringify({
                to: email,
                from: "inschrijving",
                subject,
                body: emailBody,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            if (import.meta.env.DEV) {
                console.error("[send-confirmation] Email API error:", response.status, errorText);
            }
            return new Response(
                JSON.stringify({ error: `Email verzenden mislukt (${response.status})` }),
                { status: response.status, headers: { "Content-Type": "application/json" } }
            );
        }

        const sentAt = Date.now();
        return new Response(JSON.stringify({ success: true, sentAt }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        if (import.meta.env.DEV) console.error("[send-confirmation] Unexpected error:", err);
        return new Response(
            JSON.stringify({ error: "Interne serverfout" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
