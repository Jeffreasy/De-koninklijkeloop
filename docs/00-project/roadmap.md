# Roadmap — De Koninklijke Loop Platform

> Levend document — wordt bijgehouden per sprint/versie

---

## ✅ Gerealiseerd (t/m Maart 2026)

### Platform Core
- [x] Astro 5 SSR/Hybrid frontend met Tailwind CSS v4
- [x] Convex realtime backend (37 modules)
- [x] LaventeCare Go IAM backend (Multi-tenant, RBAC, JWT)
- [x] HttpOnly cookie authenticatie + RS256 JWT
- [x] Middleware-level RBAC enforcement

### Publieke Website
- [x] Homepage met videoshowcase (Streamable Video Facade)
- [x] Interactieve routekaart (Leaflet, 4 afstanden)
- [x] MediaGalerij pagina (ImageKit CDN + Streamable aftermovies)
- [x] Blog met TipTap editor en reacties
- [x] FAQ Accordion (React Island)
- [x] Contactformulier met Convex + Go SMTP delivery
- [x] Charity pagina met live GoFundMe widget
- [x] Inschrijfformulier (gast + account flow, volledig validatie)
- [x] Deelnemersdashboard (`/dashboard`)
- [x] Dark/Light theme toggle

### Admin Panel
- [x] Dashboard met live KPIs en inschrijvingstabel
- [x] Deelnemersbeheer (CRM) met detailmodal en bulkbewerking
- [x] Analytics dashboard (cookieloos, GDPR-compliant)
- [x] Email beheer (IMAP inbox, beantwoorden, archiveren)
- [x] Mediabeheer (ImageKit upload, moderatie, metadata)
- [x] Social Media module (posts, carousel, inplannen)
- [x] X (Twitter) Poster met campagnebeheer
- [x] PR Communicatiemodule (organisatiedb, BCC-generator)
- [x] Team Hub (notulen, evenementprogramma, vrijwilligerstaken)
- [x] Interne chat (SSE, 1-op-1 + groepen, aanwezigheid)
- [x] Blog beheer (statussen, categorieën, SEO, reactiebeheer)
- [x] Donatiebeheer (GoFundMe, campagne-instellingen per jaar)
- [x] Evenement- en systeeminstellingen
- [x] SMTP/IMAP configuratie per tenant
- [x] Feedback-ticket systeem
- [x] Dual-email notificaties (inschrijving + info mailboxen)

### Infrastructuur & Security
- [x] Vercel deployment met custom security headers (CSP, HSTS)
- [x] ImageKit CDN integratie (server-side signed uploads)
- [x] Cloudinary + Streamable media resilience patterns
- [x] Docker Compose lokale dev environment
- [x] Service Worker cache-busting (Nuclear Level 3)
- [x] GDPR module (data export, account verwijdering)
- [x] Sentry observability integratie

---

## 🔄 In Progress / Gepland (Q2 2026)

### Pre-event features (voor 16 mei 2026)
- [ ] **Countdown timer** op de homepage
- [ ] **Inschrijvingsstatus email triggers** (automatische herinneringen)
- [ ] **QR-code check-in systeem** voor eventdag (IoT / ESP32)
- [ ] **Live deelnemersteller** op homepage (publiek zichtbaar)

### Platform Verbeteringen
- [ ] **Wachtwoord reset flow** volledig testen + documenteren
- [ ] **Bulk email module** voor directe deelnemerscommunicatie
- [ ] **Export module** (CSV export van deelnemerslijst voor admins)

### Post-event (na 16 mei 2026)
- [ ] **Foto upload portal** voor deelnemers (eigen foto's uploaden)
- [ ] **Resultaten pagina** met finish-tijden en foto's
- [ ] **Evaluatie module** voor vrijwilligersfeedback
- [ ] **Jaaroverzicht 2026** media archief aanmaken

---

## 💡 Backlog / Ideeën

- WhatsApp/Telegram notificaties voor admins bij nieuwe inschrijvingen
- Progressive Web App (PWA) voor offline programma toegang op eventdag
- Multi-language support (Engels voor internationale bezoekers)
- Stripe betalingsintegratie voor betaalde inschrijvingen

---

*← [Terug naar docs/README.md](../README.md)*
