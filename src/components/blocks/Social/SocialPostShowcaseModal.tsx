import { X, ChevronLeft, ChevronRight, ExternalLink, Calendar, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useMemo, useCallback, memo, useState } from "react";
import { createPortal } from "react-dom";
import { ReactionPicker } from "./ReactionPicker";
import type { Id } from "../../../../convex/_generated/dataModel";

interface SocialPost {
    _id: Id<"social_posts">;
    imageUrl: string;
    caption: string;
    instagramUrl: string;
    isFeatured: boolean;
    postedDate?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    post: SocialPost | null;
    allPosts: SocialPost[];
    onNavigate: (direction: "prev" | "next") => void;
    userId: string | null;
    isAuthenticated: boolean;
}

export const SocialPostShowcaseModal = memo(function SocialPostShowcaseModal({ isOpen, onClose, post, allPosts, onNavigate, userId, isAuthenticated }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Reset expansion when navigating
    useEffect(() => {
        setIsExpanded(false);
    }, [post?._id]);

    // Memoize expensive calculations
    const currentIndex = useMemo(() =>
        allPosts.findIndex((p) => p._id === post?._id),
        [allPosts, post?._id]
    );

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allPosts.length - 1;

    const formattedDate = useMemo(() =>
        post?.postedDate
            ? new Date(post.postedDate).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })
            : null,
        [post?.postedDate]
    );

    // Memoize event handlers
    const handleClose = useCallback(() => onClose(), [onClose]);
    const handlePrev = useCallback(() => onNavigate("prev"), [onNavigate]);
    const handleNext = useCallback(() => onNavigate("next"), [onNavigate]);
    const toggleExpand = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsExpanded(prev => !prev);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isExpanded) setIsExpanded(false);
                else handleClose();
            }
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleClose, handlePrev, handleNext, isExpanded]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen || !post) return null;

    // Use Portal to ensure modal is always on top of everything (including fixed navbars)
    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed inset-0 z-9999 h-dvh flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-200 will-change-[opacity]">
            {/* Premium Backdrop */}
            <div
                className="absolute inset-0 bg-body/95 md:bg-black/90 backdrop-blur-xl transition-all"
                onClick={handleClose}
            />

            {/* Modal Container - Full Screen Mobile / Card Desktop */}
            <div className="relative w-full h-full md:max-h-[96vh] md:max-w-7xl flex flex-col md:flex-row bg-surface md:bg-transparent md:rounded-4xl overflow-hidden shadow-2xl">

                {/* Close Button - Always visible, high contrast */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/20 md:bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-brand-orange hover:border-brand-orange transition-all shadow-lg active:scale-95"
                    aria-label="Sluit"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Left: Image Section (Top on Mobile) */}
                <div
                    className={`relative w-full md:w-1/2 bg-black md:bg-linear-to-br md:from-black md:via-gray-900 md:to-black flex items-center justify-center overflow-hidden shrink-0 group transition-[height] duration-500 ease-in-out ${isExpanded ? 'h-full z-20' : 'h-[45vh] md:h-full'}`}
                    onClick={() => toggleExpand()}
                >
                    <div className="relative w-full h-full md:p-6 pointer-events-none md:pointer-events-auto">
                        <div className="relative w-full h-full md:rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={post.imageUrl}
                                alt={post.caption.slice(0, 100)}
                                className={`w-full h-full transition-transform duration-500 group-hover:scale-[1.02] ${isExpanded ? 'object-contain' : 'object-contain md:object-cover'}`}
                            />
                        </div>
                    </div>

                    {/* Mobile Expand Toggle Button - Centered Overlay when not expanded, or Bottom Right when expanded */}
                    <button
                        onClick={toggleExpand}
                        className={`md:hidden absolute z-50 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 shadow-lg active:scale-95 transition-all ${isExpanded ? 'bottom-8 right-4' : 'bottom-4 right-4'}`}
                        aria-label={isExpanded ? "Minimaliseer" : "Maximaliseer"}
                    >
                        {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>

                    {/* Navigation Buttons - Overlay on Image for Mobile */}
                    {hasPrev && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-brand-orange transition-all border border-white/10"
                            aria-label="Vorige"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    {hasNext && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-brand-orange transition-all border border-white/10"
                            aria-label="Volgende"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Right: Info Section (Bottom on Mobile) */}
                <div className={`relative w-full md:w-1/2 flex-col flex-1 bg-surface md:bg-surface/95 md:backdrop-blur-2xl border-t md:border-t-0 md:border-l border-border overflow-hidden ${isExpanded ? 'hidden md:flex' : 'flex'}`}>

                    {/* Header */}
                    <div className="p-5 border-b border-border shrink-0 bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shrink-0">
                                    <img
                                        src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1769451085/DKLLogoV1_kx60i9.webp"
                                        alt="DKL"
                                        className="w-6 h-6 md:w-8 md:h-8 object-contain"
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-primary truncate">@koninklijkeloop</p>
                                    {formattedDate && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formattedDate}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <a
                                href={post.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-xl bg-[linear-gradient(135deg,var(--color-brand-orange)_0%,#fbbf24_100%)] text-white hover:shadow-lg hover:scale-105 transition-all"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                        <div className="p-4 rounded-2xl bg-surface/50 border border-border/50">
                            <ReactionPicker
                                postId={post._id}
                                userId={userId}
                                isAuthenticated={isAuthenticated}
                            />
                        </div>

                        {/* Caption */}
                        <div className="prose prose-invert max-w-none">
                            <p className="text-primary/90 leading-relaxed whitespace-pre-wrap text-base">
                                {post.caption}
                            </p>
                        </div>
                    </div>

                    {/* Footer / Counter */}
                    <div className="p-4 border-t border-border bg-surface/50 text-center md:text-left">
                        <span className="text-xs font-mono text-muted uppercase tracking-wider">
                            Post {currentIndex + 1} / {allPosts.length}
                        </span>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
});
