import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
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
        } catch (error) {
            console.error("Failed to toggle reaction:", error);
        } finally {
            // Small delay to prevent spam clicking
            setTimeout(() => setIsProcessing(false), 300);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <span className="text-brand-orange">💬</span>
                    Reacties
                </h3>
                {!isAuthenticated && (
                    <p className="text-xs text-text-muted italic px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                        Log in om te reageren
                    </p>
                )}
            </div>

            {/* Premium Reaction Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
                {REACTIONS.map(({ emoji, label }) => {
                    const count = reactionCounts?.[emoji] || 0;
                    const isActive = userReaction === emoji;
                    const hasRipple = rippleEffect === emoji;

                    return (
                        <button
                            key={emoji}
                            onClick={() => handleReactionClick(emoji)}
                            disabled={!isAuthenticated || isProcessing}
                            title={isAuthenticated ? label : "Log in om te reageren"}
                            className={`
                                group relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
                                transition-all duration-300 overflow-hidden
                                ${isActive
                                    ? "bg-linear-to-r from-brand-orange to-orange-500 text-white shadow-xl shadow-brand-orange/30 scale-105 border-2 border-brand-orange/50"
                                    : "bg-white/5 text-text-primary hover:bg-white/10 border-2 border-white/10 hover:border-brand-orange/30 shadow-lg hover:shadow-xl"
                                }
                                ${!isAuthenticated ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}
                                ${isProcessing ? "opacity-70" : ""}
                                backdrop-blur-xl
                            `}
                        >
                            {/* Ripple Effect */}
                            {hasRipple && (
                                <div className="absolute inset-0 rounded-2xl bg-brand-orange/40 animate-ping" />
                            )}

                            {/* Gradient Overlay on Hover (for non-active) */}
                            {!isActive && (
                                <div className="absolute inset-0 bg-linear-to-r from-brand-orange/0 via-brand-orange/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            )}

                            {/* Emoji with Animation */}
                            <span
                                className={`
                                    relative z-10 text-2xl leading-none transition-all duration-300
                                    ${isActive ? "animate-bounce" : "group-hover:scale-125"}
                                    ${hasRipple ? "scale-125" : ""}
                                `}
                            >
                                {emoji}
                            </span>

                            {/* Count Badge */}
                            {count > 0 && (
                                <span
                                    className={`
                                        relative z-10 min-w-6 px-2 py-0.5 rounded-lg text-xs font-bold text-center
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
                                <div className="absolute inset-0 rounded-2xl bg-brand-orange/20 blur-xl -z-10 animate-pulse" />
                            )}

                            {/* Hover Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                        </button>
                    );
                })}
            </div>

            {/* Total Count with Premium Badge */}
            {reactionCounts && Object.keys(reactionCounts).length > 0 && (
                <div className="flex items-center gap-3 pt-2">
                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <span className="text-brand-orange text-sm">🔥</span>
                        <span className="text-sm font-medium text-text-muted">
                            {Object.values(reactionCounts).reduce((a: number, b: number) => a + b, 0)} reactie
                            {Object.values(reactionCounts).reduce((a: number, b: number) => a + b, 0) !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                </div>
            )}
        </div>
    );
}

