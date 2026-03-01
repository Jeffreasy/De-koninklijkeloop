/**
 * Route Configuration — De Koninklijke Loop 2026
 * Single source of truth for route schedules used in email templates and UI.
 */

export const EVENT_DATE = "Zaterdag 16 mei 2026";

export type RouteKey = "15" | "10" | "6" | "2.5";

export interface RouteInfo {
    label: string;
    meldtijd: string;
    busVertrek: string;
    startTijd: string;
    startLocatie: string;
    startAdres: string;
    /** TODO: Replace with real verified Google Maps short links before go-live */
    mapsLink: string;
    kleur: string;
    afstand: string;
    /** WGS84 coordinates of the start location — used for static map in confirmation email */
    lat: number;
    lng: number;
}

export const ROUTE_INFO: Record<RouteKey, RouteInfo> = {
    "15": {
        label: "15 KM Paleistuinen & Parken",
        meldtijd: "10:15",
        busVertrek: "10:45",
        startTijd: "11:15",
        startLocatie: "Kootwijk — De Brink",
        startAdres: "Dorpscentrum Kootwijk, nabij kerk en 't Hilletje",
        // TODO: Verify and replace with real Google Maps short link
        mapsLink: "https://maps.app.goo.gl/kootwijk-de-brink",
        kleur: "#EF4444",
        afstand: "15,6 km",
        lat: 52.2446,
        lng: 5.7908,
    },
    "10": {
        label: "10 KM Vorstelijke Verkenning",
        meldtijd: "12:00",
        busVertrek: "12:30",
        startTijd: "13:00",
        startLocatie: "Assel — Halte Assel",
        startAdres: "Pomphulweg / Asselseweg, Assel (bij Eethuis Halte Assel)",
        // TODO: Verify and replace with real Google Maps short link
        mapsLink: "https://maps.app.goo.gl/assel-halte",
        kleur: "#eab308",
        afstand: "10 km",
        lat: 52.2298,
        lng: 5.8655,
    },
    "6": {
        label: "6 KM Gezinsroute",
        meldtijd: "13:15",
        busVertrek: "13:45",
        startTijd: "14:15",
        startLocatie: "Hoog Soeren — Dorpscentrum",
        startAdres: "Hoog Soeren 15, nabij Hotel Hoog Soeren en Berg & Dal",
        // TODO: Verify and replace with real Google Maps short link
        mapsLink: "https://maps.app.goo.gl/hoog-soeren",
        kleur: "#3b82f6",
        afstand: "6 km",
        lat: 52.2157,
        lng: 5.9068,
    },
    "2.5": {
        label: "2,5 KM Roll & Stroll",
        meldtijd: "14:30",
        busVertrek: "15:00",
        startTijd: "15:35",
        startLocatie: "Apeldoorn — Soerenseweg",
        startAdres: "Soerenseweg, 7313 ER Apeldoorn (verharde, toegankelijke route)",
        // TODO: Verify and replace with real Google Maps short link
        mapsLink: "https://maps.app.goo.gl/soerenseweg-apeldoorn",
        kleur: "#10b981",
        afstand: "2,5 km",
        lat: 52.2205,
        lng: 5.9552,
    },
};

const VALID_ROUTE_KEYS = new Set<RouteKey>(["15", "10", "6", "2.5"]);

/**
 * Safely resolve a route by distance string.
 * Accepts inputs like "15", "15km", "15 km" — returns null for unknown keys.
 */
export function resolveRoute(distance: string | undefined): RouteInfo | null {
    if (!distance) return null;
    const key = distance.replace(/\s*km\s*/i, "").trim();
    if (VALID_ROUTE_KEYS.has(key as RouteKey)) {
        return ROUTE_INFO[key as RouteKey];
    }
    return null;
}

/**
 * Build a static OpenStreetMap image URL — email-safe, no JavaScript or API key needed.
 * The image shows a map tile centered on the given coordinates with an orange pin marker.
 *
 * @see https://staticmap.openstreetmap.de/
 */
export function buildStaticMapUrl(
    lat: number,
    lng: number,
    zoom = 14,
    width = 520,
    height = 180,
): string {
    // Red pin marker (closest to brand orange supported by this API)
    const marker = `lon=${lng}&lat=${lat}&zoom=${zoom}&width=${width}&height=${height}&maptype=mapnik&markers=${lat},${lng},ol-marker-gold`;
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=mapnik&markers=${lat},${lng},ol-marker`;
}

/**
 * Build a Google Maps deep-link URL for a given coordinate + label.
 * Used as the href on the static map image.
 */
export function buildGoogleMapsUrl(lat: number, lng: number, label: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}&center=${lat},${lng}`;
}
