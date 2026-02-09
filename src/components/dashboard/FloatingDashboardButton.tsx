
import { useStore } from "@nanostores/react";
import { $user } from "../../lib/auth";
import { LayoutDashboard, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingDashboardButton() {
    const user = useStore($user);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show button only if user is logged in and is a participant type
        // Admins/Editors usually have their own navigation or don't need this quick link
        if (user && ['deelnemer', 'begeleider', 'vrijwilliger'].includes(user.role)) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [user]);

    if (!isVisible) return null;

    return (
        <a
            href="/dashboard"
            className="fixed bottom-6 right-6 z-90 group flex items-center gap-3 pl-2 pr-4 py-2 md:pl-4 md:pr-5 md:py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-2xl rounded-full hover:scale-105 transition-all duration-300 hover:border-brand-orange/30 animate-in fade-in slide-in-from-bottom-4"
            aria-label="Ga naar mijn dashboard"
        >
            <div className="relative shrink-0">
                <div className="absolute inset-0 bg-brand-orange/20 blur-lg rounded-full animate-pulse" />
                <div className="relative w-8 h-8 md:w-10 md:h-10 bg-linear-to-br from-brand-orange to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
                    <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5" />
                </div>
            </div>

            <div className="flex flex-col text-left">
                <span className="hidden md:block text-[10px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-brand-orange transition-colors">
                    Ingelogd als {user?.role}
                </span>
                <span className="text-xs md:text-sm font-bold text-zinc-800 dark:text-white group-hover:text-brand-orange transition-colors">
                    Mijn Dashboard
                </span>
            </div>
        </a>
    );
}
