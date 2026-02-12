import { ConvexClientProvider } from "../islands/ConvexClientProvider";
import CommunicatieManager from "./CommunicatieManager";

export default function CommunicatieIsland() {
    return (
        <ConvexClientProvider>
            <CommunicatieManager />
        </ConvexClientProvider>
    );
}
