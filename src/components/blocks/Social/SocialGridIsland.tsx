import { useState, useCallback, useMemo, memo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Instagram, AlertCircle, RefreshCw, Star, Maximize2, ArrowRight, Calendar, Film } from "lucide-react";
import { SocialPostShowcaseModal } from "./SocialPostShowcaseModal";
import { ik, ikSrcSet, ikSquare, ikSquareSrcSet } from "../../../lib/imagekit";
import { useStore } from "@nanostores/react";
import { $accessToken, $user } from "../../../lib/auth";
import type { SSRPost } from "./types";

function srcSet(url: string, widths: number[]): string {
    return ikSrcSet(url, widths);
}

function squareSrcSet(url: string, sizes: number[]): string {
    return ikSquareSrcSet(url, sizes);
}

// ─── Editions Config ───

const EDITIONS = [
    { value: "2026", label: "25/26" },
    { value: "2025", label: "24/25" },
    { value: "2024", label: "23/24" },
] as const;

// ─── Props ───

interface Props {
    ssrFeatured?: SSRPost | null;
    ssrThumbnails?: SSRPost[];
}

// ─── Section Shell ───

function SectionShell({ children }: { children: React.ReactNode }) {
    return (
        <section className="py-20 md:py-28 relative overflow-hidden" aria-label="Instagram social media">
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

// ─── Edition Row Component ───

function EditionRow({
    year,
    label,
    onPostClick,
}: {
    year: string;
    label: string;
    onPostClick: (postId: string) => void;
}) {
    const featured = useQuery(api.socialPosts.getFeatured, { year });
    const thumbnails = useQuery(api.socialPosts.getThumbnails, { year });

    const isLoading = featured === undefined && thumbnails === undefined;
    const activeFeatured = featured ?? null;
    const activeThumbnails = thumbnails ?? [];
    const hasContent = !!activeFeatured || activeThumbnails.length > 0;

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[160px]">
                    <div className="col-span-2 row-span-2 rounded-2xl bg-glass-bg/40 border border-glass-border" />
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl bg-glass-bg/40 border border-glass-border" style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                </div>
                <div className="md:hidden flex gap-3 overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-48 h-48 rounded-xl bg-glass-bg/40 border border-glass-border shrink-0" />
                    ))}
                </div>
            </div>
        );
    }

    // No content for this edition
    if (!hasContent) {
        return (
            <div className="flex items-center justify-center py-12 rounded-2xl border border-dashed border-glass-border/30 bg-glass-bg/20">
                <p className="text-sm text-text-muted/50">Nog geen posts voor {label.toLowerCase()}</p>
            </div>
        );
    }

    return (
        <div>
            {/* Desktop: Mini Bento Grid */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[160px]">
                {/* Featured Post — spans 2×2 */}
                {activeFeatured && (
                    <button
                        onClick={() => onPostClick(activeFeatured._id)}
                        className="col-span-2 row-span-2 group relative overflow-hidden rounded-2xl bg-glass-bg border border-glass-border/60 hover:border-brand-orange/40 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-brand-orange/10 cursor-pointer active:scale-[0.99]"
                    >
                        <img
                            src={ik(activeFeatured.imageUrl, 800, 800)}
                            srcSet={squareSrcSet(activeFeatured.imageUrl, [400, 800])}
                            sizes="(max-width: 1024px) 50vw, 33vw"
                            alt={activeFeatured.caption?.slice(0, 100) || "Featured Instagram post"}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                            loading="lazy"
                            width={800}
                            height={800}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-orange/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-lg">
                                <Star className="w-3 h-3 fill-current" />
                                Featured
                            </div>
                            {activeFeatured.mediaType === "video" && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold shadow-lg">
                                    <Film className="w-3 h-3" />
                                    Video
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                            <p className="text-sm line-clamp-2 mb-2 leading-relaxed text-white/90">
                                {activeFeatured.caption}
                            </p>
                            <div className="flex items-center gap-2 text-brand-orange">
                                <Instagram className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Bekijk post</span>
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 border border-white/20">
                            {activeFeatured.mediaType === "video" ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-0.5">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                            ) : (
                                <Maximize2 className="w-5 h-5 text-white" />
                            )}
                        </div>
                    </button>
                )}

                {/* Thumbnail Grid */}
                {activeThumbnails.map((post) => (
                    <button
                        key={post._id}
                        onClick={() => onPostClick(post._id)}
                        className="col-span-1 row-span-1 group relative overflow-hidden rounded-xl bg-glass-bg border border-glass-border/50 hover:border-brand-orange/30 transition-all duration-500 shadow-md hover:shadow-xl cursor-pointer active:scale-[0.97]"
                    >
                        <img
                            src={ikSquare(post.imageUrl, 400)}
                            srcSet={squareSrcSet(post.imageUrl, [200, 400])}
                            sizes="(max-width: 1024px) 33vw, 25vw"
                            alt={post.caption?.slice(0, 80) || "Instagram post"}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
                            loading="lazy"
                            width={400}
                            height={400}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex flex-col items-center justify-end p-3">
                            <p className="text-white text-xs line-clamp-2 text-center font-medium mb-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                {post.caption || "Bekijk post"}
                            </p>
                            <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                <Maximize2 className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Mobile: Horizontal Scroll Strip */}
            <div className="md:hidden -mx-4 sm:-mx-6">
                <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 pb-4 snap-x snap-mandatory scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
                    {activeFeatured && (
                        <button
                            onClick={() => onPostClick(activeFeatured._id)}
                            className="relative w-64 h-64 shrink-0 rounded-2xl overflow-hidden snap-start cursor-pointer active:scale-[0.97] transition-transform"
                        >
                            <img
                                src={ikSquare(activeFeatured.imageUrl, 600)}
                                alt={activeFeatured.caption?.slice(0, 80) || "Featured post"}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                width={600}
                                height={600}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-orange/90 text-white text-[10px] font-bold">
                                <Star className="w-3 h-3 fill-current" />
                                Featured
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-white text-sm line-clamp-2 mb-1">{activeFeatured.caption}</p>
                                <div className="flex items-center gap-1.5 text-brand-orange">
                                    <Instagram className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-medium">Bekijk</span>
                                </div>
                            </div>
                        </button>
                    )}

                    {activeThumbnails.map((post) => (
                        <button
                            key={post._id}
                            onClick={() => onPostClick(post._id)}
                            className="relative w-48 h-48 shrink-0 rounded-xl overflow-hidden snap-start cursor-pointer active:scale-[0.97] transition-transform"
                        >
                            <img
                                src={ikSquare(post.imageUrl, 400)}
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
                </div>
            </div>
        </div >
    );
}

// ─── Main Component ───

export const SocialGridIsland = memo(function SocialGridIsland({
    ssrFeatured,
    ssrThumbnails,
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPostIndex, setSelectedPostIndex] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [selectedYear, setSelectedYear] = useState(EDITIONS[0].value);

    // Auth state
    const accessToken = useStore($accessToken);
    const user = useStore($user);
    const isAuthenticated = !!accessToken && !!user;
    const userEmail = user?.email || null;

    // Fetch posts for selected year only (for modal navigation)
    const yearPosts = useQuery(api.socialPosts.listPublic, { year: selectedYear });

    // Combine with SSR fallback (only for default year)
    const allPosts = useMemo(() => {
        if (yearPosts && yearPosts.length > 0) return yearPosts as SSRPost[];
        if (selectedYear === EDITIONS[0].value) {
            return [
                ...(ssrFeatured ? [ssrFeatured] : []),
                ...(ssrThumbnails ?? []),
            ] as SSRPost[];
        }
        return [] as SSRPost[];
    }, [yearPosts, ssrFeatured, ssrThumbnails, selectedYear]);

    const hasContent = allPosts.length > 0;

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

    const handleTabChange = useCallback((year: string) => {
        setSelectedYear(year);
        setSelectedPostIndex(0);
    }, []);

    // ─── Section Header + Tabs ───

    const SectionHeader = useCallback(() => (
        <div className="text-center mb-12 md:mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-widest">
                <Instagram className="w-3.5 h-3.5" />
                @koninklijkeloop
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-text-primary">
                Volg ons op{" "}
                <span className="bg-linear-to-r from-brand-orange via-amber-400 to-brand-orange bg-clip-text text-transparent">
                    Instagram
                </span>
            </h2>
            <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Blijf op de hoogte van de laatste updates, foto's en behind the scenes.
            </p>

            {/* Year Tab Selector */}
            <div className="flex items-center justify-center gap-2">
                {EDITIONS.map((edition) => (
                    <button
                        key={edition.value}
                        onClick={() => handleTabChange(edition.value)}
                        className={`
                            px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer
                            ${selectedYear === edition.value
                                ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/25"
                                : "bg-glass-bg/60 text-text-muted border border-glass-border hover:border-brand-orange/30 hover:text-text-primary"
                            }
                        `}
                    >
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Editie {edition.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    ), [selectedYear, handleTabChange]);

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

    // ─── Main: Single Edition with Tabs ───

    return (
        <SectionShell>
            <SectionHeader />

            {/* Single Edition Content */}
            <EditionRow
                key={selectedYear}
                year={selectedYear}
                label={`Editie ${EDITIONS.find(e => e.value === selectedYear)?.label || selectedYear}`}
                onPostClick={handlePostClick}
            />

            {/* Desktop CTA */}
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

            {/* Mobile CTA */}
            <div className="md:hidden flex justify-center mt-6">
                <a
                    href="https://instagram.com/koninklijkeloop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm font-semibold hover:bg-brand-orange/20 transition-all cursor-pointer"
                >
                    <Instagram className="w-4 h-4" />
                    Volg @koninklijkeloop
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
