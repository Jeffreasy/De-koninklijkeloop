import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../../lib/api";
import { Activity } from "lucide-react";

interface Budget {
    remaining: number;
    max: number;
    used: number;
    window: string;
}

export default function XBudgetWidget() {
    const [budget, setBudget] = useState<Budget | null>(null);

    const fetchBudget = useCallback(async () => {
        try {
            const data = await apiRequest("/admin/social/budget");
            setBudget(data);
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XBudget] Fetch failed:", err);
        }
    }, []);

    useEffect(() => {
        fetchBudget();
        let interval = setInterval(fetchBudget, 60_000);

        const handleVisibility = () => {
            if (document.hidden) {
                clearInterval(interval);
            } else {
                fetchBudget();
                interval = setInterval(fetchBudget, 60_000);
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [fetchBudget]);

    if (!budget) return null;

    const percentage = budget.max > 0 ? Math.round((budget.used / budget.max) * 100) : 0;
    const isWarning = budget.remaining < 3;

    return (
        <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isWarning ? "bg-red-500/10 border-red-500/20" : "bg-glass-bg/30 border-glass-border"}`}>
            <Activity className={`w-4 h-4 ${isWarning ? "text-red-400" : "text-text-muted"}`} />
            <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-glass-border/30 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${isWarning ? "bg-red-500" : percentage > 60 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className={`text-xs font-medium ${isWarning ? "text-red-400" : "text-text-muted"}`}>
                    {budget.used}/{budget.max} posts ({budget.window})
                </span>
            </div>
        </div>
    );
}
