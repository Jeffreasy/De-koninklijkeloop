import { X, ChevronLeft, ChevronRight, ExternalLink, Calendar } from "lucide-react";
import { useEffect, useMemo, useCallback, memo } from "react";
import { ReactionPicker } from "./ReactionPicker";

interface SocialPost {
    _id: string;
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

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleClose, handlePrev, handleNext]);

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

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-2 md:p-8 animate-in fade-in duration-200 will-change-[opacity]">
            {/* Premium Backdrop with Gradient - Optimized without heavy blur */}
            <div
                className="absolute inset-0 bg-linear-to-br from-black/98 via-black/95 to-brand-blue/20"
                onClick={handleClose}
            />

            {/* Modal Container */}
            <div className="relative w-full h-full flex items-center justify-center will-change-transform">
                {/* Close Button - Floating Premium Style */}
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 md:top-6 md:right-6 z-30 group p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/30 shadow-lg hover:scale-105 will-change-transform"
                    aria-label="Sluit modal"
                >
                    <X className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-90 duration-300" />
                </button>

                {/* Navigation Buttons - Premium Glassmorphism */}
                {hasPrev && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-30 group p-2.5 md:p-5 rounded-xl md:rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-brand-orange/50 shadow-lg hover:scale-110 will-change-transform"
                        aria-label="Vorige post"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-7 md:h-7" />
                    </button>
                )}

                {hasNext && (
                    <button
                        onClick={handleNext}
                        className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-30 group p-2.5 md:p-5 rounded-xl md:rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-brand-orange/50 shadow-lg hover:scale-110 will-change-transform"
                        aria-label="Volgende post"
                    >
                        <ChevronRight className="w-5 h-5 md:w-7 md:h-7" />
                    </button>
                )}

                {/* Main Content Card - Ultra Premium */}
                <div className="relative w-full h-full max-h-[96vh] rounded-xl md:rounded-4xl overflow-hidden">
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-linear-to-br from-brand-orange/30 via-transparent to-brand-blue/30 rounded-xl md:rounded-4xl p-px">
                        <div className="w-full h-full bg-linear-to-br from-surface/98 to-surface/95 rounded-xl md:rounded-4xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.4)]">
                            {/* Content Layout - Responsive Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                                {/* Left: Image Section - Premium Frame */}
                                <div className="relative bg-linear-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden group">
                                    {/* Image with subtle inset shadow */}
                                    <div className="relative w-full h-full p-3 md:p-6">
                                        <div className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.2)]">
                                            <img
                                                src={post.imageUrl}
                                                alt={post.caption.slice(0, 100)}
                                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02] will-change-transform"
                                            />
                                        </div>
                                    </div>

                                    {/* Featured Badge - Premium Floating */}
                                    {post.isFeatured && (
                                        <div className="absolute top-3 left-3 md:top-6 md:left-6 px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-2xl bg-linear-to-r from-brand-orange to-orange-500 text-white text-xs md:text-sm font-bold shadow-lg border border-white/20">
                                            <div className="flex items-center gap-1 md:gap-2">
                                                <iconify-icon icon="lucide:star" width="12" className="md:w-4 animate-pulse" />
                                                Featured
                                            </div>
                                        </div>
                                    )}

                                    {/* Counter Badge */}
                                    <div className="absolute bottom-3 left-3 md:hidden px-3 py-1 rounded-lg bg-white/10 text-white text-xs font-medium backdrop-blur-xl border border-white/20 shadow-xl">
                                        {currentIndex + 1} / {allPosts.length}
                                    </div>
                                </div>

                                {/* Right: Info Panel - Premium Glassmorphism - Scrollable */}
                                <div className="flex flex-col bg-linear-to-br from-surface/95 to-surface/90 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 overflow-hidden">
                                    {/* Header - Compact */}
                                    <div className="p-4 md:p-6 lg:p-8 border-b border-white/10 shrink-0">
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            {/* Profile Section */}
                                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                {/* DKL Logo - Brand Identity */}
                                                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl bg-linear-to-br from-brand-orange/20 to-orange-500/20 flex items-center justify-center border border-brand-orange/30 shadow-lg shrink-0 overflow-hidden">
                                                    <img
                                                        src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1769451085/DKLLogoV1_kx60i9.webp"
                                                        alt="De Koninklijke Loop"
                                                        className="w-8 h-8 md:w-9 md:h-9 lg:w-12 lg:h-12 object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm md:text-base lg:text-xl text-text-primary truncate">
                                                        @koninklijkeloop
                                                    </p>
                                                    {formattedDate && (
                                                        <div className="flex items-center gap-1 text-xs md:text-sm text-text-muted mt-0.5">
                                                            <Calendar className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                                                            <span className="truncate">{formattedDate}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Instagram CTA - Compact */}
                                            <a
                                                href={post.instagramUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group shrink-0 flex items-center gap-2 px-3 md:px-5 lg:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-linear-to-r from-brand-orange to-orange-500 text-white text-xs md:text-sm lg:text-base font-bold hover:from-brand-orange/90 hover:to-orange-500/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] border border-white/20"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                <span className="hidden sm:inline">Instagram</span>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Reactions - Compact */}
                                    <div className="px-4 md:px-6 lg:px-8 py-3 md:py-5 lg:py-6 bg-linear-to-br from-white/5 to-transparent border-b border-white/10 shrink-0">
                                        <ReactionPicker
                                            postId={post._id as any}
                                            userId={userId}
                                            isAuthenticated={isAuthenticated}
                                        />
                                    </div>

                                    {/* Caption - Scrollable */}
                                    <div className="flex-1 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 overflow-y-auto custom-scrollbar">
                                        <p className="text-text-primary leading-relaxed text-sm md:text-base lg:text-lg whitespace-pre-wrap">
                                            {post.caption}
                                        </p>
                                    </div>

                                    {/* Footer - Desktop Counter */}
                                    <div className="hidden lg:flex items-center justify-between px-8 py-6 border-t border-white/10 bg-linear-to-br from-white/5 to-transparent shrink-0">
                                        <span className="text-sm font-medium text-text-muted">
                                            Post {currentIndex + 1} van {allPosts.length}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                                <kbd className="text-xs font-bold text-text-muted">←</kbd>
                                                <kbd className="text-xs font-bold text-text-muted">→</kbd>
                                            </div>
                                            <span className="text-xs text-text-muted">Navigate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ambient Glow Effect */}
                    <div className="absolute -inset-4 bg-linear-to-br from-brand-orange/20 via-transparent to-brand-blue/20 blur-3xl -z-10 opacity-50" />
                </div>
            </div>


        </div>
    );
});
