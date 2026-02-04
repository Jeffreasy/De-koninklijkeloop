import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';

interface Email {
    id: string;
    subject: string;
    from_address: string;
    from_name?: string;
}

interface ReplyModalProps {
    email: Email;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReplyModal({ email, onClose, onSuccess }: ReplyModalProps) {
    const [subject, setSubject] = useState(`Re: ${email.subject}`);
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async () => {
        if (!body.trim()) {
            setError('Email body cannot be empty');
            return;
        }

        setSending(true);
        setError(null);

        try {
            const response = await fetch(`/api/email/message/${email.id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: subject.trim(),
                    body: body.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to send reply: ${response.statusText}`);
            }

            // Success
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reply-modal-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="relative w-full max-w-2xl max-h-[90vh] bg-surface border border-glass-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-glass-border bg-surface">
                    <div>
                        <h2 id="reply-modal-title" className="text-xl font-semibold text-white">
                            Beantwoorden
                        </h2>
                        <p className="text-sm text-text-secondary mt-1">
                            Aan: {email.from_name || email.from_address}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-glass-border rounded-lg transition-colors"
                        disabled={sending}
                        aria-label="Sluiten"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-surface">
                    {/* Subject */}
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-text-secondary mb-2">
                            Onderwerp
                        </label>
                        <input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2.5 bg-glass-bg border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:border-accent-primary transition-[border-color,box-shadow] duration-200"
                            placeholder="Re: ..."
                            disabled={sending}
                            aria-required="false"
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-text-secondary mb-2">
                            Bericht <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={12}
                            className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:border-accent-primary resize-y min-h-[200px] transition-[border-color,box-shadow] duration-200"
                            placeholder="Typ hier je antwoord..."
                            disabled={sending}
                            aria-required="true"
                            aria-invalid={!body.trim() && body.length > 0}
                        />
                        <p className="text-xs text-text-muted mt-2">
                            {body.length} tekens
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-glass-border bg-body">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-glass-border rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={sending}
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending || !body.trim()}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary/90 disabled:bg-glass-border disabled:text-text-muted disabled:cursor-not-allowed rounded-xl transition-[background-color,opacity] duration-200 flex items-center gap-2 shadow-lg shadow-accent-primary/20"
                        aria-label={sending ? "Sending reply..." : "Send reply"}
                    >
                        {sending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verzenden...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Versturen
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
