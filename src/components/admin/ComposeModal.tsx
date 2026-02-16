import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { AdminModal } from './AdminModal';

interface ComposeModalProps {
    onClose: () => void;
    onSuccess: () => void;
    defaultTo?: string;
}

export default function ComposeModal({ onClose, onSuccess, defaultTo = '' }: ComposeModalProps) {
    const [to, setTo] = useState(defaultTo);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async () => {
        if (!to.trim() || !subject.trim() || !body.trim()) {
            setError('Alle velden zijn verplicht');
            return;
        }

        setSending(true);
        setError(null);

        try {
            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: to.trim(),
                    subject: subject.trim(),
                    body: body.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to send email: ${response.statusText}`);
            }

            // Success
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kan email niet verzenden');
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminModal
            isOpen={true}
            onClose={onClose}
            title="Nieuw Bericht"
            size="2xl"
            showFooter={false}
        >
            {/* Form */}
            <div className="space-y-5">
                {/* To */}
                <div>
                    <label htmlFor="compose-to" className="block text-sm font-medium text-text-secondary mb-2">
                        Aan <span className="text-red-400">*</span>
                    </label>
                    <input
                        id="compose-to"
                        type="email"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="w-full px-4 py-2.5 bg-glass-bg border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:border-brand-orange transition-[border-color,box-shadow] duration-200"
                        placeholder="ontvanger@example.com"
                        disabled={sending}
                        aria-required="true"
                    />
                </div>

                {/* Subject */}
                <div>
                    <label htmlFor="compose-subject" className="block text-sm font-medium text-text-secondary mb-2">
                        Onderwerp <span className="text-red-400">*</span>
                    </label>
                    <input
                        id="compose-subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2.5 bg-glass-bg border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:border-brand-orange transition-[border-color,box-shadow] duration-200"
                        placeholder="Onderwerp..."
                        disabled={sending}
                        aria-required="true"
                    />
                </div>

                {/* Body */}
                <div>
                    <label htmlFor="compose-body" className="block text-sm font-medium text-text-secondary mb-2">
                        Bericht <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        id="compose-body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={12}
                        className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:border-brand-orange resize-y min-h-[200px] transition-[border-color,box-shadow] duration-200"
                        placeholder="Typ hier je bericht..."
                        disabled={sending}
                        aria-required="true"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-[rgb(var(--error))]/10 border border-[rgb(var(--error))]/30 rounded-xl">
                        <p className="text-sm text-[rgb(var(--error))]">{error}</p>
                    </div>
                )}
            </div>

            {/* Custom Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
                <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-glass-border rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
                    disabled={sending}
                >
                    Annuleren
                </button>
                <button
                    onClick={handleSend}
                    disabled={sending || !body.trim() || !to.trim() || !subject.trim()}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-brand-orange hover:bg-orange-400 disabled:bg-glass-border disabled:text-text-muted disabled:cursor-not-allowed rounded-xl transition-[background-color,opacity] duration-200 flex items-center gap-2 shadow-lg shadow-brand-orange/20 min-h-[44px] cursor-pointer"
                    aria-label={sending ? "Email wordt verzonden..." : "Email versturen"}
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
        </AdminModal>
    );
}
