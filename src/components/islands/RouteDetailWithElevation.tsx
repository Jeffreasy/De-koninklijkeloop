import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Loader2, Mountain, TrendingUp, TrendingDown, Clock, MapPin } from 'lucide-react';
import { routes, loadRoutePoints, type Route, type RoutePoint, type RouteMetadata } from '../../lib/routeData';
import { cn } from '../../lib/utils';

const RouteMapInner = React.lazy(() => import('./RouteMapInner'));

// Haversine distance between two points in meters
function haversine(a: RoutePoint, b: RoutePoint): number {
    const R = 6371000;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h = sinLat * sinLat + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Build cumulative distance + elevation arrays
function buildProfile(points: RoutePoint[]) {
    const distances: number[] = [0];
    const elevations: number[] = [points[0]?.ele ?? 0];
    let cumDist = 0;
    let gain = 0;
    let loss = 0;

    for (let i = 1; i < points.length; i++) {
        cumDist += haversine(points[i - 1], points[i]);
        distances.push(cumDist);
        const ele = points[i].ele ?? 0;
        elevations.push(ele);
        const diff = ele - (points[i - 1].ele ?? 0);
        if (diff > 0) gain += diff;
        else loss += Math.abs(diff);
    }

    return { distances, elevations, totalDistance: cumDist, gain: Math.round(gain), loss: Math.round(loss) };
}

// Custom canvas elevation chart
function ElevationChart({
    distances,
    elevations,
    color,
    onHover,
}: {
    distances: number[];
    elevations: number[];
    color: string;
    onHover: (index: number | null) => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const paddingLeft = 45;
    const paddingRight = 16;
    const paddingTop = 16;
    const paddingBottom = 32;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const observer = new ResizeObserver(entries => {
            const { width } = entries[0].contentRect;
            setDimensions({ width, height: Math.min(180, width * 0.3) });
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.width === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        ctx.scale(dpr, dpr);

        const w = dimensions.width;
        const h = dimensions.height;
        const plotW = w - paddingLeft - paddingRight;
        const plotH = h - paddingTop - paddingBottom;

        const minEle = Math.min(...elevations) - 5;
        const maxEle = Math.max(...elevations) + 5;
        const maxDist = distances[distances.length - 1];

        const toX = (d: number) => paddingLeft + (d / maxDist) * plotW;
        const toY = (e: number) => paddingTop + (1 - (e - minEle) / (maxEle - minEle)) * plotH;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Grid lines
        const eleRange = maxEle - minEle;
        const step = eleRange > 60 ? 20 : eleRange > 30 ? 10 : 5;
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.15)';
        ctx.lineWidth = 0.5;
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(128, 128, 128, 0.6)';
        ctx.textAlign = 'right';

        for (let e = Math.ceil(minEle / step) * step; e <= maxEle; e += step) {
            const y = toY(e);
            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(w - paddingRight, y);
            ctx.stroke();
            ctx.fillText(`${Math.round(e)}m`, paddingLeft - 6, y + 3);
        }

        // X-axis labels (distance in km)
        ctx.textAlign = 'center';
        const distKm = maxDist / 1000;
        const distStep = distKm > 10 ? 5 : distKm > 5 ? 2 : 1;
        for (let d = 0; d <= distKm; d += distStep) {
            const x = toX(d * 1000);
            ctx.fillText(`${d}km`, x, h - 6);
        }

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, paddingTop, 0, h - paddingBottom);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, color + '05');

        ctx.beginPath();
        ctx.moveTo(toX(distances[0]), h - paddingBottom);
        for (let i = 0; i < distances.length; i++) {
            ctx.lineTo(toX(distances[i]), toY(elevations[i]));
        }
        ctx.lineTo(toX(distances[distances.length - 1]), h - paddingBottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Line
        ctx.beginPath();
        for (let i = 0; i < distances.length; i++) {
            const x = toX(distances[i]);
            const y = toY(elevations[i]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.stroke();
    }, [dimensions, distances, elevations, color]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = e.clientX - rect.left;
            const plotW = dimensions.width - paddingLeft - paddingRight;
            const maxDist = distances[distances.length - 1];
            const dist = ((x - paddingLeft) / plotW) * maxDist;

            if (dist < 0 || dist > maxDist) {
                onHover(null);
                return;
            }

            let closest = 0;
            let minDiff = Infinity;
            for (let i = 0; i < distances.length; i++) {
                const diff = Math.abs(distances[i] - dist);
                if (diff < minDiff) { minDiff = diff; closest = i; }
            }
            onHover(closest);
        },
        [distances, dimensions, onHover]
    );

    return (
        <div ref={containerRef} className="w-full relative">
            <canvas
                ref={canvasRef}
                style={{ width: dimensions.width, height: dimensions.height }}
                className="cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => onHover(null)}
            />
        </div>
    );
}

export default function RouteDetailWithElevation() {
    const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0].id);
    const selectedMeta = routes.find(r => r.id === selectedRouteId) || routes[0];

    const [points, setPoints] = useState<RoutePoint[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setHoverIndex(null);
        loadRoutePoints(selectedRouteId).then(pts => {
            if (!cancelled) { setPoints(pts); setLoading(false); }
        });
        return () => { cancelled = true; };
    }, [selectedRouteId]);

    const fullRoute: Route | null = points ? { ...selectedMeta, points } : null;
    const hasElevation = points?.some(p => p.ele !== undefined) ?? false;
    const profile = points && hasElevation ? buildProfile(points) : null;

    // Estimate walking time (5 km/h + Naismith's rule for elevation)
    const estimatedMinutes = profile
        ? Math.round((profile.totalDistance / 1000 / 5) * 60 + profile.gain / 100 * 10)
        : null;

    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
            { rootMargin: '200px' }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="flex flex-col gap-4">
            {/* Route Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-2">
                {routes.map(route => (
                    <button
                        key={route.id}
                        onClick={() => setSelectedRouteId(route.id)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border",
                            selectedRouteId === route.id
                                ? "text-white shadow-lg scale-105"
                                : "bg-glass-bg border-glass-border text-text-muted hover:text-text-primary hover:bg-glass-surface/60"
                        )}
                        style={selectedRouteId === route.id ? {
                            backgroundColor: route.color,
                            borderColor: route.color,
                            boxShadow: `0 8px 24px ${route.color}30`,
                        } : undefined}
                    >
                        {route.distance}
                    </button>
                ))}
            </div>

            {/* Route Title */}
            <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                    {selectedMeta.name}
                </h3>
                <p className="text-text-secondary mt-1 text-sm md:text-base max-w-xl mx-auto">
                    {selectedMeta.description}
                </p>
            </div>

            {/* Stats Bar */}
            {profile && (
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    {[
                        { icon: MapPin, label: 'Afstand', value: `${(profile.totalDistance / 1000).toFixed(1)} km` },
                        { icon: TrendingUp, label: 'Stijging', value: `+${profile.gain}m` },
                        { icon: TrendingDown, label: 'Daling', value: `-${profile.loss}m` },
                        { icon: Mountain, label: 'Hoogte', value: `${Math.min(...profile.elevations).toFixed(0)} – ${Math.max(...profile.elevations).toFixed(0)}m` },
                        ...(estimatedMinutes ? [{ icon: Clock, label: 'Geschatte tijd', value: estimatedMinutes >= 60 ? `${Math.floor(estimatedMinutes / 60)}u ${estimatedMinutes % 60}min` : `${estimatedMinutes} min` }] : []),
                    ].map(stat => (
                        <div
                            key={stat.label}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-glass-bg border border-glass-border text-xs md:text-sm"
                        >
                            <stat.icon className="w-3.5 h-3.5 text-text-muted" />
                            <span className="text-text-muted">{stat.label}:</span>
                            <span className="font-semibold text-text-primary">{stat.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Map */}
            <div className="min-h-[400px] md:min-h-[500px] w-full rounded-2xl overflow-hidden border border-glass-border shadow-xl bg-surface/5 relative z-0">
                {!isVisible || loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-brand-orange bg-surface/50 backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                ) : (
                    <Suspense fallback={
                        <div className="absolute inset-0 flex items-center justify-center text-brand-orange bg-surface/50 backdrop-blur-sm">
                            <Loader2 className="w-10 h-10 animate-spin" />
                        </div>
                    }>
                        {fullRoute && <RouteMapInner route={fullRoute} hoverIndex={hoverIndex} />}
                    </Suspense>
                )}
            </div>

            {/* Elevation Chart */}
            {profile && (
                <div className="rounded-2xl bg-glass-bg border border-glass-border backdrop-blur-md p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Mountain className="w-4 h-4 text-text-muted" />
                        <span className="text-sm font-semibold text-text-primary">Hoogteprofiel</span>
                        {hoverIndex !== null && points && (
                            <span className="ml-auto text-xs text-text-muted">
                                {(profile.distances[hoverIndex] / 1000).toFixed(2)} km — {profile.elevations[hoverIndex].toFixed(0)}m
                            </span>
                        )}
                    </div>
                    <ElevationChart
                        distances={profile.distances}
                        elevations={profile.elevations}
                        color={selectedMeta.color}
                        onHover={setHoverIndex}
                    />
                </div>
            )}
        </div>
    );
}
