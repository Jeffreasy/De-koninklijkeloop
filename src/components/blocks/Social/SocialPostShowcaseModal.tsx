import { X, ChevronLeft, ChevronRight, ExternalLink, Calendar, Maximize2, Minimize2, Share2, Copy, Check, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useCallback, memo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ReactionPicker } from "./ReactionPicker";
import { ik } from "../../../lib/imagekit";
import type { Id } from "../../../../convex/_generated/dataModel";

interface MediaItem {
    url: string;
    type: "image" | "video";
    videoUrl?: string;
}

interface SocialPost {
    _id: Id<"social_posts">;
    imageUrl: string;
    caption: string;
    instagramUrl: string;
    isFeatured: boolean;
    postedDate?: string;
    mediaType?: string;
    videoUrl?: string;
    mediaItems?: MediaItem[];
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

// ─── Touch Swipe Hook ───

function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
    const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        setSwipeOffset(0);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStart.current) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStart.current.x;
        const dy = touch.clientY - touchStart.current.y;

        // Only track horizontal swipes
        if (Math.abs(dx) > Math.abs(dy) * 1.5) {
            setSwipeOffset(dx * 0.4); // Dampened drag
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!touchStart.current) return;
        const velocity = Math.abs(swipeOffset) / (Date.now() - touchStart.current.time);

        if (Math.abs(swipeOffset) > 60 || velocity > 0.3) {
            if (swipeOffset < 0) onSwipeLeft();
            else onSwipeRight();
        }

        touchStart.current = null;
        setSwipeOffset(0);
    }, [swipeOffset, onSwipeLeft, onSwipeRight]);

    return { swipeOffset, handleTouchStart, handleTouchMove, handleTouchEnd };
}

// ─── Share Button ───

function ShareButton({ post }: { post: SocialPost }) {
    const [copied, setCopied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const shareData = {
        title: "De Koninklijke Loop — Instagram",
        text: post.caption.slice(0, 100),
        url: post.instagramUrl,
    };

    const handleShare = useCallback(async () => {
        // Try native Web Share API first (mobile)
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch {
                // User cancelled or API failed — fall through to menu
            }
        }
        setShowMenu((prev) => !prev);
    }, [shareData]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(post.instagramUrl);
            setCopied(true);
            setShowMenu(false);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const input = document.createElement("input");
            input.value = post.instagramUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setShowMenu(false);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [post.instagramUrl]);

    return (
        <div className="relative">
            <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-surface/80 text-primary hover:bg-brand-orange hover:text-white border border-glass-border hover:border-brand-orange transition-all active:scale-95"
                aria-label="Delen"
            >
                {copied
                    ? <Check className="w-5 h-5 text-green-400" />
                    : <Share2 className="w-5 h-5" />
                }
            </button>

            {/* Fallback Share Menu (Desktop) */}
            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40 cursor-pointer"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute bottom-full right-0 mb-2 z-50 min-w-48 p-2 rounded-2xl bg-surface border border-glass-border shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-200">
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-glass-border/20 transition-colors text-sm text-primary cursor-pointer"
                            onClick={() => setShowMenu(false)}
                            aria-label="Deel via WhatsApp"
                        >
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            WhatsApp
                        </a>
                        <a
                            href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-glass-border/20 transition-colors text-sm text-primary cursor-pointer"
                            onClick={() => setShowMenu(false)}
                            aria-label="Deel op X (Twitter)"
                        >
                            <span className="text-lg">𝕏</span>
                            X (Twitter)
                        </a>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-glass-border/20 transition-colors text-sm text-primary w-full text-left cursor-pointer"
                            aria-label="Link kopiëren naar klembord"
                        >
                            <Copy className="w-4 h-4" />
                            Link kopiëren
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Main Modal ───

export const SocialPostShowcaseModal = memo(function SocialPostShowcaseModal({ isOpen, onClose, post, allPosts, onNavigate, userId, isAuthenticated }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [mediaIndex, setMediaIndex] = useState(0);

    // Build effective slides array
    const slides: MediaItem[] = useMemo(() => {
        if (!post) return [];
        if (post.mediaItems && post.mediaItems.length > 0) return post.mediaItems;
        // Legacy single-media fallback
        return [{
            url: post.imageUrl,
            type: (post.mediaType as "image" | "video") || "image",
            videoUrl: post.videoUrl,
        }];
    }, [post]);

    const hasMultipleSlides = slides.length > 1;
    const currentSlide = slides[mediaIndex] || slides[0];

    // Slide navigation functions
    const goToSlide = useCallback((idx: number) => {
        setMediaIndex(Math.max(0, Math.min(idx, slides.length - 1)));
    }, [slides.length]);
    const prevSlide = useCallback(() => goToSlide(mediaIndex - 1), [goToSlide, mediaIndex]);
    const nextSlide = useCallback(() => goToSlide(mediaIndex + 1), [goToSlide, mediaIndex]);

    // Swipe: navigate slides if carousel, otherwise navigate posts
    const { swipeOffset, handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipe(
        () => { if (hasMultipleSlides && mediaIndex < slides.length - 1) nextSlide(); else onNavigate("next"); },
        () => { if (hasMultipleSlides && mediaIndex > 0) prevSlide(); else onNavigate("prev"); }
    );

    // Reset expansion and slide index when navigating
    useEffect(() => {
        setIsExpanded(false);
        setMediaIndex(0);
    }, [post?._id]);

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
            if (e.key === "ArrowLeft") {
                if (hasMultipleSlides && mediaIndex > 0) prevSlide();
                else handlePrev();
            }
            if (e.key === "ArrowRight") {
                if (hasMultipleSlides && mediaIndex < slides.length - 1) nextSlide();
                else handleNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleClose, handlePrev, handleNext, isExpanded, hasMultipleSlides, mediaIndex, slides.length, prevSlide, nextSlide]);

    // iOS-safe scroll lock
    useEffect(() => {
        if (!isOpen) return;

        const scrollY = window.scrollY;
        const body = document.body;
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.overflow = 'hidden';

        return () => {
            body.style.position = '';
            body.style.top = '';
            body.style.left = '';
            body.style.right = '';
            body.style.overflow = '';
            window.scrollTo(0, scrollY);
        };
    }, [isOpen]);

    if (!isOpen || !post) return null;
    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed inset-0 z-9999 h-dvh flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-200 will-change-[opacity]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-body/95 md:bg-black/90 backdrop-blur-xl transition-all"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full h-full md:max-h-[96vh] md:max-w-7xl flex flex-col md:flex-row bg-surface md:rounded-4xl overflow-hidden shadow-2xl">

                {/* Close */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/20 md:bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-brand-orange hover:border-brand-orange transition-all shadow-lg active:scale-95"
                    aria-label="Sluit"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Image/Video Section (swipeable carousel) */}
                <div
                    className={`relative w-full md:w-1/2 bg-black md:bg-linear-to-br md:from-black md:via-gray-900 md:to-black flex items-center justify-center overflow-hidden shrink-0 group transition-[height] duration-500 ease-in-out ${isExpanded ? 'h-full z-20' : 'h-[45vh] md:h-full'}`}
                    onClick={() => {
                        if (!(currentSlide?.type === "video" && currentSlide?.videoUrl)) toggleExpand();
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className={`relative w-full h-full md:p-6 transition-transform duration-200 ease-out ${currentSlide?.type === "video" && currentSlide?.videoUrl ? '' : 'pointer-events-none md:pointer-events-auto'
                            }`}
                        style={{ transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined }}
                    >
                        <div className="relative w-full h-full md:rounded-2xl overflow-hidden shadow-2xl">
                            {/* Render current slide */}
                            {currentSlide?.type === "video" && currentSlide?.videoUrl ? (
                                currentSlide.videoUrl.includes("imagekit.io") ? (
                                    <video
                                        src={currentSlide.videoUrl}
                                        className="w-full h-full object-contain"
                                        controls
                                        autoPlay
                                        playsInline
                                        preload="metadata"
                                        title={post.caption.slice(0, 60)}
                                    />
                                ) : (
                                    <iframe
                                        src={`https://streamable.com/e/${currentSlide.videoUrl.match(/streamable\.com\/(?:e\/|o\/)?([a-zA-Z0-9]+)/)?.[1] || ""}?autoplay=1`}
                                        className="w-full h-full"
                                        style={{ border: "none" }}
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        title={post.caption.slice(0, 60)}
                                    />
                                )
                            ) : (
                                <img
                                    src={currentSlide?.url?.includes("imagekit.io") ? ik(currentSlide.url, 1200) : (currentSlide?.url || post.imageUrl)}
                                    alt={post.caption.slice(0, 100)}
                                    className="w-full h-full transition-transform duration-500 group-hover:scale-[1.02] object-contain"
                                />
                            )}
                        </div>
                    </div>

                    {/* Carousel Slide Arrows (only for multi-slide posts) */}
                    {hasMultipleSlides && mediaIndex > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-brand-orange transition-all border border-white/20 pointer-events-auto cursor-pointer"
                            aria-label="Vorige slide"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    {hasMultipleSlides && mediaIndex < slides.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-brand-orange transition-all border border-white/20 pointer-events-auto cursor-pointer"
                            aria-label="Volgende slide"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}

                    {/* Carousel Dot Indicators */}
                    {hasMultipleSlides && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-1.5 pointer-events-auto">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); goToSlide(i); }}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${i === mediaIndex
                                        ? 'bg-brand-orange w-5'
                                        : 'bg-white/50 hover:bg-white/80'
                                        }`}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Mobile Expand Toggle */}
                    <button
                        onClick={toggleExpand}
                        className={`md:hidden absolute z-50 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 shadow-lg active:scale-95 transition-all ${isExpanded ? 'bottom-8 right-4' : 'bottom-4 right-4'}`}
                        aria-label={isExpanded ? "Minimaliseer" : "Maximaliseer"}
                    >
                        {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>

                    {/* Navigation Arrows — only show when NO carousel (single-media posts) */}
                    {!hasMultipleSlides && hasPrev && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-brand-orange transition-all border border-white/10 cursor-pointer"
                            aria-label="Vorige post"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    {!hasMultipleSlides && hasNext && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-brand-orange transition-all border border-white/10 cursor-pointer"
                            aria-label="Volgende post"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}

                    {/* Carousel: post-level nav hint at boundaries (top corners) */}
                    {hasMultipleSlides && hasPrev && mediaIndex === 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="absolute left-2 top-4 z-40 px-2 py-1 rounded-lg bg-black/40 text-white/70 backdrop-blur-md hover:bg-brand-orange hover:text-white transition-all text-xs font-medium cursor-pointer border border-white/10"
                            aria-label="Vorige post"
                        >
                            ← Post
                        </button>
                    )}
                    {hasMultipleSlides && hasNext && mediaIndex === slides.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-2 top-4 z-40 px-2 py-1 rounded-lg bg-black/40 text-white/70 backdrop-blur-md hover:bg-brand-orange hover:text-white transition-all text-xs font-medium cursor-pointer border border-white/10"
                            aria-label="Volgende post"
                        >
                            Post →
                        </button>
                    )}

                    {/* Swipe hint dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                        {allPosts.slice(0, 8).map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-brand-orange w-4' : 'bg-white/40'}`}
                            />
                        ))}
                        {allPosts.length > 8 && <span className="text-white/40 text-xs ml-1">+{allPosts.length - 8}</span>}
                    </div>
                </div>

                {/* Info Section */}
                <div className={`relative w-full md:w-1/2 flex-col flex-1 bg-surface border-t md:border-t-0 md:border-l border-glass-border overflow-hidden ${isExpanded ? 'hidden md:flex' : 'flex'}`}>

                    {/* Header */}
                    <div className="p-5 pr-20 border-b border-glass-border shrink-0 bg-surface sticky top-0 z-10">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shrink-0">
                                    <img
                                        src="https://ik.imagekit.io/a0oim4e3e/tr:w-64,f-auto,q-80/De%20Koninklijkeloop/webassets/DKLLogoV1_kx60i9.webp"
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

                            <div className="flex items-center gap-2 mr-10">
                                <ShareButton post={post} />
                                <a
                                    href={post.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl bg-linear-to-br from-brand-orange to-amber-400 text-white hover:shadow-lg hover:brightness-110 transition-all cursor-pointer"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 overscroll-contain">
                        <div className="p-4 rounded-2xl bg-surface border border-glass-border">
                            <ReactionPicker
                                postId={post._id}
                                userId={userId}
                                isAuthenticated={isAuthenticated}
                            />
                        </div>

                        {/* Caption */}
                        <div className="prose max-w-none">
                            <p className="text-primary/90 leading-relaxed whitespace-pre-wrap text-base">
                                {post.caption}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-glass-border bg-surface text-center md:text-left">
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
