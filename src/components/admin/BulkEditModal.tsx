import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { MergedImage } from "./MediaManagerIsland";
import { AdminModal, AdminModalFooterButtons } from "./AdminModal";

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
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title="Bulk Alt Text Bewerken"
            size="2xl"
            footer={
                <AdminModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleBulkSave}
                    confirmText={`${selectedImages.length} Afbeeldingen Opslaan`}
                    isLoading={isSaving}
                />
            }
        >
            {/* Subtitle */}
            <div className="text-text-muted mb-4">
                {selectedImages.length} afbeeldingen geselecteerd
            </div>

            {/* Scrollable Content */}
            <div className="space-y-4 overflow-y-auto max-h-[50vh]">
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
                                className="w-full px-3 py-2 bg-glass-bg/50 border border-glass-border rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand-orange/50 focus:outline-none"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </AdminModal>
    );
}
