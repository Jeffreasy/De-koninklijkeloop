import { ConvexClientProvider } from "../islands/ConvexClientProvider";
import { lazy, Suspense } from "react";

const AnalyticsDashboard = lazy(() => import("./AnalyticsDashboard"));

function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-glass-border/20" />
                ))}
            </div>
            <div className="h-80 rounded-2xl bg-glass-border/20" />
        </div>
    );
}

export default function AnalyticsWrapper() {
    return (
        <ConvexClientProvider>
            <Suspense fallback={<DashboardSkeleton />}>
                <AnalyticsDashboard />
            </Suspense>
        </ConvexClientProvider>
    );
}
