import { useState, useEffect } from 'react';
import { Loader2, Mail, Inbox, Star, Archive, Plus, Paperclip, Download } from 'lucide-react';
import ReplyModal from './ReplyModal';
import ComposeModal from './ComposeModal';

// Types
interface Email {
    id: string;
    account: string;
    message_id: string;
    subject: string;
    from_address: string;
    from_name?: string;
    to_addresses: string[];
    has_attachments: boolean;
    is_read: boolean;
    is_starred: boolean;
    is_archived: boolean;
    thread_id?: string;
    received_at: string;
}

interface EmailStats {
    unread_count: number;
    starred_count: number;
    total_count: number;
    archived_count: number;
}

type Account = 'info' | 'inschrijving';

export default function EmailManagerIsland() {
    // State
    const [selectedAccount, setSelectedAccount] = useState<Account>('info');
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [stats, setStats] = useState<EmailStats | null>(null);

    // Auto-dismiss toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch emails when account changes
    useEffect(() => {
        fetchEmails();
        fetchStats();
    }, [selectedAccount]);

    const fetchEmails = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/email/inbox/${selectedAccount}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch emails: ${response.statusText}`);
            }

            const data = await response.json();
            setEmails(data.emails || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load emails');
            console.error('[EmailManager] Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`/api/email/inbox/${selectedAccount}/stats`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('[EmailManager] Stats fetch error:', err);
        }
    };

    const handleEmailClick = async (email: Email) => {
        setSelectedEmail(email);

        // Mark as read if unread
        if (!email.is_read) {
            try {
                await fetch(`/api/email/message/${email.id}/read`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_read: true })
                });

                // Update local state
                setEmails(prev => prev.map(e =>
                    e.id === email.id ? { ...e, is_read: true } : e
                ));

                // Refresh stats
                fetchStats();
            } catch (err) {
                console.error('[EmailManager] Mark as read error:', err);
            }
        }
    };

    const accountDisplayName = {
        info: 'info@dekoninklijkeloop.nl',
        inschrijving: 'inschrijving@dekoninklijkeloop.nl'
    };

    return (
        <div className="email-manager grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
            {/* Left Sidebar - Account Selector & Stats */}
            <div className="lg:col-span-1">
                <div className="glass-card p-6 space-y-6">
                    {/* Account Selector */}
                    <div>
                        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
                            Mailbox Account
                        </h3>

                        <button
                            onClick={() => setShowComposeModal(true)}
                            className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-brand-orange text-white font-medium rounded-xl hover:bg-orange-400 transition-colors shadow-lg shadow-brand-orange/20"
                        >
                            <Plus className="w-5 h-5" />
                            Nieuw Bericht
                        </button>

                        <div className="space-y-2">
                            {(['info', 'inschrijving'] as Account[]).map((account) => (
                                <button
                                    key={account}
                                    onClick={() => setSelectedAccount(account)}
                                    aria-label={`Select ${account} mailbox`}
                                    aria-pressed={selectedAccount === account}
                                    className={`
                                        w-full text-left px-4 py-3 rounded-xl transition-[background-color,border-color,color] duration-200
                                        ${selectedAccount === account
                                            ? 'bg-brand-orange/10 border-2 border-brand-orange text-brand-orange font-medium'
                                            : 'bg-glass-bg/30 border-2 border-glass-border text-text-muted hover:text-text-primary hover:bg-glass-bg/50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <Mail className={`w-5 h-5 ${selectedAccount === account ? 'text-brand-orange' : 'text-text-muted'}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">
                                                {account}@
                                            </div>
                                            <div className="text-xs text-text-muted">
                                                {stats && selectedAccount === account ? `${stats.unread_count} ongelezen` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="pt-4 border-t border-glass-border space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <Inbox className="w-4 h-4" />
                                    <span className="text-sm">Totaal</span>
                                </div>
                                <span className="text-sm font-medium text-text-primary">
                                    {stats.total_count}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-brand-orange">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">Ongelezen</span>
                                </div>
                                <span className="text-sm font-medium text-brand-orange">
                                    {stats.unread_count}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <Star className="w-4 h-4" />
                                    <span className="text-sm">Met ster</span>
                                </div>
                                <span className="text-sm font-medium text-text-primary">
                                    {stats.starred_count}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Panel - Email List */}
            <div className="lg:col-span-2">
                <div className="glass-card overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-glass-border bg-white/2">
                        <h2 className="text-base md:text-lg font-display font-bold text-text-primary">
                            {accountDisplayName[selectedAccount]}
                        </h2>
                        <p className="text-sm text-text-muted">
                            {stats ? `${stats.total_count} berichten` : 'Laden...'}
                        </p>
                    </div>

                    {/* Email List */}
                    <div className="divide-y divide-glass-border max-h-[500px] overflow-y-auto">
                        {loading && (
                            <div
                                className="flex items-center justify-center py-12"
                                role="status"
                                aria-live="polite"
                            >
                                <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
                                <span className="ml-3 text-text-muted">Emails laden...</span>
                                <span className="sr-only">Email inbox wordt geladen...</span>
                            </div>
                        )}

                        {error && (
                            <div className="p-6 text-center">
                                <p className="text-red-400">{error}</p>
                                <button
                                    onClick={fetchEmails}
                                    className="mt-4 px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-lg hover:bg-brand-orange/20 transition"
                                >
                                    Opnieuw proberen
                                </button>
                            </div>
                        )}

                        {!loading && !error && emails.length === 0 && (
                            <div className="p-12 text-center">
                                <Inbox className="w-12 h-12 text-text-muted mx-auto mb-4" />
                                <p className="text-text-muted">Geen emails gevonden</p>
                            </div>
                        )}

                        {!loading && !error && emails.map((email) => (
                            <EmailListItem
                                key={email.id}
                                email={email}
                                isSelected={selectedEmail?.id === email.id}
                                onClick={() => handleEmailClick(email)}
                                aria-label={`Email from ${email.from_name || email.from_address}, subject: ${email.subject || 'No subject'}, ${email.is_read ? 'read' : 'unread'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Email Detail (if selected) */}
            {selectedEmail && (
                <div className="lg:col-span-3">
                    <EmailDetailPanel
                        email={selectedEmail}
                        onClose={() => setSelectedEmail(null)}
                        onReply={() => setShowReplyModal(true)}
                    />
                </div>
            )}

            {/* Reply Modal */}
            {showReplyModal && selectedEmail && (
                <ReplyModal
                    email={selectedEmail}
                    onClose={() => setShowReplyModal(false)}
                    onSuccess={() => {
                        setToast({ message: 'Antwoord verzonden! ✉️', type: 'success' });
                        fetchEmails();
                        fetchStats();
                    }}
                />
            )}

            {/* Compose Modal */}
            {showComposeModal && (
                <ComposeModal
                    onClose={() => setShowComposeModal(false)}
                    onSuccess={() => {
                        setToast({ message: 'Email verzonden! 🚀', type: 'success' });
                        fetchEmails();
                        fetchStats();
                    }}
                    defaultTo=""
                />
            )}

            {/* Toast Notification */}
            {toast && (
                <div
                    className="fixed bottom-6 right-6 z-50 glass-card px-6 py-4 rounded-xl shadow-2xl border-l-4
                               flex items-center gap-3 animate-slide-up"
                    style={{
                        borderLeftColor: toast.type === 'success' ? 'var(--color-brand-orange)' : '#ef4444',
                        animation: 'slideUp 0.3s ease-out'
                    }}
                >
                    {toast.type === 'success' ? (
                        <svg className="w-5 h-5 text-brand-orange shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    <span className="text-sm font-medium text-text-primary">{toast.message}</span>
                    <button
                        onClick={() => setToast(null)}
                        className="ml-2 text-text-muted hover:text-text-primary transition-colors"
                        aria-label="Close notification"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}

// EmailListItem Component
interface EmailListItemProps {
    email: Email;
    isSelected: boolean;
    onClick: () => void;
}

function EmailListItem({ email, isSelected, onClick }: EmailListItemProps) {
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Nu';
        if (diffMins < 60) return `${diffMins}m geleden`;
        if (diffHours < 24) return `${diffHours}u geleden`;
        if (diffDays < 7) return `${diffDays}d geleden`;

        return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
    };

    return (
        <button
            onClick={onClick}
            aria-label={`Email from ${email.from_name || email.from_address}, ${email.subject || 'No subject'}`}
            className={`
                w-full text-left px-6 py-4 transition-[background-color,border-color] duration-200 cursor-pointer
                ${isSelected
                    ? 'bg-brand-orange/5 border-l-2 border-brand-orange'
                    : 'hover:bg-white/3'
                }
                ${!email.is_read
                    ? 'bg-brand-orange/2 border-l-2 border-brand-orange/40'
                    : ''
                }
            `}
        >
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    {/* From */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm truncate ${!email.is_read ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                            {email.from_name || email.from_address}
                        </span>
                        <span className="text-xs text-text-muted shrink-0">
                            {formatRelativeTime(email.received_at)}
                        </span>
                    </div>

                    {/* Subject */}
                    <div className={`text-sm truncate mb-1 ${!email.is_read ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                        {email.subject || '(Geen onderwerp)'}
                    </div>

                    {/* Preview */}
                    <div className="text-xs text-text-muted line-clamp-1">
                        {email.from_address}
                    </div>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-2 shrink-0">
                    {email.has_attachments && (
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    )}
                    {email.is_starred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    {!email.is_read && (
                        <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse shadow-[0_0_8px_color-mix(in_srgb,var(--color-brand-orange),transparent_40%)]" />
                    )}
                </div>
            </div>
        </button>
    );
}

// EmailDetailPanel Component  
interface EmailDetailPanelProps {
    email: Email;
    onClose: () => void;
    onReply: () => void;
}

function EmailDetailPanel({ email, onClose, onReply }: EmailDetailPanelProps) {
    const [fullEmail, setFullEmail] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFullEmail();
    }, [email.id]);

    const fetchFullEmail = async () => {
        try {
            const response = await fetch(`/api/email/message/${email.id}`);
            if (response.ok) {
                const data = await response.json();
                setFullEmail(data);
            }
        } catch (err) {
            console.error('[EmailDetail] Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-glass-border bg-white/2 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-display font-bold text-text-primary truncate">
                        {email.subject || '(Geen onderwerp)'}
                    </h3>
                    <p className="text-sm text-text-muted">
                        Van: {email.from_name || email.from_address}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onReply}
                        aria-label="Reply to this email"
                        className="px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-lg hover:bg-brand-orange/20 transition-[background-color] duration-200 text-sm font-medium"
                    >
                        Beantwoorden
                    </button>
                    <button
                        onClick={onClose}
                        aria-label="Close email detail"
                        className="p-2 text-text-muted hover:text-text-primary transition-colors duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Attachments Section */}
            {
                !loading && fullEmail && fullEmail.attachments && fullEmail.attachments.length > 0 && (
                    <div className="px-6 py-4 border-b border-glass-border bg-white/2">
                        <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Paperclip className="w-3 h-3" />
                            Bijlagen ({fullEmail.attachments.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {fullEmail.attachments.map((att: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-glass-border rounded-lg group hover:border-brand-orange/50 transition-colors">
                                    <div className="p-2 bg-white/5 rounded-lg text-brand-orange">
                                        <Paperclip className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-text-primary truncate">
                                            {att.filename}
                                        </div>
                                        <div className="text-xs text-text-muted">
                                            {(att.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                    {att.storage_url && (
                                        <a
                                            href={att.storage_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-text-muted hover:text-brand-orange transition-colors"
                                            title="Downloaden"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Email Body */}
            <div className="p-6">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
                    </div>
                )}

                {!loading && fullEmail && (
                    <div className="prose prose-invert max-w-none">
                        {fullEmail.body_html ? (
                            <iframe
                                srcDoc={fullEmail.body_html}
                                sandbox="allow-same-origin"
                                className="w-full min-h-[400px] border-0 bg-white rounded-lg"
                                title="Email Content"
                                style={{
                                    colorScheme: 'light',
                                    height: 'auto',
                                    minHeight: '400px'
                                }}
                                onLoad={(e) => {
                                    // Auto-resize iframe to content height
                                    const iframe = e.currentTarget;
                                    try {
                                        const doc = iframe.contentDocument || iframe.contentWindow?.document;
                                        if (doc) {
                                            // Inject base styles to ensure readability
                                            const style = doc.createElement('style');
                                            style.textContent = `
                                                body {
                                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                                    padding: 1.5rem;
                                                    margin: 0;
                                                    max-width: 100%;
                                                    overflow-wrap: break-word;
                                                    word-wrap: break-word;
                                                }
                                                img { max-width: 100%; height: auto; }
                                                a { color: #3b82f6; text-decoration: underline; }
                                            `;
                                            doc.head.appendChild(style);

                                            // Resize iframe to fit content
                                            const height = doc.documentElement.scrollHeight;
                                            iframe.style.height = `${height + 20}px`;
                                        }
                                    } catch (err) {
                                        // Cross-origin or security error - keep default height
                                        console.warn('Cannot resize iframe:', err);
                                    }
                                }}
                            />
                        ) : (
                            <pre className="whitespace-pre-wrap text-text-secondary font-sans">
                                {fullEmail.body_text || '(Geen inhoud)'}
                            </pre>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
