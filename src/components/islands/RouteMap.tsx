import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { routes } from '../../lib/routeData';
import { cn } from '../../lib/utils';
// Fix for missing default icon in Leaflet with webpack/vite
import L from 'leaflet';

// Use CDN URLs for markers to avoid Vite/Vercel asset resolution issues
let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
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
                                ? "bg-accent-primary text-white border-accent-primary shadow-lg scale-105 font-bold"
                                : "bg-glass-bg border-glass-border text-secondary hover:bg-glass-bg/80 hover:text-primary hover:border-white/20"
                        )}
                    >
                        {route.distance}
                    </button>
                ))}
            </div>

            {/* Info Card */}
            <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-3">
                    {selectedRoute.name}
                </h2>
                <p className="text-lg text-secondary leading-relaxed max-w-xl mx-auto">
                    {selectedRoute.description}
                </p>

                {/* Visual indicator of metric */}
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/50 border border-white/10 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: selectedRoute.color }}></div>
                    <span className="text-sm font-medium text-primary">
                        {selectedRoute.distance}
                    </span>
                </div>
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
