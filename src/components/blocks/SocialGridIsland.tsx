import { useState, useCallback, memo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Instagram } from "lucide-react";
import { SocialPostShowcaseModal } from "./SocialPostShowcaseModal";
import { useStore } from "@nanostores/react";
import { $accessToken, $user } from "../../lib/auth";

export const SocialGridIsland = memo(function SocialGridIsland() {
    const featuredPost = useQuery(api.socialPosts.getFeatured);
    const thumbnailPosts = useQuery(api.socialPosts.getThumbnails, { limit: 7 });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPostIndex, setSelectedPostIndex] = useState(0);

    // Auth state
    const accessToken = useStore($accessToken);
    const user = useStore($user);
    const isAuthenticated = !!accessToken && !!user;
    const userEmail = user?.email || null;

    // Combine featured and thumbnails for modal navigation
    const allPosts = [
        ...(featuredPost ? [featuredPost] : []),
        ...(thumbnailPosts || []),
    ];

    const hasContent = allPosts.length > 0;

    // Memoize event handlers
    const handlePostClick = useCallback((postId: string) => {
        const index = allPosts.findIndex((p) => p._id === postId);
        if (index !== -1) {
            setSelectedPostIndex(index);
            setIsModalOpen(true);
        }
    }, [allPosts]);

    const handleNavigate = useCallback((direction: "prev" | "next") => {
        if (direction === "prev" && selectedPostIndex > 0) {
            setSelectedPostIndex(selectedPostIndex - 1);
        } else if (direction === "next" && selectedPostIndex < allPosts.length - 1) {
            setSelectedPostIndex(selectedPostIndex + 1);
        }
    }, [selectedPostIndex, allPosts.length]);

    if (!hasContent) {
        return (
            <section className="py-24 relative overflow-hidden">

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-primary tracking-tight">
                            Volg ons op{" "}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-orange to-orange-400">
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
                            className="inline-flex items-center gap-2 text-accent-primary hover:text-brand-orange transition-colors font-medium"
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
        <section className="py-24 relative overflow-hidden">

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-primary tracking-tight">
                        Volg ons op{" "}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-orange to-orange-400">
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
                        className="inline-flex items-center gap-2 text-accent-primary hover:text-brand-orange transition-colors font-medium"
                    >
                        <Instagram className="w-5 h-5" />
                        @koninklijkeloop
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Featured Post (Large, Left Side) */}
                    {featuredPost && (
                        <button
                            onClick={() => handlePostClick(featuredPost._id)}
                            className="lg:row-span-2 group relative aspect-square lg:aspect-4/5 overflow-hidden rounded-3xl glass-card transition-all duration-300 shadow-xl cursor-pointer active:scale-[0.98] hover:border-brand-orange/30"
                        >
                            {/* Image */}
                            <img
                                src={featuredPost.imageUrl}
                                alt={featuredPost.caption.slice(0, 100) || "Featured Instagram post"}
                                className="h-full w-full object-cover transition-transform duration-300 md:group-hover:scale-110 will-change-transform"
                                loading="lazy"
                            />

                            {/* Gradient Overlay - Bottom */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-70 md:group-hover:opacity-90 transition-opacity duration-300" />

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
                                    {featuredPost.caption}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-brand-orange">
                                        <Instagram className="w-5 h-5" />
                                        <span className="text-xs font-medium">Klik om te bekijken</span>
                                    </div>
                                    {featuredPost.postedDate && (
                                        <span className="text-xs text-white/70">
                                            {new Date(featuredPost.postedDate).toLocaleDateString("nl-NL", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Hover Indicator - Desktop Only */}
                            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-brand-orange/0 group-hover:bg-brand-orange/20 backdrop-blur-sm items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100">
                                <iconify-icon icon="lucide:maximize-2" width="28" className="text-white" />
                            </div>
                        </button>
                    )}

                    {/* Thumbnail Grid (Right Side) */}
                    {thumbnailPosts && thumbnailPosts.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                            {thumbnailPosts.map((post) => (
                                <button
                                    key={post._id}
                                    onClick={() => handlePostClick(post._id)}
                                    className="group relative aspect-square overflow-hidden rounded-2xl glass-card transition-all duration-300 shadow-md cursor-pointer active:scale-95 hover:border-brand-blue-light/30"
                                >
                                    {/* Image */}
                                    <img
                                        src={post.imageUrl}
                                        alt={post.caption.slice(0, 80) || "Instagram post"}
                                        className="h-full w-full object-cover transition-transform duration-300 md:group-hover:scale-110 will-change-transform"
                                        loading="lazy"
                                    />

                                    {/* Hover Overlay - Desktop Only */}
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
                post={allPosts[selectedPostIndex] || null}
                allPosts={allPosts}
                onNavigate={handleNavigate}
                userId={userEmail}
                isAuthenticated={isAuthenticated}
            />
        </section>
    );
});
