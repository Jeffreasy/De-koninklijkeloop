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
  /** Embedded group members for groepsregistratie (begeleider only). */
  groupMembers?: Array<{
    name: string;
    distance?: string;
    wheelchairUser?: boolean;
    shuttleBus?: string;
  }>;
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

/** Minify HTML: strip all newlines/extra spaces so the backend Markdown parser cannot inject <br> tags or break multiline attributes. */
function minify(html: string): string {
  return html.replace(/\s*\n\s*/g, "").replace(/\s{2,}/g, " ").trim();
}

function buildGroupMembersBlock(groupMembers: ConfirmationPayload["groupMembers"]): string {
  if (!groupMembers || groupMembers.length === 0) return "";

  const rows = groupMembers.map((m, i) => {
    const dist = m.distance ? `${m.distance} km` : "&mdash;";
    const wc = m.wheelchairUser ? ` <span style="display:inline-block;background:#eef2ff;color:#4338ca;font-size:9px;padding:1px 6px;border-radius:10px;">&#9855; Rolstoel</span>` : "";
    const shuttle = m.shuttleBus === "pendelbus" ? ` <span style="display:inline-block;background:#ecfeff;color:#0e7490;font-size:9px;padding:1px 6px;border-radius:10px;">&#128652; Bus</span>` : "";
    return `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:7px 0;font-size:12px;color:#374151;width:32px;font-weight:700;">${i + 1}.</td><td style="padding:7px 0;font-size:12px;color:#111827;font-weight:600;">${escapeHtml(m.name)}</td><td style="padding:7px 0;font-size:12px;color:#6b7280;text-align:right;">${dist}${wc}${shuttle}</td></tr>`;
  }).join("");

  return minify(`
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td style="padding:0 0 12px 0;">
        <p style="margin:0 0 6px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;">&#128101; Aangemelde deelnemers (${groupMembers.length})</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:0 12px;">
          <tbody style="display:table;width:100%;">${rows}</tbody>
        </table>
      </td></tr>
    </table>
  `);
}

/** Build the route-specific schedule block — minified for Go backend Markdown parser compatibility. */
function buildRouteBlock(
  route: ReturnType<typeof resolveRoute>,
  usesShuttle: boolean,
  roleLabel: string
): string {
  if (!route) {
    return minify(`<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:20px;"><tr><td><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;"><tr><td style="padding:14px 18px;"><p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">&#128203; Inschrijving als <strong>${roleLabel}</strong> bevestigd. Routedetails volgen zodra beschikbaar.</p></td></tr></table></td></tr></table>`);
  }

  const shuttleStatus = usesShuttle
    ? `<span style="display:inline-block;background:#dcfce7;color:#166534;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;">&#10003; Geboekt</span>`
    : `<span style="display:inline-block;background:#f3f4f6;color:#6b7280;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;">Optioneel</span>`;

  // Minified — no newlines so Go markdown parser cannot inject <br> or break multiline attributes
  return minify(`
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:16px;"><tr><td style="background-color:#f8fafc;border:2px solid ${route.kleur};border-radius:12px;padding:16px 18px;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;"><tr><td style="vertical-align:middle;"><p style="margin:0 0 3px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${route.kleur};">&#128205; Jouw route</p><p style="margin:0;font-size:18px;font-weight:800;color:#111827;line-height:1.2;">${escapeHtml(route.label)}</p><p style="margin:5px 0 0 0;font-size:11px;color:#6b7280;"><strong style="color:#374151;">${escapeHtml(route.afstand)}</strong> &nbsp;&#183;&nbsp; ${escapeHtml(roleLabel)}</p></td><td style="width:48px;text-align:right;vertical-align:middle;"><div style="width:40px;height:40px;background-color:${route.kleur};border-radius:50%;text-align:center;line-height:40px;font-size:20px;">&#127939;</div></td></tr></table><p style="margin:10px 0 0 0;"><span style="display:inline-block;background:#f0fdf4;color:#166534;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;border:1px solid #bbf7d0;">&#9855; Rolstoelvriendelijke route</span></p></td></tr></table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:20px;"><tr><td style="padding-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;"><tr><td style="width:6px;background-color:${route.kleur};border-radius:10px 0 0 10px;"></td><td style="padding:12px 16px;"><p style="margin:0 0 1px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">&#127968; Meldtijd</p><p style="margin:0;font-size:22px;font-weight:800;color:#111827;font-family:'Courier New',Courier,monospace;line-height:1;">${route.meldtijd}</p><p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;">Grote Kerk, Loolaan 16 &mdash; Apeldoorn</p></td></tr></table></td></tr><tr><td style="padding-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;"><tr><td style="width:6px;background-color:#64748b;border-radius:10px 0 0 10px;"></td><td style="padding:12px 16px;"><p style="margin:0 0 1px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">&#128652; Pendelbus</p><p style="margin:0;font-size:22px;font-weight:800;color:#111827;font-family:'Courier New',Courier,monospace;line-height:1;">${route.busVertrek}</p><p style="margin:4px 0 0 0;font-size:11px;">${shuttleStatus}</p></td></tr></table></td></tr><tr><td><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;"><tr><td style="width:6px;background-color:#10b981;border-radius:10px 0 0 10px;"></td><td style="padding:12px 16px;"><p style="margin:0 0 1px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">&#127937; Start</p><p style="margin:0;font-size:22px;font-weight:800;color:#111827;font-family:'Courier New',Courier,monospace;line-height:1;">${route.startTijd}</p><p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;">${escapeHtml(route.startLocatie)}</p></td></tr></table></td></tr></table>
  `);
}

/** Build inner HTML body for authenticated user email. No DOCTYPE/head/body — Go backend provides those. */
function buildHtmlEmail(params: {
  safeName: string;
  safeRegistrationId: string;
  routeBlock: string;
  vrijwilligerNote: string;
  groupMembersBlock: string;
}): string {
  const { safeName, safeRegistrationId, routeBlock, vrijwilligerNote, groupMembersBlock } = params;

  const infoTable = minify(`<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;width:38%;vertical-align:top;"><span style="font-size:11px;font-weight:700;color:#64748b;">&#127968; Co&ouml;rdinatiepunt</span></td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;"><span style="font-size:12px;color:#374151;">Grote Kerk, Loolaan 16 &mdash; Apeldoorn</span></td></tr><tr><td style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;"><span style="font-size:11px;font-weight:700;color:#64748b;">&#127937; Finish</span></td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;"><span style="font-size:12px;color:#374151;">Grote Kerk &middot; 16:10&ndash;16:30</span></td></tr><tr><td style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;"><span style="font-size:11px;font-weight:700;color:#64748b;">&#127828; Eten &amp; drinken</span></td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;"><span style="font-size:12px;color:#374151;">Lunchpakket inbegrepen &middot; fruit &amp; drinken onderweg</span></td></tr><tr><td style="padding:9px 12px 9px 0;vertical-align:top;"><span style="font-size:11px;font-weight:700;color:#64748b;">&#129657; EHBO</span></td><td style="padding:9px 0;vertical-align:top;"><span style="font-size:12px;color:#374151;">EHBO&rsquo;ers &amp; begeleiders gehele dag aanwezig</span></td></tr></table>`);

  const ctaButtons = minify(`<p style="text-align:center;margin:24px 0 0 0;"><a href="https://dekoninklijkeloop.nl/programma" style="display:inline-block;background-color:#f97316;color:#ffffff;font-weight:700;font-size:13px;font-family:Arial,sans-serif;text-decoration:none;padding:13px 28px;border-radius:8px;letter-spacing:0.4px;margin:0 6px 8px 6px;">Bekijk het programma &rarr;</a> <a href="https://dekoninklijkeloop.nl/routes" style="display:inline-block;background-color:#ffffff;color:#f97316;font-weight:700;font-size:13px;font-family:Arial,sans-serif;text-decoration:none;padding:12px 28px;border-radius:8px;letter-spacing:0.4px;border:2px solid #f97316;margin:0 6px 8px 6px;">Jouw route bekijken &rarr;</a></p>`);

  return [
    `<p style="margin:0 0 6px 0;font-size:16px;color:#1e293b;">Beste <strong>${safeName}</strong>,</p>`,
    `<p style="margin:0 0 24px 0;font-size:13px;color:#64748b;line-height:1.7;">Super dat je meedoet! Je inschrijving is officieel goedgekeurd en bevestigd. Hieronder vind je alle details voor jouw dag.</p>`,
    routeBlock,
    vrijwilligerNote,
    groupMembersBlock,
    `<p style="margin:0 0 14px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:20px;">Praktische informatie</p>`,
    infoTable,
    ctaButtons,
    `<p style="margin:24px 0 0 0;font-size:10px;color:#94a3b8;">Registratienummer: <code style="font-family:monospace;color:#64748b;font-size:10px;">${safeRegistrationId}</code></p>`,
  ].join("\n");
}

// ── Guest email ───────────────────────────────────────────────────────────────

/**
 * Build the guest confirmation email (inner body only).
 * Same structure as authenticated but adds an "account benefits" block and a register CTA.
 */
function buildGuestEmail(params: {
  safeName: string;
  safeRegistrationId: string;
  safeEmail: string;
  routeBlock: string;
  vrijwilligerNote: string;
  groupMembersBlock: string;
}): string {
  const { safeName, safeRegistrationId, safeEmail, routeBlock, vrijwilligerNote, groupMembersBlock } = params;

  const infoTable = minify(`<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;width:38%;vertical-align:top;"><span style="font-size:11px;font-weight:700;color:#64748b;">&#127968; Co&ouml;rdinatiepunt</span></td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;"><span style="font-size:12px;color:#374151;">Grote Kerk, Loolaan 16 &mdash; Apeldoorn</span></td></tr><tr><td style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;"><span style="font-size:11px;font-weight:700;color:#64748b;">&#127937; Finish</span></td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;"><span style="font-size:12px;color:#374151;">Grote Kerk &middot; 16:10&ndash;16:30</span></td></tr><tr><td style="padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;"><span style="font-size:11px;font-weight:700;color:#64748b;">&#127828; Eten &amp; drinken</span></td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;"><span style="font-size:12px;color:#374151;">Lunchpakket inbegrepen &middot; fruit &amp; drinken onderweg</span></td></tr><tr><td style="padding:9px 12px 9px 0;vertical-align:top;"><span style="font-size:11px;font-weight:700;color:#64748b;">&#129657; EHBO</span></td><td style="padding:9px 0;vertical-align:top;"><span style="font-size:12px;color:#374151;">EHBO&rsquo;ers &amp; begeleiders gehele dag aanwezig</span></td></tr></table>`);

  const accountBenefits = minify(`<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;"><tr><td style="background-color:#fff7ed;border:1.5px solid #fed7aa;border-radius:12px;padding:20px 22px;"><p style="margin:0 0 4px 0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#ea580c;">&#127775; Exclusief voor accounthouders</p><p style="margin:0 0 14px 0;font-size:15px;font-weight:700;color:#1e293b;line-height:1.3;">Haal meer uit jouw deelname</p><p style="margin:0 0 8px 0;font-size:12px;color:#374151;line-height:1.5;"><strong style="color:#1e293b;">1. Inschrijfhistorie bewaren</strong> &mdash; Al je deelnames op &eacute;&eacute;n plek, elke editie.</p><p style="margin:0 0 8px 0;font-size:12px;color:#374151;line-height:1.5;"><strong style="color:#1e293b;">2. Prioritaire inschrijving</strong> &mdash; Schrijf je volgend jaar eerder in dan gastdeelnemers.</p><p style="margin:0 0 8px 0;font-size:12px;color:#374151;line-height:1.5;"><strong style="color:#1e293b;">3. Jouw foto&rsquo;s terugvinden</strong> &mdash; Eventfoto&rsquo;s worden gekoppeld aan jouw profiel.</p><p style="margin:0 0 14px 0;font-size:12px;color:#374151;line-height:1.5;"><strong style="color:#1e293b;">4. Persoonlijk dashboard</strong> &mdash; Inschrijving, vrijwilligerstaken en donaties &eacute;&eacute;n overzicht.</p><p style="margin:0;font-size:11px;color:#92400e;line-height:1.5;">&#127381; Gratis &amp; binnen 60 seconden aangemaakt.</p></td></tr></table>`);

  const ctaButtons = minify(`<p style="text-align:center;margin:24px 0 0 0;"><a href="https://dekoninklijkeloop.nl/auth/register?mode=claim&amp;email=${safeEmail}" style="display:inline-block;background-color:#f97316;color:#ffffff;font-weight:700;font-size:13px;font-family:Arial,sans-serif;text-decoration:none;padding:13px 28px;border-radius:8px;letter-spacing:0.4px;margin:0 6px 8px 6px;">Maak een gratis account aan &rarr;</a> <a href="https://dekoninklijkeloop.nl/programma" style="display:inline-block;background-color:#ffffff;color:#f97316;font-weight:700;font-size:13px;font-family:Arial,sans-serif;text-decoration:none;padding:12px 28px;border-radius:8px;letter-spacing:0.4px;border:2px solid #f97316;margin:0 6px 8px 6px;">Bekijk het programma &rarr;</a></p>`);

  return [
    `<p style="margin:0 0 6px 0;font-size:16px;color:#1e293b;">Beste <strong>${safeName}</strong>,</p>`,
    `<p style="margin:0 0 24px 0;font-size:13px;color:#64748b;line-height:1.7;">Super dat je meedoet! Je inschrijving is officieel goedgekeurd en bevestigd. Hieronder vind je alle details voor jouw dag.</p>`,
    routeBlock,
    vrijwilligerNote,
    groupMembersBlock,
    `<p style="margin:0 0 14px 0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:20px;">Praktische informatie</p>`,
    infoTable,
    accountBenefits,
    ctaButtons,
    `<p style="margin:24px 0 0 0;font-size:10px;color:#94a3b8;">Registratienummer: <code style="font-family:monospace;color:#64748b;font-size:10px;">${safeRegistrationId}</code></p>`,
  ].join("\n");
}


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
  const { name, email, role, distance, shuttleBus, registrationId, userType, groupMembers } = body as ConfirmationPayload;

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
  const groupMembersBlock = buildGroupMembersBlock(groupMembers);

  const vrijwilligerNote = isVrijwilliger
    ? minify(`<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;"><tr><td style="padding:0 0 12px 0;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;"><tr><td style="padding:10px 14px;"><p style="margin:0;font-size:12px;color:#166534;line-height:1.5;"><strong>Vrijwilliger</strong> &mdash; Je ontvangt binnenkort aparte instructies. Vragen? <a href="mailto:info@dekoninklijkeloop.nl" style="color:#16a34a;font-weight:600;text-decoration:none;">info@dekoninklijkeloop.nl</a></p></td></tr></table></td></tr></table>`)
    : "";

  // 6b. Choose template based on userType (guest = stimulate account creation)
  const safeEmail = escapeHtml(encodeURIComponent(email));
  const isGuest = userType !== "authenticated";
  const htmlBody = isGuest
    ? buildGuestEmail({ safeName, safeRegistrationId, safeEmail, routeBlock, vrijwilligerNote, groupMembersBlock })
    : buildHtmlEmail({ safeName, safeRegistrationId, routeBlock, vrijwilligerNote, groupMembersBlock });
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
