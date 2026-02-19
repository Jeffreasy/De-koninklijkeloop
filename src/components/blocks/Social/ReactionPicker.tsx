import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";

interface Props {
    postId: Id<"social_posts">;
    userId: string | null;
    isAuthenticated: boolean;
}

const REACTIONS = [
    { emoji: "❤️", label: "Love" },
    { emoji: "👍", label: "Like" },
    { emoji: "😍", label: "Adorable" },
    { emoji: "🔥", label: "Fire" },
    { emoji: "👏", label: "Applause" },
] as const;

export function ReactionPicker({ postId, userId, isAuthenticated }: Props) {
    const reactionCounts = useQuery(api.socialReactions.getReactionCounts, { postId });

    // Transform array back to record for easy lookup
    const countsLookup = reactionCounts?.reduce((acc, { emoji, count }) => {
        acc[emoji] = count;
        return acc;
    }, {} as Record<string, number>) || {};

    const userReaction = useQuery(api.socialReactions.getUserReaction, {
        postId,
        userId: userId || "",
    });
    const toggleReaction = useMutation(api.socialReactions.toggleReaction);

    const [isProcessing, setIsProcessing] = useState(false);
    const [rippleEffect, setRippleEffect] = useState<string | null>(null);

    const handleReactionClick = async (emoji: string) => {
        if (!isAuthenticated || !userId || isProcessing) return;

        // Trigger ripple effect
        setRippleEffect(emoji);
        setTimeout(() => setRippleEffect(null), 600);

        setIsProcessing(true);

        try {
            await toggleReaction({
                postId,
                userId,
                reactionType: emoji,
            });
        } catch {
            // Silently handled — user sees no state change (optimistic UI reverts)
        } finally {
            // Small delay to prevent spam clicking
            setTimeout(() => setIsProcessing(false), 300);
        }
    };

    // ─── Unauthenticated: Professional Login CTA ───
    if (!isAuthenticated) {
        return (
            <div className="rounded-2xl bg-surface border border-glass-border p-5 md:p-6 text-center space-y-3">
                <div className="flex justify-center gap-3 text-xl md:text-2xl opacity-50 select-none">
                    {REACTIONS.map(({ emoji }) => (
                        <span key={emoji}>{emoji}</span>
                    ))}
                </div>
                <div className="space-y-1">
                    <h3 className="text-base md:text-lg font-bold text-primary">
                        Reageer op deze post
                    </h3>
                    <p className="text-sm text-muted">
                        Log in om je reactie achter te laten
                    </p>
                </div>
                <a
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-orange text-white font-semibold hover:bg-orange-500 hover:shadow-lg hover:shadow-brand-orange/20 transition-all duration-300 cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" x2="3" y1="12" y2="12" />
                    </svg>
                    Inloggen
                </a>
            </div>
        );
    }

    // ─── Authenticated: Full Reaction Picker ───
    return (
        <div className="space-y-2 md:space-y-4">
            {/* Header - Compact on mobile */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-base font-bold text-primary flex items-center gap-1.5 md:gap-2">
                    <span className="text-brand-orange text-base md:text-lg" aria-hidden="true">💬</span>
                    Reacties
                </h3>
            </div>

            {/* Compact Reaction Buttons - Horizontal scroll on mobile */}
            <div className="flex items-center gap-1.5 md:gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                {REACTIONS.map(({ emoji, label }) => {
                    const count = countsLookup[emoji] || 0;
                    const isActive = userReaction === emoji;
                    const hasRipple = rippleEffect === emoji;

                    return (
                        <button
                            key={emoji}
                            onClick={() => handleReactionClick(emoji)}
                            disabled={isProcessing}
                            title={label}
                            className={`
                                group relative flex items-center gap-1.5 md:gap-2.5 px-2 py-1.5 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl
                                transition-all duration-300 overflow-hidden shrink-0
                                ${isActive
                                    ? "bg-linear-to-r from-brand-orange to-orange-500 text-white shadow-lg md:shadow-xl shadow-brand-orange/30 scale-105 border border-brand-orange/50 md:border-2"
                                    : "bg-surface/50 text-primary hover:bg-surface border border-glass-border md:border-2 hover:border-brand-orange/30 shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl"
                                }
                                cursor-pointer hover:scale-105 active:scale-95
                                ${isProcessing ? "opacity-70" : ""}
                                backdrop-blur-xl
                            `}
                        >
                            {/* Ripple Effect */}
                            {hasRipple && (
                                <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-brand-orange/40 animate-ping" />
                            )}

                            {/* Gradient Overlay on Hover (for non-active) */}
                            {!isActive && (
                                <div className="absolute inset-0 bg-linear-to-r from-brand-orange/0 via-brand-orange/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            )}

                            {/* Emoji with Animation - Smaller on mobile */}
                            <span
                                className={`
                                    relative z-10 text-base md:text-2xl leading-none transition-all duration-300
                                    ${isActive ? "animate-bounce" : "group-hover:scale-125"}
                                    ${hasRipple ? "scale-125" : ""}
                                `}
                            >
                                {emoji}
                            </span>

                            {/* Count Badge - Smaller on mobile */}
                            {count > 0 && (
                                <span
                                    className={`
                                        relative z-10 min-w-4 md:min-w-6 px-1 md:px-2 py-0.5 rounded-md md:rounded-lg text-xs font-bold text-center
                                        transition-all duration-300
                                        ${isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange/20"
                                        }
                                        ${hasRipple ? "scale-110" : ""}
                                    `}
                                >
                                    {count}
                                </span>
                            )}

                            {/* Active Glow */}
                            {isActive && (
                                <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-brand-orange/20 blur-xl -z-10 animate-pulse" />
                            )}

                            {/* Hover Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-border to-transparent" />
                        </button>
                    );
                })}
            </div>

            {/* Total Count - Compact on mobile */}
            {reactionCounts && reactionCounts.length > 0 && (
                <div className="flex items-center gap-2 md:gap-3 pt-1 md:pt-2">
                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent" />
                    <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl bg-surface/50 border border-glass-border backdrop-blur-sm">
                        <span className="text-brand-orange text-xs md:text-sm" aria-hidden="true">🔥</span>
                        <span className="text-xs md:text-sm font-medium text-muted">
                            {(() => { const total = reactionCounts.reduce((acc, { count }) => acc + count, 0); return `${total} reactie${total !== 1 ? 's' : ''}`; })()}
                        </span>
                    </div>
                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent" />
                </div>
            )}

        </div>
    );
}

