import type { Id } from "../../../convex/_generated/dataModel";
import { Edit3, Eye, EyeOff, Star, StarOff, Trash2, ExternalLink, Instagram, Film } from "lucide-react";

interface Props {
    post: {
        _id: Id<"social_posts">;
        imageUrl: string;
        caption: string;
        instagramUrl: string;
        isFeatured: boolean;
        isVisible: boolean;
        displayOrder: number;
        mediaType?: string;
    };
    onEdit: (id: Id<"social_posts">) => void;
    onDelete: (id: Id<"social_posts">) => void;
    onToggleVisibility: (id: Id<"social_posts">) => void;
    onToggleFeatured: (id: Id<"social_posts">) => void;
}

export function SocialPostCard({
    post,
    onEdit,
    onDelete,
    onToggleVisibility,
    onToggleFeatured
}: Props) {
    const truncatedCaption = post.caption.length > 100
        ? post.caption.slice(0, 100) + "..."
        : post.caption;

    return (
        <div className="glass-card group relative overflow-hidden rounded-2xl border border-glass-border hover:border-brand-orange/30 transition-all duration-300">
            {/* Image Preview */}
            <div className="relative aspect-square overflow-hidden bg-glass-bg/50">
                <img
                    srcSet={`${post.imageUrl.replace('/De%20Koninklijkeloop/', '/tr:w-400,q-80,f-auto/De%20Koninklijkeloop/')} 400w,
                             ${post.imageUrl.replace('/De%20Koninklijkeloop/', '/tr:w-800,q-80,f-auto/De%20Koninklijkeloop/')} 800w,
                             ${post.imageUrl.replace('/De%20Koninklijkeloop/', '/tr:w-1200,q-80,f-auto/De%20Koninklijkeloop/')} 1200w`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={post.imageUrl}
                    alt={truncatedCaption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
                    loading="lazy"
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {post.isFeatured && (
                        <div className="px-2 py-1 rounded-lg bg-brand-orange text-white text-xs font-bold shadow-lg backdrop-blur-sm">
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                Featured
                            </div>
                        </div>
                    )}
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium shadow-lg backdrop-blur-sm ${post.isVisible
                        ? "bg-[rgb(var(--success))]/90 text-white dark:bg-[rgb(var(--success))]/80"
                        : "bg-[rgb(var(--muted))]/90 text-white dark:bg-[rgb(var(--muted))]/70"
                        }`}>
                        {post.isVisible ? "Zichtbaar" : "Verborgen"}
                    </div>
                </div>

                {/* Display Order Badge */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold">
                    #{post.displayOrder}
                </div>

                {/* Video Play Badge */}
                {(post.mediaType === "video") && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-bold shadow-lg">
                        <Film className="w-3 h-3" />
                        Video
                    </div>
                )}

                {/* Desktop: Hover Actions Overlay (hidden on mobile) */}
                <div className="absolute inset-0 bg-brand-orange/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center gap-2 p-4">
                    <button
                        onClick={() => onEdit(post._id)}
                        className="p-3 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-200 shadow-lg min-w-[44px] min-h-[44px] cursor-pointer"
                        title="Bewerken"
                        aria-label="Post bewerken"
                    >
                        <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onToggleVisibility(post._id)}
                        className="p-3 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-200 shadow-lg min-w-[44px] min-h-[44px] cursor-pointer"
                        title={post.isVisible ? "Verbergen" : "Tonen"}
                        aria-label={post.isVisible ? "Post verbergen" : "Post tonen"}
                    >
                        {post.isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => onToggleFeatured(post._id)}
                        className="p-3 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-200 shadow-lg min-w-[44px] min-h-[44px] cursor-pointer"
                        title={post.isFeatured ? "Unfeatured" : "Maak Featured"}
                        aria-label={post.isFeatured ? "Featured status verwijderen" : "Als featured markeren"}
                    >
                        {post.isFeatured ? <StarOff className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => onDelete(post._id)}
                        className="p-3 rounded-xl bg-red-500/40 hover:bg-red-500/60 text-white backdrop-blur-sm transition-all duration-200 shadow-lg min-w-[44px] min-h-[44px] cursor-pointer"
                        title="Verwijderen"
                        aria-label="Post verwijderen"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Mobile: Tap-to-edit overlay on image (visible on touch devices) */}
                <button
                    onClick={() => onEdit(post._id)}
                    className="absolute inset-0 md:hidden cursor-pointer"
                    aria-label="Post bewerken"
                >
                    <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/70 via-black/20 to-transparent p-3 pt-8">
                        <span className="text-white text-xs font-medium flex items-center gap-1.5 justify-center opacity-80">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Tik om te bewerken
                        </span>
                    </div>
                </button>
            </div>

            {/* Caption Preview */}
            <div className="p-4 bg-glass-bg/30 border-t border-glass-border">
                <p className="text-sm text-text-primary line-clamp-2 mb-2">
                    {truncatedCaption}
                </p>
                <a
                    href={post.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-orange hover:text-orange-400 transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink className="w-3 h-3" />
                    Bekijk op Instagram
                </a>
            </div>

            {/* Mobile: Always-visible action bar (hidden on desktop) */}
            <div className="md:hidden flex items-center border-t border-glass-border bg-glass-bg/50">
                <button
                    onClick={() => onEdit(post._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-text-muted active:bg-brand-orange/10 active:text-brand-orange active:scale-95 transition-all cursor-pointer min-h-[48px]"
                    aria-label="Post bewerken"
                >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-xs font-medium">Bewerk</span>
                </button>
                <div className="w-px h-6 bg-glass-border" />
                <button
                    onClick={() => onToggleVisibility(post._id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 active:scale-95 transition-all cursor-pointer min-h-[48px] ${post.isVisible
                        ? "text-text-muted active:bg-yellow-500/10 active:text-yellow-500"
                        : "text-green-400 active:bg-green-500/10"
                        }`}
                    aria-label={post.isVisible ? "Post verbergen" : "Post tonen"}
                >
                    {post.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="text-xs font-medium">{post.isVisible ? "Verberg" : "Toon"}</span>
                </button>
                <div className="w-px h-6 bg-glass-border" />
                <button
                    onClick={() => onToggleFeatured(post._id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 active:scale-95 transition-all cursor-pointer min-h-[48px] ${post.isFeatured
                        ? "text-brand-orange active:bg-brand-orange/10"
                        : "text-text-muted active:bg-brand-orange/10 active:text-brand-orange"
                        }`}
                    aria-label={post.isFeatured ? "Featured status verwijderen" : "Als featured markeren"}
                >
                    {post.isFeatured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    <span className="text-xs font-medium">{post.isFeatured ? "Unfeature" : "Feature"}</span>
                </button>
                <div className="w-px h-6 bg-glass-border" />
                <button
                    onClick={() => onDelete(post._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-red-400 active:bg-red-500/10 active:scale-95 transition-all cursor-pointer min-h-[48px]"
                    aria-label="Post verwijderen"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Wis</span>
                </button>
            </div>
        </div>
    );
}
