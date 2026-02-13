import { internalMutation } from "./_generated/server";

export const seedTeamData = internalMutation({
    handler: async (ctx) => {
        // 1. Clear existing data
        const existingMinutes = await ctx.db.query("team_minutes").collect();
        for (const m of existingMinutes) {
            await ctx.db.delete(m._id);
        }
        const existingSchedule = await ctx.db.query("event_schedule").collect();
        for (const s of existingSchedule) {
            await ctx.db.delete(s._id);
        }

        // 2. Insert Real Minutes
        const minutes = [
            {
                title: "Vergadering Verslag",
                date: "2024-09-24",
                type: "meeting" as const,
                status: "final" as const,
                tags: ["notulen", "2024", "september"],
                content: `# Datum
[24/09/2024]

# Aanwezigen
- Jeffrey
- Marieke
- Salih

# Actiepunten

## Jeffrey
- Website Aanpassingen:
    - Logo's van Samenwerkingspartners: Plaats de logo's van de gemeente Apeldoorn, Liliane Fonds en de Grote Kerk bovenaan de website. Verwijder logo 's Heeren Loo.
    - Sponsoren: Verplaats naar onderste sectie.
    - Bewegende Elementen: Vervang door statische afbeeldingen voor rust.
    - Achtergrondvideo: Vervang door sfeerimpressie/aftermovie vorige editie.
    - Navigatiebalk: Voeg knoppen "Inschrijven" en "Doneren" toe. Herzie "Login" knop.
    - Contactpagina: Voeg e-mail en telefoon toe.
    - Social Media: Integreer links en iconen.
    - Chatbot: Optimaliseer zichtbaarheid en functionaliteit.
    - Teksten en SEO: Optimaliseer samen met Marieke.
    - Mobile: Optimaliseer weergave.
    - Media: Bouw sectie voor foto's/video's.
    - Privacy: Beveilig persoonsgegevens (AVG).
    - Backend: Verbeter registratie en inlog.
    - Planning: Deel planning in Teams.
    - Begroting: Lever cijfers (ca €700-€800).

## Marieke
- Tekstuele Aanpassingen en SEO: Optimaliseer teksten, keywords, deel SEO-plan.
- Social Media: Deel links/accounts met Jeffrey. Denk na over strategie.
- Nieuwsbrieven: Onderzoek mogelijkheden, plan content.
- Voorbereiding: Bereid bespreking teksten/SEO voor volgende meeting.

## Salih
- Projectplan en Begroting: Stel plan gemeente op, verwerk cijfers Jeffrey.
- Vrijwilligers: Overleg met Fanny/Raymond, plan vergaderingen.
- Cliënten: Organiseer bijeenkomsten voor input.
- Netwerken: Benader zorginstellingen, bereid promotie voor.
- Voorbereiding: Update projectplan/netwerkaanpak.

## Fanny
- Vrijwilligers: Werk aan draaiboek, identificeer taken, coördineer communicatie.
- Cliënten: Organiseer bijeenkomsten met Salih.
- Netwerken: Ondersteun Salih, gebruik eigen netwerk.

## Raymond
- Draaiboek en Logistiek: Stel draaiboek/routeplanning op.
- Vrijwilligers:wijs taken toe, overzicht materialen.

# Volgende Vergadering
- Maandag om 11:00 uur (Updates website, teksten/SEO, projectplan gemeente)`
            },
            {
                title: "Notulen DKL Meeting",
                date: "2025-10-30",
                type: "meeting" as const,
                status: "final" as const,
                tags: ["notulen", "2025", "oktober", "start-2026"],
                content: `# Notulen 30 oktober 2025

**Afspraken voor DKL 2026**
- **Datum:** zaterdag 16 mei 2026
- **Doel:** Only Friends (Apeldoorn). Lokaal en sluit aan bij Alessandro Bistolfi.
- **Streefdoel:** 100 deelnemers
- **Organisatie Miniteams:**
    - Algemeen: Salih, Angelique, Jeffrey, Marieke (Planning, ICT, Draaiboeken)
    - Sponsoring/Subsidie: evt Marieke (Begroting, Financiering)
    - PR & Communicatie: Lida, Ginelli, Jeffrey, Marieke (PR plan, Media, Content)
    - Doelgroep: Hoe bereiken/betrekken?
    - Partners: Salih (Accres, verenigingen, zorginstellingen)

**Overige Punten:**
- **Meetings:** 1x per 6 weken op maandag.
- **Partners:** Accres, Alessandro Bistolfi (Nedarg handbikes). Idee: Kinderen met handbikes mee laten doen.
- **Website & App:** Stappenteller + donatie module. Jeffrey heeft eerste versie.
- **PR Ideeën:** Intranet, Social Media (vlogs, live), Mascotte brainstorm, Merch (tasjes/bekers).
- **Betrokkenheid:** Vanaf januari doelgroep betrekken.`
            },
            {
                title: "Agenda DKL Meeting",
                date: "2025-12-08",
                type: "agenda" as const,
                status: "concept" as const,
                tags: ["agenda", "2025", "december"],
                content: `# DKL Meeting 8 december

**1. Opening en welkom**

**2. Updates**
Hoe gaat het met de voorbereidingen & organisatie van DKL 26?
- Jaarplanning & organisatieplan
- Samenwerking Accres
- Samenwerking Only Friends
- DKL Socials & website
- DKL merch idee (bijv tasjes maken/ontwerpen en verkopen)

**3. Brainstormen**
Kleine brainstorm sessie om ideeën en actiepunten te verzamelen over:
- Het aantal deelnemers vergroten (streven 100)
- De inzameling donaties makkelijk te laten verlopen en meer donaties binnen te krijgen
- Sponsors vinden en wat kunnen we als tegenprestatie bieden?

**4. Actiepunten opstellen/ vragen/ afsluiting**`
            },
            {
                title: "Notulen & Actiepunten DKL Meeting",
                date: "2025-12-08",
                type: "meeting" as const,
                status: "final" as const,
                tags: ["notulen", "2025", "december"],
                content: `# Notulen en actiepunten DKL meeting 8 december

**Updates met actiepunten:**
- **Organisatie:** Kalender, plan & begroting begin januari af.
- **Social Media:** Plan contentplanning gemaakt! Start v.a. half december.
- **Accres:** Salih had belafspraak met Remke Halma. Accres is enthousiast! (Remke sluit 19 jan aan).
- **Handbikes:** Alessandro Bertolfi vindt deelname leuk idee. Mirjam neemt contact op.
- **Merch:** Tassen maken via Druten bleek lastig. Iets voor volgende vergadering.
- **Mascotte:** Angelique + AI hebben een **egel** bedacht! Nadenken over pak/posters.`
            },
            {
                title: "Algemene Agenda DKL 2026",
                date: "2026-01-01",
                type: "agenda" as const,
                status: "final" as const,
                tags: ["agenda", "2026", "jaarplanning"],
                content: `# Agenda DKL 2026 Meeting

**Welkom & DKL 2026**
- Wat gaat er anders?
- Nieuwe aanpak: mini-teams (PR, Doelgroep, etc.)
- Nieuwe partners: Accres, Alessandro Bistolfi
- App & Site ontwikkeling
- Nieuwe inzamelingsvormen

**Brainstorm Vragen**
- Welk doel? (Only Friends)
- Streefbedrag/aantal deelnemers?
- Ideeën verbetering vorige editie?
- Datum? (Zaterdag 16 mei 2026)

**Team Indeling**
- Algemeen (Planning, ICT, Draaiboeken)
- Sponsoring (Financiën)
- PR & Communicatie
- Doelgroep Betrokkenheid
- Partners

**Data Meetings 2026**
- 2 maart @ 11:00
- 13 april @ 11:00
- 11 mei ('terras meeting')`
            },
            {
                title: "Notulen & Actiepunten",
                date: "2026-01-19",
                type: "meeting" as const,
                status: "final" as const,
                tags: ["notulen", "2026", "januari"],
                content: `# Notulen en actiepunten DKL meeting 19 januari

**Updates met actiepunten:**
- **Organisatie:** Kalender, plan & begroting eind januari af -> Subsidie indienen.
- **Accres:** Remke ondersteunt werving (G-teams) en naamsbekendheid.
- **Gemeente:** Salih sprak wethouder Nick Derks. Steun vanuit gemeente (structureel/coalitieplannen).
- **Website & App:** App is ontwikkelproject voor later. Website update voor 16 feb.
- **Social Media:**
    - Flow van content (vrijwilligers/throwbacks).
    - 16 feb start actieve werving.
    - Persbericht naar media/partners (Doel: naamsbekendheid & werving). Marieke maakt af.
- **PR Ideeën:**
    - Interview Stentor (Mirjam).
    - Item TV Gelderland.
    - Flyeren (v.a. 16 feb).
    - Vlog-achtige filmpjes.
- **Sponsors:** Subsidie via 'sport' aanvragen (advies Nick Derks).

**Belangrijke Data**
- **DKL 2026:** Zaterdag 16 mei 2026
- **Meetings:** 2 maart, 13 april, 11 mei.
- **Overig:** Werkbezoek Only Friends (Jan/Feb).`
            }
        ];

        for (const m of minutes) {
            await ctx.db.insert("team_minutes", {
                ...m,
                created_at: Date.now(),
                updated_at: Date.now(),
            });
        }

        // 3. Insert Schedule (Updated with 2026 details found in minutes)
        const scheduleItems = [
            {
                order: 1,
                time: "09:00",
                title: "Terrein Open & Aanmelden",
                description: "Openstelling evenemententerrein. Ophalen startnummers.",
                type: "logistics" as const,
                icon: "aanvang"
            },
            {
                order: 2,
                time: "10:00",
                title: "Gezamenlijke Warming-up",
                description: "Warming-up voor alle deelnemers.",
                type: "event" as const,
                icon: "start"
            },
            {
                order: 3,
                time: "10:30",
                title: "Start De Koningsloop",
                description: "Startschot voor de hoofdafstanden.",
                type: "event" as const,
                icon: "vertrek"
            },
            {
                order: 4,
                time: "12:30",
                title: "Lunch & Muziek",
                description: "Gezamenlijke lunch en live muziek.",
                type: "break" as const,
                icon: "rustpunt"
            },
            {
                order: 5,
                time: "13:30",
                title: "Prijsuitreiking",
                description: "Ceremonie voor alle winnaars.",
                type: "event" as const,
                icon: "finish"
            },
            {
                order: 6,
                time: "15:00",
                title: "Einde Evenement",
                description: "Afsluiting van de dag.",
                type: "logistics" as const,
                icon: "feest"
            }
        ];

        for (const s of scheduleItems) {
            await ctx.db.insert("event_schedule", {
                ...s,
                created_at: Date.now(),
                updated_at: Date.now(),
            });
        }

        return "Real team data seeded successfully!";
    }
});
