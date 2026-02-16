import { useState, useEffect } from 'react';
import { Loader2, Send, XCircle, Clock } from 'lucide-react';

export default function NotificationMonitor() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        sent: 0,
        failed: 0
    });

    useEffect(() => {
        fetchNotifications();
        // Poll every 10 seconds, but only when tab is visible
        let interval: ReturnType<typeof setInterval> | null = setInterval(fetchNotifications, 10000);

        const handleVisibility = () => {
            if (document.hidden) {
                if (interval) { clearInterval(interval); interval = null; }
            } else {
                fetchNotifications();
                interval = setInterval(fetchNotifications, 10000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            if (interval) clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            // Use dedicated email-stats proxy route
            const response = await fetch('/api/email-stats');

            if (response.ok) {
                const data = await response.json();
                setStats({
                    pending: data.queue?.pending || 0,
                    sent: data.queue?.sent || 0,
                    failed: data.queue?.failed || 0
                });
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error('[NotificationMonitor] Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[rgb(var(--success))]/10 rounded-xl">
                            <Send className="w-6 h-6 text-[rgb(var(--success))]" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-text-primary">
                                {stats.sent}
                            </div>
                            <div className="text-sm text-text-muted">Verzonden</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[rgb(var(--warning))]/10 rounded-xl">
                            <Clock className="w-6 h-6 text-[rgb(var(--warning))]" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-text-primary">
                                {stats.pending}
                            </div>
                            <div className="text-sm text-text-muted">In wachtrij</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[rgb(var(--error))]/10 rounded-xl">
                            <XCircle className="w-6 h-6 text-[rgb(var(--error))]" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-text-primary">
                                {stats.failed}
                            </div>
                            <div className="text-sm text-text-muted">Mislukt</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Table */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-glass-border bg-white/5">
                    <h3 className="text-lg font-display font-bold text-text-primary">
                        Recente Notificaties
                    </h3>
                    <p className="text-sm text-text-muted">
                        Laatste 24 uur
                    </p>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div
                            className="flex items-center justify-center py-12"
                            role="status"
                            aria-live="polite"
                        >
                            <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
                            <span className="ml-3 text-text-muted">Notificaties laden...</span>
                            <span className="sr-only">Notificaties worden geladen...</span>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Send className="w-12 h-12 text-text-muted mx-auto mb-4" />
                            <p className="text-text-muted">Individuele notificatie-tracking komt binnenkort</p>
                            <p className="text-xs text-text-muted mt-2">Gebruik de statistieken hierboven voor het huidige overzicht</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
