import { ConvexClientProvider } from "./ConvexClientProvider";
import AdminDashboardTable from "./AdminDashboardTable";

export default function AdminDashboardWrapper() {
    return (
        <ConvexClientProvider>
            <AdminDashboardTable />
        </ConvexClientProvider>
    )
}
