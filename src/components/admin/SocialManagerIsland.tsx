import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { SocialPostCard } from "./SocialPostCard";
import { SocialPostModal, type SocialPostFormData } from "./SocialPostModal";
import { Plus, Instagram, Calendar } from "lucide-react";
import { useStore } from "@nanostores/react";
import { $user } from "../../lib/auth";

type FilterType = "all" | "visible" | "hidden" | "featured";

// DKL event happens in May each year.
// Posts are bucketed by the event year they relate to:
//   "2024" = Editie 2024 (event mei 2024) → seizoen 23/24
//   "2025" = Editie 2025 (event mei 2025) → seizoen 24/25
//   "2026" = Editie 2026 (event mei 2026) → seizoen 25/26 (huidig)
const EDITIONS = [
    { value: "2026", label: "2026", sublabel: "seizoen 25/26" },
    { value: "2025", label: "2025", sublabel: "seizoen 24/25" },
    { value: "2024", label: "2024", sublabel: "seizoen 23/24" },
] as const;
type YearType = typeof EDITIONS[number]["value"];

function editionLabel(year: string): string {
    const ed = EDITIONS.find(e => e.value === year);
    return ed ? `Editie ${ed.label} (${ed.sublabel})` : year;
}

type EditingPost = {
    _id: Id<"social_posts">;
    imageUrl: string;
    caption: string;
    instagramUrl: string;
    isFeatured: boolean;
    isVisible: boolean;
    postedDate?: number;
    year?: string;
    mediaType?: "image" | "video";
    videoUrl?: string;
    mediaItems?: { url: string; type: "image" | "video"; videoUrl?: string }[];
} | null;

export function SocialManagerIsland() {
    const user = useStore($user);

    // Year state — default to most recent
    const [selectedYear, setSelectedYear] = useState<YearType>("2026");

    // Convex hooks — scoped by year
    const posts = useQuery(api.socialPosts.listAll, { year: selectedYear });
    const createPost = useMutation(api.socialPosts.create);
    const updatePost = useMutation(api.socialPosts.update);
    const deletePost = useMutation(api.socialPosts.remove);
    const toggleVisibility = useMutation(api.socialPosts.toggleVisibility);
    const toggleFeatured = useMutation(api.socialPosts.toggleFeatured);

    // Local state
    const [filter, setFilter] = useState<FilterType>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<EditingPost>(null);

    // Filter posts
    const filteredPosts = posts?.filter((post: any) => {
        if (filter === "all") return true;
        if (filter === "visible") return post.isVisible;
        if (filter === "hidden") return !post.isVisible;
        if (filter === "featured") return post.isFeatured;
        return true;
    }) || [];

    // Handlers
    const handleCreate = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const handleEdit = (id: Id<"social_posts">) => {
        const post = posts?.find((p: any) => p._id === id);
        if (post) {
            setEditingPost({
                _id: post._id,
                imageUrl: post.imageUrl,
                caption: post.caption,
                instagramUrl: post.instagramUrl,
                isFeatured: post.isFeatured,
                isVisible: post.isVisible,
                postedDate: post.postedDate != null ? Number(post.postedDate) : undefined,
                year: post.year,
                mediaType: post.mediaType,
                videoUrl: post.videoUrl,
                mediaItems: post.mediaItems,
            });
            setIsModalOpen(true);
        }
    };

    const handleSave = async (formData: SocialPostFormData) => {
        const updatedBy = user?.email || "admin@dkl.nl";

        if (editingPost) {
            await updatePost({
                id: editingPost._id,
                ...formData,
                updatedBy,
            });
        } else {
            await createPost({
                ...formData,
                year: selectedYear,
                updatedBy,
            });
        }
    };

    const handleDelete = async (id: Id<"social_posts">) => {
        if (confirm("Weet je zeker dat je deze post wilt verwijderen?")) {
            await deletePost({ id });
        }
    };

    const handleToggleVisibility = async (id: Id<"social_posts">) => {
        await toggleVisibility({ id, updatedBy: user?.email || "admin@dkl.nl" });
    };

    const handleToggleFeatured = async (id: Id<"social_posts">) => {
        await toggleFeatured({ id, updatedBy: user?.email || "admin@dkl.nl" });
    };

    // Loading state
    if (posts === undefined) {
        return (
            <div className="space-y-6 animate-pulse" aria-hidden="true">
                <div className="glass-card p-3 h-[66px] bg-glass-bg/20" />
                <div className="glass-card p-4 flex justify-between gap-4">
                    <div className="h-11 w-full md:w-[300px] bg-glass-surface/50 rounded-xl" />
                    <div className="h-11 w-32 bg-brand-orange/20 rounded-xl hidden md:block" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card h-[400px] bg-glass-bg/20" />
                    ))}
                </div>
            </div>
        );
    }

    const totalCount = posts.length;
    const visibleCount = posts.filter((p: any) => p.isVisible).length;
    const featuredCount = posts.filter((p: any) => p.isFeatured).length;

    return (
        <div className="space-y-6">
            {/* Year Tabs */}
            <div className="glass-card p-3">
                <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-text-muted shrink-0" />
                    <div className="flex items-center gap-1.5 p-1 bg-glass-border/20 rounded-xl w-full sm:w-auto">
                        {EDITIONS.map((edition) => (
                            <button
                                key={edition.value}
                                onClick={() => {
                                    setSelectedYear(edition.value);
                                    setFilter("all");
                                }}
                                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 flex flex-col items-center leading-tight ${selectedYear === edition.value
                                    ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/25"
                                    : "text-text-muted hover:text-text-primary hover:bg-glass-border/30"
                                    }`}
                                aria-label={`Toon posts van editie ${edition.label}`}
                                aria-pressed={selectedYear === edition.value}
                            >
                                <span className="font-bold">{edition.label}</span>
                                <span className={`text-[10px] font-normal ${selectedYear === edition.value ? "text-white/80" : "text-text-muted"}`}>
                                    {edition.sublabel}
                                </span>
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-text-muted hidden sm:inline ml-auto">
                        {editionLabel(selectedYear)}
                    </span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="glass-card p-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
                    {/* Left: Filters */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 flex-wrap w-full md:w-auto">
                        {/* Filter Buttons */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-1 bg-glass-border/20 rounded-xl w-full md:w-auto">
                            {[
                                { value: "all" as FilterType, label: "Alle", count: totalCount },
                                { value: "visible" as FilterType, label: "Zichtbaar", count: visibleCount },
                                { value: "hidden" as FilterType, label: "Verborgen", count: totalCount - visibleCount },
                                { value: "featured" as FilterType, label: "Featured", count: featuredCount },
                            ].map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => setFilter(f.value)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 ${filter === f.value
                                        ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                                        : "text-text-muted hover:text-text-primary hover:bg-glass-border/30"
                                        }`}
                                    aria-label={`Filter op ${f.label.toLowerCase()}`}
                                >
                                    {f.label} ({f.count})
                                </button>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="px-3 py-2 rounded-xl bg-glass-border/20 text-xs font-medium text-text-muted border border-glass-border">
                            {filteredPosts.length} posts
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all duration-200 shadow-lg shadow-brand-orange/20 w-full md:w-auto min-h-[44px] cursor-pointer"
                        aria-label="Nieuwe social media post toevoegen"
                    >
                        <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Nieuwe Post
                        </div>
                    </button>
                </div>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-glass-border/30 flex items-center justify-center">
                            <Instagram className="w-8 h-8 text-text-muted opacity-50" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-text-primary">
                            Nog geen posts in {editionLabel(selectedYear)}
                        </h3>
                        <p className="text-text-muted">
                            {filter === "all"
                                ? `Voeg je eerste Instagram post toe voor ${editionLabel(selectedYear)}.`
                                : `Geen posts gevonden met filter: ${filter}`
                            }
                        </p>
                        {filter === "all" && (
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all duration-200 shadow-lg shadow-brand-orange/20 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                Eerste Post Toevoegen
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPosts.map((post: any) => (
                        <SocialPostCard
                            key={post._id}
                            post={post}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleVisibility={handleToggleVisibility}
                            onToggleFeatured={handleToggleFeatured}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <SocialPostModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPost(null);
                }}
                onSave={handleSave}
                editingPost={editingPost}
            />
        </div>
    );
}
