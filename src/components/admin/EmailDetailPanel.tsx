import { useState, useEffect } from 'react';
import { Loader2, Paperclip, Download, X, AlertCircle } from 'lucide-react';
import type { Email, FullEmail } from '../../types/email';

interface EmailDetailPanelProps {
    email: Email;
    onClose: () => void;
    onReply: () => void;
}

export function EmailDetailPanel({ email, onClose, onReply }: EmailDetailPanelProps) {
    const [fullEmail, setFullEmail] = useState<FullEmail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setFullEmail(null);
        setError(null);
        fetchFullEmail();
    }, [email.id]);

    const fetchFullEmail = async () => {
        try {
            const response = await fetch(`/api/email/message/${email.id}`);
            if (!response.ok) {
                setError(`Kan email niet laden (${response.status})`);
                return;
            }
            const data = await response.json();
            setFullEmail(data);
        } catch (err) {
            setError('Kan email niet laden');
            if (import.meta.env.DEV) console.error('[EmailDetail] Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-glass-border bg-white/5 flex items-center justify-between">
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
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Attachments Section */}
            {
                !loading && fullEmail && Array.isArray(fullEmail.attachments) && fullEmail.attachments.length > 0 && (
                    <div className="px-6 py-4 border-b border-glass-border bg-white/5">
                        <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Paperclip className="w-3 h-3" />
                            Bijlagen ({fullEmail.attachments.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {fullEmail.attachments.map((att, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-glass-border rounded-lg group hover:border-brand-orange/50 transition-colors cursor-pointer">
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
                    <div className="prose dark:prose-invert max-w-none">
                        {fullEmail.body_html ? (
                            <iframe
                                srcDoc={fullEmail.body_html}
                                sandbox="allow-popups allow-popups-to-escape-sandbox"
                                className="w-full min-h-[400px] border-0 bg-white rounded-lg"
                                title="Email Content"
                                style={{
                                    colorScheme: 'light',
                                    height: 'auto',
                                    minHeight: '400px'
                                }}
                                onLoad={(e) => {
                                    const iframe = e.currentTarget;
                                    try {
                                        const doc = iframe.contentDocument || iframe.contentWindow?.document;
                                        if (doc) {
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

                                            const height = doc.documentElement.scrollHeight;
                                            iframe.style.height = `${height + 20}px`;
                                        }
                                    } catch (err) {
                                        // Cross-origin or security error — keep default height
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

            {/* Error State */}
            {!loading && error && (
                <div className="p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                    <p className="text-sm text-red-400">{error}</p>
                    <button
                        onClick={() => { setError(null); setLoading(true); fetchFullEmail(); }}
                        className="mt-3 px-4 py-2 text-sm text-brand-orange bg-brand-orange/10 rounded-lg hover:bg-brand-orange/20 transition-colors cursor-pointer"
                    >
                        Opnieuw proberen
                    </button>
                </div>
            )}
        </div>
    );
}
