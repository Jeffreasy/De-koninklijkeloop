import type { Id } from "../../../convex/_generated/dataModel";

interface Props {
    post: {
        _id: Id<"social_posts">;
        imageUrl: string;
        caption: string;
        instagramUrl: string;
        isFeatured: boolean;
        isVisible: boolean;
        displayOrder: number;
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
                    srcSet={`${post.imageUrl}?w=400 400w,
                             ${post.imageUrl}?w=800 800w,
                             ${post.imageUrl}?w=1200 1200w`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={post.imageUrl}
                    alt={truncatedCaption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {post.isFeatured && (
                        <div className="px-2 py-1 rounded-lg bg-brand-orange text-white text-xs font-bold shadow-lg backdrop-blur-sm">
                            <div className="flex items-center gap-1">
                                <iconify-icon icon="lucide:star" width="12" />
                                Featured
                            </div>
                        </div>
                    )}
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium shadow-lg backdrop-blur-sm ${post.isVisible
                        ? "bg-[rgb(var(--success))]/90 text-white dark:bg-[rgb(var(--success))]/80"
                        : "bg-[rgb(var(--muted))]/90 text-white dark:bg-[rgb(var(--muted))]/70"
                        }`}>
                        {post.isVisible ? "Visible" : "Hidden"}
                    </div>
                </div>

                {/* Display Order Badge */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold">
                    #{post.displayOrder}
                </div>

                {/* Hover Actions Overlay */}
                <div className="absolute inset-0 bg-brand-orange/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-4">
                    <button
                        onClick={() => onEdit(post._id)}
                        className="p-3 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-200 shadow-lg min-w-[44px] min-h-[44px] cursor-pointer"
                        title="Bewerken"
                        aria-label="Post bewerken"
                    >
                        <iconify-icon icon="lucide:edit-3" width="20" />
                    </button>
                    <button
                        onClick={() => onToggleVisibility(post._id)}
                        className="p-3 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-200 shadow-lg min-w-[44px] min-h-[44px] cursor-pointer"
                        title={post.isVisible ? "Verbergen" : "Tonen"}
                        aria-label={post.isVisible ? "Post verbergen" : "Post tonen"}
                    >
                        <iconify-icon icon={post.isVisible ? "lucide:eye-off" : "lucide:eye"} width="20" />
                    </button>
                    <button
                        onClick={() => onToggleFeatured(post._id)}
                        className="p-3 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-200 shadow-lg min-w-[44px] min-h-[44px] cursor-pointer"
                        title={post.isFeatured ? "Unfeatured" : "Maak Featured"}
                        aria-label={post.isFeatured ? "Featured status verwijderen" : "Als featured markeren"}
                    >
                        <iconify-icon icon={post.isFeatured ? "lucide:star-off" : "lucide:star"} width="20" />
                    </button>
                    <button
                        onClick={() => onDelete(post._id)}
                        className="p-3 rounded-xl bg-red-500/40 hover:bg-red-500/60 text-white backdrop-blur-sm transition-all duration-200 shadow-lg min-w-[44px] min-h-[44px] cursor-pointer"
                        title="Verwijderen"
                        aria-label="Post verwijderen"
                    >
                        <iconify-icon icon="lucide:trash-2" width="20" />
                    </button>
                </div>
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
                    <iconify-icon icon="lucide:external-link" width="12" />
                    Bekijk op Instagram
                </a>
            </div>
        </div>
    );
}
