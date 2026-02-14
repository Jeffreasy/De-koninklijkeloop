import { useState } from "react";
import { apiRequest } from "../../lib/api";
import { Plus, Save, Trash2, Loader2, GripVertical, Pencil } from "lucide-react";

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    post_count?: number;
}

interface Props {
    categories: BlogCategory[];
    onRefresh: () => void;
}

export default function BlogCategoryManager({ categories, onRefresh }: Props) {
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);

    const startCreate = () => {
        setEditingId(null);
        setName(""); setSlug(""); setDescription("");
        setCreating(true);
    };

    const startEdit = (cat: BlogCategory) => {
        setCreating(false);
        setEditingId(cat.id);
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description || "");
    };

    const handleNameChange = (val: string) => {
        setName(val);
        if (!editingId) {
            setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const body = { name, slug, description: description || undefined };
            if (editingId) {
                await apiRequest(`/blog/categories/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
            } else {
                await apiRequest("/blog/categories", { method: "POST", body: JSON.stringify(body) });
            }
            setCreating(false);
            setEditingId(null);
            onRefresh();
        } catch (err) {
            console.error("[BlogCategory] Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze categorie wilt verwijderen?")) return;
        try {
            await apiRequest(`/blog/categories/${id}`, { method: "DELETE" });
            onRefresh();
        } catch (err) {
            console.error("[BlogCategory] Delete failed:", err);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-text-primary">Categorieën</h3>
                <button onClick={startCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer text-sm"
                >
                    <Plus className="w-4 h-4" /> Nieuwe Categorie
                </button>
            </div>

            {/* Create Form */}
            {creating && (
                <div className="glass-card p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)}
                            aria-label="Categorie naam"
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-base sm:text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all"
                            placeholder="Categorie naam" />
                        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                            aria-label="Slug"
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary font-mono text-base sm:text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all"
                            placeholder="slug" />
                    </div>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                        aria-label="Beschrijving"
                        className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-base sm:text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all"
                        placeholder="Beschrijving (optioneel)" />
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={saving || !name}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all cursor-pointer text-sm disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Opslaan
                        </button>
                        <button onClick={() => setCreating(false)}
                            className="px-4 py-2 rounded-xl border border-glass-border text-text-muted hover:text-text-primary transition-all cursor-pointer text-sm"
                        >
                            Annuleren
                        </button>
                    </div>
                </div>
            )}

            {/* Category List */}
            <div className="space-y-2">
                {categories.length === 0 ? (
                    <div className="glass-card p-8 text-center text-text-muted">
                        Nog geen categorieën aangemaakt.
                    </div>
                ) : (
                    categories.map((cat) => (
                        <div key={cat.id} className="glass-card p-4">
                            {editingId === cat.id ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                            aria-label="Categorie naam"
                                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-base sm:text-sm focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all" />
                                        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                                            aria-label="Slug"
                                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary font-mono text-base sm:text-sm focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all" />
                                    </div>
                                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                                        aria-label="Beschrijving"
                                        className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-base sm:text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30 outline-none transition-all"
                                        placeholder="Beschrijving" />
                                    <div className="flex gap-2">
                                        <button onClick={handleSave} disabled={saving || !name}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all cursor-pointer text-sm disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Bijwerken
                                        </button>
                                        <button onClick={() => setEditingId(null)}
                                            className="px-4 py-2 rounded-xl border border-glass-border text-text-muted hover:text-text-primary transition-all cursor-pointer text-sm"
                                        >
                                            Annuleren
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <GripVertical className="w-4 h-4 text-text-muted/50 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-text-primary">{cat.name}</span>
                                            <span className="text-xs text-text-muted font-mono">/{cat.slug}</span>
                                        </div>
                                        {cat.description && <p className="text-xs text-text-muted mt-0.5">{cat.description}</p>}
                                    </div>
                                    {cat.post_count !== undefined && (
                                        <span className="text-xs text-text-muted bg-glass-border/20 px-2 py-0.5 rounded-md">
                                            {cat.post_count} berichten
                                        </span>
                                    )}
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => startEdit(cat)} title="Bewerken"
                                            className="p-2.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-glass-border/30 transition-all cursor-pointer"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} title="Verwijderen"
                                            className="p-2.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
