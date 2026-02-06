import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { routes } from '../../lib/routeData';
import { cn } from '../../lib/utils';

const RouteMapInner = React.lazy(() => import('./RouteMapInner'));

export default function RouteMap() {
    const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0].id);
    const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

    // Lazy load logic
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            {/* Title - Always visible outside */}
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary">
                    {selectedRoute.name}
                </h2>
            </div>

            {/* Map Container with Floating Elements */}
            <div ref={containerRef} className="min-h-[500px] w-full rounded-3xl overflow-hidden border border-glass-border shadow-2xl bg-surface/5 relative group">
                {!isVisible ? (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                        <span className="animate-pulse">Kaart laden bij scrollen...</span>
                    </div>
                ) : (
                    <>
                        <Suspense fallback={
                            <div className="absolute inset-0 flex items-center justify-center text-brand-orange bg-surface/50 backdrop-blur-sm">
                                <Loader2 className="w-10 h-10 animate-spin" />
                            </div>
                        }>
                            <RouteMapInner route={selectedRoute} />
                        </Suspense>

                        {/* Floating Info (Top) */}
                        <div className="absolute top-6 left-4 right-4 z-400 flex justify-center pointer-events-none">
                            <div className="max-w-md bg-white/90 dark:bg-black/60 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xl rounded-2xl p-4 text-center pointer-events-auto">
                                <p className="text-sm md:text-base text-text-primary dark:text-white/90 leading-relaxed font-medium">
                                    {selectedRoute.description}
                                </p>
                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10">
                                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: selectedRoute.color }}></div>
                                    <span className="text-xs font-bold text-text-primary dark:text-white">
                                        {selectedRoute.distance}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Controls */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-400 w-full max-w-max px-4">
                            <div className="flex flex-wrap justify-center gap-2 p-2 rounded-2xl bg-white/90 dark:bg-black/60 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xl">
                                {routes.map((route) => (
                                    <button
                                        key={route.id}
                                        onClick={() => setSelectedRouteId(route.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300",
                                            selectedRouteId === route.id
                                                ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/25 scale-105"
                                                : "bg-transparent text-text-muted hover:text-brand-orange hover:bg-black/5 dark:hover:bg-white/10"
                                        )}
                                    >
                                        {route.distance}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
