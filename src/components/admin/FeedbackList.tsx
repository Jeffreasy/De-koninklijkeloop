import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
    Bug,
    Lightbulb,
    Heart,
    HelpCircle,
    CheckCircle2,
    RotateCcw,
    XCircle,
    MessageSquare,
    Clock,
    MoreHorizontal
} from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

export default function FeedbackList() {
    const feedback = useQuery(api.feedback.list);
    const updateStatus = useMutation(api.feedback.updateStatus);
    const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

    if (!feedback) {
        return (
            <div className="flex items-center justify-center p-12 text-text-muted">
                <span className="animate-pulse">Feedback laden...</span>
            </div>
        );
    }

    const filteredFeedback = feedback.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'open') return item.status === 'open' || item.status === 'in_progress';
        if (filter === 'closed') return item.status === 'closed' || item.status === 'rejected';
        return true;
    });

    const handleStatusChange = async (id: Id<"feedback">, newStatus: "open" | "in_progress" | "closed" | "rejected") => {
        await updateStatus({ id, status: newStatus });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bug': return <Bug className="w-4 h-4 text-red-400" />;
            case 'feature': return <Lightbulb className="w-4 h-4 text-yellow-400" />;
            case 'praise': return <Heart className="w-4 h-4 text-pink-400" />;
            default: return <HelpCircle className="w-4 h-4 text-brand-blue" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium border border-blue-500/20">Open</span>;
            case 'in_progress':
                return <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">Mee bezig</span>;
            case 'closed':
                return <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">Opgelost</span>;
            case 'rejected':
                return <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20">Afgewezen</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-display text-text-body">Ingezonden Feedback</h2>
                <div className="flex gap-2 p-1 bg-surface/50 border border-border rounded-lg">
                    {['all', 'open', 'closed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === f
                                ? 'bg-brand-orange text-white shadow-sm'
                                : 'text-text-muted hover:text-text-body hover:bg-black/5'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredFeedback.length === 0 ? (
                    <div className="text-center p-12 border border-dashed border-border rounded-2xl">
                        <MessageSquare className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
                        <h3 className="text-text-body font-medium">Geen feedback gevonden</h3>
                        <p className="text-text-muted text-sm">Er is nog geen feedback ingediend met dit filter.</p>
                    </div>
                ) : (
                    filteredFeedback.map((item) => (
                        <div key={item._id} className="group bg-surface/30 border border-border hover:border-brand-orange/30 rounded-xl p-4 transition-all hover:bg-surface/50">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl bg-surface border border-border shrink-0`}>
                                    {getTypeIcon(item.type)}
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-text-body font-medium leading-snug">{item.message}</p>
                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(item.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {item.metadata?.url && (
                                                    <span className="truncate max-w-[200px]">
                                                        op {item.metadata.url}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {getStatusBadge(item.status)}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 pt-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                        {item.status !== 'closed' && (
                                            <button
                                                onClick={() => handleStatusChange(item._id, 'closed')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs font-medium transition-colors"
                                            >
                                                <CheckCircle2 className="w-3 h-3" /> Oplossen
                                            </button>
                                        )}
                                        {item.status !== 'in_progress' && item.status !== 'closed' && (
                                            <button
                                                onClick={() => handleStatusChange(item._id, 'in_progress')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-xs font-medium transition-colors"
                                            >
                                                <RotateCcw className="w-3 h-3" /> Mee bezig
                                            </button>
                                        )}
                                        {item.status !== 'rejected' && (
                                            <button
                                                onClick={() => handleStatusChange(item._id, 'rejected')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium transition-colors"
                                            >
                                                <XCircle className="w-3 h-3" /> Afwijzen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
