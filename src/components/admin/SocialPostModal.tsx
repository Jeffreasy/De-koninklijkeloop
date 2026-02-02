import { useState, useEffect } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { X } from "lucide-react";
import { ServerSideUploadButton, uploadFileToCloudinary } from "./ServerSideUploadButton";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: SocialPostFormData) => Promise<void>;
    editingPost?: {
        _id: Id<"social_posts">;
        imageUrl: string;
        caption: string;
        instagramUrl: string;
        isFeatured: boolean;
        displayOrder: number;
        isVisible: boolean;
        postedDate?: string;
    } | null;
}

export interface SocialPostFormData {
    imageUrl: string;
    caption: string;
    instagramUrl: string;
    isFeatured: boolean;
    displayOrder: number;
    isVisible: boolean;
    postedDate?: string;
}

export function SocialPostModal({ isOpen, onClose, onSave, editingPost }: Props) {
    const [formData, setFormData] = useState<SocialPostFormData>({
        imageUrl: "",
        caption: "",
        instagramUrl: "",
        isFeatured: false,
        displayOrder: 1,
        isVisible: true,
        postedDate: "",
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreviewError, setImagePreviewError] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [urlError, setUrlError] = useState("");

    // Populate form when editing
    useEffect(() => {
        if (editingPost) {
            setFormData({
                imageUrl: editingPost.imageUrl,
                caption: editingPost.caption,
                instagramUrl: editingPost.instagramUrl,
                isFeatured: editingPost.isFeatured,
                displayOrder: editingPost.displayOrder,
                isVisible: editingPost.isVisible,
                postedDate: editingPost.postedDate || "",
            });
        } else {
            // Reset for new post
            setFormData({
                imageUrl: "",
                caption: "",
                instagramUrl: "",
                isFeatured: false,
                displayOrder: 1,
                isVisible: true,
                postedDate: "",
            });
        }
        setImagePreviewError(false);
        setUrlError("");
    }, [editingPost, isOpen]);

    const validateInstagramUrl = (url: string): boolean => {
        if (!url) return false;
        return url.includes("instagram.com");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.imageUrl.trim()) {
            alert("Voeg een afbeelding URL toe");
            return;
        }
        if (!formData.caption.trim()) {
            alert("Voeg een caption toe");
            return;
        }
        if (!validateInstagramUrl(formData.instagramUrl)) {
            setUrlError("Voeg een geldige Instagram URL toe (moet instagram.com bevatten)");
            return;
        }

        setIsSaving(true);
        try {
            let finalImageUrl = formData.imageUrl;

            // If a file is selected, upload it first
            if (selectedFile) {
                setIsUploading(true);
                try {
                    console.log('📤 Uploading file before saving...');
                    finalImageUrl = await uploadFileToCloudinary(selectedFile);
                    console.log('✅ File uploaded:', finalImageUrl);
                } catch (uploadError) {
                    console.error('❌ Upload failed:', uploadError);
                    alert('Upload mislukt. Probeer opnieuw.');
                    setIsUploading(false);
                    setIsSaving(false);
                    return;
                } finally {
                    setIsUploading(false);
                }
            }

            // Save post with uploaded URL
            await onSave({ ...formData, imageUrl: finalImageUrl });
            onClose();
            setSelectedFile(null);
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Fout bij opslaan. Probeer opnieuw.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleInstagramUrlChange = (url: string) => {
        setFormData({ ...formData, instagramUrl: url });
        if (url && !validateInstagramUrl(url)) {
            setUrlError("URL moet een Instagram link zijn");
        } else {
            setUrlError("");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface/95 backdrop-blur-2xl rounded-3xl border border-glass-border shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-glass-border bg-surface/80 backdrop-blur-xl">
                    <h2 className="text-2xl font-display font-bold text-text-primary">
                        {editingPost ? "Post Bewerken" : "Nieuwe Post"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-glass-border/30 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: Form Fields */}
                        <div className="space-y-5">
                            {/* Image Upload/URL */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-3">
                                    Afbeelding *
                                </label>

                                {/* Server-Side Upload Button */}
                                <ServerSideUploadButton
                                    onFileSelect={(file) => {
                                        setSelectedFile(file);
                                        setImagePreviewError(false);
                                    }}
                                    onClearFile={() => {
                                        setSelectedFile(null);
                                    }}
                                    selectedFile={selectedFile}
                                    currentUrl={formData.imageUrl}
                                />

                                {/* Manual URL Input */}
                                <div className="mt-3">
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => {
                                            setFormData({ ...formData, imageUrl: e.target.value });
                                            setImagePreviewError(false);
                                            setSelectedFile(null); // Clear file if URL is pasted
                                        }}
                                        placeholder="Of plak een URL (https://...)"
                                        className="w-full px-4 py-3 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                        required={!selectedFile} // Only required if no file selected
                                    />
                                </div>
                            </div>

                            {/* Instagram URL */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Instagram Post URL *
                                </label>
                                <input
                                    type="url"
                                    value={formData.instagramUrl}
                                    onChange={(e) => handleInstagramUrlChange(e.target.value)}
                                    placeholder="https://instagram.com/p/..."
                                    className={`w-full px-4 py-3 bg-glass-bg/50 border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 ${urlError ? "border-red-500" : "border-glass-border"
                                        }`}
                                    required
                                />
                                {urlError && (
                                    <p className="text-xs text-red-500 mt-1">{urlError}</p>
                                )}
                            </div>

                            {/* Caption */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Caption *
                                </label>
                                <textarea
                                    value={formData.caption}
                                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                    placeholder="Voeg een beschrijving toe..."
                                    rows={4}
                                    maxLength={500}
                                    className="w-full px-4 py-3 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 resize-none"
                                    required
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    {formData.caption.length}/500 karakters
                                </p>
                            </div>

                            {/* Posted Date (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Post Datum (Optioneel)
                                </label>
                                <input
                                    type="date"
                                    value={formData.postedDate}
                                    onChange={(e) => setFormData({ ...formData, postedDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                />
                            </div>

                            {/* Display Order */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Volgorde
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                                    className="w-full px-4 py-3 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    Lagere nummers worden eerst getoond
                                </p>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-3 p-4 bg-glass-border/20 rounded-xl border border-glass-border">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="w-5 h-5 rounded border-2 border-glass-border bg-glass-bg/50 checked:bg-brand-orange checked:border-brand-orange cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                                            Featured Post
                                        </span>
                                        <p className="text-xs text-text-muted">Wordt groot getoond op homepage</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.isVisible}
                                        onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                                        className="w-5 h-5 rounded border-2 border-glass-border bg-glass-bg/50 checked:bg-green-500 checked:border-green-500 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                                            Zichtbaar op website
                                        </span>
                                        <p className="text-xs text-text-muted">Post is publiek zichtbaar</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Right Column: Preview */}
                        <div className="lg:sticky lg:top-6 h-fit">
                            <div className="p-4 bg-glass-border/20 rounded-2xl border border-glass-border">
                                <h3 className="text-sm font-medium text-text-primary mb-3">Preview</h3>
                                {formData.imageUrl ? (
                                    <div className="relative aspect-square overflow-hidden rounded-xl bg-glass-bg/50">
                                        {!imagePreviewError ? (
                                            <img
                                                src={formData.imageUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={() => setImagePreviewError(true)}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                <div className="text-center">
                                                    <iconify-icon icon="lucide:image-off" width="48" className="mb-2 opacity-50" />
                                                    <p className="text-sm">Afbeelding kon niet worden geladen</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="aspect-square flex items-center justify-center bg-glass-bg/30 rounded-xl border-2 border-dashed border-glass-border">
                                        <div className="text-center text-text-muted">
                                            <iconify-icon icon="lucide:image" width="48" className="mb-2 opacity-30" />
                                            <p className="text-sm">Voeg een URL toe</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-glass-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl bg-glass-border/30 text-text-muted hover:bg-glass-border/50 transition-all duration-200"
                            disabled={isSaving}
                        >
                            Annuleren
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-all duration-200 shadow-lg shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSaving || isUploading}
                        >
                            {isUploading ? (
                                <span className="flex items-center gap-2">
                                    <iconify-icon icon="lucide:loader-2" width="16" className="animate-spin" />
                                    Uploaden...
                                </span>
                            ) : isSaving ? (
                                <span className="flex items-center gap-2">
                                    <iconify-icon icon="lucide:loader-2" width="16" className="animate-spin" />
                                    Opslaan...
                                </span>
                            ) : (
                                editingPost ? "Wijzigingen Opslaan" : "Post Toevoegen"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
