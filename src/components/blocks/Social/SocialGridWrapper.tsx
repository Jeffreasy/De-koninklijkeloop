
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SocialGridIsland } from "./SocialGridIsland";
import { useStore } from "@nanostores/react";
import { $accessToken } from "../../../lib/auth";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL!);

export default function SocialGridWrapper() {
    const accessToken = useStore($accessToken);

    // If we have a token, configure the client to use it
    if (accessToken) {
        convex.setAuth(async () => accessToken);
    } else {
        // Clear auth if no token
        convex.setAuth(async () => null);
    }

    return (
        <ConvexProvider client={convex}>
            <SocialGridIsland />
        </ConvexProvider>
    );
}
