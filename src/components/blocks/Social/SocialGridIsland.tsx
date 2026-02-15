import { useState, useCallback, useMemo, memo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Instagram, AlertCircle, RefreshCw, Star, Maximize2, ArrowRight } from "lucide-react";
import { SocialPostShowcaseModal } from "./SocialPostShowcaseModal";
import { ik, ikSrcSet } from "../../../lib/imagekit";
import { useStore } from "@nanostores/react";
import { $accessToken, $user } from "../../../lib/auth";
import type { SSRPost } from "./types";

function srcSet(url: string, widths: number[]): string {
    return ikSrcSet(url, widths);
}

// ─── Props ───

interface Props {
    ssrFeatured?: SSRPost | null;
    ssrThumbnails?: SSRPost[];
}

const BENTO_SIZE = "col-span-1 row-span-1";

// ─── Section Shell (extracted for clean render) ───

function SectionShell({ children }: { children: React.ReactNode }) {
    return (
        <section className="py-20 md:py-28 relative overflow-hidden" aria-label="Instagram social media">
            {/* Royal Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-orange/4 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue/3 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-orange/2 rounded-full blur-[150px] rotate-12" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {children}
            </div>
        </section>
    );
}

// ─── Main Component ───

export const SocialGridIsland = memo(function SocialGridIsland({
    ssrFeatured,
    ssrThumbnails,
}: Props) {
    // Real-time Convex data (takes over from SSR once loaded)
    const featuredPost = useQuery(api.socialPosts.getFeatured);
    const thumbnailPosts = useQuery(api.socialPosts.getThumbnails, { limit: 7 });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPostIndex, setSelectedPostIndex] = useState(0);
    const [hasError, setHasError] = useState(false);

    // Auth state
    const accessToken = useStore($accessToken);
    const user = useStore($user);
    const isAuthenticated = !!accessToken && !!user;
    const userEmail = user?.email || null;

    // Loading state
    const isLoading = featuredPost === undefined && thumbnailPosts === undefined;

    // Use Convex data when available, SSR data as fallback
    const activeFeatured = featuredPost ?? ssrFeatured ?? null;
    const activeThumbnails = thumbnailPosts ?? ssrThumbnails ?? [];

    // Combine for modal navigation
    const allPosts = useMemo(() => [
        ...(activeFeatured ? [activeFeatured] : []),
        ...activeThumbnails,
    ] as SSRPost[], [activeFeatured, activeThumbnails]);

    const hasContent = allPosts.length > 0;

    // Handlers
    const handlePostClick = useCallback(
        (postId: string) => {
            const index = allPosts.findIndex((p) => p._id === postId);
            if (index !== -1) {
                setSelectedPostIndex(index);
                setIsModalOpen(true);
            }
        },
        [allPosts]
    );

    const handleNavigate = useCallback(
        (direction: "prev" | "next") => {
            setSelectedPostIndex(prev => {
                if (direction === "prev" && prev > 0) return prev - 1;
                if (direction === "next" && prev < allPosts.length - 1) return prev + 1;
                return prev;
            });
        },
        [allPosts.length]
    );



    // ─── Section Header ───

    const SectionHeader = useCallback(() => (
        <div className="text-center mb-12 md:mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-widest">
                <Instagram className="w-3.5 h-3.5" />
                @koninklijkeloop
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-text-primary tracking-tight">
                Volg ons op{" "}
                <span className="bg-linear-to-r from-brand-orange via-amber-400 to-brand-orange bg-clip-text text-transparent">
                    Instagram
                </span>
            </h2>
            <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Blijf op de hoogte van de laatste updates, foto's en behind the scenes.
            </p>
        </div>
    ), []);

    // ─── Error State ───

    if (hasError) {
        return (
            <SectionShell>
                <SectionHeader />
                <div className="max-w-md mx-auto text-center space-y-4 p-8 rounded-3xl bg-glass-bg/60 border border-glass-border backdrop-blur-xl">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                    <p className="text-text-primary font-medium">Kon Instagram posts niet laden</p>
                    <button
                        onClick={() => setHasError(false)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange text-white font-medium hover:brightness-110 transition-all cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Opnieuw proberen
                    </button>
                </div>
            </SectionShell>
        );
    }

    // ─── Loading Skeleton ───

    if (isLoading && !hasContent) {
        return (
            <SectionShell>
                <div className="text-center mb-12 md:mb-16 space-y-4">
                    <div className="h-8 w-48 mx-auto rounded-full bg-glass-border/20 animate-pulse" />
                    <div className="h-12 w-80 mx-auto rounded-2xl bg-glass-border/15 animate-pulse" />
                    <div className="h-5 w-64 mx-auto rounded-xl bg-glass-border/10 animate-pulse" />
                </div>

                {/* Desktop skeleton */}
                <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
                    <div className="col-span-2 row-span-2 rounded-3xl bg-glass-bg/40 border border-glass-border animate-pulse" />
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-glass-bg/40 border border-glass-border animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                </div>

                {/* Mobile skeleton */}
                <div className="md:hidden flex gap-3 overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-64 h-64 rounded-2xl bg-glass-bg/40 border border-glass-border animate-pulse shrink-0" />
                    ))}
                </div>
            </SectionShell>
        );
    }

    // ─── Empty State ───

    if (!hasContent) {
        return (
            <SectionShell>
                <SectionHeader />
                <div className="text-center py-12">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-glass-bg/60 border border-glass-border flex items-center justify-center">
                            <Instagram className="w-8 h-8 text-text-muted opacity-50" />
                        </div>
                        <p className="text-text-muted">Nog geen Instagram posts toegevoegd.</p>
                    </div>
                </div>
            </SectionShell>
        );
    }

    // ─── Main Bento Grid ───

    return (
        <SectionShell>
            <SectionHeader />

            {/* ── Desktop: Bento Grid ── */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
                {/* Featured Post — spans 2×2 */}
                {activeFeatured && (
                    <button
                        onClick={() => handlePostClick(activeFeatured._id)}
                        className="col-span-2 row-span-2 group relative overflow-hidden rounded-3xl bg-glass-bg border border-glass-border/60 hover:border-brand-orange/40 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-brand-orange/10 cursor-pointer active:scale-[0.99]"
                    >
                        <img
                            src={ik(activeFeatured.imageUrl, 800)}
                            srcSet={srcSet(activeFeatured.imageUrl, [400, 800, 1200])}
                            sizes="(max-width: 1024px) 66vw, 50vw"
                            alt={activeFeatured.caption?.slice(0, 100) || "Featured Instagram post"}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                            loading="eager"
                            width={800}
                            height={800}
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                        {/* Featured badge */}
                        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-orange/90 backdrop-blur-sm text-white text-xs font-bold shadow-lg">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            Featured
                        </div>

                        {/* Content overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                            <p className="text-sm md:text-base line-clamp-3 mb-3 leading-relaxed text-white/90">
                                {activeFeatured.caption}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-brand-orange">
                                    <Instagram className="w-4 h-4" />
                                    <span className="text-xs font-medium">Bekijk post</span>
                                </div>
                                {activeFeatured.postedDate && (
                                    <span className="text-xs text-white/50">
                                        {new Date(activeFeatured.postedDate).toLocaleDateString("nl-NL", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Hover maximize indicator */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 border border-white/20">
                            <Maximize2 className="w-6 h-6 text-white" />
                        </div>
                    </button>
                )}

                {/* Thumbnail Grid — fills remaining slots */}
                {activeThumbnails.map((post, i) => (
                    <button
                        key={post._id}
                        onClick={() => handlePostClick(post._id)}
                        className={`${BENTO_SIZE} group relative overflow-hidden rounded-2xl bg-glass-bg border border-glass-border/50 hover:border-brand-orange/30 transition-all duration-500 shadow-md hover:shadow-xl cursor-pointer active:scale-[0.97]`}
                        style={{ animationDelay: `${i * 60}ms` }}
                    >
                        <img
                            src={ik(post.imageUrl, 400)}
                            srcSet={srcSet(post.imageUrl, [200, 400, 600])}
                            sizes="(max-width: 1024px) 33vw, 25vw"
                            alt={post.caption?.slice(0, 80) || "Instagram post"}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
                            loading="lazy"
                            width={400}
                            height={400}
                        />

                        {/* Glassmorphism hover overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex flex-col items-center justify-end p-4">
                            <p className="text-white text-xs line-clamp-2 text-center font-medium mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                {post.caption || "Bekijk post"}
                            </p>
                            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* ── Mobile: Horizontal Scroll Strip ── */}
            <div className="md:hidden -mx-4 sm:-mx-6">
                <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 pb-4 snap-x snap-mandatory scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
                    {/* Featured card (larger) */}
                    {activeFeatured && (
                        <button
                            onClick={() => handlePostClick(activeFeatured._id)}
                            className="relative w-72 h-72 shrink-0 rounded-2xl overflow-hidden snap-start cursor-pointer active:scale-[0.97] transition-transform"
                        >
                            <img
                                src={ik(activeFeatured.imageUrl, 600)}
                                alt={activeFeatured.caption?.slice(0, 80) || "Featured post"}
                                className="w-full h-full object-cover"
                                loading="eager"
                                width={600}
                                height={600}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-orange/90 text-white text-[10px] font-bold">
                                <Star className="w-3 h-3 fill-current" />
                                Featured
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-white text-sm line-clamp-2 mb-1">{activeFeatured.caption}</p>
                                <div className="flex items-center gap-1.5 text-brand-orange">
                                    <Instagram className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-medium">Bekijk</span>
                                </div>
                            </div>
                        </button>
                    )}

                    {/* Thumbnail cards */}
                    {activeThumbnails.map((post) => (
                        <button
                            key={post._id}
                            onClick={() => handlePostClick(post._id)}
                            className="relative w-56 h-56 shrink-0 rounded-2xl overflow-hidden snap-start cursor-pointer active:scale-[0.97] transition-transform"
                        >
                            <img
                                src={ik(post.imageUrl, 400)}
                                alt={post.caption?.slice(0, 60) || "Instagram post"}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                width={400}
                                height={400}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-white text-xs line-clamp-2">{post.caption}</p>
                            </div>
                        </button>
                    ))}

                    {/* CTA scroll card */}
                    <a
                        href="https://instagram.com/koninklijkeloop"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-3 w-44 h-56 shrink-0 rounded-2xl bg-glass-bg/60 border border-glass-border backdrop-blur-md snap-start cursor-pointer hover:border-brand-orange/30 transition-all active:scale-[0.97]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
                            <Instagram className="w-6 h-6 text-brand-orange" />
                        </div>
                        <span className="text-sm font-semibold text-text-primary">Meer op</span>
                        <span className="text-xs text-brand-orange font-medium">Instagram</span>
                    </a>
                </div>
            </div>

            {/* ── Desktop CTA ── */}
            <div className="hidden md:flex justify-center mt-10">
                <a
                    href="https://instagram.com/koninklijkeloop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-glass-bg/60 border border-glass-border hover:border-brand-orange/40 hover:bg-brand-orange/5 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer"
                >
                    <Instagram className="w-5 h-5 text-brand-orange" />
                    <span className="text-text-primary font-semibold">Volg @koninklijkeloop</span>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
                </a>
            </div>

            {/* Showcase Modal */}
            <SocialPostShowcaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                post={(allPosts[selectedPostIndex] as any) || null}
                allPosts={allPosts as any}
                onNavigate={handleNavigate}
                userId={userEmail}
                isAuthenticated={isAuthenticated}
            />
        </SectionShell>
    );
});
