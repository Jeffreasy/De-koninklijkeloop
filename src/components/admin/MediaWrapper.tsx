import { ConvexClientProvider } from "../islands/ConvexClientProvider.tsx";
import MediaManagerIsland from "./MediaManagerIsland.tsx";

export default function MediaWrapper() {
    return (
        <ConvexClientProvider>
            <MediaManagerIsland />
        </ConvexClientProvider>
    )
}
