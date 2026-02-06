import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SocialGridIsland } from "./SocialGridIsland";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL!);

export default function SocialGridWrapper() {
    return (
        <ConvexProvider client={convex}>
            <SocialGridIsland />
        </ConvexProvider>
    );
}
