import { useStore } from "@nanostores/react";
import { $user } from "../../lib/auth";
import { LayoutDashboard, Smartphone, X, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, ConvexProvider, ConvexReactClient } from "convex/react";
import { api } from "../../../convex/_generated/api";

function FloatingToolboxContent() {
    const user = useStore($user);
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch event settings to check for Mobile App status
    const settings = useQuery(api.eventSettings.getActiveSettings);

    useEffect(() => {
        // Show toolbox for ALL logged-in users
        // Note: Auth system returns roles like 'admin', 'user', 'viewer'
        // Registration roles ('deelnemer', etc.) are stored in Convex, not the auth user object
        if (user && user.email) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [user]);

    if (!isVisible) return null;

    const isAppEnabled = settings?.mobile_app_enabled;
    const isAppComingSoon = settings?.mobile_app_status === "coming_soon";

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-end gap-3 mb-2"
                    >
                        {/* Mobile App Button (Conditional) */}
                        {isAppEnabled && (
                            <a
                                href={isAppComingSoon ? "#" : settings?.mobile_app_url || "#"}
                                onClick={(e) => {
                                    if (isAppComingSoon) {
                                        e.preventDefault();
                                        // Optional: Add toast here
                                    }
                                }}
                                className={`
                                    group flex items-center gap-3 pl-4 pr-2 py-2 
                                    bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl 
                                    border border-zinc-200 dark:border-white/10 
                                    shadow-xl rounded-full 
                                    hover:scale-105 transition-all duration-300
                                    ${isAppComingSoon ? 'opacity-75 cursor-not-allowed' : 'hover:border-brand-orange/30 cursor-pointer'}
                                `}
                            >
                                <div className="text-right mr-1">
                                    <span className="block text-xs font-bold text-zinc-800 dark:text-white group-hover:text-brand-orange transition-colors">
                                        DKL App
                                    </span>
                                    {isAppComingSoon && (
                                        <span className="block text-[10px] text-brand-orange font-medium animate-pulse">
                                            Binnenkort beschikbaar
                                        </span>
                                    )}
                                </div>
                                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                            </a>
                        )}

                        {/* Dashboard Link (Always visible in open state for consistency) */}
                        <a
                            href="/dashboard"
                            className="group flex items-center gap-3 pl-4 pr-2 py-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-xl rounded-full hover:scale-105 transition-all duration-300 hover:border-brand-orange/30"
                        >
                            <span className="text-xs font-bold text-zinc-800 dark:text-white group-hover:text-brand-orange transition-colors mr-1">
                                Mijn Dashboard
                            </span>
                            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    group flex items-center gap-3 pl-2 pr-4 py-2 md:pl-2 md:pr-4 md:py-2 
                    bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl 
                    border border-zinc-200 dark:border-white/10 
                    shadow-2xl rounded-full 
                    hover:scale-105 transition-all duration-300 
                    hover:border-brand-orange/30 
                    animate-in fade-in slide-in-from-bottom-4
                `}
                aria-label="Open toolbox"
            >
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-brand-orange/20 blur-lg rounded-full animate-pulse" />
                    <div className={`
                        relative w-12 h-12 bg-linear-to-br from-brand-orange to-orange-500 
                        rounded-full flex items-center justify-center text-white shadow-lg 
                        transition-transform duration-500
                        ${isOpen ? 'rotate-180' : 'group-hover:rotate-12'}
                    `}>
                        {isOpen ? <X className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
                    </div>
                </div>

                <div className="flex flex-col text-left pr-2">
                    <span className="hidden md:block text-[10px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-brand-orange transition-colors">
                        Quick Menu
                    </span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-white group-hover:text-brand-orange transition-colors">
                        {isOpen ? "Sluiten" : "Tools"}
                    </span>
                </div>
            </button>
        </div>
    );
}

export default function FloatingToolbox() {
    const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
    const [convexClient] = useState(() => convexUrl ? new ConvexReactClient(convexUrl) : null);

    if (!convexClient) return null;

    return (
        <ConvexProvider client={convexClient}>
            <FloatingToolboxContent />
        </ConvexProvider>
    );
}
