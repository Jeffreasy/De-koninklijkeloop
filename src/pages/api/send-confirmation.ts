// POST /api/send-confirmation
// Sends a professional HTML confirmation email to a participant.
// Called by the admin UI "Accepteren" button after manual approval.

import type { APIRoute } from "astro";
import { getAuthContext, getApiUrl, getRoleFromToken, unauthorizedResponse } from "./_email-proxy-utils";
import { resolveRoute, EVENT_DATE } from "../../config/routes";

// ── Types ────────────────────────────────────────────────────────────────────

interface ConfirmationPayload {
  name: string;
  email: string;
  role: string;
  distance?: string;
  shuttleBus?: string;
  registrationId: string;
  /** From Convex registrations.userType — determines which email template is used. */
  userType?: "authenticated" | "guest";
}

interface ValidationError {
  error: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Escape HTML special characters to prevent XSS via template injection. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate the incoming payload. Returns null on success, error object on failure. */
function validatePayload(body: Partial<ConfirmationPayload>): ValidationError | null {
  if (!body.name || !body.email || !body.registrationId) {
    return { error: "name, email en registrationId zijn verplicht" };
  }
  if (!EMAIL_RE.test(body.email)) {
    return { error: "Ongeldig e-mailadres" };
  }
  return null;
}

/** Build the route-specific schedule block — stacked on mobile, 3-col on desktop. */
function buildRouteBlock(
  route: ReturnType<typeof resolveRoute>,
  usesShuttle: boolean,
  roleLabel: string
): string {
  if (!route) {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;">
              <tr><td style="padding:14px 18px;">
                <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">&#128203; Inschrijving als <strong>${roleLabel}</strong> bevestigd. Routedetails volgen zodra beschikbaar.</p>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>`;
  }

  const shuttleStatus = usesShuttle
    ? `<span style="display:inline-block;background:#dcfce7;color:#166534;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;">&#10003; Geboekt</span>`
    : `<span style="display:inline-block;background:#f3f4f6;color:#6b7280;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;">Optioneel</span>`;

  // Each time-card as a full-width stacked row (100% fluid — works on all clients and mobile)
  return `
      <!-- Route badge -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td style="background:linear-gradient(135deg,${route.kleur}18 0%,${route.kleur}08 100%);border:1.5px solid ${route.kleur}40;border-radius:12px;padding:16px 18px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              <tr>
                <td style="vertical-align:middle;">
                  <p style="margin:0 0 3px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${route.kleur};">&#128205; Jouw route</p>
                  <p style="margin:0;font-size:18px;font-weight:800;color:#111827;line-height:1.2;">${escapeHtml(route.label)}</p>
                  <p style="margin:5px 0 0 0;font-size:11px;color:#6b7280;"><strong style="color:#374151;">${escapeHtml(route.afstand)}</strong> &nbsp;&#183;&nbsp; ${escapeHtml(roleLabel)}</p>
                </td>
                <td style="width:48px;text-align:right;vertical-align:middle;">
                  <div style="width:40px;height:40px;background:${route.kleur};border-radius:50%;text-align:center;line-height:40px;font-size:20px;">&#127939;</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Tijdenkaarten — 3 stacked rows, each 100% wide (Outlook safe) -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding-bottom:8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
              <tr>
                <td style="width:6px;background:${route.kleur};border-radius:10px 0 0 10px;"></td>
                <td style="padding:12px 16px;">
                  <p style="margin:0 0 1px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">&#127968; Meldtijd</p>
                  <p style="margin:0;font-size:22px;font-weight:800;color:#111827;font-family:'Courier New',Courier,monospace;line-height:1;">${route.meldtijd}</p>
                  <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;">Grote Kerk, Loolaan 16 &mdash; Apeldoorn</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
              <tr>
                <td style="width:6px;background:#64748b;border-radius:10px 0 0 10px;"></td>
                <td style="padding:12px 16px;">
                  <p style="margin:0 0 1px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">&#128652; Pendelbus</p>
                  <p style="margin:0;font-size:22px;font-weight:800;color:#111827;font-family:'Courier New',Courier,monospace;line-height:1;">${route.busVertrek}</p>
                  <p style="margin:4px 0 0 0;font-size:11px;">${shuttleStatus}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
              <tr>
                <td style="width:6px;background:#10b981;border-radius:10px 0 0 10px;"></td>
                <td style="padding:12px 16px;">
                  <p style="margin:0 0 1px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">&#127937; Start</p>
                  <p style="margin:0;font-size:22px;font-weight:800;color:#111827;font-family:'Courier New',Courier,monospace;line-height:1;">${route.startTijd}</p>
                  <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;">${escapeHtml(route.startLocatie)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;
}

/** Build the full HTML email. All user-supplied values must be pre-escaped. */
function buildHtmlEmail(params: {
  safeName: string;
  safeRegistrationId: string;
  routeBlock: string;
  vrijwilligerNote: string;
}): string {
  const { safeName, safeRegistrationId, routeBlock, vrijwilligerNote } = params;

  return `<!DOCTYPE html>
<html lang="nl" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Bevestiging inschrijving &mdash; De Koninklijke Loop 2026</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    /* Reset & base */
    * { box-sizing: border-box; }
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }

    /* Dark mode overrides — Gmail app on Android + Apple Mail */
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #0f172a !important; }
      .email-card { background-color: #1e293b !important; }
      .body-text { color: #e2e8f0 !important; }
      .muted-text { color: #94a3b8 !important; }
      .section-label { color: #64748b !important; border-color: #334155 !important; }
      .time-card { background-color: #0f172a !important; border-color: #334155 !important; }
      .info-row-border { border-bottom-color: #1e293b !important; }
      .info-label { color: #64748b !important; }
      .info-value { color: #e2e8f0 !important; }
      .footer-bg { background-color: #0f172a !important; border-top-color: #334155 !important; }
      .footer-text { color: #475569 !important; }
      .footer-link { color: #f97316 !important; }
      .time-value { color: #f1f5f9 !important; }
    }

    /* Fluid image resets */
    img.logo { max-width: 100%; height: auto; }
  </style>
</head>
<body class="email-bg" style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- ✉️ Preheader — inbox snippet text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Je inschrijving voor De Koninklijke Loop 2026 is bevestigd! Bekijk jouw route en tijden.&nbsp;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;</div>

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Email card — max 580px -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;" class="email-card">

          <!-- ══ LOGO BAR (white — no filter tricks needed) ═══════════════════ -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;border-radius:16px 16px 0 0;padding:18px 28px;border-bottom:1px solid #fef3e2;">
              <img src="https://ik.imagekit.io/a0oim4e3e/tr:w-240,f-auto,q-85/De%20Koninklijkeloop/webassets/DKLLogoV1_kx60i9.webp"
                   alt="De Koninklijke Loop"
                   width="120"
                   height="auto"
                   style="display:block;height:auto;max-height:44px;width:auto;"
              />
            </td>
          </tr>

          <!-- ══ HEADER (brand orange gradient) ════════════════════════════════ -->
          <tr>
            <td style="background:linear-gradient(145deg,#f97316 0%,#ea580c 100%);padding:28px 28px 32px 28px;">
              <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.70);">Bevestigingsmail</p>
              <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.15;letter-spacing:-0.5px;">Inschrijving<br/>bevestigd &#10003;</p>
              <p style="margin:12px 0 0 0;font-size:13px;color:rgba(255,255,255,0.85);">
                &#128197; ${EVENT_DATE} &nbsp;&#183;&nbsp; &#128205; Apeldoorn
              </p>
            </td>
          </tr>

          <!-- ══ BODY ════════════════════════════════════════════════════════ -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;padding:28px 28px 8px 28px;">

              <!-- Greeting -->
              <p class="body-text" style="margin:0 0 6px 0;font-size:16px;color:#1e293b;">Beste <strong>${safeName}</strong>,</p>
              <p class="muted-text" style="margin:0 0 24px 0;font-size:13px;color:#64748b;line-height:1.7;">Super dat je meedoet! Je inschrijving is officieel goedgekeurd en bevestigd. Hieronder vind je alle details voor jouw dag.</p>

              <!-- Route & tijden -->
              ${routeBlock}
              ${vrijwilligerNote}

            </td>
          </tr>

          <!-- ══ PRAKTISCHE INFO ════════════════════════════════════════════ -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;padding:0 28px 24px 28px;">

              <p class="section-label" style="margin:0 0 14px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:20px;">Praktische informatie</p>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="info-row-border" style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;width:38%;vertical-align:top;">
                    <span class="info-label" style="font-size:11px;font-weight:700;color:#64748b;">&#127968; Co&ouml;rdinatiepunt</span>
                  </td>
                  <td class="info-row-border" style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <span class="info-value" style="font-size:12px;color:#374151;">Grote Kerk, Loolaan 16 &mdash; Apeldoorn</span>
                  </td>
                </tr>
                <tr>
                  <td class="info-row-border" style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <span class="info-label" style="font-size:11px;font-weight:700;color:#64748b;">&#127937; Finish</span>
                  </td>
                  <td class="info-row-border" style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <span class="info-value" style="font-size:12px;color:#374151;">Grote Kerk &middot; 16:10&ndash;16:30</span>
                  </td>
                </tr>
                <tr>
                  <td class="info-row-border" style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <span class="info-label" style="font-size:11px;font-weight:700;color:#64748b;">&#127828; Eten &amp; drinken</span>
                  </td>
                  <td class="info-row-border" style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <span class="info-value" style="font-size:12px;color:#374151;">Lunchpakket inbegrepen &middot; fruit &amp; drinken onderweg</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:9px 12px 9px 0;vertical-align:top;">
                    <span class="info-label" style="font-size:11px;font-weight:700;color:#64748b;">&#129657; EHBO</span>
                  </td>
                  <td style="padding:9px 0;vertical-align:top;">
                    <span class="info-value" style="font-size:12px;color:#374151;">EHBO&rsquo;ers &amp; begeleiders gehele dag aanwezig</span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ══ CTA ════════════════════════════════════════════════════════ -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;padding:8px 28px 32px 28px;text-align:center;">
              <a href="https://dekoninklijkeloop.nl/programma"
                 style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;font-size:13px;font-family:Arial,sans-serif;text-decoration:none;padding:13px 28px;border-radius:8px;letter-spacing:0.4px;margin:0 6px 8px 6px;">
                Bekijk het programma &rarr;
              </a>
              <a href="https://dekoninklijkeloop.nl/routes"
                 style="display:inline-block;background:#ffffff;color:#f97316;font-weight:700;font-size:13px;font-family:Arial,sans-serif;text-decoration:none;padding:12px 28px;border-radius:8px;letter-spacing:0.4px;border:2px solid #f97316;margin:0 6px 8px 6px;">
                Jouw route bekijken &rarr;
              </a>
            </td>
          </tr>

          <!-- ══ FOOTER ═════════════════════════════════════════════════════ -->
          <tr>
            <td class="footer-bg" style="background-color:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;padding:20px 28px;">

              <!-- Social links -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14px;">
                <tr>
                  <td>
                    <a href="https://www.instagram.com/koninklijkeloop/" style="color:#64748b;text-decoration:none;font-size:11px;margin-right:14px;">Instagram</a>
                    <a href="https://www.facebook.com/p/De-Koninklijke-Loop-61556315443279/" style="color:#64748b;text-decoration:none;font-size:11px;margin-right:14px;">Facebook</a>
                    <a href="https://www.linkedin.com/company/de-koninklijke-loop/" style="color:#64748b;text-decoration:none;font-size:11px;">LinkedIn</a>
                  </td>
                </tr>
              </table>

              <p class="footer-text" style="margin:0 0 6px 0;font-size:11px;color:#64748b;line-height:1.6;">
                Vragen? Mail ons via <a href="mailto:info@dekoninklijkeloop.nl" class="footer-link" style="color:#f97316;text-decoration:none;font-weight:600;">info@dekoninklijkeloop.nl</a>
              </p>
              <p class="footer-text" style="margin:0;font-size:10px;color:#94a3b8;">
                Registratie&shy;nummer: <code style="font-family:monospace;color:#64748b;font-size:10px;">${safeRegistrationId}</code>
                &nbsp;&middot;&nbsp;
                <a href="https://dekoninklijkeloop.nl" class="footer-link" style="color:#94a3b8;text-decoration:none;">dekoninklijkeloop.nl</a>
              </p>

            </td>
          </tr>

        </table>
        <!-- /email card -->

      </td>
    </tr>
  </table>
  <!-- /outer wrapper -->

</body>
</html>`;
}

// ── Guest email \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

/**
 * Build the guest confirmation email.
 * Structurally identical to the authenticated email but includes:
 *  - A "maak een account" benefits section above the CTA
 *  - CTA links to programma + register (instead of dashboard)
 */
function buildGuestEmail(params: {
  safeName: string;
  safeRegistrationId: string;
  safeEmail: string;
  routeBlock: string;
  vrijwilligerNote: string;
}): string {
  const { safeName, safeRegistrationId, safeEmail, routeBlock, vrijwilligerNote } = params;

  return `<!DOCTYPE html>
<html lang="nl" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Bevestiging inschrijving &mdash; De Koninklijke Loop 2026</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    * { box-sizing: border-box; }
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #0f172a !important; }
      .email-card { background-color: #1e293b !important; }
      .body-text { color: #e2e8f0 !important; }
      .muted-text { color: #94a3b8 !important; }
      .time-card { background-color: #0f172a !important; border-color: #334155 !important; }
      .info-row-border { border-bottom-color: #1e293b !important; }
      .info-label { color: #64748b !important; }
      .info-value { color: #e2e8f0 !important; }
      .footer-bg { background-color: #0f172a !important; border-top-color: #334155 !important; }
      .footer-text { color: #475569 !important; }
      .footer-link { color: #f97316 !important; }
      .time-value { color: #f1f5f9 !important; }
      .account-card { background-color: #1e293b !important; border-color: #f9731620 !important; }
    }
  </style>
</head>
<body class="email-bg" style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Je inschrijving voor De Koninklijke Loop 2026 is bevestigd! Maak een account aan en profiteer van exclusieve voordelen.&nbsp;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;</div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;" class="email-card">

          <!-- LOGO BAR -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;border-radius:16px 16px 0 0;padding:18px 28px;border-bottom:1px solid #fef3e2;">
              <img src="https://ik.imagekit.io/a0oim4e3e/tr:w-240,f-auto,q-85/De%20Koninklijkeloop/webassets/DKLLogoV1_kx60i9.webp"
                   alt="De Koninklijke Loop" width="120" height="auto"
                   style="display:block;height:auto;max-height:44px;width:auto;" />
            </td>
          </tr>

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(145deg,#f97316 0%,#ea580c 100%);padding:28px 28px 32px 28px;">
              <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.70);">Bevestigingsmail</p>
              <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.15;letter-spacing:-0.5px;">Inschrijving<br/>bevestigd &#10003;</p>
              <p style="margin:12px 0 0 0;font-size:13px;color:rgba(255,255,255,0.85);">
                &#128197; ${EVENT_DATE} &nbsp;&#183;&nbsp; &#128205; Apeldoorn
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;padding:28px 28px 8px 28px;">
              <p class="body-text" style="margin:0 0 6px 0;font-size:16px;color:#1e293b;">Beste <strong>${safeName}</strong>,</p>
              <p class="muted-text" style="margin:0 0 24px 0;font-size:13px;color:#64748b;line-height:1.7;">Super dat je meedoet! Je inschrijving is officieel goedgekeurd en bevestigd. Hieronder vind je alle details voor jouw dag.</p>

              ${routeBlock}
              ${vrijwilligerNote}
            </td>
          </tr>

          <!-- PRAKTISCHE INFO -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;padding:0 28px 24px 28px;">
              <p style="margin:0 0 14px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:20px;" class="muted-text">Praktische informatie</p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="info-row-border" style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;width:38%;vertical-align:top;">
                    <span class="info-label" style="font-size:11px;font-weight:700;color:#64748b;">&#127968; Co&ouml;rdinatiepunt</span>
                  </td>
                  <td class="info-row-border" style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <span class="info-value" style="font-size:12px;color:#374151;">Grote Kerk, Loolaan 16 &mdash; Apeldoorn</span>
                  </td>
                </tr>
                <tr>
                  <td class="info-row-border" style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <span class="info-label" style="font-size:11px;font-weight:700;color:#64748b;">&#127937; Finish</span>
                  </td>
                  <td class="info-row-border" style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <span class="info-value" style="font-size:12px;color:#374151;">Grote Kerk &middot; 16:10&ndash;16:30</span>
                  </td>
                </tr>
                <tr>
                  <td class="info-row-border" style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <span class="info-label" style="font-size:11px;font-weight:700;color:#64748b;">&#127828; Eten &amp; drinken</span>
                  </td>
                  <td class="info-row-border" style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                    <span class="info-value" style="font-size:12px;color:#374151;">Lunchpakket inbegrepen &middot; fruit &amp; drinken onderweg</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:9px 12px 9px 0;vertical-align:top;">
                    <span class="info-label" style="font-size:11px;font-weight:700;color:#64748b;">&#129657; EHBO</span>
                  </td>
                  <td style="padding:9px 0;vertical-align:top;">
                    <span class="info-value" style="font-size:12px;color:#374151;">EHBO&rsquo;ers &amp; begeleiders gehele dag aanwezig</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- \u2550\u2550 ACCOUNT BENEFITS BLOCK (guest-only) \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;padding:0 28px 24px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="account-card" style="background:linear-gradient(135deg,#fff7ed 0%,#fffbf5 100%);border:1.5px solid #fed7aa;border-radius:12px;padding:20px 22px;">
                    <p style="margin:0 0 4px 0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#ea580c;">&#127775; Exclusief voor accounthouders</p>
                    <p style="margin:0 0 14px 0;font-size:15px;font-weight:700;color:#1e293b;line-height:1.3;">Haal meer uit jouw deelname</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:0 0 8px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="width:24px;vertical-align:top;padding-top:1px;">
                                <div style="width:20px;height:20px;background:#f97316;border-radius:50%;text-align:center;line-height:20px;font-size:11px;color:#fff;font-weight:700;">1</div>
                              </td>
                              <td style="padding-left:10px;vertical-align:top;">
                                <p style="margin:0;font-size:12px;color:#374151;line-height:1.5;"><strong style="color:#1e293b;">Inschrijfhistorie bewaren</strong> &mdash; Al je deelnames op &eacute;&eacute;n plek, elke editie.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 8px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="width:24px;vertical-align:top;padding-top:1px;">
                                <div style="width:20px;height:20px;background:#f97316;border-radius:50%;text-align:center;line-height:20px;font-size:11px;color:#fff;font-weight:700;">2</div>
                              </td>
                              <td style="padding-left:10px;vertical-align:top;">
                                <p style="margin:0;font-size:12px;color:#374151;line-height:1.5;"><strong style="color:#1e293b;">Prioritaire inschrijving</strong> &mdash; Schrijf je volgend jaar eerder in dan gastdeelnemers.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 8px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="width:24px;vertical-align:top;padding-top:1px;">
                                <div style="width:20px;height:20px;background:#f97316;border-radius:50%;text-align:center;line-height:20px;font-size:11px;color:#fff;font-weight:700;">3</div>
                              </td>
                              <td style="padding-left:10px;vertical-align:top;">
                                <p style="margin:0;font-size:12px;color:#374151;line-height:1.5;"><strong style="color:#1e293b;">Jouw foto&rsquo;s terugvinden</strong> &mdash; Eventfoto&rsquo;s worden gekoppeld aan jouw profiel.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="width:24px;vertical-align:top;padding-top:1px;">
                                <div style="width:20px;height:20px;background:#f97316;border-radius:50%;text-align:center;line-height:20px;font-size:11px;color:#fff;font-weight:700;">4</div>
                              </td>
                              <td style="padding-left:10px;vertical-align:top;">
                                <p style="margin:0;font-size:12px;color:#374151;line-height:1.5;"><strong style="color:#1e293b;">Persoonlijk dashboard</strong> &mdash; Inschrijving, vrijwilligerstaken en donaties &eacute;&eacute;n overzicht.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 0 0;font-size:11px;color:#92400e;line-height:1.5;">&#127381; Gratis &amp; binnen 60 seconden aangemaakt.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA (guest variant) -->
          <tr>
            <td class="email-card" style="background-color:#ffffff;padding:8px 28px 32px 28px;text-align:center;">
              <a href="https://dekoninklijkeloop.nl/auth/register?mode=claim&amp;email=${safeEmail}"
                 style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;font-size:13px;font-family:Arial,sans-serif;text-decoration:none;padding:13px 28px;border-radius:8px;letter-spacing:0.4px;margin:0 6px 8px 6px;">
                Maak een gratis account aan &rarr;
              </a>
              <a href="https://dekoninklijkeloop.nl/programma"
                 style="display:inline-block;background:#ffffff;color:#f97316;font-weight:700;font-size:13px;font-family:Arial,sans-serif;text-decoration:none;padding:12px 28px;border-radius:8px;letter-spacing:0.4px;border:2px solid #f97316;margin:0 6px 8px 6px;">
                Bekijk het programma &rarr;
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer-bg" style="background-color:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;padding:20px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14px;">
                <tr>
                  <td>
                    <a href="https://www.instagram.com/koninklijkeloop/" style="color:#64748b;text-decoration:none;font-size:11px;margin-right:14px;">Instagram</a>
                    <a href="https://www.facebook.com/p/De-Koninklijke-Loop-61556315443279/" style="color:#64748b;text-decoration:none;font-size:11px;margin-right:14px;">Facebook</a>
                    <a href="https://www.linkedin.com/company/de-koninklijke-loop/" style="color:#64748b;text-decoration:none;font-size:11px;">LinkedIn</a>
                  </td>
                </tr>
              </table>
              <p class="footer-text" style="margin:0 0 6px 0;font-size:11px;color:#64748b;line-height:1.6;">
                Vragen? Mail ons via <a href="mailto:info@dekoninklijkeloop.nl" class="footer-link" style="color:#f97316;text-decoration:none;font-weight:600;">info@dekoninklijkeloop.nl</a>
              </p>
              <p class="footer-text" style="margin:0;font-size:10px;color:#94a3b8;">
                Registratie&shy;nummer: <code style="font-family:monospace;color:#64748b;font-size:10px;">${safeRegistrationId}</code>
                &nbsp;&middot;&nbsp;
                <a href="https://dekoninklijkeloop.nl" class="footer-link" style="color:#94a3b8;text-decoration:none;">dekoninklijkeloop.nl</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}


/** Build a plain-text fallback for spam-filter compliance and accessibility. */
function buildPlainText(params: {
  name: string;
  roleLabel: string;
  registrationId: string;
  route: ReturnType<typeof resolveRoute>;
  usesShuttle: boolean;
  isVrijwilliger: boolean;
}): string {
  const { name, roleLabel, registrationId, route, usesShuttle, isVrijwilliger } = params;

  const routeSection = route
    ? [
      `Route: ${route.label} (${route.afstand})`,
      `Meldtijd: ${route.meldtijd} — Grote Kerk, Loolaan 16, Apeldoorn`,
      `Pendelbus vertrek: ${route.busVertrek} — ${usesShuttle ? "Geselecteerd" : "Optioneel"}`,
      `Start: ${route.startTijd} — ${route.startLocatie}`,
      `Startadres: ${route.startAdres}`,
    ].join("\n")
    : `Inschrijving als ${roleLabel} bevestigd.`;

  const vrijwilligerSection = isVrijwilliger
    ? "\nVrijwilliger — Je ontvangt binnenkort aparte instructies. Vragen? info@dekoninklijkeloop.nl\n"
    : "";

  return [
    `De Koninklijke Loop 2026 — Inschrijving bevestigd`,
    ``,
    `Beste ${name},`,
    ``,
    `Je inschrijving is officieel bevestigd. Tot ${EVENT_DATE} in Apeldoorn!`,
    ``,
    routeSection,
    vrijwilligerSection,
    `Praktische informatie`,
    `  Coordinatiepunt: Grote Kerk, Loolaan 16 — Apeldoorn`,
    `  Finish: Grote Kerk · 16:10–16:30`,
    `  Eten & drinken: Lunchpakket inbegrepen · fruit & drinken bij rustpunten`,
    `  EHBO: Begeleiders & EHBO'ers gehele dag aanwezig`,
    ``,
    `Bekijk het programma: https://dekoninklijkeloop.nl/programma`,
    ``,
    `Vragen? info@dekoninklijkeloop.nl`,
    `Registratienummer: ${registrationId}`,
  ].join("\n");
}

// ── Handler ──────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request, cookies }) => {
  // 1. Auth: token aanwezig?
  const auth = getAuthContext(cookies);
  if (!auth) return unauthorizedResponse();

  // 2. RBAC: alleen admin of editor mag bevestigingen sturen
  const callerRole = getRoleFromToken(auth.token);
  if (callerRole !== "admin" && callerRole !== "editor") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Parse request body
  let body: Partial<ConfirmationPayload>;
  try {
    body = await request.json() as Partial<ConfirmationPayload>;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 4. Validate input
  const validationError = validatePayload(body);
  if (validationError) {
    return new Response(JSON.stringify(validationError), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Safe to cast — validatePayload guarantees required fields are present
  const { name, email, role, distance, shuttleBus, registrationId, userType } = body as ConfirmationPayload;

  // 5. Resolve route safely (no unsafe cast)
  const route = resolveRoute(distance);
  const usesShuttle = shuttleBus === "pendelbus";
  const isVrijwilliger = role === "vrijwilliger";

  const roleLabel =
    role === "begeleider" ? "Begeleider" :
      role === "vrijwilliger" ? "Vrijwilliger" :
        "Deelnemer";

  // 6. Build email parts
  const safeName = escapeHtml(name);
  const safeRegistrationId = escapeHtml(registrationId);

  const routeBlock = buildRouteBlock(route, usesShuttle, roleLabel);

  const vrijwilligerNote = isVrijwilliger ? `
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
      </table>` : "";

  // 6b. Choose template based on userType (guest = stimulate account creation)
  const safeEmail = escapeHtml(encodeURIComponent(email));
  const isGuest = userType !== "authenticated";
  const htmlBody = isGuest
    ? buildGuestEmail({ safeName, safeRegistrationId, safeEmail, routeBlock, vrijwilligerNote })
    : buildHtmlEmail({ safeName, safeRegistrationId, routeBlock, vrijwilligerNote });
  const textBody = buildPlainText({ name, roleLabel, registrationId, route, usesShuttle, isVrijwilliger });

  const subject = isGuest
    ? `Bevestiging inschrijving — De Koninklijke Loop 2026`
    : `Bevestiging inschrijving — De Koninklijke Loop 2026`;

  // 7. Dispatch via Go backend
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/mail/send`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({
        to: email,
        from: "inschrijving",
        subject,
        body: htmlBody,
        text: textBody,
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

    return new Response(JSON.stringify({ success: true, sentAt: Date.now() }), {
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
