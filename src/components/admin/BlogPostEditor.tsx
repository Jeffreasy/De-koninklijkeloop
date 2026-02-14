import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { apiRequest } from "../../lib/api";
import type { BlogCategory } from "./BlogCategoryManager";
import { AdminModal } from "./AdminModal";
import {
    Loader2, Save, Bold, Italic, Heading2, Heading3, List, ListOrdered,
    Link2, ImageIcon, Code, Quote, Undo, Redo, ChevronDown, ChevronUp,
} from "lucide-react";

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category_id: string | null;
    tags: string[];
    cover_image_url: string | null;
    status: string;
    visibility: string;
    is_featured: boolean;
    is_pinned: boolean;
    seo_title: string | null;
    seo_description: string | null;
    og_image_url: string | null;
    published_at: string | null;
    scheduled_for: string | null;
    reading_time_minutes: number;
    view_count: number;
    author_id: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editingPost: BlogPost | null;
    categories: BlogCategory[];
}

function ToolbarButton({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) {
    return (
        <button type="button" onClick={onClick} title={title}
            className={`p-2 rounded-lg transition-all cursor-pointer ${active ? "bg-brand-orange/20 text-brand-orange" : "text-text-muted hover:text-text-primary hover:bg-glass-border/30"}`}
        >
            {children}
        </button>
    );
}

function EditorToolbar({ editor }: { editor: Editor }) {
    return (
        <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-glass-border bg-glass-bg/20 rounded-t-xl">
            <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Vet">
                <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursief">
                <Italic className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-6 bg-glass-border mx-1 self-center" />
            <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
                <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
                <Heading3 className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-6 bg-glass-border mx-1 self-center" />
            <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Opsomming">
                <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Genummerd">
                <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citaat">
                <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code">
                <Code className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-6 bg-glass-border mx-1 self-center" />
            <ToolbarButton onClick={() => {
                const url = prompt("Link URL:");
                if (url) editor.chain().focus().setLink({ href: url }).run();
            }} title="Link" active={editor.isActive("link")}>
                <Link2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => {
                const url = prompt("Afbeelding URL:");
                if (url) editor.chain().focus().setImage({ src: url }).run();
            }} title="Afbeelding">
                <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-6 bg-glass-border mx-1 self-center" />
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Ongedaan maken">
                <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Opnieuw">
                <Redo className="w-4 h-4" />
            </ToolbarButton>
        </div>
    );
}

export default function BlogPostEditor({ isOpen, onClose, onSaved, editingPost, categories }: Props) {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [tags, setTags] = useState("");
    const [coverImageUrl, setCoverImageUrl] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [isFeatured, setIsFeatured] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [showSeo, setShowSeo] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveAction, setSaveAction] = useState<"draft" | "review" | "publish">("draft");

    const editor = useEditor({
        extensions: [
            StarterKit.configure({}),
            LinkExtension.configure({ openOnClick: false }),
            ImageExtension,
        ],
        content: "",
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none min-h-[300px] px-4 py-3 focus:outline-none text-text-primary",
            },
        },
    });

    useEffect(() => {
        if (!isOpen) return;
        if (editingPost) {
            setTitle(editingPost.title);
            setSlug(editingPost.slug);
            setExcerpt(editingPost.excerpt || "");
            setCategoryId(editingPost.category_id || "");
            setTags(editingPost.tags?.join(", ") || "");
            setCoverImageUrl(editingPost.cover_image_url || "");
            setVisibility(editingPost.visibility || "public");
            setIsFeatured(editingPost.is_featured);
            setIsPinned(editingPost.is_pinned);
            setSeoTitle(editingPost.seo_title || "");
            setSeoDescription(editingPost.seo_description || "");
            editor?.commands.setContent(editingPost.content || "");
        } else {
            setTitle(""); setSlug(""); setExcerpt(""); setCategoryId(""); setTags("");
            setCoverImageUrl(""); setVisibility("public"); setIsFeatured(false); setIsPinned(false);
            setSeoTitle(""); setSeoDescription("");
            editor?.commands.setContent("");
        }
    }, [editingPost, isOpen, editor]);

    const handleTitleChange = (val: string) => {
        setTitle(val);
        if (!editingPost) {
            setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-"));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const statusMap = { draft: "draft", review: "review", publish: "published" };
        const body: any = {
            title,
            slug,
            content: editor?.getHTML() || "",
            excerpt,
            category_id: categoryId || undefined,
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            cover_image_url: coverImageUrl || undefined,
            visibility,
            is_featured: isFeatured,
            is_pinned: isPinned,
            seo_title: seoTitle || undefined,
            seo_description: seoDescription || undefined,
            status: statusMap[saveAction],
        };

        try {
            if (editingPost) {
                await apiRequest(`/blog/posts/${editingPost.id}`, {
                    method: "PUT",
                    body: JSON.stringify(body),
                });
            } else {
                await apiRequest("/blog/posts", {
                    method: "POST",
                    body: JSON.stringify(body),
                });
            }
            onSaved();
        } catch (err) {
            console.error("[BlogEditor] Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminModal isOpen={isOpen} onClose={onClose} title={editingPost ? "Bericht Bewerken" : "Nieuw Bericht"} size="6xl">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title + Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="bp-title" className="block text-sm font-medium text-text-muted mb-1.5">Titel</label>
                        <input id="bp-title" type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} required
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 outline-none transition-all"
                            placeholder="Bericht titel" />
                    </div>
                    <div>
                        <label htmlFor="bp-slug" className="block text-sm font-medium text-text-muted mb-1.5">Slug</label>
                        <input id="bp-slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary font-mono text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 outline-none transition-all"
                            placeholder="bericht-slug" />
                    </div>
                </div>

                {/* TipTap Editor */}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1.5">Inhoud</label>
                    <div className="rounded-xl border border-glass-border overflow-hidden bg-glass-bg/30">
                        {editor && <EditorToolbar editor={editor} />}
                        <EditorContent editor={editor} />
                    </div>
                </div>

                {/* Excerpt */}
                <div>
                    <label htmlFor="bp-excerpt" className="block text-sm font-medium text-text-muted mb-1.5">Samenvatting</label>
                    <textarea id="bp-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 outline-none transition-all resize-none"
                        rows={2} placeholder="Korte beschrijving voor de post preview..." />
                </div>

                {/* Meta: Category, Tags, Cover Image */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="bp-category" className="block text-sm font-medium text-text-muted mb-1.5">Categorie</label>
                        <select id="bp-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm focus:border-brand-orange/50 outline-none cursor-pointer"
                        >
                            <option value="">Geen categorie</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bp-tags" className="block text-sm font-medium text-text-muted mb-1.5">Tags</label>
                        <input id="bp-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 outline-none transition-all"
                            placeholder="hardlopen, dordrecht" />
                    </div>
                    <div>
                        <label htmlFor="bp-cover" className="block text-sm font-medium text-text-muted mb-1.5">Cover Afbeelding URL</label>
                        <input id="bp-cover" type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 outline-none transition-all"
                            placeholder="https://..." />
                    </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)}
                            className="rounded border-glass-border text-brand-orange focus:ring-brand-orange/30" />
                        Uitgelicht
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                        <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)}
                            className="rounded border-glass-border text-brand-orange focus:ring-brand-orange/30" />
                        Vastgezet
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                        <select value={visibility} onChange={(e) => setVisibility(e.target.value)}
                            className="rounded-lg bg-glass-bg/30 border border-glass-border text-text-primary text-sm px-2 py-1 cursor-pointer">
                            <option value="public">Openbaar</option>
                            <option value="private">Privé</option>
                            <option value="unlisted">Niet opgelijst</option>
                        </select>
                        Zichtbaarheid
                    </label>
                </div>

                {/* SEO Collapsible */}
                <div>
                    <button type="button" onClick={() => setShowSeo(!showSeo)}
                        className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                        {showSeo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        SEO Instellingen
                    </button>
                    {showSeo && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 rounded-xl bg-glass-bg/20 border border-glass-border">
                            <div>
                                <label htmlFor="bp-seo-title" className="block text-sm font-medium text-text-muted mb-1.5">SEO Titel</label>
                                <input id="bp-seo-title" type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 outline-none transition-all"
                                    placeholder="Aangepaste SEO titel" />
                            </div>
                            <div>
                                <label htmlFor="bp-seo-desc" className="block text-sm font-medium text-text-muted mb-1.5">Meta Omschrijving</label>
                                <textarea id="bp-seo-desc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-glass-bg/30 border border-glass-border text-text-primary text-sm placeholder:text-text-muted/50 focus:border-brand-orange/50 outline-none transition-all resize-none"
                                    rows={2} placeholder="Meta omschrijving voor zoekmachines" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-glass-border/50">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-glass-border text-text-muted hover:text-text-primary hover:bg-glass-bg/30 transition-all cursor-pointer text-sm"
                    >
                        Annuleren
                    </button>
                    <button type="submit" disabled={saving} onClick={() => setSaveAction("draft")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-glass-border text-text-primary hover:bg-glass-bg/30 transition-all cursor-pointer text-sm disabled:opacity-50"
                    >
                        {saving && saveAction === "draft" && <Loader2 className="w-4 h-4 animate-spin" />}
                        Concept Opslaan
                    </button>
                    <button type="submit" disabled={saving} onClick={() => setSaveAction("publish")}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all shadow-lg shadow-brand-orange/20 cursor-pointer disabled:opacity-50 text-sm"
                    >
                        {saving && saveAction === "publish" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Publiceren
                    </button>
                </div>
            </form>
        </AdminModal>
    );
}
