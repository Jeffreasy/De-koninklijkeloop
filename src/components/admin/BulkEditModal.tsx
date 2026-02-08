import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { MergedImage } from "./MediaManagerIsland";
import { AdminModal, AdminModalFooterButtons } from "./AdminModal";
import { addToast } from "../../lib/toast";
import { Copy, ChevronsDown, Tag, Type, AlignLeft } from "lucide-react";

interface Props {
    isOpen: boolean;
    selectedImages: MergedImage[];
    onClose: () => void;
    onBulkUpdate: (updates: { publicId: string; altText: string; title?: string; tags?: string[] }[]) => void;
    accessToken: string;
}

export function BulkEditModal({ isOpen, selectedImages, onClose, onBulkUpdate, accessToken }: Props) {
    // Individual state tracking
    const [bulkAltTexts, setBulkAltTexts] = useState<Record<string, string>>({});
    const [bulkTitles, setBulkTitles] = useState<Record<string, string>>({});
    const [bulkTags, setBulkTags] = useState<Record<string, string>>({});

    // "Apply to All" state
    const [applyAllAlt, setApplyAllAlt] = useState("");
    const [applyAllTitle, setApplyAllTitle] = useState("");
    const [applyAllTags, setApplyAllTags] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const bulkSaveMutation = useMutation(api.mediaMetadata.bulkSave);

    // Initial state population
    useEffect(() => {
        if (isOpen && selectedImages.length > 0) {
            const initialAlts: Record<string, string> = {};
            const initialTitles: Record<string, string> = {};
            const initialTags: Record<string, string> = {};

            selectedImages.forEach(img => {
                initialAlts[img.public_id] = img.alt_text || "";
                initialTitles[img.public_id] = img.title || "";
                initialTags[img.public_id] = img.tags?.join(", ") || "";
            });

            setBulkAltTexts(initialAlts);
            setBulkTitles(initialTitles);
            setBulkTags(initialTags);

            // Reset "Apply to All" fields
            setApplyAllAlt("");
            setApplyAllTitle("");
            setApplyAllTags("");
        }
    }, [isOpen, selectedImages]);

    const handleApplyToAll = (field: 'alt' | 'title' | 'tags') => {
        if (field === 'alt' && applyAllAlt) {
            const newAlts = { ...bulkAltTexts };
            selectedImages.forEach(img => newAlts[img.public_id] = applyAllAlt);
            setBulkAltTexts(newAlts);
            addToast("Alt tekst toegepast op alle afbeeldingen", "info");
        }
        if (field === 'title' && applyAllTitle) {
            const newTitles = { ...bulkTitles };
            selectedImages.forEach(img => newTitles[img.public_id] = applyAllTitle);
            setBulkTitles(newTitles);
            addToast("Titel toegepast op alle afbeeldingen", "info");
        }
        if (field === 'tags' && applyAllTags) {
            const newTags = { ...bulkTags };
            selectedImages.forEach(img => newTags[img.public_id] = applyAllTags);
            setBulkTags(newTags);
            addToast("Tags toegepast op alle afbeeldingen", "info");
        }
    };

    const handleBulkSave = async () => {
        setIsSaving(true);
        try {
            const updates = selectedImages.map(img => {
                const altText = bulkAltTexts[img.public_id] !== undefined ? bulkAltTexts[img.public_id] : (img.alt_text || "");
                const title = bulkTitles[img.public_id] !== undefined ? bulkTitles[img.public_id] : (img.title || "");
                const tagsString = bulkTags[img.public_id] !== undefined ? bulkTags[img.public_id] : (img.tags?.join(", ") || "");
                const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);

                return {
                    cloudinary_public_id: img.public_id,
                    alt_text: altText,
                    title: title,
                    tags: tags,
                    folder: img.folder
                };
            });

            // Calculate changes only (optional optimization, but we usually want to save current state)
            // For now, we save everything to ensure consistency
            if (updates.length === 0) {
                addToast("Geen wijzigingen om op te slaan", "info");
                return;
            }

            await bulkSaveMutation({
                updates,
                token: accessToken
            });

            // Update parent state efficiently
            onBulkUpdate(updates.map(u => ({
                publicId: u.cloudinary_public_id,
                altText: u.alt_text,
                title: u.title,
                tags: u.tags
            })));

            onClose();
        } catch (error) {
            console.error("Bulk save failed", error);
            addToast("Kon niet alles opslaan. Probeer opnieuw.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Bulk Bewerken (${selectedImages.length} items)`}
            size="4xl"
            footer={
                <AdminModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleBulkSave}
                    confirmText="Alles Opslaan"
                    isLoading={isSaving}
                />
            }
        >
            {/* Apply to All Section */}
            <div className="mb-6 p-4 bg-glass-bg/30 border border-brand-orange/20 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-brand-orange font-medium mb-2">
                    <ChevronsDown className="w-5 h-5" />
                    <h3>Pas toe op alle geselecteerde items</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Apply Alt */}
                    <div className="space-y-2">
                        <label className="text-xs text-text-muted flex items-center gap-1">
                            <AlignLeft className="w-3 h-3" /> Alt Tekst
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={applyAllAlt}
                                onChange={(e) => setApplyAllAlt(e.target.value)}
                                placeholder="Alt tekst voor alles..."
                                className="flex-1 px-3 py-2 bg-glass-bg/50 border border-glass-border rounded-lg text-sm focus:ring-1 focus:ring-brand-orange/50"
                            />
                            <button
                                onClick={() => handleApplyToAll('alt')}
                                disabled={!applyAllAlt}
                                className="p-2 bg-glass-border/30 hover:bg-brand-orange/20 text-text-primary rounded-lg transition-colors disabled:opacity-50"
                                title="Pas toe op alle items"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Apply Title */}
                    <div className="space-y-2">
                        <label className="text-xs text-text-muted flex items-center gap-1">
                            <Type className="w-3 h-3" /> Titel
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={applyAllTitle}
                                onChange={(e) => setApplyAllTitle(e.target.value)}
                                placeholder="Titel voor alles..."
                                className="flex-1 px-3 py-2 bg-glass-bg/50 border border-glass-border rounded-lg text-sm focus:ring-1 focus:ring-brand-orange/50"
                            />
                            <button
                                onClick={() => handleApplyToAll('title')}
                                disabled={!applyAllTitle}
                                className="p-2 bg-glass-border/30 hover:bg-brand-orange/20 text-text-primary rounded-lg transition-colors disabled:opacity-50"
                                title="Pas toe op alle items"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Apply Tags */}
                    <div className="space-y-2">
                        <label className="text-xs text-text-muted flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Tags
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={applyAllTags}
                                onChange={(e) => setApplyAllTags(e.target.value)}
                                placeholder="Tags koppelen..."
                                className="flex-1 px-3 py-2 bg-glass-bg/50 border border-glass-border rounded-lg text-sm focus:ring-1 focus:ring-brand-orange/50"
                            />
                            <button
                                onClick={() => handleApplyToAll('tags')}
                                disabled={!applyAllTags}
                                className="p-2 bg-glass-border/30 hover:bg-brand-orange/20 text-text-primary rounded-lg transition-colors disabled:opacity-50"
                                title="Pas toe op alle items"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                {selectedImages.map(img => (
                    <div
                        key={img.public_id}
                        className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-glass-bg/30 rounded-xl border border-glass-border"
                    >
                        {/* Thumbnail & Info */}
                        <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-2 sm:w-32 shrink-0">
                            <img
                                src={`${img.secure_url}?w=150&h=150&c=fill&f_auto&q_auto`}
                                alt={img.alt_text || ""}
                                className="w-20 h-20 sm:w-32 sm:h-32 rounded-lg object-cover"
                            />
                            <div className="min-w-0 w-full">
                                <p className="text-xs font-mono text-text-muted truncate" title={img.public_id}>
                                    {img.public_id.split('/').pop()}
                                </p>
                            </div>
                        </div>

                        {/* Input Fields Grid */}
                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Alt Text */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs text-text-muted">Alt Tekst <span className="text-red-400">*</span></label>
                                <textarea
                                    value={bulkAltTexts[img.public_id] ?? ""}
                                    onChange={(e) => setBulkAltTexts({ ...bulkAltTexts, [img.public_id]: e.target.value })}
                                    placeholder="Beschrijf de afbeelding..."
                                    rows={2}
                                    className="w-full px-3 py-2 bg-glass-bg/50 border border-glass-border rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand-orange/50 resize-y"
                                />
                            </div>

                            {/* Title */}
                            <div className="space-y-1">
                                <label className="text-xs text-text-muted">Titel</label>
                                <input
                                    type="text"
                                    value={bulkTitles[img.public_id] ?? ""}
                                    onChange={(e) => setBulkTitles({ ...bulkTitles, [img.public_id]: e.target.value })}
                                    placeholder="Titel..."
                                    className="w-full px-3 py-2 bg-glass-bg/50 border border-glass-border rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand-orange/50"
                                />
                            </div>

                            {/* Tags */}
                            <div className="space-y-1">
                                <label className="text-xs text-text-muted">Tags</label>
                                <input
                                    type="text"
                                    value={bulkTags[img.public_id] ?? ""}
                                    onChange={(e) => setBulkTags({ ...bulkTags, [img.public_id]: e.target.value })}
                                    placeholder="Tags filter..."
                                    className="w-full px-3 py-2 bg-glass-bg/50 border border-glass-border rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand-orange/50"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminModal>
    );
}
