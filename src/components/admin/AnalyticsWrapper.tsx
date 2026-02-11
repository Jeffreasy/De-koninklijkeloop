import { ConvexClientProvider } from "../islands/ConvexClientProvider";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default function AnalyticsWrapper() {
    return (
        <ConvexClientProvider>
            <AnalyticsDashboard />
        </ConvexClientProvider>
    );
}
