import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState, useEffect } from "react";
import EventSettingsForm from "./EventSettingsForm";
import MailConfigIsland from "./MailConfigIsland";
import TelegramConfigIsland from "./TelegramConfigIsland";
import FeedbackList from "./FeedbackList";
import { Calendar, Mail, Bot, MessageSquarePlus } from "lucide-react";

interface Props {
    convexUrl: string;
}

type Tab = 'event' | 'email' | 'telegram' | 'feedback';

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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
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
                <div className="grid grid-cols-4 sm:flex p-1 rounded-xl bg-glass-bg/30 border border-glass-border w-full sm:w-fit gap-1 sm:gap-0">
                    <button
                        onClick={() => setActiveTab('event')}
                        className={`group relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'event'
                            ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                            : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                            }`}
                    >
                        <Calendar className={`w-4 h-4 transition-transform ${activeTab === 'event' ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="hidden xs:inline">Evenement</span>
                        <span className="xs:hidden">Event</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`group relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'email'
                            ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                            : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                            }`}
                    >
                        <Mail className={`w-4 h-4 transition-transform ${activeTab === 'email' ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="hidden xs:inline whitespace-nowrap">Server & E-mail</span>
                        <span className="xs:hidden">Email</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('telegram')}
                        className={`group relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'telegram'
                            ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                            : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                            }`}
                    >
                        <Bot className={`w-4 h-4 transition-transform ${activeTab === 'telegram' ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span>Telegram</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`group relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'feedback'
                            ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                            : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                            }`}
                    >
                        <MessageSquarePlus className={`w-4 h-4 transition-transform ${activeTab === 'feedback' ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span>Feedback</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === 'event' && <EventSettingsForm />}
                    {activeTab === 'email' && <MailConfigIsland />}
                    {activeTab === 'telegram' && <TelegramConfigIsland />}
                    {activeTab === 'feedback' && <FeedbackList />}
                </div>
            </div>
        </ConvexProvider>
    );
}
