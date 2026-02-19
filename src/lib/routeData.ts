export interface RoutePoint {
    lat: number;
    lng: number;
    ele?: number;
}

export interface RouteMetadata {
    id: string;
    name: string;
    distance: string;
    color: string;
    description: string;
}

export interface Route extends RouteMetadata {
    points: RoutePoint[];
}

// Grote Kerk, Loolaan 16, Apeldoorn (Start/Finish point)
export const START_POINT = { lat: 52.2205, lng: 5.9552 };

export const routes: RouteMetadata[] = [
    {
        id: "2.5km",
        name: "2.5 KM Roll & Stroll",
        distance: "2.5 KM",
        color: "#10b981",
        description: "Een volledig verharde, toegankelijke route. Perfect voor rolstoelgebruikers en gezinnen.",
    },
    {
        id: "6km",
        name: "6 KM Gezinsroute",
        distance: "6 KM",
        color: "#3b82f6",
        description: "Een mooie wandeling door de directe natuur, ideaal voor een sportieve middag met het gezin.",
    },
    {
        id: "10km",
        name: "10 KM Vorstelijke Verkenning",
        distance: "10 KM",
        color: "#eab308",
        description: "Verken de bossen rondom het paleis en de prachtige lanen van Apeldoorn.",
    },
    {
        id: "15km",
        name: "15 KM Paleistuinen & Parken",
        distance: "15.6 KM",
        color: "#EF4444",
        description: "Onze langste route van Kootwijk naar Apeldoorn voor de echte doorzetters.",
    },
];

const pointsCache = new Map<string, RoutePoint[]>();

export async function loadRoutePoints(id: string): Promise<RoutePoint[]> {
    const cached = pointsCache.get(id);
    if (cached) return cached;

    const res = await fetch(`/data/routes/${id}.json`);
    if (!res.ok) return [];
    const points: RoutePoint[] = await res.json();
    pointsCache.set(id, points);
    return points;
}

export async function loadFullRoute(id: string): Promise<Route | null> {
    const meta = routes.find(r => r.id === id);
    if (!meta) return null;

    const points = await loadRoutePoints(id);
    return { ...meta, points };
}