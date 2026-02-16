import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, ChevronDown, Bold, Italic, Link2, List, ListOrdered, AlertCircle, Sparkles, Reply, ChevronRight } from 'lucide-react';
import { AdminModal } from './AdminModal';
import ContactPicker, { type Recipient } from './ContactPicker';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { FullEmail, Account } from '../../types/email';

interface ComposeModalProps {
    onClose: () => void;
    onSuccess: () => void;
    defaultTo?: string;
    /** When set to 'reply', pre-fills from replyToEmail and shows thread quote */
    mode?: 'compose' | 'reply';
    /** The full email being replied to (required when mode='reply') */
    replyToEmail?: FullEmail;
}

const ACCOUNTS = [
    { value: 'info', label: 'info@dekoninklijkeloop.nl' },
    { value: 'inschrijving', label: 'inschrijving@dekoninklijkeloop.nl' },
] as const;

const MAX_BODY_LENGTH = 10_000;

const AI_TONES = [
    { value: 'formal', label: 'Formeel', desc: 'Zakelijk, "u"-vorm' },
    { value: 'warm', label: 'Warm', desc: 'Persoonlijk, "je"-vorm' },
    { value: 'informative', label: 'Informatief', desc: 'Feitelijk, beknopt' },
] as const;

type AiTone = typeof AI_TONES[number]['value'];

export default function ComposeModal({ onClose, onSuccess, defaultTo = '', mode = 'compose', replyToEmail }: ComposeModalProps) {
    const isReply = mode === 'reply' && !!replyToEmail;

    // Pre-fill recipients from original sender when replying
    const initialRecipients = (): Recipient[] => {
        if (isReply) {
            return [{ email: replyToEmail.from_address, naam: replyToEmail.from_name, isManual: true }];
        }
        return defaultTo ? [{ email: defaultTo, isManual: true }] : [];
    };

    const [fromAccount, setFromAccount] = useState<Account>(ACCOUNTS[0].value);
    const [recipients, setRecipients] = useState<Recipient[]>(initialRecipients);
    const [subject, setSubject] = useState(isReply ? `Re: ${replyToEmail.subject}` : '');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bodyRef = useRef<HTMLTextAreaElement>(null);
    const logSend = useMutation(api.prCommunicatie.logSend);
    const [showThreadQuote, setShowThreadQuote] = useState(false);

    // AI Smart Compose state
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [aiTone, setAiTone] = useState<AiTone>('formal');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [previousBody, setPreviousBody] = useState<string | null>(null);

    // Build thread context for AI (original email body truncated to 3000 chars)
    const threadContext = isReply ? (() => {
        const original = replyToEmail.body_text || replyToEmail.body_html?.replace(/<[^>]+>/g, '') || '';
        const truncated = original.slice(0, 3000);
        return `ORIGINEEL BERICHT:\nVan: ${replyToEmail.from_name || ''} (${replyToEmail.from_address})\nOnderwerp: ${replyToEmail.subject}\nDatum: ${new Date(replyToEmail.received_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}\n---\n${truncated}${original.length > 3000 ? '\n[...]' : ''}`;
    })() : undefined;

    // Auto-focus body in reply mode, subject in compose mode
    useEffect(() => {
        if (isReply) {
            bodyRef.current?.focus();
        }
    }, []);

    const charCount = body.length;
    const isOverLimit = charCount > MAX_BODY_LENGTH;
    const canSend = recipients.length > 0 && subject.trim() && body.trim() && !isOverLimit;

    const insertFormatting = (prefix: string, suffix: string = prefix) => {
        const textarea = bodyRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = body.substring(start, end);
        const replacement = `${prefix}${selected || 'tekst'}${suffix}`;
        const newBody = body.substring(0, start) + replacement + body.substring(end);
        setBody(newBody);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected || 'tekst').length);
        }, 0);
    };

    // AI Smart Compose handler
    const handleAiGenerate = useCallback(async () => {
        if (!subject.trim()) {
            setAiError('Vul eerst een onderwerp in');
            return;
        }
        setAiGenerating(true);
        setAiError(null);
        setPreviousBody(body); // Save for undo
        try {
            const res = await fetch('/api/admin/email/generate-draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: subject.trim(),
                    tone: aiTone,
                    ...(threadContext ? { threadContext, mode: 'reply' } : {}),
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Generatie mislukt (${res.status})`);
            }
            const data = await res.json();
            setBody(data.draft);
            setShowAiPanel(false);
        } catch (err) {
            setAiError(err instanceof Error ? err.message : 'AI generatie mislukt');
        } finally {
            setAiGenerating(false);
        }
    }, [subject, aiTone, body, threadContext]);

    const handleAiUndo = () => {
        if (previousBody !== null) {
            setBody(previousBody);
            setPreviousBody(null);
        }
    };

    const handleSend = async () => {
        if (!canSend) {
            setError('Vul alle verplichte velden in');
            return;
        }

        setSending(true);
        setError(null);

        const toEmails = recipients.map(r => r.email.trim()).join(', ');

        try {
            // Reply uses dedicated reply endpoint, compose uses send endpoint
            const endpoint = isReply
                ? `/api/email/message/${replyToEmail!.id}/reply`
                : '/api/email/send';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(isReply ? {} : { to: toEmails }),
                    from: fromAccount,
                    subject: subject.trim(),
                    body: body.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Verzenden mislukt (${response.status})`);
            }

            // Log to Convex send history (best-effort)
            try {
                await logSend({
                    onderwerp: subject.trim(),
                    segment: isReply ? 'email-reply' : 'email-compose',
                    aantalOntvangers: recipients.length,
                    emailLijst: recipients.map(r => r.email),
                    verzondenDoor: `${fromAccount}@dekoninklijkeloop.nl`,
                });
            } catch {
                // Best-effort: don't block email success on Convex log failure
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kan email niet verzenden');
        } finally {
            setSending(false);
        }
    };

    // Ctrl/Cmd+Enter to send
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canSend && !sending) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <AdminModal
            isOpen={true}
            onClose={onClose}
            title={isReply ? 'Beantwoorden' : 'Nieuw Bericht'}
            size="4xl"
            showFooter={false}
        >
            <div className="space-y-0" onKeyDown={handleKeyDown}>
                {/* From Account Selector */}
                <div className="flex items-center gap-3 py-3 border-b border-glass-border">
                    <label className="text-sm font-medium text-text-muted w-16 shrink-0">Van</label>
                    <div className="relative flex-1">
                        <select
                            value={fromAccount}
                            onChange={(e) => setFromAccount(e.target.value as Account)}
                            disabled={sending}
                            className="w-full appearance-none bg-glass-bg/50 border border-glass-border rounded-lg px-3 py-2 pr-8 text-sm text-text-primary cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 transition-[border-color,box-shadow] duration-200"
                            aria-label="Afzender account"
                        >
                            {ACCOUNTS.map(acc => (
                                <option key={acc.value} value={acc.value}>{acc.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    </div>
                </div>

                {/* To Field — Contact Picker */}
                <div className="flex items-start gap-3 py-3 border-b border-glass-border">
                    <label htmlFor="compose-to" className="text-sm font-medium text-text-muted w-16 shrink-0 pt-1.5">
                        Aan
                    </label>
                    <div className="flex-1">
                        <ContactPicker
                            recipients={recipients}
                            onChange={(r) => { setRecipients(r); setError(null); }}
                            disabled={sending}
                            id="compose-to"
                        />
                    </div>
                </div>


                {/* Subject */}
                <div className="flex items-center gap-3 py-3 border-b border-glass-border">
                    <label htmlFor="compose-subject" className="text-sm font-medium text-text-muted w-16 shrink-0">
                        Onderwerp
                    </label>
                    <input
                        id="compose-subject"
                        type="text"
                        value={subject}
                        onChange={(e) => { setSubject(e.target.value); setError(null); }}
                        className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none py-1 font-medium"
                        placeholder="Onderwerp van je email..."
                        disabled={sending}
                        aria-required="true"
                    />
                </div>

                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 py-2 border-b border-glass-border">
                    <button
                        type="button"
                        onClick={() => insertFormatting('**')}
                        className="p-2 text-text-muted hover:text-text-primary hover:bg-glass-border/50 rounded-lg transition-colors cursor-pointer"
                        title="Vet (Ctrl+B)"
                        aria-label="Vet"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting('_')}
                        className="p-2 text-text-muted hover:text-text-primary hover:bg-glass-border/50 rounded-lg transition-colors cursor-pointer"
                        title="Cursief (Ctrl+I)"
                        aria-label="Cursief"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-glass-border mx-1" />
                    <button
                        type="button"
                        onClick={() => insertFormatting('[', '](https://)')}
                        className="p-2 text-text-muted hover:text-text-primary hover:bg-glass-border/50 rounded-lg transition-colors cursor-pointer"
                        title="Link invoegen"
                        aria-label="Link"
                    >
                        <Link2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting('- ', '')}
                        className="p-2 text-text-muted hover:text-text-primary hover:bg-glass-border/50 rounded-lg transition-colors cursor-pointer"
                        title="Opsomming"
                        aria-label="Opsomming"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting('1. ', '')}
                        className="p-2 text-text-muted hover:text-text-primary hover:bg-glass-border/50 rounded-lg transition-colors cursor-pointer"
                        title="Genummerde lijst"
                        aria-label="Genummerde lijst"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>

                    {/* AI divider + button */}
                    <div className="w-px h-5 bg-glass-border mx-1" />
                    <button
                        type="button"
                        onClick={() => setShowAiPanel(!showAiPanel)}
                        disabled={sending || aiGenerating}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${showAiPanel
                            ? 'bg-brand-orange/15 text-brand-orange border border-brand-orange/30'
                            : 'text-text-muted hover:text-brand-orange hover:bg-brand-orange/10'
                            }`}
                        title="AI Schrijfassistent"
                        aria-label="AI Schrijfassistent"
                        aria-expanded={showAiPanel}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">AI Assist</span>
                    </button>

                    {/* Undo AI button */}
                    {previousBody !== null && (
                        <button
                            type="button"
                            onClick={handleAiUndo}
                            className="px-2 py-1.5 text-xs text-text-muted hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors cursor-pointer"
                            title="AI concept ongedaan maken"
                            aria-label="AI concept ongedaan maken"
                        >
                            Undo AI
                        </button>
                    )}
                </div>

                {/* AI Smart Compose Panel */}
                {showAiPanel && (
                    <div className="p-4 border-b border-glass-border bg-brand-orange/5 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-brand-orange" />
                                AI Schrijfassistent
                            </p>
                            {!subject.trim() && (
                                <p className="text-xs text-amber-400">Vul eerst een onderwerp in</p>
                            )}
                        </div>

                        {/* Tone selector pills */}
                        <div className="flex gap-2">
                            {AI_TONES.map(tone => (
                                <button
                                    key={tone.value}
                                    type="button"
                                    onClick={() => setAiTone(tone.value)}
                                    className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 cursor-pointer flex-1 text-center ${aiTone === tone.value
                                        ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/25'
                                        : 'bg-glass-bg/50 text-text-muted hover:bg-glass-border/50 border border-glass-border'
                                        }`}
                                >
                                    <span className="font-medium block">{tone.label}</span>
                                    <span className={`text-[10px] block mt-0.5 ${aiTone === tone.value ? 'text-white/80' : 'text-text-muted/60'}`}>
                                        {tone.desc}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* AI error */}
                        {aiError && (
                            <p className="text-xs text-red-400 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {aiError}
                            </p>
                        )}

                        {/* Generate button */}
                        <button
                            type="button"
                            onClick={handleAiGenerate}
                            disabled={aiGenerating || !subject.trim()}
                            className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-brand-orange hover:bg-orange-400 disabled:bg-glass-border disabled:text-text-muted disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20 min-h-[44px] cursor-pointer"
                        >
                            {aiGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Genereren...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Genereer Concept
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="pt-3">
                    <textarea
                        ref={bodyRef}
                        id="compose-body"
                        value={body}
                        onChange={(e) => { setBody(e.target.value); setError(null); }}
                        rows={14}
                        className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none resize-none min-h-[280px] leading-relaxed"
                        placeholder="Typ hier je bericht...

Je kunt **vet**, _cursief_ en [links](url) gebruiken."
                        disabled={sending}
                        aria-required="true"
                        aria-describedby="char-count"
                    />
                </div>

                {/* Thread Quote (reply mode only) */}
                {isReply && replyToEmail && (
                    <div className="border-t border-glass-border">
                        <button
                            type="button"
                            onClick={() => setShowThreadQuote(!showThreadQuote)}
                            className="w-full flex items-center gap-2 px-1 py-2.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            aria-expanded={showThreadQuote}
                        >
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showThreadQuote ? 'rotate-90' : ''}`} />
                            <Reply className="w-3.5 h-3.5" />
                            <span>
                                {replyToEmail.from_name || replyToEmail.from_address}
                                {' — '}
                                {new Date(replyToEmail.received_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </button>
                        {showThreadQuote && (
                            <div className="pl-6 pr-2 pb-3 border-l-2 border-brand-orange/30 ml-2 text-xs text-text-muted leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                                {replyToEmail.body_text || replyToEmail.body_html?.replace(/<[^>]+>/g, '') || '(Geen inhoud)'}
                            </div>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                    <div className="flex items-center gap-3">
                        <span
                            id="char-count"
                            className={`text-xs font-mono tabular-nums ${isOverLimit ? 'text-red-400 font-medium' : charCount > MAX_BODY_LENGTH * 0.9 ? 'text-amber-400' : 'text-text-muted'
                                }`}
                        >
                            {charCount.toLocaleString()}/{MAX_BODY_LENGTH.toLocaleString()}
                        </span>
                        <span className="text-xs text-text-muted hidden sm:inline">
                            Ctrl+Enter om te versturen
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-glass-border/50 rounded-xl transition-colors min-h-[44px] cursor-pointer"
                            disabled={sending}
                        >
                            Annuleren
                        </button>
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={sending || !canSend}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-orange hover:bg-orange-400 disabled:bg-glass-border disabled:text-text-muted disabled:cursor-not-allowed rounded-xl transition-[background-color,opacity] duration-200 flex items-center gap-2 shadow-lg shadow-brand-orange/20 min-h-[44px] cursor-pointer"
                            aria-label={sending ? 'Email wordt verzonden...' : 'Email versturen'}
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verzenden...
                                </>
                            ) : (
                                <>
                                    {isReply ? <Reply className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                    {isReply ? 'Beantwoorden' : 'Versturen'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AdminModal>
    );
}
