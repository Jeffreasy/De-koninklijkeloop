import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../../lib/api";
import { addToast } from "../../lib/toast";
import { XCampaignModal, type Campaign } from "./XCampaignModal";
import { XPostEditor, type XPost } from "./XPostEditor";
import XPostCard from "./XPostCard";
import XBudgetWidget from "./XBudgetWidget";
import { Loader2, Plus, ListFilter, Megaphone, Send } from "lucide-react";

type PostStatus = "all" | "draft" | "approved" | "queued" | "published" | "failed";

export default function XPosterIsland() {
    // Data
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [posts, setPosts] = useState<XPost[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<PostStatus>("all");

    // Modals
    const [campaignModalOpen, setCampaignModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [postEditorOpen, setPostEditorOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<XPost | null>(null);

    // Fetch
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [campaignsRes, postsRes] = await Promise.all([
                apiRequest("/admin/social/campaigns?limit=100"),
                apiRequest(`/admin/social/posts?limit=100${statusFilter !== "all" ? `&status=${statusFilter}` : ""}`),
            ]);
            setCampaigns(campaignsRes.campaigns || []);
            setPosts(postsRes.posts || []);
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XPoster] Fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Filtered posts
    const filteredPosts = posts.filter((p) => {
        if (selectedCampaign !== "all" && p.campaign_id !== selectedCampaign) return false;
        return true;
    });

    // Handlers
    const handleCreateCampaign = () => {
        setEditingCampaign(null);
        setCampaignModalOpen(true);
    };

    const handleEditCampaign = (c: Campaign) => {
        setEditingCampaign(c);
        setCampaignModalOpen(true);
    };

    const handleCreatePost = () => {
        setEditingPost(null);
        setPostEditorOpen(true);
    };

    const handleEditPost = (p: XPost) => {
        setEditingPost(p);
        setPostEditorOpen(true);
    };

    const handleApprove = async (id: string) => {
        try {
            await apiRequest(`/admin/social/posts/${id}/approve`, { method: "POST" });
            addToast("Post goedgekeurd", "success");
            fetchData();
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XPoster] Approve failed:", err);
            addToast("Goedkeuren mislukt", "error");
        }
    };

    const handleQueue = async (id: string) => {
        try {
            await apiRequest(`/admin/social/posts/${id}/queue`, { method: "POST" });
            addToast("Post in wachtrij geplaatst", "success");
            fetchData();
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XPoster] Queue failed:", err);
            addToast("In wachtrij plaatsen mislukt", "error");
        }
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze post wilt verwijderen?")) return;
        try {
            await apiRequest(`/admin/social/posts/${id}`, { method: "DELETE" });
            addToast("Post verwijderd", "success");
            fetchData();
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XPoster] Delete failed:", err);
            addToast("Verwijderen mislukt", "error");
        }
    };

    const statusCounts = posts.reduce(
        (acc, p) => {
            acc.all++;
            if (p.status in acc) acc[p.status as PostStatus]++;
            return acc;
        },
        { all: 0, draft: 0, approved: 0, queued: 0, published: 0, failed: 0 } as Record<PostStatus, number>
    );

    const STATUS_TABS: { value: PostStatus; label: string }[] = [
        { value: "all", label: "Alle" },
        { value: "draft", label: "Concept" },
        { value: "approved", label: "Goedgekeurd" },
        { value: "queued", label: "Wachtrij" },
        { value: "published", label: "Gepubliceerd" },
        { value: "failed", label: "Mislukt" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Bar: Budget + Actions */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <XBudgetWidget />
                <div className="flex gap-3">
                    <button
                        onClick={handleCreateCampaign}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-glass-border text-text-primary hover:bg-glass-bg/40 transition-all text-sm font-medium cursor-pointer"
                    >
                        <Megaphone className="w-4 h-4" />
                        Nieuwe Campagne
                    </button>
                    <button
                        onClick={handleCreatePost}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Nieuwe Post
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="glass-card p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-glass-border/20">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setStatusFilter(tab.value)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${statusFilter === tab.value
                                    ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                                    : "text-text-muted hover:text-text-primary hover:bg-glass-border/30"
                                    }`}
                            >
                                {tab.label} ({statusCounts[tab.value]})
                            </button>
                        ))}
                    </div>

                    {/* Campaign Filter */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <ListFilter className="w-4 h-4 text-text-muted shrink-0" />
                        <select
                            value={selectedCampaign}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm focus:border-brand-orange/50 outline-none cursor-pointer"
                        >
                            <option value="all">Alle Campagnes</option>
                            {campaigns.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Campaigns Preview Strip */}
            {campaigns.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {campaigns.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => handleEditCampaign(c)}
                            className="shrink-0 px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border hover:border-brand-orange/30 transition-all cursor-pointer text-left"
                        >
                            <p className="text-sm font-medium text-text-primary">{c.name}</p>
                            <p className="text-xs text-text-muted mt-0.5 capitalize">{c.archetype} · {c.active ? "Actief" : "Inactief"}</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-glass-border/30 flex items-center justify-center">
                            <Send className="w-8 h-8 text-text-muted opacity-50" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-text-primary">Nog geen posts</h3>
                        <p className="text-text-muted">Maak je eerste X post om te beginnen met publiceren.</p>
                        <button
                            onClick={handleCreatePost}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Eerste Post Maken
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPosts.map((post) => (
                        <XPostCard
                            key={post.id}
                            post={post}
                            campaigns={campaigns}
                            onEdit={handleEditPost}
                            onApprove={handleApprove}
                            onQueue={handleQueue}
                            onDelete={handleDeletePost}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <XCampaignModal
                isOpen={campaignModalOpen}
                onClose={() => { setCampaignModalOpen(false); setEditingCampaign(null); }}
                onSaved={fetchData}
                editingCampaign={editingCampaign}
            />
            <XPostEditor
                isOpen={postEditorOpen}
                onClose={() => { setPostEditorOpen(false); setEditingPost(null); }}
                onSaved={fetchData}
                editingPost={editingPost}
                campaigns={campaigns}
            />
        </div>
    );
}
