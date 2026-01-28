
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
        id: "5km",
        name: "5KM Koninklijke Mijl",
        distance: "5 KM",
        color: "#3b82f6", // Blue
        description: "Een prachtige route door de tuinen van Het Loo. Geschikt voor jong en oud.",
        points: [
            START_POINT,
            { lat: 52.238, lng: 5.950 },
            { lat: 52.240, lng: 5.948 },
            { lat: 52.242, lng: 5.942 },
            { lat: 52.239, lng: 5.938 },
            START_POINT
        ]
    },
    {
        id: "10km",
        name: "10KM Vorstelijke Verkenning",
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
        name: "15KM Paleistuinen & Parken",
        distance: "15 KM",
        color: "#EF4444", // Red
        description: "Onze langste route voor de echte wandelaars. Zie alles wat Apeldoorn te bieden heeft.",
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
