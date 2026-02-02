import { ConvexClientProvider } from "../islands/ConvexClientProvider";
import ParticipantsTable from "./ParticipantsTable";

export default function ParticipantsTableWrapper() {
    return (
        <ConvexClientProvider>
            <ParticipantsTable />
        </ConvexClientProvider>
    );
}
