import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SocialManagerIsland } from "./SocialManagerIsland";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL!);

export default function SocialWrapper() {
    return (
        <ConvexProvider client={convex}>
            <SocialManagerIsland />
        </ConvexProvider>
    );
}
