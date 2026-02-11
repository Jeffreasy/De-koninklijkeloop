import { useState, useCallback, memo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Instagram, AlertCircle, RefreshCw } from "lucide-react";
import { SocialPostShowcaseModal } from "./SocialPostShowcaseModal";
import { useStore } from "@nanostores/react";
import { $accessToken, $user } from "../../../lib/auth";

// ─── ImageKit URL helper ───

function ik(url: string, width: number): string {
    if (!url.includes("imagekit.io")) return url;
    return url.replace("/De%20Koninklijkeloop/", `/tr:w-${width},q-80,f-auto/De%20Koninklijkeloop/`);
}

function srcSet(url: string, widths: number[]): string {
    return widths.map((w) => `${ik(url, w)} ${w}w`).join(", ");
}

// ─── Types ───

interface SSRPost {
    _id: string;
    imageUrl: string;
    caption: string;
    instagramUrl: string;
    isFeatured: boolean;
    isVisible?: boolean;
    displayOrder?: number;
    postedDate?: string;
}

interface Props {
    ssrFeatured?: SSRPost | null;
    ssrThumbnails?: SSRPost[];
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

    // Loading state: Convex queries return undefined while loading
    const isLoading = featuredPost === undefined && thumbnailPosts === undefined;

    // Use Convex data when available, SSR data as fallback
    const activeFeatured = featuredPost ?? ssrFeatured ?? null;
    const activeThumbnails = thumbnailPosts ?? ssrThumbnails ?? [];

    // Combine for modal navigation
    const allPosts = [
        ...(activeFeatured ? [activeFeatured] : []),
        ...activeThumbnails,
    ] as SSRPost[];

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
            if (direction === "prev" && selectedPostIndex > 0) {
                setSelectedPostIndex(selectedPostIndex - 1);
            } else if (direction === "next" && selectedPostIndex < allPosts.length - 1) {
                setSelectedPostIndex(selectedPostIndex + 1);
            }
        },
        [selectedPostIndex, allPosts.length]
    );

    // Error state
    if (hasError) {
        return (
            <section className="py-24 relative overflow-hidden" aria-label="Instagram social media">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="max-w-md mx-auto space-y-4 p-8 rounded-3xl bg-glass-bg/40 border border-glass-border backdrop-blur-xl">
                        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                        <p className="text-text-primary font-medium">Kon Instagram posts niet laden</p>
                        <button
                            onClick={() => setHasError(false)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Opnieuw proberen
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // Loading skeleton (only if no SSR data available)
    if (isLoading && !hasContent) {
        return (
            <section className="py-24 relative overflow-hidden" aria-label="Instagram social media laden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <div className="h-12 w-80 mx-auto rounded-2xl bg-glass-border/20 animate-pulse" />
                        <div className="h-5 w-64 mx-auto rounded-xl bg-glass-border/15 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Featured skeleton */}
                        <div className="lg:row-span-2 aspect-square lg:aspect-[4/5] rounded-3xl bg-glass-bg/40 border border-glass-border animate-pulse overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-glass-border/30 via-glass-border/10 to-glass-border/30 animate-shimmer" />
                        </div>
                        {/* Thumbnail skeletons */}
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-square rounded-2xl bg-glass-bg/40 border border-glass-border animate-pulse overflow-hidden"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="w-full h-full bg-gradient-to-br from-glass-border/30 via-glass-border/10 to-glass-border/30" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Empty state
    if (!hasContent) {
        return (
            <section className="py-24 relative overflow-hidden" aria-label="Instagram social media">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-primary tracking-tight">
                            Volg ons op{" "}
                            <span className="text-royal-gradient">Instagram</span>
                        </h2>
                        <p className="text-muted text-lg max-w-2xl mx-auto">
                            Blijf op de hoogte van de laatste updates, foto's en behind the scenes.
                        </p>
                        <a
                            href="https://instagram.com/koninklijkeloop"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-brand-orange hover:text-orange-400 transition-colors font-medium"
                        >
                            <Instagram className="w-5 h-5" />
                            @koninklijkeloop
                        </a>
                    </div>
                    <div className="text-center py-12">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-glass-border/30 flex items-center justify-center">
                                <Instagram className="w-8 h-8 text-muted opacity-50" />
                            </div>
                            <p className="text-muted">Nog geen Instagram posts toegevoegd.</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 relative overflow-hidden" aria-label="Instagram social media">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-primary tracking-tight">
                        Volg ons op{" "}
                        <span className="text-brand-orange drop-shadow-sm brightness-110">
                            Instagram
                        </span>
                    </h2>
                    <p className="text-muted text-lg max-w-2xl mx-auto">
                        Blijf op de hoogte van de laatste updates, foto's en behind the scenes.
                    </p>
                    <a
                        href="https://instagram.com/koninklijkeloop"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-brand-orange hover:text-orange-400 transition-colors font-medium"
                    >
                        <Instagram className="w-5 h-5" />
                        @koninklijkeloop
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Featured Post (Large, Left Side) */}
                    {activeFeatured && (
                        <button
                            onClick={() => handlePostClick(activeFeatured._id)}
                            className="lg:row-span-2 group relative aspect-square lg:aspect-[4/5] overflow-hidden rounded-3xl glass-card transition-all duration-300 shadow-xl cursor-pointer active:scale-[0.98] hover:border-brand-orange/30"
                        >
                            <img
                                src={ik(activeFeatured.imageUrl, 800)}
                                srcSet={srcSet(activeFeatured.imageUrl, [400, 800, 1200])}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                alt={activeFeatured.caption?.slice(0, 100) || "Featured Instagram post"}
                                className="h-full w-full object-cover transition-transform duration-300 md:group-hover:scale-110 will-change-transform"
                                loading="eager"
                                width={800}
                                height={1000}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-70 md:group-hover:opacity-90 transition-opacity duration-300" />

                            {/* Featured Badge */}
                            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-lg backdrop-blur-sm">
                                <div className="flex items-center gap-1">
                                    <iconify-icon icon="lucide:star" width="14" />
                                    Featured
                                </div>
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                                <p className="text-sm md:text-base line-clamp-3 mb-4 leading-relaxed">
                                    {activeFeatured.caption}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-brand-orange">
                                        <Instagram className="w-5 h-5" />
                                        <span className="text-xs font-medium">Klik om te bekijken</span>
                                    </div>
                                    {activeFeatured.postedDate && (
                                        <span className="text-xs text-white/60">
                                            {new Date(activeFeatured.postedDate).toLocaleDateString("nl-NL", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Hover Indicator */}
                            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-brand-orange/0 group-hover:bg-brand-orange/20 backdrop-blur-sm items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100">
                                <iconify-icon icon="lucide:maximize-2" width="28" className="text-white" />
                            </div>
                        </button>
                    )}

                    {/* Thumbnail Grid (Right Side) */}
                    {activeThumbnails.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                            {activeThumbnails.map((post) => (
                                <button
                                    key={post._id}
                                    onClick={() => handlePostClick(post._id)}
                                    className="group relative aspect-square overflow-hidden rounded-2xl glass-card transition-all duration-300 shadow-md cursor-pointer active:scale-95 hover:border-brand-blue-light/30"
                                >
                                    <img
                                        src={ik(post.imageUrl, 400)}
                                        srcSet={srcSet(post.imageUrl, [200, 400, 600])}
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                                        alt={post.caption?.slice(0, 80) || "Instagram post"}
                                        className="h-full w-full object-cover transition-transform duration-300 md:group-hover:scale-110 will-change-transform"
                                        loading="lazy"
                                        width={400}
                                        height={400}
                                    />
                                    {/* Hover Overlay */}
                                    <div className="hidden md:flex absolute inset-0 bg-brand-blue/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col items-center justify-center p-4">
                                        <p className="text-white text-xs line-clamp-4 text-center font-medium mb-3">
                                            {post.caption || "Bekijk post"}
                                        </p>
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-orange text-white">
                                            <iconify-icon icon="lucide:maximize-2" width="20" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
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
        </section>
    );
});
