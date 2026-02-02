import { X, ChevronLeft, ChevronRight, ExternalLink, Calendar } from "lucide-react";
import { useEffect } from "react";
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

export function SocialPostShowcaseModal({ isOpen, onClose, post, allPosts, onNavigate, userId, isAuthenticated }: Props) {
    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onNavigate("prev");
            if (e.key === "ArrowRight") onNavigate("next");
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, onNavigate]);

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

    const currentIndex = allPosts.findIndex((p) => p._id === post._id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allPosts.length - 1;

    const formattedDate = post.postedDate
        ? new Date(post.postedDate).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center animate-in fade-in duration-200">
            {/* Premium Backdrop with Gradient */}
            <div
                className="absolute inset-0 bg-linear-to-br from-black/98 via-black/95 to-brand-blue/20 backdrop-blur-3xl"
                onClick={onClose}
            />

            {/* Modal Container with Premium Spacing */}
            <div className="relative w-full h-full max-w-7xl max-h-screen flex items-center justify-center p-6 md:p-12">
                {/* Close Button - Floating Premium Style */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 group p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all duration-300 border border-white/20 hover:border-white/30 shadow-2xl hover:scale-105"
                    aria-label="Sluit modal"
                >
                    <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" />
                </button>

                {/* Navigation Buttons - Premium Glassmorphism */}
                {hasPrev && (
                    <button
                        onClick={() => onNavigate("prev")}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 group p-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all duration-300 border border-white/20 hover:border-brand-orange/50 shadow-2xl hover:scale-110 hidden md:flex items-center justify-center"
                        aria-label="Vorige post"
                    >
                        <ChevronLeft className="w-7 h-7" />
                    </button>
                )}

                {hasNext && (
                    <button
                        onClick={() => onNavigate("next")}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 group p-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all duration-300 border border-white/20 hover:border-brand-orange/50 shadow-2xl hover:scale-110 hidden md:flex items-center justify-center"
                        aria-label="Volgende post"
                    >
                        <ChevronRight className="w-7 h-7" />
                    </button>
                )}

                {/* Main Content Card - Ultra Premium */}
                <div className="relative w-full h-full max-w-6xl max-h-[92vh] rounded-4xl overflow-hidden">
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-linear-to-br from-brand-orange/30 via-transparent to-brand-blue/30 rounded-4xl p-px">
                        <div className="w-full h-full bg-linear-to-br from-surface/98 to-surface/95 backdrop-blur-3xl rounded-4xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.4)]">
                            {/* Content Layout */}
                            <div className="flex flex-col md:flex-row h-full">
                                {/* Image Section - Premium Frame */}
                                <div className="relative flex-1 bg-linear-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden group">
                                    {/* Image with subtle inset shadow */}
                                    <div className="relative w-full h-full p-4 md:p-6">
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.3)]">
                                            <img
                                                src={post.imageUrl}
                                                alt={post.caption.slice(0, 100)}
                                                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                                            />
                                        </div>
                                    </div>

                                    {/* Featured Badge - Premium Floating */}
                                    {post.isFeatured && (
                                        <div className="absolute top-8 left-8 px-4 py-2 rounded-2xl bg-linear-to-r from-brand-orange to-orange-500 text-white text-sm font-bold shadow-2xl backdrop-blur-xl border border-white/20">
                                            <div className="flex items-center gap-2">
                                                <iconify-icon icon="lucide:star" width="16" className="animate-pulse" />
                                                Featured
                                            </div>
                                        </div>
                                    )}

                                    {/* Mobile Navigation - Refined */}
                                    <div className="md:hidden absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                        {hasPrev && (
                                            <button
                                                onClick={() => onNavigate("prev")}
                                                className="p-3 rounded-xl bg-white/10 text-white backdrop-blur-xl border border-white/20 shadow-xl"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                        )}
                                        <div className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium backdrop-blur-xl border border-white/20 shadow-xl">
                                            {currentIndex + 1} / {allPosts.length}
                                        </div>
                                        {hasNext && (
                                            <button
                                                onClick={() => onNavigate("next")}
                                                className="p-3 rounded-xl bg-white/10 text-white backdrop-blur-xl border border-white/20 shadow-xl"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Info Panel - Premium Glassmorphism */}
                                <div className="w-full md:w-[420px] bg-linear-to-br from-surface/95 to-surface/90 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 flex flex-col">
                                    {/* Header - Premium Spacing */}
                                    <div className="p-8 border-b border-white/10">
                                        <div className="flex items-center gap-4 mb-6">
                                            {/* Instagram Icon with Gradient */}
                                            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-brand-orange/20 to-orange-500/20 flex items-center justify-center border border-brand-orange/30 shadow-lg">
                                                <iconify-icon
                                                    icon="lucide:instagram"
                                                    width="28"
                                                    className="text-brand-orange"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-lg text-text-primary">
                                                    @koninklijkeloop
                                                </p>
                                                {formattedDate && (
                                                    <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formattedDate}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Instagram CTA - Premium Button */}
                                        <a
                                            href={post.instagramUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl bg-linear-to-r from-brand-orange to-orange-500 text-white font-bold hover:from-brand-orange/90 hover:to-orange-500/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] border border-white/20"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            Bekijk op Instagram
                                        </a>
                                    </div>

                                    {/* Reactions - Premium Card */}
                                    <div className="px-8 py-6 bg-linear-to-br from-white/5 to-transparent border-b border-white/10">
                                        <ReactionPicker
                                            postId={post._id as any}
                                            userId={userId}
                                            isAuthenticated={isAuthenticated}
                                        />
                                    </div>

                                    {/* Caption - Elegant Typography */}
                                    <div className="flex-1 px-8 py-6 overflow-y-auto custom-scrollbar">
                                        <p className="text-text-primary leading-relaxed text-base whitespace-pre-wrap">
                                            {post.caption}
                                        </p>
                                    </div>

                                    {/* Footer - Desktop Counter */}
                                    <div className="hidden md:flex items-center justify-between px-8 py-6 border-t border-white/10 bg-linear-to-br from-white/5 to-transparent">
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

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, var(--color-brand-orange), var(--color-brand-blue));
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, var(--color-brand-orange), var(--color-orange-500));
                }
            `}</style>
        </div>
    );
}
