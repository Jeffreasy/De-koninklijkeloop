import { routes } from '../../../lib/routeData';

export interface MinuteItem {
    id: string;
    title: string;
    date: string;
    type: 'meeting' | 'agenda' | 'other';
    status: 'concept' | 'final';
    tags: string[];
    content: string; // Markdown supported
}

export const teamMinutes: MinuteItem[] = [
    {
        id: '1',
        title: 'Notulen & Actiepunten DKL Meeting',
        date: '2026-01-19',
        type: 'meeting',
        status: 'final',
        tags: ['Organisatie', 'Accres', 'Gemeente', 'PR'],
        content: `
**Updates met actiepunten:**

- **Organisatie kalender, algemeen organisatieplan, begroting & financieel plan:** zijn in de maak -> Deze zijn eind januari af. -> subsidie aanvraag indienen
- **Samenwerking met Accres** -> Remke kan helaas niet bij de vergadering aanwezig zijn. Maar ze wil iig ondersteunen via het netwerk van Accres om deelnemers te werven (vanuit bijv G teams) en naamsbekendheid in Apeldoorn te vergroten.
- **Samenwerking gemeente Apeldoorn** -> Salih heeft met Nick Derks, de wethouder, gesproken. Hij vindt De Koninklijke Loop een heel mooi initiatief en wil dit ook vanuit zijn rol in de gemeenteraad ondersteunen, zodat het uiteindelijk kan uitgroeien naar een landelijk evenement. Hij wil ook helpen om structurele ondersteuning te regelen vanuit gemeente Apeldoorn en het meenemen in de plannen van de nieuwe gemeentelijke coalitie.
- **Website & app** -> app is nog in ontwikkeling, dit is een project op zich, waarmee nu gestart is maar pas bij volgende edities echt in gebruik wordt genomen. De website zal qua inhoud hier en daar geüpdatet worden voor 16 februari en verder bijgehouden worden. -> Salih gaat hier naar kijken.

**Social media/communicatie:**
- Met het voorstellen van de vrijwilligers en de throwback posts over de vorige editie ontstaat al een mooie flow van content om deelnemers te activeren en te inspireren.
- 16 februari starten we met actieve werving van deelnemers op social media, andere media en offline.
- Er zal dan ook een eerste persbericht de deur uit gaan naar lokale en landelijke media en naar partners en andere partijen binnen het netwerk. Persoonlijke contacten met media worden ook ingezet. Het eerst persbericht heeft als doel naamsbekendheid creëren en deelnemers werven en activeren. -> Marieke maakt de persberichten voor 16 februari af en lijst met contacten geupdate

**Verdere ideeën voor PR en deelnemers werven:**
- Een interview met de stentor met de mannen van SHL -> Mirjam gaat even kijken hiervoor binnen haar netwerk.
- item bij tv Gelderland
- Flyeren bij de instellingen, doelgroep hier ook bij betrekken (na 16 februari)
- vlogachtige filmpjes maken en posten.

- **Sponsors en subsidies** -> We gaan subsidie voor DKL 2026 via sport bij gemeente Apeldoorn aanvragen op advies van Nick Derks

**Data voor vergaderingen/meetings etc.**
**DKL 2026: zaterdag 16 mei 2026**

**DKL Meetings 2026:**
- 2 maart
- 13 April
- 11 mei ('terras meeting')

**Meeting/vergadering met bewoners**
- Meeting met bewoners Ermelo
- Meeting met alle bewoners

**Werkbezoek met bewoners en team bij Only Friends**: Januari/februari?
    `
    },
    {
        id: '2',
        title: 'Notulen & Actiepunten DKL Meeting',
        date: '2025-12-08',
        type: 'meeting',
        status: 'final',
        tags: ['Organisatie', 'Social Media', 'Accres', 'Merch'],
        content: `
**Notulen en actiepunten DKL meeting 8 december**

Updates met actiepunten:

- **Organisatie Kalender, algemeen organisatieplan, begroting & financieel plan:** zijn in de maak -> Deze zijn begin januari af.
- **Social media:** Plan voor contentplanning is gemaakt! -> Vanaf half december wordt er gepost in een regelmatige flow van leuk content waarbij volgers/bezoekers worden meegenomen in hoe de organisatie van DKL verloopt naar de dag toe.
- **Samenwerking met Accres** -> Salih heeft een belafspraak gehad met Remke Halma. Accres is heel enthousiast om de DKL te ondersteunen. 19 januari sluit Remke aan bij de DKL meeting.
- **Samenwerking met Alessandro Bertolfi handbikes**. Salih contact had met Alessandro, hij vond het een leuk idee, de handbikes onderdeel te maken van de loop en hierin wellicht samen te werken met Only Friends -> Mirjam gaat hier verder contact over opnemen.
- **Het idee om zelf merch te maken en verkopen (bv tasjes**) .Angelique had gekeken naar de mogelijkheden bij Druten, dit ging daar toch wat lastiger dan gedacht. ->Iets om over na te denken voor de volgende vergadering.

Angelique heeft samen met AI wel al een mascotte bedacht: een egel! Ziet er leuk uit ->nadenken hoe we hier een pak van kunnen laten maken en/of andere dingen zoals posters, spandoeken etc.
    `
    },
    {
        id: '3',
        title: 'Agenda DKL Meeting',
        date: '2025-12-08',
        type: 'agenda',
        status: 'final',
        tags: ['Agenda', 'Brainstorm', 'Planning'],
        content: `
**DKL Meeting 8 december**

- **Opening en welkom**
- **Updates**

Hoe gaat het met de voorbereidingen & organisatie van DKL 26?

- Jaarplanning & organisatieplan
- Samenwerking Accres
- Samenwerking Only Friends
- DKL Socials & website
- DKL merch idee (bijv tasjes maken/ontwerpen en verkopen )

- **Brainstormen:**

Kleine brainstorm sessie om ideeën en actiepunten te verzamelen over:

- Het aantal deelnemers vergroten (streven 100)
- De inzameling donaties makkelijk te laten verlopen en meer donaties binnen te krijgen)
- Sponsors vinden en wat kunnen we als tegenprestatie bieden?

- **Actiepunten opstellen/ vragen/ afsluiting**.
    `
    },
    {
        id: '4',
        title: 'Notulen DKL Start Meeting',
        date: '2025-10-30',
        type: 'meeting',
        status: 'final',
        tags: ['Start', 'Doel', 'Teams', 'Mascotte'],
        content: `
**Notulen 30 oktober 2025**

**Afspraken voor DKL 2026**

- Datum: zaterdag 16 mei
- Doel: Only Friends (https://onlyfriends.nl/), stichting in Apeldoorn, goed doel omdat het lokaal is en mooi aansluit bij samenwerking met Alessandro Bistolfi.
- Streefdoel aantal deelnemers: 100
- Verdeling van de organisatie in miniteams.

**Teams:**
- **Algemene organisatie: Salih, Angelique, Jeffrey, Marieke** (taken: bewaking jaarplanning, vergaderingen plannen, ICT en online organisatie, draaiboeken maken organisatie dag zelf)
- **Sponsoring/subsidie aanvragen: evt Marieke** (taken: begroting opstellen, financiering rond maken, aanvragen, sponsors benaderen)
- **PR & communicatie: Lida, Ginelli, Jeffrey, Marieke** (taken: pr plan maken, contact media, content creatie, social media beheer)
- **Doelgroep betrokkenheid:** Hoe kunnen we de doelgroepen bereiken en betrekken bij de organisatie? (plannen vergaderingen, taakverdeling)
- **Partners en samenwerkingen: Salih** (Taken:contact onderhoud en betrekken van Accres en andere partijen zoals sportverenigingen en andere zorginstellingen)

- **Vaste meetings:** Eenmaal in de 6 weken op de maandag hebben we een meeting in teams. Salih gaat een meeting cyclus op Teams aanmaken.
- **Partners:**
    - Accres (beheer sportfaciliteiten en evenementen voor de gemeente Apeldoorn)
    - Alessandro Bestolfi, van Nedarg handbikes. Idee is om kinderen tijdens DKL met de handbikes mee te laten doen. -> Salih neemt contact op.
    - Opties van scholen/instanties om te benaderen. Lida kent een aantal scholen in Harderwijk. Salih kijkt naar Maartenschool Nijmegen.

- **Website & online:** Stappenteller app ontwikkeling door Jeffrey. Koppeling met donatie.

**Ideeën voor DKL26:**
- **Social media:** Intranet inzetten, actievere content (vlogs, live), introductie videos. Lida en Ginelli aan de slag.
- **Mascotte:** Eigen mascotte ontwikkelen. Brainstormen.
- **Merch:** Draagtasjes of bekers verkopen. Angelique kijkt met Wesleys en collega.
- **Betrokkenheid:** Vanaf januari doelgroep betrekken. Salih informeert bij Kathelijn.
    `
    },
    {
        id: '5',
        title: 'Vergadering Verslag',
        date: '2024-09-24',
        type: 'meeting',
        status: 'final',
        tags: ['Website', 'Actiepunten', 'Start'],
        content: `
**Actiepunten uit de vergadering 24/09/2024**

**Aanwezigen:** Jeffrey, Marieke, Salih

**Jeffrey:**
- Website aanpassingen (Logo's partners, Sponsoren verplaatsen, statische afbeeldingen ipv bewegend)
- Achtergrondvideo vervangen door aftermovie
- Navigatiebalk optimaliseren (Inschrijven/Doneren knoppen)
- Contactpagina en Social Media integratie
- Chatbot optimalisatie
- SEO en responsive check
- Foto's en Media sectie bouwen
- Privacy/AVG check en backend verbeteringen
- Planning en Begroting opstellen

**Marieke:**
- Tekstuele aanpassingen en SEO optimalisatie
- Social Media accountgegevens delen
- Nieuwsbrieven onderzoek en planning

**Salih:**
- Projectplan en Begroting voor gemeente
- Vrijwilligerscoördinatie (met Fanny en Raymond)
- Cliëntenbetrokkenheid bijeenkomsten organiseren
- Netwerken en Promotie starten (november)

**Fanny:**
- Vrijwilligerscoördinatie en Cliëntenbetrokkenheid

**Raymond:**
- Draaiboek en Logistiek (routeplanning)

**Algemeen:**
- Deadline: Volledig functionele website en projectplan voor gemeente (over 3 weken)
- Communicatie via Teams
    `
    },
    {
        id: '6',
        title: 'Agenda DKL26 Meeting',
        date: '2025-10-30', // Estimated date based on context
        type: 'agenda',
        status: 'final',
        tags: ['Kick-off', 'Brainstorm', 'Teams'],
        content: `
**Agenda DKL 2026 Meeting**

**Welkom**

**DKL 2026**
- Wat gaat er anders dit jaar?
- Nieuwe aanpak organisatie en voorbereiding DKL 2026: vanuit jaarplanning in mini-teams aan de slag.
- Nieuwe partners & samenwerkingen: Accres en Alessandro Bistolfi.
- Ontwikkeling app en site.
- Ontwikkeling nieuwe inzamelingsvormen.

**Kleine Brainstormsessie:**
- Welk doel steunen we dit jaar?
- Doelen: hoeveel deelnemers, streefbedrag?
- Ideeën: Wat kan beter/ anders dan de vorige editie?
- Wanneer, welke datum?

**Wie wil/kan wat doen in welk team?**
- Algemene organisatie
- Sponsoring/subsidie
- PR & communicatie
- Doelgroep betrokkenheid
- Partners en samenwerkingen

**Rondvraag & afsluiting**.
    `
    }
];

export interface ScheduleItem {
    id: string;
    time: string;
    title: string;
    description: string;
    type: 'logistics' | 'event' | 'break';
    icon: string; // For specialized icon display
    routeId?: string; // Link to route data
}

export const teamSchedule: ScheduleItem[] = [
    {
        id: '1',
        time: '10:15',
        title: 'Aanvang',
        description: 'Aanvang Deelnemers 15km bij het coördinatiepunt',
        type: 'logistics',
        icon: 'aanvang'
    },
    {
        id: '2',
        time: '10:45',
        title: 'Vertrek',
        description: 'Vertrek pendelbussen naar startpunt 15km',
        type: 'logistics',
        icon: 'vertrek'
    },
    {
        id: '3',
        time: '11:05',
        title: 'Aanwezig',
        description: 'Deelnemers 15km aanwezig startpunt (Kootwijk)',
        type: 'logistics',
        icon: 'aanwezig'
    },
    {
        id: '4',
        time: '11:15',
        title: 'Start',
        description: 'START 15KM',
        type: 'event',
        icon: 'start',
        routeId: '15km'
    },
    {
        id: '5',
        time: '12:00',
        title: 'Aanvang',
        description: 'Aanvang Deelnemers 10km bij het coördinatiepunt',
        type: 'logistics',
        icon: 'aanvang'
    },
    {
        id: '6',
        time: '12:30',
        title: 'Vertrek',
        description: 'Vertrek deelnemers 10km met de pendelbussen naar het startpunt 10km',
        type: 'logistics',
        icon: 'vertrek'
    },
    {
        id: '7',
        time: '12:45',
        title: 'Rustpunt',
        description: 'Verwachte aankomst 15 km lopers bij rustpunt (Halte Assel - 15 min pauze)',
        type: 'break',
        icon: 'rustpunt',
        routeId: '15km'
    },
    {
        id: '8',
        time: '12:50',
        title: 'Aanwezig',
        description: 'Deelnemers 10km aanwezig bij het startpunt (Halte Assel)',
        type: 'logistics',
        icon: 'aanwezig'
    },
    {
        id: '9',
        time: '13:00',
        title: 'Start',
        description: 'START 10KM, Hervatting 15km',
        type: 'event',
        icon: 'start',
        routeId: '10km'
    },
    {
        id: '10',
        time: '13:15',
        title: 'Aanvang',
        description: 'Aanvang Deelnemers 6km bij het coördinatiepunt',
        type: 'logistics',
        icon: 'aanvang'
    },
    {
        id: '11',
        time: '13:45',
        title: 'Vertrek',
        description: 'Vertrek deelnemers 6 km met de pendelbussen naar het startpunt 6km',
        type: 'logistics',
        icon: 'vertrek'
    },
    {
        id: '12',
        time: '14:00',
        title: 'Rustpunt',
        description: 'Verwachte aankomst 15, 10 km lopers bij rustpunt (Hoog Soeren - 15 min pauze)',
        type: 'break',
        icon: 'rustpunt',
        routeId: '10km'
    },
    {
        id: '13',
        time: '14:00',
        title: 'Aanwezig',
        description: 'Deelnemers 6km aanwezig bij het startpunt (Hoog Soeren)',
        type: 'logistics',
        icon: 'aanwezig'
    },
    {
        id: '14',
        time: '14:15',
        title: 'Start',
        description: 'START 6KM, Hervatting 10km en 15km',
        type: 'event',
        icon: 'start',
        routeId: '6km'
    },
    {
        id: '15',
        time: '14:30',
        title: 'Aanvang',
        description: 'Aanvang Deelnemers 2,5km bij het coördinatiepunt',
        type: 'logistics',
        icon: 'aanvang'
    },
    {
        id: '16',
        time: '15:00',
        title: 'Vertrek',
        description: 'Vertrek deelnemers 2,5 km met de pendelbussen naar het startpunt 2,5km',
        type: 'logistics',
        icon: 'vertrek'
    },
    {
        id: '17',
        time: '15:05',
        title: 'Aanwezig',
        description: 'Deelnemers 2,5km aanwezig bij het startpunt (Berg & Bos)',
        type: 'logistics',
        icon: 'aanwezig'
    },
    {
        id: '18',
        time: '15:15',
        title: 'Rustpunt',
        description: 'Verwachte aankomst 15, 10, 6 km lopers bij rustpunt (Berg & Bos - 15 min pauze)',
        type: 'break',
        icon: 'rustpunt',
        routeId: '6km'
    },
    {
        id: '19',
        time: '15:35',
        title: 'Start',
        description: 'START 2,5KM, Hervatting 6km, 10km en 15km',
        type: 'event',
        icon: 'start',
        routeId: '2.5km'
    },
    {
        id: '20',
        time: '15:55',
        title: 'Aankomst',
        description: 'Aankomst bij De Naald / START INHULDIGINGSLOOP',
        type: 'event',
        icon: 'aankomst'
    },
    {
        id: '21',
        time: '16:10 - 16:30',
        title: 'Finish',
        description: 'FINISH',
        type: 'event',
        icon: 'finish'
    },
    {
        id: '22',
        time: '17:00 - 18:00',
        title: 'Feest',
        description: 'INHULDIGINGSFEEST',
        type: 'event',
        icon: 'feest'
    }
];
