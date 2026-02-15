import type { XPost } from "./XPostEditor";
import type { Campaign } from "./XCampaignModal";
import { CheckCircle, Clock, Send, AlertTriangle, FileText, Trash2, CheckCheck, ListOrdered } from "lucide-react";

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; icon: typeof FileText; label: string }> = {
    draft: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20", icon: FileText, label: "Concept" },
    approved: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20", icon: CheckCircle, label: "Goedgekeurd" },
    queued: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", icon: Clock, label: "Wachtrij" },
    published: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", icon: Send, label: "Gepubliceerd" },
    failed: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: AlertTriangle, label: "Mislukt" },
};

interface Props {
    post: XPost;
    campaigns: Campaign[];
    onEdit: (post: XPost) => void;
    onApprove: (id: string) => void;
    onQueue: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function XPostCard({ post, campaigns, onEdit, onApprove, onQueue, onDelete }: Props) {
    const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
    const StatusIcon = statusCfg.icon;
    const campaign = campaigns.find((c) => c.id === post.campaign_id);

    const scheduledDate = post.scheduled_for
        ? new Date(post.scheduled_for).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
        : null;

    return (
        <div
            className="glass-card p-4 space-y-3 group hover:border-brand-orange/20 transition-all cursor-pointer"
            onClick={() => onEdit(post)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEdit(post); } }}
            role="button"
            tabIndex={0}
            aria-label={`Post bewerken: ${post.content.slice(0, 50)}...`}
        >
            {/* Header: Status + Campaign */}
            <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                </span>
                {campaign && (
                    <span className="text-xs text-text-muted bg-glass-border/20 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                        {campaign.name}
                    </span>
                )}
            </div>

            {/* Content Preview */}
            <p className="text-sm text-text-primary line-clamp-3 leading-relaxed">{post.content}</p>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-text-muted">
                {scheduledDate && (
                    <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {scheduledDate}
                    </span>
                )}
                {post.ai_generated && (
                    <span className="inline-flex items-center gap-1 text-amber-400">
                        AI
                    </span>
                )}
                {post.parent_id && (
                    <span className="inline-flex items-center gap-1">
                        <ListOrdered className="w-3 h-3" />
                        Thread #{post.thread_position}
                    </span>
                )}
                <span className="capitalize">{post.archetype}</span>
            </div>

            {/* Error */}
            {post.last_error && (
                <p className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                    {post.last_error}
                </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                {post.status === "draft" && (
                    <button onClick={() => onApprove(post.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-all text-xs font-medium cursor-pointer"
                    >
                        <CheckCheck className="w-3 h-3" aria-hidden="true" /> Goedkeuren
                    </button>
                )}
                {post.status === "approved" && (
                    <button onClick={() => onQueue(post.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-medium cursor-pointer"
                    >
                        <ListOrdered className="w-3 h-3" aria-hidden="true" /> In Wachtrij
                    </button>
                )}
                {(post.status === "draft" || post.status === "approved" || post.status === "failed") && (
                    <button onClick={() => onDelete(post.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs font-medium cursor-pointer"
                    >
                        <Trash2 className="w-3 h-3" aria-hidden="true" /> Verwijderen
                    </button>
                )}
            </div>
        </div>
    );
}
