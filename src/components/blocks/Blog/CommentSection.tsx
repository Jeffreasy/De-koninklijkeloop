import { useState, useEffect, useCallback } from "react";
import { Loader2, Send, MessageCircle, Reply, User } from "lucide-react";

interface Comment {
    id: string;
    author_name: string;
    content: string;
    parent_id: string | null;
    created_at: number;
    replies?: Comment[];
}

interface Props {
    slug: string;
    postId: string;
}

export default function CommentSection({ slug, postId }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    // Form
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [content, setContent] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [honeypot, setHoneypot] = useState("");

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/blog/comments?status=approved&post_id=${postId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments || []);
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error("[Comments]", err);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Honeypot: if filled, silently drop (bots auto-fill hidden fields)
        if (honeypot) { setSubmitted(true); return; }
        setSubmitting(true);
        try {
            const res = await fetch(`/api/blog/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    post_id: postId,
                    author_name: name,
                    author_email: email || undefined,
                    content,
                    parent_id: replyTo || undefined,
                }),
            });
            if (res.ok) {
                setSubmitted(true);
                setContent("");
                setReplyTo(null);
                setTimeout(() => setSubmitted(false), 5000);
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error("[Comments]", err);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (ts: number | string) =>
        new Date(typeof ts === 'number' ? ts : ts).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });

    const renderComment = (comment: Comment, depth = 0) => (
        <div key={comment.id} className={`${depth > 0 ? "ml-4 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-glass-border/30" : ""}`}>
            <div className="glass-card p-4 mb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-brand-orange" />
                        </div>
                        <span className="text-sm font-semibold text-text-primary">{comment.author_name}</span>
                    </div>
                    <time className="text-xs text-text-muted">{formatDate(comment.created_at)}</time>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
                <button
                    onClick={() => setReplyTo(comment.id)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-orange transition-colors cursor-pointer min-h-[44px] py-2"
                >
                    <Reply className="w-3 h-3" /> Reageren
                </button>
            </div>
            {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Comment Form */}
            <div className="glass-card p-6">
                {submitted ? (
                    <div className="text-center py-4">
                        <div className="w-12 h-12 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                            <MessageCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-sm font-medium text-green-400">Bedankt voor je reactie!</p>
                        <p className="text-xs text-text-muted mt-1">Je reactie wordt beoordeeld voordat deze zichtbaar wordt.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-base font-display font-bold text-text-primary">
                            {replyTo ? "Antwoord schrijven" : "Reactie plaatsen"}
                        </h3>
                        {replyTo && (
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                <Reply className="w-3 h-3" />
                                Reageren op bericht
                                <button onClick={() => setReplyTo(null)} className="text-brand-orange hover:underline cursor-pointer min-h-[44px] py-2 px-2">
                                    Annuleren
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                                aria-label="Jouw naam"
                                className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-base sm:text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all"
                                placeholder="Jouw naam *" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                aria-label="E-mailadres"
                                className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-base sm:text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all"
                                placeholder="E-mail (optioneel)" />
                        </div>
                        {/* Honeypot — hidden from humans, catches bots */}
                        <input
                            type="text"
                            name="website"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            autoComplete="off"
                            tabIndex={-1}
                            aria-hidden="true"
                            style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
                        />
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} required
                            aria-label="Reactie"
                            className="w-full px-4 py-3 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-base sm:text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all resize-none"
                            rows={3} placeholder="Schrijf je reactie..." />
                        <button type="submit" disabled={submitting || !name || !content}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer disabled:opacity-50 text-sm"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Plaatsen
                        </button>
                    </form>
                )}
            </div>

            {/* Comments List */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center text-text-muted py-6 text-sm">
                    Nog geen reacties. Wees de eerste!
                </p>
            ) : (
                <div className="space-y-2">
                    {comments.map((comment) => renderComment(comment))}
                </div>
            )}
        </div>
    );
}
