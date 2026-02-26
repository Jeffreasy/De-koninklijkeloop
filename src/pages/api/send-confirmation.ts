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

  // Compact 3-column timeline: Meldtijd | Pendelbus | Start
  const routeBlock = route ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td colspan="3" style="padding:0 0 12px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#fff8f0;border-left:4px solid ${route.kleur};border-radius:0 8px 8px 0;">
              <tr>
                <td style="padding:12px 16px;">
                  <p style="margin:0 0 2px 0;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#bbb;">Jouw route</p>
                  <p style="margin:0;font-size:16px;font-weight:800;color:${route.kleur};">${route.label}</p>
                  <p style="margin:2px 0 0 0;font-size:11px;color:#999;">${route.afstand} &nbsp;&middot;&nbsp; ${roleLabel}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 5px 12px 0;width:33%;vertical-align:top;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
              <tr><td style="padding:10px 12px;">
                <p style="margin:0 0 2px 0;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Meldtijd</p>
                <p style="margin:0;font-size:18px;font-weight:800;color:#111827;font-family:monospace;line-height:1;">${route.meldtijd}</p>
                <p style="margin:3px 0 0 0;font-size:10px;color:#6b7280;line-height:1.3;">Grote Kerk<br/>Loolaan 16</p>
              </td></tr>
            </table>
          </td>
          <td style="padding:0 5px 12px 5px;width:33%;vertical-align:top;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
              <tr><td style="padding:10px 12px;">
                <p style="margin:0 0 2px 0;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Pendelbus</p>
                <p style="margin:0;font-size:18px;font-weight:800;color:#111827;font-family:monospace;line-height:1;">${route.busVertrek}</p>
                <p style="margin:3px 0 0 0;font-size:10px;line-height:1.3;">${usesShuttle ? "<strong style=\"color:#059669;\">&#10003; Geselecteerd</strong>" : "<span style=\"color:#6b7280;\">Optioneel</span>"}</p>
              </td></tr>
            </table>
          </td>
          <td style="padding:0 0 12px 5px;width:33%;vertical-align:top;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
              <tr><td style="padding:10px 12px;">
                <p style="margin:0 0 2px 0;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Start</p>
                <p style="margin:0;font-size:18px;font-weight:800;color:#111827;font-family:monospace;line-height:1;">${route.startTijd}</p>
                <p style="margin:3px 0 0 0;font-size:10px;color:#6b7280;line-height:1.3;">${route.startLocatie}</p>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    ` : `
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:0 0 12px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f3f4f6;border-radius:8px;">
              <tr><td style="padding:12px 16px;">
                <p style="margin:0;font-size:13px;color:#374151;">Inschrijving als <strong>${roleLabel}</strong> bevestigd.</p>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    `;

  const vrijwilligerNote = role === "vrijwilliger" ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:0 0 12px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
              <tr><td style="padding:10px 14px;">
                <p style="margin:0;font-size:12px;color:#166534;line-height:1.5;"><strong>Vrijwilliger</strong> &mdash; Je ontvangt binnenkort aparte instructies. Vragen? <a href="mailto:info@dekoninklijkeloop.nl" style="color:#16a34a;font-weight:600;text-decoration:none;">info@dekoninklijkeloop.nl</a></p>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    ` : "";

  const htmlBody = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Bevestiging inschrijving &mdash; De Koninklijke Loop 2026</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

  <!-- Preheader: inbox preview text -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Welkom bij De Koninklijke Loop 2026! Je inschrijving is bevestigd &mdash; bekijk jouw routedetails.&nbsp;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;</div>

  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f3f4f6;">
    <tr>
      <td style="padding:28px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:24px 28px;">
              <p style="margin:0 0 4px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.65);">De Koninklijke Loop &middot; 2026</p>
              <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;line-height:1.2;">Inschrijving bevestigd &#10003;</p>
              <p style="margin:5px 0 0 0;font-size:12px;color:rgba(255,255,255,0.8);">Zaterdag 16 mei 2026 &middot; Apeldoorn</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:12px 28px 8px 28px;">
              <p style="margin:0 0 4px 0;font-size:14px;color:#374151;">Beste <strong>${name}</strong>,</p>
              <p style="margin:0 0 10px 0;font-size:12px;color:#6b7280;line-height:1.6;">Je inschrijving is officieel bevestigd. Tot zaterdag 16 mei in Apeldoorn!</p>

              ${routeBlock}
              ${vrijwilligerNote}

            </td>
          </tr>

          <!-- Praktische info -->
          <tr>
            <td style="padding:0 28px 8px 28px;">
              <p style="margin:0 0 10px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:14px;">Praktische informatie</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td style="padding:6px 10px 6px 0;border-bottom:1px solid #f3f4f6;width:100px;vertical-align:top;">
                    <span style="font-size:10px;font-weight:600;color:#9ca3af;">Co&ouml;rdinatiepunt</span>
                  </td>
                  <td style="padding:6px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <span style="font-size:11px;color:#374151;">Grote Kerk, Loolaan 16 &mdash; Apeldoorn</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 10px 6px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <span style="font-size:10px;font-weight:600;color:#9ca3af;">Finish</span>
                  </td>
                  <td style="padding:6px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <span style="font-size:11px;color:#374151;">Grote Kerk &middot; 16:10&ndash;16:30</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 10px 6px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <span style="font-size:10px;font-weight:600;color:#9ca3af;">Eten &amp; drinken</span>
                  </td>
                  <td style="padding:6px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <span style="font-size:11px;color:#374151;">Lunchpakket inbegrepen &middot; fruit &amp; drinken bij rustpunten</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 10px 6px 0;vertical-align:top;">
                    <span style="font-size:10px;font-weight:600;color:#9ca3af;">EHBO</span>
                  </td>
                  <td style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:11px;color:#374151;">Begeleiders &amp; EHBO'ers gehele dag aanwezig</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:18px 28px 24px 28px;text-align:center;">
              <a href="https://dekoninklijkeloop.nl/programma" style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;font-size:12px;text-decoration:none;padding:11px 26px;border-radius:8px;letter-spacing:0.3px;">Bekijk het programma &rarr;</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 28px;">
              <p style="margin:0 0 4px 0;font-size:10px;color:#9ca3af;">Vragen? <a href="mailto:info@dekoninklijkeloop.nl" style="color:#f97316;text-decoration:none;font-weight:600;">info@dekoninklijkeloop.nl</a></p>
              <p style="margin:0;font-size:10px;color:#d1d5db;">Nr: <code style="color:#9ca3af;">${registrationId}</code> &nbsp;&middot;&nbsp; <a href="https://dekoninklijkeloop.nl" style="color:#d1d5db;text-decoration:none;">dekoninklijkeloop.nl</a></p>
            </td>
          </tr>

        </table>

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
