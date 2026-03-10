# PR Communicatie Module

## Beschrijving

De communicatiemodule (`/admin/communicatie`) beheert de PR-database voor het versturen van persberichten en uitnodigingen.  
**Convex module:** `prCommunicatie.ts` (19KB — uitgebreid)

---

## Organisatiedatabase

Bevat zorginstellingen in de regio die worden uitgenodigd om deel te nemen of af te vaardigen:

**Sectoren:**
- Ziekenhuizen
- GGZ (Geestelijke Gezondheidszorg)
- Revalidatiecentra
- Gehandicaptenzorg

**Filteropties:**
- Sector
- Regio

---

## Contactendatabase

Per organisatie worden contactpersonen bijgehouden:
- Naam
- Functie
- E-mailadres
- Telefoonnummer
- Notities

---

## BCC-Generator

**Functie:** Kopieer gefilterde e-mailadressen naar klembord voor externe mailing.

Stappen:
1. Filter op sector en/of regio
2. Schuif de gewenste contacten aan
3. Klik "Kopieer BCC-lijst"
4. Plak in eigen e-mailclient (Outlook, Gmail, etc.)

---

## Verzendhistorie

Log van alle PR-uitingen:

| Veld | Beschrijving |
|---|---|
| Datum | Tijdstip van verzending |
| Onderwerp | Onderwerp van het bericht |
| Ontvangers | Aantal ontvangers |
| Door | Welke editor verzond |

---

*← [blog.md](./blog.md) · Volgende: [team.md](./team.md)*
