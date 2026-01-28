import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { routes } from '../../lib/routeData';
import { cn } from '../../lib/utils';
// Fix for missing default icon in Leaflet with webpack/vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: (icon as any).src ?? (icon as unknown as string),
    shadowUrl: (iconShadow as any).src ?? (iconShadow as unknown as string),
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Updated component to fit view bounds of the route
function MapUpdater({ points }: { points: { lat: number; lng: number }[] }) {
    const map = useMap();
    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
}

export default function RouteMap() {
    const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0].id);
    const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

    return (
        <div className="flex flex-col gap-6">
            {/* Controls */}
            <div className="flex flex-wrap justify-center gap-4">
                {routes.map((route) => (
                    <button
                        key={route.id}
                        onClick={() => setSelectedRouteId(route.id)}
                        className={cn(
                            "px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-md border",
                            selectedRouteId === route.id
                                ? "bg-brand-primary text-slate-950 border-brand-primary shadow-lg scale-105"
                                : "bg-glass-bg border-glass-border text-text-muted hover:bg-glass-bg/80 hover:text-text-body"
                        )}
                    >
                        {route.distance}
                    </button>
                ))}
            </div>

            {/* Info Card */}
            <div className="text-center max-w-2xl mx-auto mb-4">
                <h2 className="text-2xl font-display font-medium text-text-body mb-2">{selectedRoute.name}</h2>
                <p className="text-text-muted">{selectedRoute.description}</p>
            </div>

            {/* Map */}
            <div className="relative h-[500px] w-full rounded-3xl overflow-hidden border border-glass-border shadow-2xl">
                <MapContainer
                    center={[52.234, 5.945]}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="h-full w-full z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Polyline
                        positions={selectedRoute.points.map(p => [p.lat, p.lng])}
                        pathOptions={{ color: selectedRoute.color, weight: 6, opacity: 0.8 }}
                    />

                    <Marker position={[52.234120, 5.945890]}>
                        <Popup>
                            Start/Finish: Paleis Het Loo
                        </Popup>
                    </Marker>

                    <MapUpdater points={selectedRoute.points} />
                </MapContainer>
            </div>
        </div>
    );
}
