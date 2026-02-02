import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";

interface Props {
    children: ReactNode;
    convexUrl?: string;
}

export function ConvexClientProvider({ children, convexUrl }: Props) {
    const [client, setClient] = useState<ConvexReactClient | null>(null);

    useEffect(() => {
        // Get Convex URL from prop or environment
        const url = convexUrl || import.meta.env.PUBLIC_CONVEX_URL;

        if (!url) {
            console.error("[ConvexClientProvider] No Convex URL provided");
            return;
        }

        console.log("[ConvexClientProvider] Initializing with URL:", url);
        const convexClient = new ConvexReactClient(url);
        setClient(convexClient);

        return () => {
            convexClient.close();
        };
    }, [convexUrl]);

    if (!client) {
        return (
            <div className="p-8 text-center text-text-secondary">
                Initializing Convex...
            </div>
        );
    }

    return (
        <ConvexProvider client={client}>
            {children}
        </ConvexProvider>
    );
}
