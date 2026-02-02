import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState, useEffect } from "react";
import EventSettingsForm from "./EventSettingsForm";

interface Props {
    convexUrl: string;
}

export default function EventSettingsIsland({ convexUrl }: Props) {
    const [client, setClient] = useState<ConvexReactClient | null>(null);

    useEffect(() => {
        if (!convexUrl) {
            console.error("[EventSettingsIsland] No Convex URL provided");
            return;
        }

        console.log("[EventSettingsIsland] Initializing Convex client with:", convexUrl);
        const convexClient = new ConvexReactClient(convexUrl);
        setClient(convexClient);

        return () => {
            convexClient.close();
        };
    }, [convexUrl]);

    if (!client) {
        return (
            <div className="premium-glass rounded-2xl md:rounded-3xl p-6 md:p-8">
                <div
                    className="flex items-center justify-center"
                    role="status"
                    aria-live="polite"
                >
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
                    <span className="ml-3 text-text-secondary">Convex client wordt geïnitialiseerd...</span>
                    <span className="sr-only">Laden...</span>
                </div>
            </div>
        );
    }

    return (
        <ConvexProvider client={client}>
            <EventSettingsForm />
        </ConvexProvider>
    );
}
