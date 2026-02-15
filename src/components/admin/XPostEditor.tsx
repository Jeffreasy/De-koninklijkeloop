import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import { addToast } from "../../lib/toast";
import { AdminModal } from "./AdminModal";
import { Loader2, Save, Sparkles, Link2, Image } from "lucide-react";
import type { Campaign } from "./XCampaignModal";

export interface XPost {
    id: string;
    campaign_id: string | null;
    parent_id: string | null;
    thread_position: number;
    content: string;
    media_url: string | null;
    link_url: string | null;
    scheduled_for: string;
    status: string;
    x_post_id: string | null;
    ai_generated: boolean;
    archetype: string;
    last_error: string | null;
    retry_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editingPost: XPost | null;
    campaigns: Campaign[];
}

export function XPostEditor({ isOpen, onClose, onSaved, editingPost, campaigns }: Props) {
    const [content, setContent] = useState("");
    const [campaignId, setCampaignId] = useState("");
    const [scheduledFor, setScheduledFor] = useState("");
    const [archetype, setArchetype] = useState("hero");
    const [mediaUrl, setMediaUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [threadMode, setThreadMode] = useState(false);
    const [threadContent, setThreadContent] = useState<string[]>([]);
    const [campaignContext, setCampaignContext] = useState("");

    useEffect(() => {
        if (editingPost) {
            setContent(editingPost.content);
            setCampaignId(editingPost.campaign_id || "");
            setScheduledFor(editingPost.scheduled_for?.substring(0, 16) || "");
            setArchetype(editingPost.archetype || "hero");
            setMediaUrl(editingPost.media_url || "");
            setLinkUrl(editingPost.link_url || "");
        } else {
            setContent(""); setCampaignId(""); setScheduledFor(""); setArchetype("hero");
            setMediaUrl(""); setLinkUrl(""); setThreadMode(false); setThreadContent([]);
        }
    }, [editingPost, isOpen]);

    const charCount = content.length;
    const charColor = charCount > 280 ? "text-red-400" : charCount > 250 ? "text-amber-400" : "text-green-400";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // #6: Validate char limits before submit
        if (threadMode && threadContent.length > 0) {
            const overLimit = threadContent.findIndex((t) => t.length > 280);
            if (overLimit !== -1) {
                addToast(`Tweet ${overLimit + 1} overschrijdt de 280 tekens limiet`, "error");
                return;
            }
        } else if (content.length > 280) {
            addToast("Tweet overschrijdt de 280 tekens limiet", "error");
            return;
        }

        setSaving(true);
        try {
            if (threadMode && threadContent.length > 0) {
                // Create thread: first post is parent, rest are children
                let parentId: string | null = null;
                for (let i = 0; i < threadContent.length; i++) {
                    const body = {
                        content: threadContent[i],
                        scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : new Date().toISOString(),
                        campaign_id: campaignId || undefined,
                        archetype,
                        parent_id: parentId,
                        media_url: i === 0 ? mediaUrl || undefined : undefined,
                        link_url: i === threadContent.length - 1 ? linkUrl || undefined : undefined,
                    };
                    const res = await apiRequest("/admin/social/posts", {
                        method: "POST",
                        body: JSON.stringify(body),
                    });
                    if (i === 0) parentId = res.id;
                }
            } else if (editingPost) {
                // #7: PUT existing post instead of creating duplicate
                const body = {
                    content,
                    scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : new Date().toISOString(),
                    campaign_id: campaignId || undefined,
                    archetype,
                    media_url: mediaUrl || undefined,
                    link_url: linkUrl || undefined,
                };
                await apiRequest(`/admin/social/posts/${editingPost.id}`, {
                    method: "PUT",
                    body: JSON.stringify(body),
                });
            } else {
                const body = {
                    content,
                    scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : new Date().toISOString(),
                    campaign_id: campaignId || undefined,
                    archetype,
                    media_url: mediaUrl || undefined,
                    link_url: linkUrl || undefined,
                };
                await apiRequest("/admin/social/posts", {
                    method: "POST",
                    body: JSON.stringify(body),
                });
            }
            addToast(editingPost ? "Post bijgewerkt" : "Post opgeslagen als concept", "success");
            onSaved();
            onClose();
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XPost] Save failed:", err);
            addToast("Post opslaan mislukt", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const body = {
                archetype,
                campaign_context: campaignContext || "Hardloopwedstrijd door historisch Dordrecht, 10km en 5km routes",
                thread_mode: threadMode,
            };
            const data = await apiRequest("/admin/social/posts/generate", {
                method: "POST",
                body: JSON.stringify(body),
            });
            if (data.type === "thread" && data.thread) {
                setThreadContent(data.thread);
                setThreadMode(true);
            } else if (data.draft) {
                setContent(data.draft);
                setThreadMode(false);
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error("[XPost] AI generate failed:", err);
            addToast("AI generatie mislukt", "error");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingPost ? "Post Bewerken" : "Nieuwe X Post"}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* AI Generation Section */}
                <div className="p-4 rounded-xl bg-glass-bg/30 border border-glass-border space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        AI Content Generatie
                    </div>
                    <textarea
                        value={campaignContext}
                        onChange={(e) => setCampaignContext(e.target.value)}
                        placeholder="Beschrijf de context (bijv. 'Hardloopwedstrijd door historisch Dordrecht, 10km en 5km routes')"
                        className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 outline-none transition-all resize-none"
                        rows={2}
                    />
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={handleGenerate} disabled={generating}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-sm font-medium cursor-pointer disabled:opacity-50"
                        >
                            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {threadMode ? "Thread Genereren" : "Tweet Genereren"}
                        </button>
                        <label htmlFor="xp-thread-mode" className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                            <input id="xp-thread-mode" type="checkbox" checked={threadMode} onChange={(e) => setThreadMode(e.target.checked)}
                                className="rounded border-glass-border text-brand-orange focus:ring-brand-orange/30" />
                            Thread modus
                        </label>
                    </div>
                </div>

                {/* Content */}
                {threadMode && threadContent.length > 0 ? (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-text-muted">Thread ({threadContent.length} tweets)</label>
                        {threadContent.map((tweet, i) => (
                            <div key={i} className="relative">
                                <div className="absolute left-3 top-0.5 text-xs text-text-muted/60 font-mono">{i + 1}/{threadContent.length}</div>
                                <textarea
                                    value={tweet}
                                    onChange={(e) => {
                                        const updated = [...threadContent];
                                        updated[i] = e.target.value;
                                        setThreadContent(updated);
                                    }}
                                    aria-label={`Tweet ${i + 1} van ${threadContent.length}`}
                                    className="w-full px-4 pt-6 pb-2 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm focus:border-brand-orange/50 outline-none transition-all resize-none"
                                    rows={3}
                                />
                                <span className={`absolute right-3 bottom-2 text-xs font-mono ${tweet.length > 280 ? "text-red-400" : "text-text-muted/50"}`}>{tweet.length}/280</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <label htmlFor="xp-content" className="block text-sm font-medium text-text-muted mb-1.5">Tweet Content</label>
                        <div className="relative">
                            <textarea id="xp-content" value={content} onChange={(e) => setContent(e.target.value)} required
                                className="w-full px-4 py-3 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 outline-none transition-all resize-none"
                                rows={4}
                                placeholder="Schrijf je tweet..."
                                maxLength={280}
                            />
                            <span className={`absolute right-3 bottom-3 text-xs font-mono ${charColor}`}>{charCount}/280</span>
                        </div>
                    </div>
                )}

                {/* Campaign + Archetype Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="xp-campaign" className="block text-sm font-medium text-text-muted mb-1.5">Campagne</label>
                        <select id="xp-campaign" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm focus:border-brand-orange/50 outline-none cursor-pointer"
                        >
                            <option value="">Geen campagne</option>
                            {campaigns.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="xp-archetype" className="block text-sm font-medium text-text-muted mb-1.5">Archetype</label>
                        <select id="xp-archetype" value={archetype} onChange={(e) => setArchetype(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm focus:border-brand-orange/50 outline-none cursor-pointer capitalize"
                        >
                            <option value="hero">Hero</option>
                            <option value="ruler">Ruler</option>
                            <option value="caregiver">Caregiver</option>
                            <option value="sage">Sage</option>
                            <option value="explorer">Explorer</option>
                        </select>
                    </div>
                </div>

                {/* Schedule */}
                <div>
                    <label htmlFor="xp-schedule" className="block text-sm font-medium text-text-muted mb-1.5">Inplannen</label>
                    <input id="xp-schedule" type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm focus:border-brand-orange/50 outline-none transition-all"
                    />
                </div>

                {/* Optional: Media + Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="xp-media" className="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5">
                            <Image className="w-3.5 h-3.5" /> Media URL
                        </label>
                        <input id="xp-media" type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 outline-none transition-all"
                            placeholder="https://..." />
                    </div>
                    <div>
                        <label htmlFor="xp-link" className="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5">
                            <Link2 className="w-3.5 h-3.5" /> Link URL
                        </label>
                        <input id="xp-link" type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 outline-none transition-all"
                            placeholder="https://..." />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-glass-border/50">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-glass-border text-text-muted hover:text-text-primary hover:bg-glass-bg/30 transition-all cursor-pointer text-sm"
                    >
                        Annuleren
                    </button>
                    <button type="submit" disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer disabled:opacity-50 text-sm"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {editingPost ? "Bijwerken" : "Opslaan als Concept"}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
}
