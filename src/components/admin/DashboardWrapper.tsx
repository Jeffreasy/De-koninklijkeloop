import { ConvexClientProvider } from "../islands/ConvexClientProvider";
import DashboardTable from "./DashboardTable";

export default function DashboardWrapper() {
    return (
        <ConvexClientProvider>
            <DashboardTable />
        </ConvexClientProvider>
    )
}
