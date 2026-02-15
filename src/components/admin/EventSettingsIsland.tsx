import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState, useEffect } from "react";
import EventSettingsForm from "./EventSettingsForm";
import MailConfigIsland from "./MailConfigIsland";
import TelegramConfigIsland from "./TelegramConfigIsland";
import FeedbackList from "./FeedbackList";
import XConfigPanel from "./XConfigPanel";
import BlogConfigPanel from "./BlogConfigPanel";
import { Calendar, Mail, Bot, MessageSquarePlus, Twitter, BookOpen } from "lucide-react";

interface Props {
    convexUrl: string;
}

type Tab = 'event' | 'email' | 'telegram' | 'feedback' | 'xconfig' | 'blogconfig';

const TABS: { value: Tab; label: string; shortLabel?: string; icon: typeof Calendar }[] = [
    { value: 'event', label: 'Evenement', shortLabel: 'Event', icon: Calendar },
    { value: 'email', label: 'Server & E-mail', shortLabel: 'Email', icon: Mail },
    { value: 'telegram', label: 'Telegram', icon: Bot },
    { value: 'feedback', label: 'Feedback', icon: MessageSquarePlus },
    { value: 'xconfig', label: 'X / Twitter', shortLabel: 'X', icon: Twitter },
    { value: 'blogconfig', label: 'Blog', icon: BookOpen },
];

export default function EventSettingsIsland({ convexUrl }: Props) {
    const [client, setClient] = useState<ConvexReactClient | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('event');

    useEffect(() => {
        if (!convexUrl) {
            if (import.meta.env.DEV) console.error("[EventSettingsIsland] No Convex URL provided");
            return;
        }

        if (import.meta.env.DEV) console.log("[EventSettingsIsland] Initializing Convex client");
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
                <div className="grid grid-cols-3 sm:flex p-1 rounded-xl bg-glass-bg/30 border border-glass-border w-full sm:w-fit gap-1 sm:gap-0 overflow-x-auto">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`group relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.value
                                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 shrink-0 transition-transform ${activeTab === tab.value ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {tab.shortLabel ? (
                                    <>
                                        <span className="hidden xs:inline">{tab.label}</span>
                                        <span className="xs:hidden">{tab.shortLabel}</span>
                                    </>
                                ) : (
                                    <span>{tab.label}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" key={activeTab}>
                    {activeTab === 'event' && <EventSettingsForm />}
                    {activeTab === 'email' && <MailConfigIsland />}
                    {activeTab === 'telegram' && <TelegramConfigIsland />}
                    {activeTab === 'feedback' && <FeedbackList />}
                    {activeTab === 'xconfig' && <XConfigPanel />}
                    {activeTab === 'blogconfig' && <BlogConfigPanel />}
                </div>
            </div>
        </ConvexProvider>
    );
}
