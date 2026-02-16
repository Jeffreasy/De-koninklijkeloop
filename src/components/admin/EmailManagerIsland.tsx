import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Loader2, Mail, Inbox, Star, Plus, RefreshCw, Search } from 'lucide-react';
import ComposeModal from './ComposeModal';
import { EmailListItem } from './EmailListItem';
import { EmailDetailPanel } from './EmailDetailPanel';
import { ConvexClientProvider } from '../islands/ConvexClientProvider';
import type { Email, FullEmail, EmailStats, Account } from '../../types/email';

const EMAILS_PER_PAGE = 30;
const POLL_INTERVAL_MS = 60_000;

export default function EmailManagerIsland() {
    // State
    const [selectedAccount, setSelectedAccount] = useState<Account>('info');
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyToFullEmail, setReplyToFullEmail] = useState<FullEmail | null>(null);
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [accountStats, setAccountStats] = useState<Record<Account, EmailStats | null>>({ info: null, inschrijving: null });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Auto-dismiss toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Fetch emails when account changes — reset to page 1
    useEffect(() => {
        setPage(1);
        setEmails([]);
        setSelectedEmail(null);
        fetchEmails(1);
        fetchStats(selectedAccount);
    }, [selectedAccount]);

    // Fetch stats for both accounts on mount
    useEffect(() => {
        fetchStats('info');
        fetchStats('inschrijving');
    }, []);

    // Auto-poll inbox every 60s (visibility-aware)
    useEffect(() => {
        const startPoll = () => {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = setInterval(() => {
                fetchEmails(1);
                fetchStats(selectedAccount);
            }, POLL_INTERVAL_MS);
        };
        const stopPoll = () => {
            if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        };
        const handleVisibility = () => { document.hidden ? stopPoll() : startPoll(); };

        startPoll();
        document.addEventListener('visibilitychange', handleVisibility);
        return () => { stopPoll(); document.removeEventListener('visibilitychange', handleVisibility); };
    }, [selectedAccount]);

    // Filtered emails based on search query
    const filteredEmails = useMemo(() => {
        if (!searchQuery.trim()) return emails;
        const q = searchQuery.toLowerCase();
        return emails.filter(e =>
            (e.subject || '').toLowerCase().includes(q) ||
            (e.from_name || '').toLowerCase().includes(q) ||
            (e.from_address || '').toLowerCase().includes(q)
        );
    }, [emails, searchQuery]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchEmails(1);
        await fetchStats(selectedAccount);
        setRefreshing(false);
    };

    const fetchEmails = async (fetchPage: number = 1) => {
        if (fetchPage === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        setError(null);

        try {
            const response = await fetch(
                `/api/email/inbox/${selectedAccount}?page=${fetchPage}&per_page=${EMAILS_PER_PAGE}&archived=false`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch emails: ${response.statusText}`);
            }

            const data = await response.json();
            const fetched = data.emails || [];

            if (fetchPage === 1) {
                setEmails(fetched);
            } else {
                setEmails(prev => [...prev, ...fetched]);
            }
            setHasMore(fetched.length === EMAILS_PER_PAGE);
            setPage(fetchPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load emails');
            if (import.meta.env.DEV) console.error('[EmailManager] Fetch error:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchStats = async (account: Account) => {
        try {
            const response = await fetch(`/api/email/inbox/${account}/stats`);
            if (response.ok) {
                const data = await response.json();
                setAccountStats(prev => ({ ...prev, [account]: data }));
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error('[EmailManager] Stats fetch error:', err);
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
                fetchStats(selectedAccount);
            } catch (err) {
                if (import.meta.env.DEV) console.error('[EmailManager] Mark as read error:', err);
            }
        }
    };

    const handleMarkUnread = useCallback(async (emailId: string) => {
        try {
            await fetch(`/api/email/message/${emailId}/read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_read: false })
            });
            setEmails(prev => prev.map(e =>
                e.id === emailId ? { ...e, is_read: false } : e
            ));
            setSelectedEmail(prev => prev?.id === emailId ? { ...prev, is_read: false } : prev);
            fetchStats(selectedAccount);
            setToast({ message: 'Gemarkeerd als ongelezen', type: 'success' });
        } catch (err) {
            if (import.meta.env.DEV) console.error('[EmailManager] Mark unread error:', err);
            setToast({ message: 'Kon niet markeren als ongelezen', type: 'error' });
        }
    }, [selectedAccount]);

    const handleToggleStar = useCallback(async (emailId: string, currentStarred: boolean) => {
        try {
            await fetch(`/api/email/message/${emailId}/star`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_starred: !currentStarred })
            });
            setEmails(prev => prev.map(e =>
                e.id === emailId ? { ...e, is_starred: !currentStarred } : e
            ));
            setSelectedEmail(prev => prev?.id === emailId ? { ...prev, is_starred: !currentStarred } : prev);
            fetchStats(selectedAccount);
        } catch (err) {
            if (import.meta.env.DEV) console.error('[EmailManager] Star toggle error:', err);
            setToast({ message: 'Ster wijzigen mislukt', type: 'error' });
        }
    }, [selectedAccount]);

    const handleArchive = useCallback(async (emailId: string) => {
        try {
            await fetch(`/api/email/message/${emailId}/archive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            setEmails(prev => prev.filter(e => e.id !== emailId));
            if (selectedEmail?.id === emailId) setSelectedEmail(null);
            fetchStats(selectedAccount);
            setToast({ message: 'Email gearchiveerd', type: 'success' });
        } catch (err) {
            if (import.meta.env.DEV) console.error('[EmailManager] Archive error:', err);
            setToast({ message: 'Archiveren mislukt', type: 'error' });
        }
    }, [selectedAccount, selectedEmail]);

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
                            className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-brand-orange text-white font-medium rounded-xl hover:bg-orange-400 transition-colors shadow-lg shadow-brand-orange/20 cursor-pointer min-h-[44px]"
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
                                                {accountStats[account] ? `${accountStats[account]!.unread_count} ongelezen` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    {accountStats[selectedAccount] && (
                        <div className="pt-4 border-t border-glass-border space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <Inbox className="w-4 h-4" />
                                    <span className="text-sm">Totaal</span>
                                </div>
                                <span className="text-sm font-medium text-text-primary">
                                    {accountStats[selectedAccount]!.total_count}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-brand-orange">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">Ongelezen</span>
                                </div>
                                <span className="text-sm font-medium text-brand-orange">
                                    {accountStats[selectedAccount]!.unread_count}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <Star className="w-4 h-4" />
                                    <span className="text-sm">Met ster</span>
                                </div>
                                <span className="text-sm font-medium text-text-primary">
                                    {accountStats[selectedAccount]!.starred_count}
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
                    <div className="px-6 py-4 border-b border-glass-border bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="text-base md:text-lg font-display font-bold text-text-primary">
                                    {accountDisplayName[selectedAccount]}
                                </h2>
                                <p className="text-sm text-text-muted">
                                    {accountStats[selectedAccount] ? `${accountStats[selectedAccount]!.total_count} berichten` : 'Laden...'}
                                </p>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2.5 text-text-muted hover:text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                                aria-label="Inbox vernieuwen"
                                title="Inbox vernieuwen"
                            >
                                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Zoek in emails..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-glass-bg border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:border-brand-orange transition-[border-color,box-shadow] duration-200"
                                aria-label="Zoek emails op onderwerp of afzender"
                            />
                        </div>
                    </div>

                    {/* Email List */}
                    <div className="divide-y divide-glass-border max-h-[500px] overflow-y-auto">
                        {loading && (
                            <div role="status" aria-live="polite">
                                <span className="sr-only">Email inbox wordt geladen...</span>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="px-6 py-4 animate-pulse">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-glass-border rounded-full shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-glass-border rounded w-1/3" />
                                                <div className="h-3 bg-glass-border rounded w-2/3" />
                                                <div className="h-3 bg-glass-border rounded w-1/4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="p-6 text-center">
                                <p className="text-red-400">{error}</p>
                                <button
                                    onClick={() => fetchEmails(1)}
                                    className="mt-4 px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-lg hover:bg-brand-orange/20 transition"
                                >
                                    Opnieuw proberen
                                </button>
                            </div>
                        )}

                        {!loading && !error && emails.length === 0 && (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                                    <Inbox className="w-8 h-8 text-brand-orange" />
                                </div>
                                <p className="text-lg font-medium text-text-primary mb-1">Inbox is leeg</p>
                                <p className="text-sm text-text-muted">
                                    Er zijn nog geen emails voor {accountDisplayName[selectedAccount]}
                                </p>
                                <button
                                    onClick={handleRefresh}
                                    className="mt-4 px-4 py-2 text-sm text-brand-orange bg-brand-orange/10 rounded-lg hover:bg-brand-orange/20 transition-colors cursor-pointer"
                                >
                                    Vernieuwen
                                </button>
                            </div>
                        )}

                        {!loading && !error && filteredEmails.map((email) => (
                            <EmailListItem
                                key={email.id}
                                email={email}
                                isSelected={selectedEmail?.id === email.id}
                                onClick={() => handleEmailClick(email)}
                            />
                        ))}

                        {/* Search: no results */}
                        {!loading && !error && emails.length > 0 && filteredEmails.length === 0 && (
                            <div className="p-8 text-center">
                                <Search className="w-8 h-8 text-text-muted mx-auto mb-3" />
                                <p className="text-sm text-text-muted">
                                    Geen resultaten voor “{searchQuery}”
                                </p>
                            </div>
                        )}

                        {/* Load More */}
                        {hasMore && !loading && !error && (
                            <div className="p-4 border-t border-glass-border">
                                <button
                                    onClick={() => fetchEmails(page + 1)}
                                    disabled={loadingMore}
                                    className="w-full py-3 text-sm font-medium text-brand-orange bg-brand-orange/5 hover:bg-brand-orange/10 rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Laden...
                                        </>
                                    ) : (
                                        'Meer laden'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel - Email Detail (if selected) */}
            {selectedEmail && (
                <div className="lg:col-span-3">
                    <EmailDetailPanel
                        email={selectedEmail}
                        onClose={() => setSelectedEmail(null)}
                        onReply={(fullEmail) => { setReplyToFullEmail(fullEmail); setShowReplyModal(true); }}
                        onMarkUnread={() => handleMarkUnread(selectedEmail.id)}
                        onToggleStar={() => handleToggleStar(selectedEmail.id, selectedEmail.is_starred)}
                        onArchive={() => handleArchive(selectedEmail.id)}
                    />
                </div>
            )}

            {/* Reply Modal (unified ComposeModal in reply mode) */}
            {showReplyModal && replyToFullEmail && (
                <ConvexClientProvider>
                    <ComposeModal
                        mode="reply"
                        replyToEmail={replyToFullEmail}
                        onClose={() => { setShowReplyModal(false); setReplyToFullEmail(null); }}
                        onSuccess={() => {
                            setToast({ message: 'Antwoord verzonden', type: 'success' });
                            fetchEmails();
                            fetchStats(selectedAccount);
                        }}
                    />
                </ConvexClientProvider>
            )}

            {/* Compose Modal (wrapped in Convex for contact picker) */}
            {showComposeModal && (
                <ConvexClientProvider>
                    <ComposeModal
                        onClose={() => setShowComposeModal(false)}
                        onSuccess={() => {
                            setToast({ message: 'Email verzonden', type: 'success' });
                            fetchEmails();
                            fetchStats(selectedAccount);
                        }}
                        defaultTo=""
                    />
                </ConvexClientProvider>
            )}


            {/* Toast Notification */}
            {toast && (
                <div
                    className="fixed bottom-6 right-6 z-50 glass-card px-6 py-4 rounded-xl shadow-2xl border-l-4
                               flex items-center gap-3 animate-slide-up"
                    style={{
                        borderLeftColor: toast.type === 'success' ? 'var(--color-brand-orange)' : '#ef4444'
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
