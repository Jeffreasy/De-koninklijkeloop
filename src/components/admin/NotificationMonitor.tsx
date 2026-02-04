import { useState, useEffect } from 'react';
import { Loader2, Send, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface EmailOutboxItem {
    id: string;
    status: 'pending' | 'processing' | 'sent' | 'failed';
    payload: {
        to: string;
        template: string;
        subject?: string;
    };
    retry_count: number;
    last_error?: string;
    created_at: string;
    processed_at?: string;
}

export default function NotificationMonitor() {
    const [notifications, setNotifications] = useState<EmailOutboxItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        sent: 0,
        failed: 0
    });

    useEffect(() => {
        fetchNotifications();
        // Poll every 10 seconds
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            // Use dedicated email-stats proxy route
            const response = await fetch('/api/email-stats');

            if (response.ok) {
                const data = await response.json();
                // email-stats returns: { queue: { pending, sent, failed }, delivery: {...} }
                setNotifications([]); // No individual notifications from stats endpoint
                setStats({
                    pending: data.queue?.pending || 0,
                    sent: data.queue?.sent || 0,
                    failed: data.queue?.failed || 0
                });
            }
        } catch (err) {
            console.error('[NotificationMonitor] Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'sent':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'processing':
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-text-muted" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            sent: 'bg-green-500/10 text-green-500 border-green-500/20',
            failed: 'bg-red-500/10 text-red-500 border-red-500/20',
            processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${styles[status as keyof typeof styles] || 'bg-white/5 text-text-muted border-glass-border'}`}>
                {status}
            </span>
        );
    };

    const formatTemplate = (template: string) => {
        const templates = {
            'registration_confirmation': 'Registratie Bevestiging',
            'invite_user': 'Gebruiker Uitnodiging',
            'password_reset': 'Wachtwoord Reset',
            'plain_reply': 'Email Antwoord'
        };
        return templates[template as keyof typeof templates] || template;
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <Send className="w-6 h-6 text-green-500" />
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
                        <div className="p-3 bg-yellow-500/10 rounded-xl">
                            <Clock className="w-6 h-6 text-yellow-500" />
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
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <XCircle className="w-6 h-6 text-red-500" />
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
                <div className="px-6 py-4 border-b border-glass-border bg-white/[0.02]">
                    <h3 className="text-lg font-display font-bold text-text-primary">
                        Recente Notificaties
                    </h3>
                    <p className="text-sm text-text-muted">
                        Laatste 24 uur
                    </p>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
                            <span className="ml-3 text-text-muted">Notificaties laden...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Send className="w-12 h-12 text-text-muted mx-auto mb-4" />
                            <p className="text-text-muted">Geen recente notificaties</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-white/[0.02] border-b border-glass-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                        Ontvanger
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                        Template
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                        Verzonden
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                        Pogingen
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-glass-border">
                                {notifications.map((notif) => (
                                    <tr key={notif.id} className="hover:bg-white/[0.02] transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(notif.status)}
                                                {getStatusBadge(notif.status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            {notif.payload.to}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            {formatTemplate(notif.payload.template)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted">
                                            {new Date(notif.created_at).toLocaleString('nl-NL')}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {notif.retry_count > 0 ? (
                                                <span className="text-yellow-500">
                                                    {notif.retry_count} pogingen
                                                </span>
                                            ) : (
                                                <span className="text-text-muted">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
