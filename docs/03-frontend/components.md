# Component Bibliotheek — Overzicht

## Component Categorieën

```
src/components/
├── admin/      — 60 admin React componenten (`.tsx`)
├── blocks/     — 11 pagina-sectie blokken
├── chat/       — 14 chat UI componenten
├── islands/    — 20 publieke React Islands
├── ui/         — 9 herbruikbare UI primitieven
└── seo/        — 1 SEO meta component
```

---

## 🛠️ Admin Componenten (`/admin`)

### Dashboard & Overview
| Component | Doel |
|---|---|
| `DashboardStats.tsx` | KPI-kaarten (totaal deelnemers, nieuw vandaag) |
| `DashboardTable.tsx` | Live inschrijvingstabel (76KB — grootste component) |
| `DashboardWrapper.tsx` | Hydration wrapper voor dashboard island |
| `AnalyticsDashboard.tsx` | Websitestatistieken dashboard (52KB) |
| `AnalyticsWrapper.tsx` | Hydration wrapper voor analytics |

### Inschrijvingen & CRM
| Component | Doel |
|---|---|
| `ParticipantsTable.tsx` | CRM tabel met filteren en sorteren (76KB) |
| `ParticipantDetailModal.tsx` | Detailmodal deelnemer (34KB) |
| `BulkEditModal.tsx` | Bulkbewerking (status, editie) |
| `PaginationControls.tsx` | Paginatie component |

### Media
| Component | Doel |
|---|---|
| `MediaManagerIsland.tsx` | Media bibliotheek overzicht |
| `MediaCard.tsx` | Individuele media-item kaart |
| `MediaDetailModal.tsx` | Media detail + metadata bewerken |
| `MediaToolbar.tsx` | Filter en actiebalk |
| `ServerSideUploadButton.tsx` | ImageKit server-side signed upload |
| `ImageKitUploadButton.tsx` | Client-side upload alternatief |

### Email Beheer
| Component | Doel |
|---|---|
| `EmailManagerIsland.tsx` | Inbox beheer (28KB) |
| `EmailListItem.tsx` | Individueel email item |
| `EmailDetailPanel.tsx` | Email lezen en beantwoorden |
| `ComposeModal.tsx` | Nieuw email opstellen (25KB) |
| `ContactPicker.tsx` | Ontvanger selecteren (19KB) |
| `IMAPConfigIsland.tsx` | IMAP configuratie (17KB) |
| `MailConfigIsland.tsx` | SMTP configuratie (20KB) |

### Social Media
| Component | Doel |
|---|---|
| `SocialManagerIsland.tsx` | Overzicht social posts |
| `SocialPostCard.tsx` | Individuele post kaart |
| `SocialPostModal.tsx` | Post aanmaken/bewerken (34KB) |

### X (Twitter) Poster
| Component | Doel |
|---|---|
| `XPosterIsland.tsx` | X campagne overzicht |
| `XPostEditor.tsx` | Post editor (20KB) |
| `XCampaignModal.tsx` | Campagne beheer |
| `XConfigPanel.tsx` | X API configuratie |
| `XBudgetWidget.tsx` | Budget overzicht |
| `XPostCard.tsx` | Individuele X post kaart |

### Blog
| Component | Doel |
|---|---|
| `BlogManagerIsland.tsx` | Blog posts overzicht (16KB) |
| `BlogPostEditor.tsx` | TipTap rich-text editor (23KB) |
| `BlogCategoryManager.tsx` | Categorieën beheren |
| `BlogCommentMod.tsx` | Reacties modereren |
| `BlogConfigPanel.tsx` | Blog instellingen |

### PR Communicatie
| Component | Doel |
|---|---|
| `CommunicatieManager.tsx` | Organisaties + contacten database (40KB) |
| `CommunicatieModals.tsx` | Toevoegen/bewerken modals |
| `CommunicatieIsland.tsx` | Hydration wrapper |

### Team Hub
| Component | Doel |
|---|---|
| `TeamHub.tsx` | Notulen, programma, taken overzicht (20KB) |
| `TeamHubModals.tsx` | Aanmaken/bewerken modals |
| `EventSchedule.tsx` | Evenementprogramma beheer (26KB) |
| `EventSettingsForm.tsx` | Evenementinstellingen (18KB) |
| `EventSettingsIsland.tsx` | Hydration wrapper |
| `VolunteerTasksManager.tsx` | Vrijwilligerstaken (31KB) |

### Donaties
| Component | Doel |
|---|---|
| `DonationSettingsIsland.tsx` | Campagne-instellingen (13KB) |
| `DonationWidgetIsland.tsx` | GoFundMe widget (10KB) |

### Admin Utility
| Component | Doel |
|---|---|
| `AdminHeader.astro` | Admin paginaheader (niet-React) |
| `AdminNav.astro` | Admin navigatiemenu |
| `AdminModal.tsx` | Herbruikbare modal wrapper |
| `FeedbackList.tsx` | Feedback-tickets overzicht |
| `FeedbackModal.tsx` | Feedback-ticket detail |
| `NotificationMonitor.tsx` | Realtime notificatie indicator |
| `TelegramConfigIsland.tsx` | Telegram notificatie config |

---

## 🌐 Publieke Islands (`/islands`)

| Component | Beschrijving |
|---|---|
| `RegisterIsland.tsx` | Volledig inschrijfformulier (52KB) |
| `LoginForm.tsx` | Login + MFA flow (34KB) |
| `ParticipantDashboardWrapper.tsx` | Deelnemersdashboard (47KB) |
| `ParticipantEditModal.tsx` | Profielbewerking |
| `RouteMap.tsx` | Leaflet kaart (eenvoudig) |
| `RouteDetailWithElevation.tsx` | Route detail + hoogteprofiel |
| `RouteMapInner.tsx` | Inner kaart component |
| `MediaLightboxModal.tsx` | Foto lightbox |
| `VideoShowcase.tsx` | Aftermovie jaar-switching |
| `FAQAccordion.tsx` | Uitklapbare FAQ |
| `ContactForm.tsx` | Contactformulier |
| `LiveImageGrid.tsx` | Live fotogrid |
| `PhotoUploadWidget.tsx` | Foto upload door deelnemers |
| `SystemStatus.tsx` | Service health indicator |
| `ThemeToggle.tsx` | Dark/Light wisseling |
| `ResetPasswordIsland.tsx` | Wachtwoord reset |
| `ConvexClientProvider.tsx` | Convex context wrapper |

---

## 📦 UI Primitieven (`/ui`)

Herbruikbare lage-niveau componenten:
- Buttons, badges, modals
- Form inputs
- Loading spinners / skeletons
- Tooltips

---

## 🧱 Pagina Blokken (`/blocks`)

| Map | Blokken |
|---|---|
| `Blog/` | BlogGrid, BlogPost, BlogSidebar |
| `Contact/` | ContactInfo, ContactMap |
| `DKL/` | DKLHero, DKLInfo, DKLStats |
| `Global/` | Footer, Navigation |
| `Home/` | HeroSection, FeatureCards |
| `Media/` | PhotoGallery, VideoSection, AfterMovies, MediaGrid |
| `Overons/` | TeamSection |
| `Programma/` | ProgrammaSchedule |
| `Route/` | RouteSection |
| `Social/` | SocialFeed, SocialCard, SocialGrid (6 componenten) |
| `Sponsors/` | SponsorGrid, SponsorBanner, SponsorCard |

---

*← [design-system.md](./design-system.md) · Volgende: [pages.md](./pages.md)*
