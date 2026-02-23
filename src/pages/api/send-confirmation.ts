// POST /api/send-confirmation
// Sends a professional HTML confirmation email to a participant.
// Called by the admin UI "Accepteren" button after manual approval.

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
        shuttleBus?: string;
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

    const { name, email, role, distance, shuttleBus, registrationId } = body;

    if (!name || !email || !registrationId) {
        return new Response(JSON.stringify({ error: "name, email en registrationId zijn verplicht" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // ── Route-specific schedule data (from seedSchedule / team.ts) ──────────
    type RouteKey = "15" | "10" | "6" | "2.5";

    const ROUTE_INFO: Record<RouteKey, {
        label: string;
        meldtijd: string;
        busVertrek: string;
        startTijd: string;
        startLocatie: string;
        startAdres: string;
        mapsLink: string;
        kleur: string;
        afstand: string;
    }> = {
        "15": {
            label: "15 KM Paleistuinen & Parken",
            meldtijd: "10:15",
            busVertrek: "10:45",
            startTijd: "11:15",
            startLocatie: "Kootwijk — De Brink",
            startAdres: "Dorpscentrum Kootwijk, nabij kerk en 't Hilletje",
            mapsLink: "https://maps.app.goo.gl/kootwijk-de-brink",
            kleur: "#EF4444",
            afstand: "15,6 km",
        },
        "10": {
            label: "10 KM Vorstelijke Verkenning",
            meldtijd: "12:00",
            busVertrek: "12:30",
            startTijd: "13:00",
            startLocatie: "Assel — Halte Assel",
            startAdres: "Pomphulweg / Asselseweg, Assel (bij Eethuis Halte Assel)",
            mapsLink: "https://maps.app.goo.gl/assel-halte",
            kleur: "#eab308",
            afstand: "10 km",
        },
        "6": {
            label: "6 KM Gezinsroute",
            meldtijd: "13:15",
            busVertrek: "13:45",
            startTijd: "14:15",
            startLocatie: "Hoog Soeren — Dorpscentrum",
            startAdres: "Hoog Soeren 15, nabij Hotel Hoog Soeren en Berg & Dal",
            mapsLink: "https://maps.app.goo.gl/hoog-soeren",
            kleur: "#3b82f6",
            afstand: "6 km",
        },
        "2.5": {
            label: "2,5 KM Roll & Stroll",
            meldtijd: "14:30",
            busVertrek: "15:00",
            startTijd: "15:35",
            startLocatie: "Apeldoorn — Soerenseweg",
            startAdres: "Soerenseweg, 7313 ER Apeldoorn (verharde, toegankelijke route)",
            mapsLink: "https://maps.app.goo.gl/soerenseweg-apeldoorn",
            kleur: "#10b981",
            afstand: "2,5 km",
        },
    };

    const routeKey = (distance?.replace("km", "").trim() as RouteKey) ?? null;
    const route = routeKey ? ROUTE_INFO[routeKey] : null;

    const roleLabel =
        role === "begeleider" ? "Begeleider" :
            role === "vrijwilliger" ? "Vrijwilliger" :
                "Deelnemer";

    const usesShuttle = shuttleBus === "pendelbus";

    const subject = `Bevestiging inschrijving — De Koninklijke Loop 2026`;

    // ── HTML e-mail template ─────────────────────────────────────────────────
    const routeBlock = route ? `
      <div style="background:#fff8f0;border-left:4px solid ${route.kleur};border-radius:8px;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;">Jouw route</p>
        <p style="margin:0;font-size:20px;font-weight:800;color:${route.kleur};">${route.label}</p>
        <p style="margin:4px 0 0 0;font-size:14px;color:#555;">${route.afstand} · ${roleLabel}</p>
      </div>

      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 24px 0;">
        <tr>
          <td style="padding:0 8px 8px 0;width:50%;vertical-align:top;">
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;">
              <p style="margin:0 0 2px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Meldtijd</p>
              <p style="margin:0;font-size:22px;font-weight:800;color:#111827;font-family:monospace;">${route.meldtijd}</p>
              <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">Meld je aan bij de Grote Kerk</p>
            </div>
          </td>
          <td style="padding:0 0 8px 8px;width:50%;vertical-align:top;">
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;">
              <p style="margin:0 0 2px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Starttijd</p>
              <p style="margin:0;font-size:22px;font-weight:800;color:#111827;font-family:monospace;">${route.startTijd}</p>
              <p style="margin:4px 0 2px 0;font-size:12px;font-weight:600;color:#374151;">${route.startLocatie}</p>
              <p style="margin:0;font-size:11px;color:#6b7280;">${route.startAdres}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:0;">
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;">
              <p style="margin:0 0 2px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Pendelbus vertrekt</p>
              <p style="margin:0;font-size:18px;font-weight:700;color:#111827;font-family:monospace;">${route.busVertrek}</p>
              <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">Vanaf Grote Kerk, Loolaan 16, Apeldoorn${usesShuttle ? " · <strong>Je hebt de pendelbus geselecteerd ✓</strong>" : ""}</p>
            </div>
          </td>
        </tr>
      </table>
    ` : `
      <div style="background:#f3f4f6;border-radius:8px;padding:20px 24px;margin:24px 0;">
        <p style="margin:0;font-size:15px;color:#374151;">Inschrijving als <strong>${roleLabel}</strong> bevestigd.</p>
      </div>
    `;

    const vrijwilligerNote = role === "vrijwilliger" ? `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:0 0 20px 0;">
        <p style="margin:0;font-size:14px;color:#166534;">
          <strong>Vrijwilliger</strong> — Je ontvangt binnenkort aparte instructies over jouw taak en aanmelding.
          Neem bij vragen contact op via <a href="mailto:info@dekoninklijkeloop.nl" style="color:#16a34a;">info@dekoninklijkeloop.nl</a>.
        </p>
      </div>
    ` : "";

    const htmlBody = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Bevestiging inschrijving — De Koninklijke Loop 2026</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f3f4f6;">
    <tr>
      <td style="padding:40px 16px;">

        <!-- Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:36px 40px;">
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.75);">De Koninklijke Loop</p>
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;line-height:1.2;">Inschrijving bevestigd</h1>
              <p style="margin:8px 0 0 0;font-size:15px;color:rgba(255,255,255,0.85);">Zaterdag 16 mei 2026, Apeldoorn</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 20px 0;font-size:16px;color:#374151;line-height:1.6;">
                Beste <strong>${name}</strong>,
              </p>
              <p style="margin:0 0 24px 0;font-size:15px;color:#4b5563;line-height:1.6;">
                Welkom bij <strong>De Koninklijke Loop 2026</strong>! Je inschrijving is officieel bevestigd. We kijken er naar uit om je op zaterdag 16 mei te verwelkomen in Apeldoorn.
              </p>

              ${routeBlock}
              ${vrijwilligerNote}

              <!-- Praktisch -->
              <h2 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:#111827;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Praktische informatie</h2>

              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;width:140px;">
                    <span style="font-size:12px;font-weight:600;color:#6b7280;">Coördinatiepunt</span>
                  </td>
                  <td style="padding:10px 0 10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <span style="font-size:13px;color:#111827;">Grote Kerk<br/>Loolaan 16, 7315 AB Apeldoorn</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <span style="font-size:12px;font-weight:600;color:#6b7280;">Finish</span>
                  </td>
                  <td style="padding:10px 0 10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <span style="font-size:13px;color:#111827;">Grote Kerk, Apeldoorn<br/><em style="color:#6b7280;">Gezamenlijke finish: 16:10 – 16:30</em></span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <span style="font-size:12px;font-weight:600;color:#6b7280;">Eten & drinken</span>
                  </td>
                  <td style="padding:10px 0 10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <span style="font-size:13px;color:#111827;">Lunchpakketje inbegrepen. Bij rustpunten is fruit & drinken aanwezig. Neem zelf voldoende water mee.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <span style="font-size:12px;font-weight:600;color:#6b7280;">EHBO & begeleiding</span>
                  </td>
                  <td style="padding:10px 0 10px 12px;vertical-align:top;">
                    <span style="font-size:13px;color:#111827;">Routebegeleiders en EHBO'ers zijn de gehele dag aanwezig.</span>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <div style="text-align:center;margin:32px 0 8px 0;">
                <a href="https://dekoninklijkeloop.nl/programma" style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:14px 32px;border-radius:10px;letter-spacing:0.3px;">
                  Bekijk het volledige programma →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#9ca3af;line-height:1.5;">
                Vragen? Stuur een email naar
                <a href="mailto:info@dekoninklijkeloop.nl" style="color:#f97316;text-decoration:none;">info@dekoninklijkeloop.nl</a>
              </p>
              <p style="margin:0;font-size:11px;color:#d1d5db;">
                Inschrijvingsnummer: <code style="font-size:11px;color:#9ca3af;">${registrationId}</code>
                &nbsp;·&nbsp;
                <a href="https://dekoninklijkeloop.nl" style="color:#d1d5db;text-decoration:none;">dekoninklijkeloop.nl</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- End card -->

      </td>
    </tr>
  </table>

</body>
</html>`;

    try {
        const apiUrl = getApiUrl();
        const sendUrl = `${apiUrl}/mail/send`;

        const response = await fetch(sendUrl, {
            method: "POST",
            headers: auth.headers,
            body: JSON.stringify({
                to: email,
                from: "inschrijving",
                subject,
                body: htmlBody,
                html: true,
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
