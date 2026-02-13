import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SocialGridIsland } from "./SocialGridIsland";
import { useStore } from "@nanostores/react";
import { $accessToken } from "../../../lib/auth";
import type { SSRPost } from "./types";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL!);

interface Props {
    ssrFeatured?: SSRPost | null;
    ssrThumbnails?: SSRPost[];
}

export default function SocialGridWrapper({ ssrFeatured, ssrThumbnails }: Props) {
    const accessToken = useStore($accessToken);

    if (accessToken) {
        convex.setAuth(async () => accessToken);
    } else {
        convex.setAuth(async () => null);
    }

    return (
        <ConvexProvider client={convex}>
            <SocialGridIsland
                ssrFeatured={ssrFeatured}
                ssrThumbnails={ssrThumbnails}
            />
        </ConvexProvider>
    );
}
