/**
 * PR/Communicatie Seed Script — Master Database v3.0
 * Source: Main communicatie Versie 4.pdf (12 feb 2026)
 * 
 * 208 organisaties across 7 sectors:
 * - Sector 1: 7 Academische Ziekenhuizen (UMC's)
 * - Sector 2: 55 Algemene & Topklinische Ziekenhuizen
 * - Sector 3: 25 GGZ instellingen
 * - Sector 4: 35 Gehandicaptenzorg, VVT & Thuiszorg
 * - Sector 5: 74 Verenigingen & Doelgroeporganisaties
 * - Sector 6: 8 Revalidatiecentra
 * - Sector 7: 4 Pers & Media
 * 
 * Run: npx convex run seedPrData:seed
 */

import { internalMutation } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// MASTER DATA — EXTRACTED FROM PDF (VERIFIED)
// ═══════════════════════════════════════════════════════════════

type Sector = "academisch_ziekenhuis" | "algemeen_ziekenhuis" | "ggz" | "gehandicaptenzorg" | "verpleging_verzorging" | "revalidatie" | "overig";
type Regio = "apeldoorn" | "gelderland" | "overijssel" | "overig";

interface OrgEntry {
    naam: string;
    email: string;
    sector: Sector;
    regio: Regio;
    type?: string;
}

// Sector 1 — Academische Ziekenhuizen (UMC's) — 7 organisaties
const SECTOR_1_UMC: OrgEntry[] = [
    { naam: "Amsterdam UMC", email: "pers@amsterdamumc.nl", sector: "academisch_ziekenhuis", regio: "overig" },
    { naam: "Erasmus MC", email: "press@erasmusmc.nl", sector: "academisch_ziekenhuis", regio: "overig" },
    { naam: "LUMC", email: "pers@lumc.nl", sector: "academisch_ziekenhuis", regio: "overig" },
    { naam: "Maastricht UMC+", email: "communicatie@mumc.nl", sector: "academisch_ziekenhuis", regio: "overig" },
    { naam: "Radboudumc", email: "nieuws@radboudumc.nl", sector: "academisch_ziekenhuis", regio: "gelderland" },
    { naam: "UMC Utrecht", email: "press@umcutrecht.nl", sector: "academisch_ziekenhuis", regio: "overig" },
    { naam: "UMCG", email: "communicatie@umcg.nl", sector: "academisch_ziekenhuis", regio: "overig" },
];

// Sector 2 — Algemene & Topklinische Ziekenhuizen — 55 organisaties
const SECTOR_2_ZIEKENHUIZEN: OrgEntry[] = [
    { naam: "Albert Schweitzer ziekenhuis", email: "communicatie@asz.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Alrijne Ziekenhuis", email: "communicatie@alrijne.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Amphia Ziekenhuis", email: "communicatie@amphia.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Anna Zorggroep / St. Anna", email: "communicatie@st-anna.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Antonius Ziekenhuis (Sneek)", email: "communicatie@mijnantonius.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "BovenIJ ziekenhuis", email: "communicatie@bovenij.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Bravis ziekenhuis", email: "communicatie@bravis.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Canisius Wilhelmina Ziekenhuis", email: "communicatie@cwz.nl", sector: "algemeen_ziekenhuis", regio: "gelderland" },
    { naam: "Catharina Ziekenhuis", email: "communicatie@catharinaziekenhuis.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Deventer Ziekenhuis", email: "communicatie@dz.nl", sector: "algemeen_ziekenhuis", regio: "overijssel" },
    { naam: "Dijklander Ziekenhuis", email: "communicatie@dijklander.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Elkerliek ziekenhuis", email: "communicatie@elkerliek.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "ETZ (Elisabeth-TweeSteden)", email: "communicatie@etz.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Franciscus Gasthuis & Vlietland", email: "communicatie@franciscus.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Gelderse Vallei", email: "communicatie@zgv.nl", sector: "algemeen_ziekenhuis", regio: "gelderland" },
    { naam: "Gelre ziekenhuizen", email: "communicatie@gelre.nl", sector: "algemeen_ziekenhuis", regio: "apeldoorn" },
    { naam: "Groene Hart Ziekenhuis", email: "communicatie@ghz.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Haaglanden Medisch Centrum", email: "communicatie@haaglandenmc.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "HagaZiekenhuis", email: "communicatie@hagaziekenhuis.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Ikazia Ziekenhuis", email: "communicatie@ikazia.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Isala (Zwolle/Meppel)", email: "communicatie@isala.nl", sector: "algemeen_ziekenhuis", regio: "overijssel" },
    { naam: "Jeroen Bosch Ziekenhuis", email: "communicatie@jbz.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "LangeLand Ziekenhuis", email: "communicatie@llz.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Laurentius Ziekenhuis", email: "communicatie@lzr.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Maasstad Ziekenhuis", email: "communicatie@maasstadziekenhuis.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Maasziekenhuis Pantein", email: "communicatie@pantein.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Martini Ziekenhuis", email: "communicatie@martiniziekenhuis.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Máxima MC (Veldhoven)", email: "communicatie@mmc.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Meander Medisch Centrum", email: "communicatie@meandermc.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Medisch Centrum Leeuwarden", email: "communicatie@mcl.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Medisch Spectrum Twente", email: "communicatie@mst.nl", sector: "algemeen_ziekenhuis", regio: "overijssel" },
    { naam: "Nij Smellinghe", email: "communicatie@nijsmellinghe.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Noordwest Ziekenhuisgroep", email: "communicatie@nwz.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "OLVG (Amsterdam)", email: "communicatie@olvg.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Ommelander Ziekenhuis Groningen", email: "communicatie@ozg.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Rijnstate", email: "communicatie@rijnstate.nl", sector: "algemeen_ziekenhuis", regio: "gelderland" },
    { naam: "Rivierenland", email: "communicatie@zrt.nl", sector: "algemeen_ziekenhuis", regio: "gelderland" },
    { naam: "Rode Kruis Ziekenhuis", email: "communicatie@rkz.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Saxenburgh", email: "communicatie@sxb.nl", sector: "algemeen_ziekenhuis", regio: "overijssel" },
    { naam: "SJG Weert", email: "communicatie@sjgweert.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Slingeland Ziekenhuis", email: "communicatie@slingeland.nl", sector: "algemeen_ziekenhuis", regio: "gelderland" },
    { naam: "Spaarne Gasthuis", email: "communicatie@spaarnegasthuis.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "St Jansdal", email: "communicatie@stjansdal.nl", sector: "algemeen_ziekenhuis", regio: "gelderland" },
    { naam: "St. Antonius Ziekenhuis (Nieuwegein)", email: "communicatie@antoniusziekenhuis.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Streekziekenhuis Koningin Beatrix", email: "communicatie@skbwinterswijk.nl", sector: "algemeen_ziekenhuis", regio: "gelderland" },
    { naam: "Tergooi MC", email: "communicatie@tergooi.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Tjongerschans", email: "communicatie@tjongerschans.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Treant Zorggroep", email: "communicatie@treant.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Van Weel-Bethesda Ziekenhuis", email: "communicatie@srz.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "VieCuri Medisch Centrum", email: "communicatie@viecuri.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Wilhelmina Ziekenhuis Assen", email: "communicatie@wza.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Zaans Medisch Centrum", email: "communicatie@zaansmc.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "ZGT", email: "communicatie@zgt.nl", sector: "algemeen_ziekenhuis", regio: "overijssel" },
    { naam: "ZorgSaam", email: "communicatie@zorgsaam.org", sector: "algemeen_ziekenhuis", regio: "overig" },
    { naam: "Zuyderland", email: "communicatie@zuyderland.nl", sector: "algemeen_ziekenhuis", regio: "overig" },
];

// Sector 3 — Geestelijke Gezondheidszorg (GGZ) — 25 organisaties
const SECTOR_3_GGZ: OrgEntry[] = [
    { naam: "Altrecht", email: "communicatie@altrecht.nl", sector: "ggz", regio: "overig" },
    { naam: "Antes", email: "communicatie@anteszorg.nl", sector: "ggz", regio: "overig" },
    { naam: "Arkin", email: "communicatie@arkin.nl", sector: "ggz", regio: "overig" },
    { naam: "Dimence Groep", email: "communicatie@dimencegroep.nl", sector: "ggz", regio: "overijssel" },
    { naam: "Eleos", email: "communicatie@eleos.nl", sector: "ggz", regio: "apeldoorn" },
    { naam: "Emergis", email: "communicatie@emergis.nl", sector: "ggz", regio: "overig" },
    { naam: "GGNet", email: "communicatie@ggnet.nl", sector: "ggz", regio: "apeldoorn" },
    { naam: "GGZ Breburg", email: "communicatie@ggzbreburg.nl", sector: "ggz", regio: "overig" },
    { naam: "GGZ Centraal", email: "communicatie@ggzcentraal.nl", sector: "ggz", regio: "gelderland" },
    { naam: "GGZ Delfland", email: "communicatie@ggzdelfland.nl", sector: "ggz", regio: "overig" },
    { naam: "GGZ Drenthe", email: "communicatie@ggzdrenthe.nl", sector: "ggz", regio: "overig" },
    { naam: "GGZ Friesland", email: "communicatie@ggzfriesland.nl", sector: "ggz", regio: "overig" },
    { naam: "GGZ inGeest", email: "communicatie@ggzingeest.nl", sector: "ggz", regio: "overig" },
    { naam: "GGZ Noord-Holland-Noord", email: "communicatie@ggznhn.nl", sector: "ggz", regio: "overig" },
    { naam: "GGZ Oost Brabant", email: "communicatie@ggzoostbrabant.nl", sector: "ggz", regio: "overig" },
    { naam: "GGzE (Eindhoven)", email: "communicatie@ggze.nl", sector: "ggz", regio: "overig" },
    { naam: "Lentis", email: "communicatie@lentis.nl", sector: "ggz", regio: "overig" },
    { naam: "Mediant", email: "communicatie@mediant.nl", sector: "ggz", regio: "overijssel" },
    { naam: "Mondriaan", email: "communicatie@mondriaan.eu", sector: "ggz", regio: "overig" },
    { naam: "Parnassia Groep", email: "communicatie@parnassiagroep.nl", sector: "ggz", regio: "overig" },
    { naam: "Pro Persona", email: "communicatie@propersona.nl", sector: "ggz", regio: "gelderland" },
    { naam: "Reinier van Arkel", email: "communicatie@reiniervanarkel.nl", sector: "ggz", regio: "overig" },
    { naam: "Rivierduinen", email: "communicatie@rivierduinen.nl", sector: "ggz", regio: "overig" },
    { naam: "Vincent van Gogh", email: "communicatie@vvgi.nl", sector: "ggz", regio: "overig" },
    { naam: "Yulius", email: "communicatie@yulius.nl", sector: "ggz", regio: "overig" },
];

// Sector 4 — Gehandicaptenzorg, VVT & Thuiszorg — 35 organisaties
const SECTOR_4_VVT: OrgEntry[] = [
    { naam: "'s Heeren Loo", email: "communicatie@sheerenloo.nl", sector: "gehandicaptenzorg", regio: "gelderland" },
    { naam: "Aafje", email: "communicatie@aafje.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Alliade", email: "communicatie@alliade.nl", sector: "gehandicaptenzorg", regio: "overig" },
    { naam: "Amarant", email: "communicatie@amarant.nl", sector: "gehandicaptenzorg", regio: "overig" },
    { naam: "Amstelring", email: "communicatie@amstelring.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "ASVZ", email: "communicatie@asvz.nl", sector: "gehandicaptenzorg", regio: "overig" },
    { naam: "Buurtzorg", email: "communicatie@buurtzorgnederland.com", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Carante Groep", email: "communicatie@carantegroep.nl", sector: "gehandicaptenzorg", regio: "overig" },
    { naam: "Careyn", email: "communicatie@careyn.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Carintreggeland", email: "communicatie@carintreggeland.nl", sector: "verpleging_verzorging", regio: "overijssel" },
    { naam: "Cello", email: "communicatie@cello-zorg.nl", sector: "gehandicaptenzorg", regio: "overig" },
    { naam: "Cordaan", email: "communicatie@cordaan.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "De Zorgcirkel", email: "communicatie@zorgcirkel.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Dichterbij", email: "communicatie@dichterbij.nl", sector: "gehandicaptenzorg", regio: "gelderland" },
    { naam: "Envida", email: "communicatie@envida.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Esdégé-Reigersdaal", email: "communicatie@esdege-reigersdaal.nl", sector: "gehandicaptenzorg", regio: "overig" },
    { naam: "Espria", email: "communicatie@espria.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Evean", email: "communicatie@evean.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Florence", email: "communicatie@florence.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Ipse de Bruggen", email: "communicatie@ipsedebruggen.nl", sector: "gehandicaptenzorg", regio: "overig" },
    { naam: "Koraal", email: "communicatie@koraal.nl", sector: "gehandicaptenzorg", regio: "overig" },
    { naam: "Laurens", email: "communicatie@laurens.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "MeanderGroep", email: "communicatie@mgzl.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Omring", email: "communicatie@omring.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Philadelphia Zorg", email: "communicatie@philadelphia.nl", sector: "gehandicaptenzorg", regio: "gelderland" },
    { naam: "Pluryn", email: "communicatie@pluryn.nl", sector: "gehandicaptenzorg", regio: "gelderland" },
    { naam: "Sensire", email: "communicatie@sensire.nl", sector: "verpleging_verzorging", regio: "gelderland" },
    { naam: "Severinus", email: "communicatie@severinus.nl", sector: "gehandicaptenzorg", regio: "overig" },
    { naam: "Siza", email: "communicatie@siza.nl", sector: "gehandicaptenzorg", regio: "gelderland" },
    { naam: "TanteLouise", email: "communicatie@tantelouise.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Zorgbalans", email: "communicatie@zorgbalans.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Zorggroep Meander", email: "communicatie@zorggroepmeander.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Zorggroep Sint Maarten", email: "communicatie@zorggroepsintmaarten.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "Zorgpartners Midden-Holland", email: "communicatie@zorgpartners.nl", sector: "verpleging_verzorging", regio: "overig" },
    { naam: "ZuidOostZorg", email: "communicatie@zuidoostzorg.nl", sector: "verpleging_verzorging", regio: "overig" },
];

// Sector 5 — Verenigingen & Doelgroeporganisaties — 74 organisaties
const SECTOR_5_VERENIGINGEN: OrgEntry[] = [
    // NAH
    { naam: "Hersenletsel.nl", email: "info@hersenletsel.nl", sector: "overig", regio: "overig", type: "NAH" },
    { naam: "Cerebraal", email: "info@cerebraal.nl", sector: "overig", regio: "overig", type: "NAH" },
    { naam: "InteraktContour", email: "info@interaktcontour.nl", sector: "overig", regio: "overijssel", type: "NAH" },
    { naam: "Stichting NAH Gelderland", email: "info@nahgelderland.nl", sector: "overig", regio: "gelderland", type: "NAH" },
    { naam: "Stichting NAH Veluwe", email: "info@nahveluwe.nl", sector: "overig", regio: "apeldoorn", type: "NAH" },
    // Zintuig
    { naam: "Koninklijke Visio", email: "communicatie@visio.org", sector: "overig", regio: "apeldoorn", type: "ZINTUIG" },
    { naam: "Bartiméus", email: "communicatie@bartimeus.nl", sector: "overig", regio: "overig", type: "ZINTUIG" },
    // LVB
    { naam: "LFB Belangenvereniging", email: "info@lfb.nu", sector: "overig", regio: "overig", type: "LVB" },
    { naam: "MEE Veluwe", email: "info@meeveluwe.nl", sector: "overig", regio: "apeldoorn", type: "LVB" },
    { naam: "MEE IJsseloevers", email: "info@meeijsseloevers.nl", sector: "overig", regio: "overijssel", type: "LVB" },
    { naam: "Sprank", email: "info@sprank.nl", sector: "overig", regio: "gelderland", type: "LVB" },
    { naam: "Stichting Aveleijn", email: "info@aveleijn.nl", sector: "overig", regio: "overijssel", type: "LVB" },
    // GGZ cliëntenorganisaties
    { naam: "MIND Landelijk Platform", email: "info@wijzijnmind.nl", sector: "overig", regio: "overig", type: "GGZ" },
    { naam: "ADF Stichting (Angst, Dwang)", email: "info@adfstichting.nl", sector: "overig", regio: "overig", type: "GGZ" },
    { naam: "Stichting Labyrint~In Perspectief", email: "info@labyrintinperspectief.nl", sector: "overig", regio: "overig", type: "GGZ" },
    { naam: "Ypsilon (psychose)", email: "info@ypsilon.org", sector: "overig", regio: "overig", type: "GGZ" },
    { naam: "VMDB (Depressie)", email: "info@vmdb.nl", sector: "overig", regio: "overig", type: "GGZ" },
    { naam: "Cliëntenbelang Apeldoorn", email: "info@clientenbelangapeldoorn.nl", sector: "overig", regio: "apeldoorn", type: "GGZ" },
    // Jeugd
    { naam: "Balans (ADHD/Autisme)", email: "info@balansdigitaal.nl", sector: "overig", regio: "overig", type: "JEUGD" },
    { naam: "NSGK (Gehandicapte Kinderen)", email: "info@nsgk.nl", sector: "overig", regio: "overig", type: "JEUGD" },
    { naam: "Jantje Beton", email: "info@jantjebeton.nl", sector: "overig", regio: "overig", type: "JEUGD" },
    { naam: "De Kleine Generaal", email: "info@dekleinegeneraal.nl", sector: "overig", regio: "overig", type: "JEUGD" },
    { naam: "Kinderpostzegels", email: "info@kinderpostzegels.nl", sector: "overig", regio: "overig", type: "JEUGD" },
    { naam: "Het Gehandicapte Kind", email: "info@gehandicaptekind.nl", sector: "overig", regio: "overig", type: "JEUGD" },
    { naam: "Jeugdsportfonds Gelderland", email: "gelderland@jeugdsportfonds.nl", sector: "overig", regio: "gelderland", type: "JEUGD" },
    { naam: "Jeugdsportfonds Overijssel", email: "overijssel@jeugdsportfonds.nl", sector: "overig", regio: "overijssel", type: "JEUGD" },
    // G-Sport — Apeldoorn
    { naam: "AGOVV (G-voetbal)", email: "info@agovv.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "WWNA (G-voetbal)", email: "info@wwna.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "VV Albatross (G-jeugdvoetbal)", email: "info@uvvalbatross.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "ZVV'56 (G-voetbal)", email: "info@zvv56.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "vv Loenermark (G-voetbal)", email: "info@loenermark.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "HC Ares (G-hockey)", email: "info@hcares.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "AV Lycurgus (G-atletiek)", email: "info@avlycurgus.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "Sportservice Apeldoorn", email: "apeldoorn@unieksporten.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "G Spirit (beweegactiviteiten)", email: "info@gspirit.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "Zintens SportVariant", email: "info@zintens.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "Multi Talent Centrum", email: "info@mtcapeldoorn.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "Stichting Paardrijden Gehandicapten", email: "info@spga.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "VV Heerde (G-elftal)", email: "info@vvheerde.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "TV Frankrijk Harderwijk", email: "info@tvfrankrijk.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "Unitas Harderwijk (G-korfbal)", email: "info@unitasharderwijk.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "GA! Harderwijk", email: "info@gaharderwijk.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "BASE Epe (G-basketbal)", email: "info@basketballstarsepe.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    { naam: "Uniek Sporten Epe", email: "epe@unieksporten.nl", sector: "overig", regio: "apeldoorn", type: "G-SPORT" },
    // G-Sport — Gelderland
    { naam: "ISVA Arnhem", email: "info@isva.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "AMHC Upward Arnhem", email: "info@upward.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "Nijmegen Atletiek", email: "info@nijmegenatletiek.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "Stichting Koprol Nijmegen", email: "info@stichtingkoprol.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "Stichting CAP Nijmegen", email: "info@stichtingcap.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "DTS Ede (G-voetbal)", email: "info@dtsede.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "MHC Ede (G-hockey)", email: "info@mhcede.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "Climax Atletiek Ede", email: "info@climax-atletiek.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "LAWA'S GYM Ede", email: "info@lawasgym.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "AZC Zutphen (G-voetbal)", email: "info@azczutphen.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "Battle4kids Zutphen", email: "info@battle4kids.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "Actief Zutphen", email: "info@actiefzutphen.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "WMHC Wageningen (G-hockey)", email: "info@wmhc.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "DZC'68 Doetinchem", email: "info@dzc68.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "BV Batouwe Bemmel", email: "info@batouwebasketball.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    { naam: "BVV Barneveld", email: "info@bvvbarneveld.nl", sector: "overig", regio: "gelderland", type: "G-SPORT" },
    // G-Sport — Overijssel
    { naam: "VG Sport Zwolle", email: "info@vgsportzwolle.nl", sector: "overig", regio: "overijssel", type: "G-SPORT" },
    { naam: "De Boog / Regio Zwolle", email: "info@regiozwolleunited.nl", sector: "overig", regio: "overijssel", type: "G-SPORT" },
    { naam: "SportService Zwolle", email: "info@sportservicezwolle.nl", sector: "overig", regio: "overijssel", type: "G-SPORT" },
    { naam: "Sportbedrijf Deventer", email: "info@sportbedrijfdeventer.nl", sector: "overig", regio: "overijssel", type: "G-SPORT" },
    { naam: "Deventer Sportploeg", email: "info@deventersportploeg.nl", sector: "overig", regio: "overijssel", type: "G-SPORT" },
    { naam: "Colmschate '33", email: "info@colmschate33.nl", sector: "overig", regio: "overijssel", type: "G-SPORT" },
    { naam: "De Tubanters 1897", email: "info@detubanters.nl", sector: "overig", regio: "overijssel", type: "G-SPORT" },
    { naam: "Quick 1888 Hengelo", email: "info@quick1888.nl", sector: "overig", regio: "overijssel", type: "G-SPORT" },
    // G-Sport — Landelijk
    { naam: "Special Olympics NL", email: "info@specialolympics.nl", sector: "overig", regio: "overig", type: "G-SPORT" },
    { naam: "Uniek Sporten", email: "info@unieksporten.nl", sector: "overig", regio: "overig", type: "G-SPORT" },
    { naam: "Gehandicaptensport NL", email: "info@gehandicaptensport.nl", sector: "overig", regio: "overig", type: "G-SPORT" },
    { naam: "Stichting Onbeperkt Sportief", email: "info@onbeperktsportief.nl", sector: "overig", regio: "overig", type: "G-SPORT" },
    { naam: "Stichting Only Friends", email: "info@onlyfriends.nl", sector: "overig", regio: "overig", type: "G-SPORT" },
    { naam: "KNVB G-voetbal", email: "amateurvoetbal@knvb.nl", sector: "overig", regio: "overig", type: "G-SPORT" },
];

// Sector 6 — Revalidatiecentra — 8 organisaties
const SECTOR_6_REVALIDATIE: OrgEntry[] = [
    { naam: "Klimmendaal (Arnhem/Apeldoorn)", email: "communicatie@klimmendaal.nl", sector: "revalidatie", regio: "gelderland" },
    { naam: "Basalt Revalidatie", email: "communicatie@basaltrevalidatie.nl", sector: "revalidatie", regio: "overig" },
    { naam: "Heliomare", email: "communicatie@heliomare.nl", sector: "revalidatie", regio: "overig" },
    { naam: "Sint Maartenskliniek", email: "communicatie@maartenskliniek.nl", sector: "revalidatie", regio: "gelderland" },
    { naam: "Adelante Zorggroep", email: "communicatie@adelante-zorggroep.nl", sector: "revalidatie", regio: "overig" },
    { naam: "Roessingh", email: "communicatie@roessingh.nl", sector: "revalidatie", regio: "overijssel" },
    { naam: "Vogelland", email: "communicatie@vogelland.nl", sector: "revalidatie", regio: "overijssel" },
    { naam: "Reade", email: "communicatie@reade.nl", sector: "revalidatie", regio: "overig" },
];

// Sector 7 — Pers & Media — 4 organisaties
const SECTOR_7_PERS: OrgEntry[] = [
    { naam: "De Stentor", email: "redactie.apeldoorn@destentor.nl", sector: "overig", regio: "apeldoorn", type: "PERS" },
    { naam: "Omroep Gelderland", email: "redactie@gld.nl", sector: "overig", regio: "gelderland", type: "PERS" },
    { naam: "RTV Apeldoorn", email: "redactie@rtvapeldoorn.nl", sector: "overig", regio: "apeldoorn", type: "PERS" },
    { naam: "NOS Sport", email: "sport@nos.nl", sector: "overig", regio: "overig", type: "PERS" },
];

// Combine all sectors
const ALL_ORGANIZATIONS: OrgEntry[] = [
    ...SECTOR_1_UMC,
    ...SECTOR_2_ZIEKENHUIZEN,
    ...SECTOR_3_GGZ,
    ...SECTOR_4_VVT,
    ...SECTOR_5_VERENIGINGEN,
    ...SECTOR_6_REVALIDATIE,
    ...SECTOR_7_PERS,
];

// ═══════════════════════════════════════════════════════════════
// SEED MUTATION
// ═══════════════════════════════════════════════════════════════

export const seed = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Check if data already exists
        const existing = await ctx.db.query("pr_organizations").first();
        if (existing) {
            throw new Error(
                "Database already contains PR organizations. " +
                "Delete existing data first or use 'seedForce' to overwrite."
            );
        }

        let orgCount = 0;
        let contactCount = 0;
        const emailSet = new Set<string>();

        for (const entry of ALL_ORGANIZATIONS) {
            // Create organization
            const orgId = await ctx.db.insert("pr_organizations", {
                naam: entry.naam,
                sector: entry.sector,
                regio: entry.regio,
                type: entry.type || "",
                website: "",
                notities: "",
                isActive: true,
                created_at: Date.now(),
                updated_at: Date.now(),
            });
            orgCount++;

            // Create contact (linked to organization)
            if (!emailSet.has(entry.email)) {
                emailSet.add(entry.email);
                await ctx.db.insert("pr_contacts", {
                    email: entry.email,
                    naam: "",
                    functie: "Communicatie / Pers",
                    organizationId: orgId,
                    tags: [],
                    isActive: true,
                    notities: "",
                    created_at: Date.now(),
                    updated_at: Date.now(),
                });
                contactCount++;
            }
        }

        return {
            message: `✅ Seed complete!`,
            organizations: orgCount,
            contacts: contactCount,
            uniqueEmails: emailSet.size,
            breakdown: {
                sector1_umc: SECTOR_1_UMC.length,
                sector2_ziekenhuizen: SECTOR_2_ZIEKENHUIZEN.length,
                sector3_ggz: SECTOR_3_GGZ.length,
                sector4_vvt: SECTOR_4_VVT.length,
                sector5_verenigingen: SECTOR_5_VERENIGINGEN.length,
                sector6_revalidatie: SECTOR_6_REVALIDATIE.length,
                sector7_pers: SECTOR_7_PERS.length,
            },
        };
    },
});

// Force seed (deletes existing data first)
export const seedForce = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Delete all existing PR data
        const orgs = await ctx.db.query("pr_organizations").collect();
        for (const org of orgs) {
            await ctx.db.delete(org._id);
        }
        const contacts = await ctx.db.query("pr_contacts").collect();
        for (const contact of contacts) {
            await ctx.db.delete(contact._id);
        }
        const history = await ctx.db.query("pr_send_history").collect();
        for (const h of history) {
            await ctx.db.delete(h._id);
        }

        // Re-run seed logic
        let orgCount = 0;
        let contactCount = 0;
        const emailSet = new Set<string>();

        for (const entry of ALL_ORGANIZATIONS) {
            const orgId = await ctx.db.insert("pr_organizations", {
                naam: entry.naam,
                sector: entry.sector,
                regio: entry.regio,
                type: entry.type || "",
                website: "",
                notities: "",
                isActive: true,
                created_at: Date.now(),
                updated_at: Date.now(),
            });
            orgCount++;

            if (!emailSet.has(entry.email)) {
                emailSet.add(entry.email);
                await ctx.db.insert("pr_contacts", {
                    email: entry.email,
                    naam: "",
                    functie: "Communicatie / Pers",
                    organizationId: orgId,
                    tags: [],
                    isActive: true,
                    notities: "",
                    created_at: Date.now(),
                    updated_at: Date.now(),
                });
                contactCount++;
            }
        }

        return {
            message: `✅ Force seed complete! (previous data deleted)`,
            organizations: orgCount,
            contacts: contactCount,
            uniqueEmails: emailSet.size,
        };
    },
});
