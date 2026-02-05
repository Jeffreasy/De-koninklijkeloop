import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState, useEffect } from "react";
import EventSettingsForm from "./EventSettingsForm";
import MailConfigIsland from "./MailConfigIsland"; // Import the new component
import { Calendar, Mail } from "lucide-react";

interface Props {
    convexUrl: string;
}

type Tab = 'event' | 'email';

export default function EventSettingsIsland({ convexUrl }: Props) {
    const [client, setClient] = useState<ConvexReactClient | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('event');

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
            <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex p-1 rounded-xl bg-glass-bg/30 border border-glass-border w-fit">
                    <button
                        onClick={() => setActiveTab('event')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'event'
                                ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                                : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Evenement</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'email'
                                ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                                : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                            }`}
                    >
                        <Mail className="w-4 h-4" />
                        <span>Server & E-mail</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === 'event' ? (
                        <EventSettingsForm />
                    ) : (
                        <MailConfigIsland />
                    )}
                </div>
            </div>
        </ConvexProvider>
    );
}
