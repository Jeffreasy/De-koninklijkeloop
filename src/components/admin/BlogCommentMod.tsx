import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../../lib/api";
import { Loader2, CheckCircle, XCircle, Trash2, MessageCircle, Filter } from "lucide-react";

interface Comment {
    id: string;
    post_id: string;
    post_title?: string;
    author_name: string;
    author_email: string | null;
    content: string;
    status: string;
    parent_id: string | null;
    created_at: string;
}

type CommentFilter = "pending" | "approved" | "rejected";

interface Props {
    onCountChange: (count: number) => void;
}

export default function BlogCommentMod({ onCountChange }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<CommentFilter>("pending");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiRequest(`/blog/comments?status=${filter}&limit=50`);
            setComments(data.comments || []);
            if (filter === "pending") {
                onCountChange(data.total || 0);
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error("[BlogComments]", err);
        } finally {
            setLoading(false);
        }
    }, [filter, onCountChange]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleAction = async (id: string, action: "approve" | "reject" | "delete") => {
        setActionLoading(id);
        try {
            if (action === "delete") {
                await apiRequest(`/blog/comments/${id}`, { method: "DELETE" });
            } else {
                await apiRequest(`/blog/comments/${id}/${action}`, { method: "PATCH" });
            }
            fetchComments();
        } catch (err) {
            if (import.meta.env.DEV) console.error("[BlogComments]", err);
        } finally {
            setActionLoading(null);
        }
    };

    const FILTERS: { value: CommentFilter; label: string }[] = [
        { value: "pending", label: "In afwachting" },
        { value: "approved", label: "Goedgekeurd" },
        { value: "rejected", label: "Afgewezen" },
    ];

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center gap-4">
                <Filter className="w-4 h-4 text-text-muted shrink-0" />
                <div className="overflow-x-auto">
                    <div className="flex gap-1 p-1 rounded-xl bg-glass-border/20 min-w-max">
                        {FILTERS.map((f) => (
                            <button key={f.value} onClick={() => setFilter(f.value)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${filter === f.value
                                    ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                                    : "text-text-muted hover:text-text-primary hover:bg-glass-border/30"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comments List */}
            {loading ? (
                <div className="space-y-3 animate-pulse" aria-hidden="true">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass-card p-4 h-[140px]" />
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <div className="glass-card p-8 text-center">
                    <MessageCircle className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                    <p className="text-text-muted">Geen reacties met status "{FILTERS.find((f) => f.value === filter)?.label}"</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment) => (
                        <div key={comment.id} className="glass-card p-4 space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">{comment.author_name}</p>
                                    {comment.author_email && (
                                        <p className="text-xs text-text-muted">{comment.author_email}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs text-text-muted">
                                        {new Date(comment.created_at).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                    {comment.post_title && (
                                        <p className="text-xs text-text-muted mt-0.5">op: <span className="text-text-primary">{comment.post_title}</span></p>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-sm text-text-primary bg-glass-bg/30 rounded-xl p-3 border border-glass-border/50">
                                {comment.content}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2">
                                {filter !== "approved" && (
                                    <button
                                        onClick={() => handleAction(comment.id, "approve")}
                                        disabled={actionLoading === comment.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all text-xs font-medium cursor-pointer disabled:opacity-50 min-h-[44px]"
                                    >
                                        {actionLoading === comment.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                        Goedkeuren
                                    </button>
                                )}
                                {filter !== "rejected" && (
                                    <button
                                        onClick={() => handleAction(comment.id, "reject")}
                                        disabled={actionLoading === comment.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-medium cursor-pointer disabled:opacity-50 min-h-[44px]"
                                    >
                                        <XCircle className="w-3 h-3" /> Afwijzen
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (confirm("Weet je zeker dat je deze reactie permanent wilt verwijderen?")) {
                                            handleAction(comment.id, "delete");
                                        }
                                    }}
                                    disabled={actionLoading === comment.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs font-medium cursor-pointer disabled:opacity-50 min-h-[44px]"
                                >
                                    <Trash2 className="w-3 h-3" /> Verwijderen
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
