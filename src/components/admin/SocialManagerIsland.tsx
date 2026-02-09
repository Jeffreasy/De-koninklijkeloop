import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { SocialPostCard } from "./SocialPostCard";
import { SocialPostModal, type SocialPostFormData } from "./SocialPostModal";
import { Loader2, Plus } from "lucide-react";
import { useStore } from "@nanostores/react";
import { $accessToken } from "../../lib/auth";

type FilterType = "all" | "visible" | "hidden" | "featured";

export function SocialManagerIsland() {
    const accessToken = useStore($accessToken);

    // Convex hooks
    const posts = useQuery(api.socialPosts.listAll);
    const createPost = useMutation(api.socialPosts.create);
    const updatePost = useMutation(api.socialPosts.update);
    const deletePost = useMutation(api.socialPosts.remove);
    const toggleVisibility = useMutation(api.socialPosts.toggleVisibility);
    const toggleFeatured = useMutation(api.socialPosts.toggleFeatured);

    // Local state
    const [filter, setFilter] = useState<FilterType>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);

    // Filter posts
    const filteredPosts = posts?.filter((post) => {
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
        const post = posts?.find((p) => p._id === id);
        if (post) {
            setEditingPost(post);
            setIsModalOpen(true);
        }
    };

    const handleSave = async (formData: SocialPostFormData) => {
        const updatedBy = "admin@dkl.nl"; // TODO: Get from auth context

        if (editingPost) {
            // Update existing
            await updatePost({
                id: editingPost._id,
                ...formData,
                updatedBy,
            });
        } else {
            // Create new
            await createPost({
                ...formData,
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
        await toggleVisibility({
            id,
            updatedBy: "admin@dkl.nl" // TODO: Get from auth
        });
    };

    const handleToggleFeatured = async (id: Id<"social_posts">) => {
        await toggleFeatured({
            id,
            updatedBy: "admin@dkl.nl" // TODO: Get from auth
        });
    };

    // Loading state
    if (posts === undefined) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
            </div>
        );
    }

    const totalCount = posts.length;
    const visibleCount = posts.filter((p) => p.isVisible).length;
    const featuredCount = posts.filter((p) => p.isFeatured).length;

    return (
        <div className="space-y-6">
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
                                    className={`px-3 py-2 md:py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] cursor-pointer ${filter === f.value
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
                            <iconify-icon icon="lucide:instagram" width="32" className="text-text-muted opacity-50" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-text-primary">
                            Nog geen posts
                        </h3>
                        <p className="text-text-muted">
                            {filter === "all"
                                ? "Voeg je eerste Instagram post toe om te beginnen."
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
                    {filteredPosts.map((post) => (
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
