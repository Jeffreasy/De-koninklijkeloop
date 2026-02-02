import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { MergedImage } from "./MediaManagerIsland";

interface Props {
    isOpen: boolean;
    selectedImages: MergedImage[];
    onClose: () => void;
    onSave: (publicId: string, altText: string) => Promise<void>;
    accessToken: string;
}

export function BulkEditModal({ isOpen, selectedImages, onClose, onSave, accessToken }: Props) {
    const [bulkAltTexts, setBulkAltTexts] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const bulkSaveMutation = useMutation(api.mediaMetadata.bulkSave);

    if (!isOpen) return null;

    const handleBulkChange = (publicId: string, value: string) => {
        setBulkAltTexts(prev => ({
            ...prev,
            [publicId]: value
        }));
    };

    const handleBulkSave = async () => {
        setIsSaving(true);
        try {
            const updates = selectedImages
                .filter(img => bulkAltTexts[img.public_id] !== undefined)
                .map(img => ({
                    cloudinary_public_id: img.public_id,
                    alt_text: bulkAltTexts[img.public_id] || img.alt_text || "",
                    folder: img.folder
                }));

            if (updates.length === 0) {
                alert("Geen wijzigingen om op te slaan");
                return;
            }

            await bulkSaveMutation({
                updates,
                token: accessToken
            });

            // Update individual states via parent callback
            for (const update of updates) {
                await onSave(update.cloudinary_public_id, update.alt_text);
            }

            onClose();
        } catch (error) {
            console.error("Bulk save failed", error);
            alert("Kon niet alles opslaan. Probeer het opnieuw.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="premium-glass rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-glass-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-text-primary">
                                Bulk Alt Text Bewerken
                            </h2>
                            <p className="text-text-muted mt-1">
                                {selectedImages.length} afbeeldingen geselecteerd
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-glass-border/30 transition-colors text-text-muted hover:text-text-primary"
                        >
                            <iconify-icon icon="lucide:x" width="24" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
                    {selectedImages.map(img => (
                        <div
                            key={img.public_id}
                            className="flex items-start gap-4 p-4 bg-glass-bg/30 rounded-xl border border-glass-border"
                        >
                            {/* Thumbnail */}
                            <img
                                src={`${img.secure_url}?w=100&h=100&c=fill&f_auto&q_auto`}
                                alt={img.alt_text || ""}
                                className="w-16 h-16 rounded-lg object-cover shrink-0"
                            />

                            {/* Input */}
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-mono text-text-muted mb-2 truncate" title={img.public_id}>
                                    {img.public_id.split('/').pop()}
                                </div>
                                <input
                                    type="text"
                                    value={bulkAltTexts[img.public_id] ?? img.alt_text ?? ""}
                                    onChange={(e) => handleBulkChange(img.public_id, e.target.value)}
                                    placeholder="Alt text..."
                                    className="w-full px-3 py-2 bg-glass-bg/50 border border-glass-border rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-accent-primary/50 focus:outline-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-glass-border flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-xl bg-glass-border/30 text-text-muted hover:bg-glass-border/50 transition-colors disabled:opacity-50"
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={handleBulkSave}
                        disabled={isSaving}
                        className="px-6 py-2 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Opslaan..." : `${selectedImages.length} Afbeeldingen Opslaan`}
                    </button>
                </div>
            </div>
        </div>
    );
}
