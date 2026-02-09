import { ConvexClientProvider } from "../islands/ConvexClientProvider";
import VolunteerTasksManager from "./VolunteerTasksManager";

export default function VolunteerTasksWrapper() {
    return (
        <ConvexClientProvider>
            <VolunteerTasksManager />
        </ConvexClientProvider>
    );
}
