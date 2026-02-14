import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../../lib/api";
import BlogPostEditor, { type BlogPost } from "./BlogPostEditor";
import BlogCategoryManager, { type BlogCategory } from "./BlogCategoryManager";
import BlogCommentMod from "./BlogCommentMod";
import BlogConfigPanel from "./BlogConfigPanel";
import { Loader2, Plus, FileText, FolderOpen, MessageCircle, Trash2, Send, Archive, Settings } from "lucide-react";

type Tab = "posts" | "categories" | "comments" | "config";
type PostStatus = "all" | "draft" | "review" | "published" | "scheduled" | "archived";

export default function BlogManagerIsland() {
    const [activeTab, setActiveTab] = useState<Tab>("posts");
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [pendingComments, setPendingComments] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<PostStatus>("all");
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const fetchPosts = useCallback(async () => {
        try {
            const params = new URLSearchParams({ limit: "100" });
            if (statusFilter !== "all") params.set("status", statusFilter);
            const data = await apiRequest(`/blog/posts?${params}`);
            setPosts(data.posts || []);
        } catch (err) {
            console.error("[Blog] Fetch posts failed:", err);
        }
    }, [statusFilter]);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await apiRequest("/blog/categories");
            setCategories(data.categories || []);
        } catch (err) {
            console.error("[Blog] Fetch categories failed:", err);
        }
    }, []);

    const fetchCommentCount = useCallback(async () => {
        try {
            const data = await apiRequest("/blog/comments?status=pending&limit=1");
            setPendingComments(data.total || 0);
        } catch {
            // Non-critical
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchPosts(), fetchCategories(), fetchCommentCount()]);
            setLoading(false);
        };
        load();
    }, [fetchPosts, fetchCategories, fetchCommentCount]);

    const handleDeletePost = async (id: string) => {
        if (!confirm("Weet je zeker dat je dit blogbericht wilt verwijderen?")) return;
        try {
            await apiRequest(`/blog/posts/${id}`, { method: "DELETE" });
            fetchPosts();
        } catch (err) {
            console.error("[Blog] Delete failed:", err);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await apiRequest(`/blog/posts/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status: "published" }),
            });
            fetchPosts();
        } catch (err) {
            console.error("[Blog] Publish failed:", err);
        }
    };

    const handleArchive = async (id: string) => {
        try {
            await apiRequest(`/blog/posts/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status: "archived" }),
            });
            fetchPosts();
        } catch (err) {
            console.error("[Blog] Archive failed:", err);
        }
    };

    const STATUS_TABS: { value: PostStatus; label: string }[] = [
        { value: "all", label: "Alle" },
        { value: "draft", label: "Concept" },
        { value: "review", label: "Review" },
        { value: "published", label: "Gepubliceerd" },
        { value: "scheduled", label: "Ingepland" },
        { value: "archived", label: "Gearchiveerd" },
    ];

    const POST_STATUS_COLORS: Record<string, string> = {
        draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        review: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        published: "bg-green-500/10 text-green-400 border-green-500/20",
        scheduled: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        archived: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Tab Bar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="overflow-x-auto -mx-1 px-1">
                    <div className="flex gap-1 p-1 rounded-xl bg-glass-bg/30 border border-glass-border w-max min-w-full">
                        <button onClick={() => setActiveTab("posts")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === "posts" ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20" : "text-text-muted hover:text-text-primary"}`}
                        >
                            <FileText className="w-4 h-4" /> Berichten
                        </button>
                        <button onClick={() => setActiveTab("categories")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === "categories" ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20" : "text-text-muted hover:text-text-primary"}`}
                        >
                            <FolderOpen className="w-4 h-4" /> Categorieën
                        </button>
                        <button onClick={() => setActiveTab("comments")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === "comments" ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20" : "text-text-muted hover:text-text-primary"}`}
                        >
                            <MessageCircle className="w-4 h-4" /> Reacties
                            {pendingComments > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">{pendingComments}</span>
                            )}
                        </button>
                        <button onClick={() => setActiveTab("config")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === "config" ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20" : "text-text-muted hover:text-text-primary"}`}
                        >
                            <Settings className="w-4 h-4" /> Instellingen
                        </button>
                    </div>
                </div>

                {activeTab === "posts" && (
                    <button onClick={() => { setEditingPost(null); setEditorOpen(true); }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Nieuw Bericht
                    </button>
                )}
            </div>

            {/* Posts Tab */}
            {activeTab === "posts" && (
                <div className="space-y-4">
                    {/* Status Filter */}
                    <div className="overflow-x-auto">
                        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-glass-border/20 min-w-max">
                            {STATUS_TABS.map((tab) => (
                                <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${statusFilter === tab.value
                                        ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                                        : "text-text-muted hover:text-text-primary hover:bg-glass-border/30"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Post List */}
                    {posts.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="max-w-md mx-auto space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-glass-border/30 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-text-muted opacity-50" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-text-primary">Nog geen berichten</h3>
                                <p className="text-text-muted">Schrijf je eerste blogbericht om te beginnen.</p>
                                <button onClick={() => { setEditingPost(null); setEditorOpen(true); }}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Eerste Bericht Schrijven
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {posts.map((post) => {
                                const category = categories.find((c) => c.id === post.category_id);
                                return (
                                    <div key={post.id}
                                        className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:border-brand-orange/20 transition-all cursor-pointer"
                                        onClick={() => { setEditingPost(post); setEditorOpen(true); }}
                                    >
                                        {/* Cover Image */}
                                        {post.cover_image_url && (
                                            <img src={post.cover_image_url} alt={post.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                        )}
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-text-primary truncate">{post.title}</h4>
                                            <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{post.excerpt || "Geen samenvatting"}</p>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border capitalize ${POST_STATUS_COLORS[post.status] || POST_STATUS_COLORS.draft}`}>
                                                    {post.status}
                                                </span>
                                                {category && (
                                                    <span className="text-xs text-text-muted">{category.name}</span>
                                                )}
                                                {post.is_featured && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">Featured</span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex gap-2 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            {post.status === "draft" && (
                                                <button onClick={() => handlePublish(post.id)} title="Publiceren"
                                                    className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all cursor-pointer"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            {post.status === "published" && (
                                                <button onClick={() => handleArchive(post.id)} title="Archiveren"
                                                    className="p-2 rounded-lg bg-neutral-500/10 border border-neutral-500/20 text-neutral-400 hover:bg-neutral-500/20 transition-all cursor-pointer"
                                                >
                                                    <Archive className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button onClick={() => handleDeletePost(post.id)} title="Verwijderen"
                                                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
                <BlogCategoryManager
                    categories={categories}
                    onRefresh={() => { fetchCategories(); fetchPosts(); }}
                />
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
                <BlogCommentMod onCountChange={setPendingComments} />
            )}

            {/* Config Tab */}
            {activeTab === "config" && (
                <BlogConfigPanel />
            )}

            {/* Post Editor Modal */}
            <BlogPostEditor
                isOpen={editorOpen}
                onClose={() => { setEditorOpen(false); setEditingPost(null); }}
                onSaved={() => { fetchPosts(); setEditorOpen(false); setEditingPost(null); }}
                editingPost={editingPost}
                categories={categories}
            />
        </div>
    );
}
