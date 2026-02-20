import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import type { Route } from '../../lib/routeData';
import L from 'leaflet';

// Use CDN URLs for markers
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

interface RouteMapInnerProps {
    route: Route;
    hoverIndex?: number | null;
}

export default function RouteMapInner({ route, hoverIndex }: RouteMapInnerProps) {
    if (!route) return null;

    const hoverPoint = hoverIndex != null && route.points[hoverIndex] ? route.points[hoverIndex] : null;

    return (
        <div className="relative h-[400px] md:h-[500px] w-full">
            <MapContainer
                center={[52.2205, 5.9552]}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Polyline
                    positions={route.points.map(p => [p.lat, p.lng])}
                    pathOptions={{ color: route.color, weight: 5, opacity: 0.85 }}
                />
                {/* Start marker: first point of the route */}
                <Marker position={[route.points[0].lat, route.points[0].lng]}>
                    <Popup>Start</Popup>
                </Marker>

                {/* Finish marker: Grote Kerk, Loolaan 16 */}
                <Marker position={[52.2205, 5.9552]}>
                    <Popup>Finish: Grote Kerk, Loolaan 16</Popup>
                </Marker>

                {/* Hover indicator from elevation chart */}
                {hoverPoint && (
                    <CircleMarker
                        center={[hoverPoint.lat, hoverPoint.lng]}
                        radius={8}
                        pathOptions={{
                            color: '#fff',
                            fillColor: route.color,
                            fillOpacity: 1,
                            weight: 3,
                        }}
                    />
                )}

                <MapUpdater points={route.points} />
            </MapContainer>
        </div>
    );
}
