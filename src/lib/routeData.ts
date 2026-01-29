
export interface RoutePoint {
    lat: number;
    lng: number;
}

export interface Route {
    id: string;
    name: string;
    distance: string;
    color: string;
    description: string;
    points: RoutePoint[];
}

// Center near Paleis Het Loo, Apeldoorn
const START_POINT = { lat: 52.234120, lng: 5.945890 };

export const routes: Route[] = [
    {
        id: "2.5km",
        name: "2.5 KM Roll & Stroll",
        distance: "2.5 KM",
        color: "#10b981", // Emerald
        description: "Een volledig verharde, toegankelijke route. Perfect voor rolstoelgebruikers en gezinnen.",
        points: [
            START_POINT,
            { lat: 52.236, lng: 5.948 },
            { lat: 52.238, lng: 5.945 },
            { lat: 52.235, lng: 5.940 },
            START_POINT
        ]
    },
    {
        id: "6km",
        name: "6 KM Gezinsroute",
        distance: "6 KM",
        color: "#3b82f6", // Blue
        description: "Een mooie wandeling door de directe natuur, ideaal voor een sportieve middag met het gezin.",
        points: [
            START_POINT,
            { lat: 52.238, lng: 5.952 },
            { lat: 52.242, lng: 5.948 },
            { lat: 52.240, lng: 5.935 },
            { lat: 52.232, lng: 5.938 },
            START_POINT
        ]
    },
    {
        id: "10km",
        name: "10 KM Vorstelijke Verkenning",
        distance: "10 KM",
        color: "#eab308", // Yellow/Gold
        description: "Verken de bossen rondom het paleis en de prachtige lanen van Apeldoorn.",
        points: [
            START_POINT,
            { lat: 52.230, lng: 5.955 },
            { lat: 52.225, lng: 5.960 },
            { lat: 52.220, lng: 5.950 },
            { lat: 52.225, lng: 5.930 },
            { lat: 52.235, lng: 5.935 },
            START_POINT
        ]
    },
    {
        id: "15km",
        name: "15 KM Paleistuinen & Parken",
        distance: "15 KM",
        color: "#EF4444", // Red
        description: "Onze langste route van Kootwijk naar Apeldoorn voor de echte doorzetters.",
        points: [
            START_POINT,
            { lat: 52.230, lng: 5.960 },
            { lat: 52.210, lng: 5.970 },
            { lat: 52.200, lng: 5.950 },
            { lat: 52.210, lng: 5.920 },
            { lat: 52.230, lng: 5.910 },
            { lat: 52.240, lng: 5.930 },
            START_POINT
        ]
    }
];
