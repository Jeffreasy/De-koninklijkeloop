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
        <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
            {/* Backdrop - hidden on mobile for full-screen effect */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal - Full screen on mobile, centered on desktop */}
            <div className="relative w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-3xl bg-surface/95 backdrop-blur-2xl border-0 md:border md:border-glass-border shadow-2xl flex flex-col">
                {/* Header - Fixed on mobile */}
                <div className="shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-glass-border bg-surface/90 backdrop-blur-xl">
                    <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary">
                        {editingPost ? "Post Bewerken" : "Nieuwe Post"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-glass-border/30 transition-colors"
                        disabled={isSaving || isUploading}
                        aria-label="Sluit modal"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6 text-text-muted" />
                    </button>
                </div>

                {/* Form - Scrollable content */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    {/* Scrollable content area */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 md:p-6">
                            {/* Single column on mobile, grid on desktop */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                {/* Left Column: Form Fields */}
                                <div className="space-y-4 md:space-y-5">
                                    {/* Image Upload/URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2 md:mb-3">
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
                                                placeholder={selectedFile ? "Bestand geselecteerd - URL optioneel" : "Of plak een URL (https://...)"}
                                                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                                required={!selectedFile && !formData.imageUrl} // Only required if no file AND no URL
                                            />
                                        </div>
                                    </div>

                                    {/* Caption */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2 md:mb-3">
                                            Bericht *
                                        </label>
                                        <textarea
                                            value={formData.caption}
                                            onChange={(e) =>
                                                setFormData({ ...formData, caption: e.target.value })
                                            }
                                            placeholder="Schrijf een pakkende caption..."
                                            rows={4}
                                            className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 resize-none"
                                            required
                                        />
                                        <p className="mt-1.5 text-xs text-text-muted">
                                            {formData.caption.length} / 500 tekens
                                        </p>
                                    </div>

                                    {/* Instagram URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2 md:mb-3">
                                            Instagram Post URL *
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.instagramUrl}
                                            onChange={(e) => handleInstagramUrlChange(e.target.value)}
                                            placeholder="https://www.instagram.com/p/..."
                                            className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                            required
                                        />
                                        {urlError && (
                                            <p className="mt-1.5 text-xs text-red-400">{urlError}</p>
                                        )}
                                    </div>

                                    {/* Posted Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2 md:mb-3">
                                            Post Datum
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.postedDate || ""}
                                            onChange={(e) =>
                                                setFormData({ ...formData, postedDate: e.target.value })
                                            }
                                            className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Preview & Settings */}
                                <div className="space-y-4 md:space-y-5">
                                    {/* Image Preview */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2 md:mb-3">
                                            Preview
                                        </label>
                                        <div className="relative aspect-square rounded-xl overflow-hidden bg-glass-bg/30 border border-glass-border">
                                            {formData.imageUrl ? (
                                                <img
                                                    src={formData.imageUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={() => setImagePreviewError(true)}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                                                    <div className="text-center p-4">
                                                        <iconify-icon
                                                            icon="lucide:image"
                                                            width="48"
                                                            className="mx-auto mb-3 opacity-30"
                                                        />
                                                        <p className="text-xs md:text-sm">Geen afbeelding geselecteerd</p>
                                                    </div>
                                                </div>
                                            )}
                                            {imagePreviewError && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 text-red-400">
                                                    <p className="text-xs md:text-sm px-4 text-center">Afbeelding kan niet worden geladen</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Settings */}
                                    <div className="space-y-3 md:space-y-4 p-3 md:p-4 bg-glass-bg/30 rounded-xl border border-glass-border">
                                        <h3 className="text-sm font-medium text-text-primary mb-2">Instellingen</h3>

                                        {/* Featured Toggle */}
                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <span className="text-xs md:text-sm text-text-primary group-hover:text-accent-primary transition-colors">
                                                Uitgelicht
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={formData.isFeatured}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, isFeatured: e.target.checked })
                                                }
                                                className="w-10 h-6 bg-glass-border rounded-full appearance-none cursor-pointer transition-all duration-200 relative checked:bg-accent-primary"
                                            />
                                        </label>

                                        {/* Visibility Toggle */}
                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <span className="text-xs md:text-sm text-text-primary group-hover:text-accent-primary transition-colors">
                                                Zichtbaar
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={formData.isVisible}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, isVisible: e.target.checked })
                                                }
                                                className="w-10 h-6 bg-glass-border rounded-full appearance-none cursor-pointer transition-all duration-200 relative checked:bg-accent-primary"
                                            />
                                        </label>

                                        {/* Display Order */}
                                        <div>
                                            <label className="block text-xs md:text-sm text-text-primary mb-1.5">
                                                Volgorde ({formData.displayOrder})
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="100"
                                                value={formData.displayOrder}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        displayOrder: parseInt(e.target.value),
                                                    })
                                                }
                                                className="w-full h-2 bg-glass-border rounded-lg appearance-none cursor-pointer accent-accent-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Sticky on mobile, fixed on desktop */}
                    <div className="sticky bottom-0 lg:relative shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 md:p-6 border-t border-glass-border bg-surface/95 backdrop-blur-xl z-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-glass-border/30 text-text-muted hover:bg-glass-border/50 transition-all duration-200 text-sm md:text-base font-medium"
                            disabled={isSaving || isUploading}
                        >
                            Annuleren
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-all duration-200 shadow-lg shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                            disabled={isSaving || isUploading}
                        >
                            {isUploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <iconify-icon icon="lucide:loader-2" width="16" className="animate-spin" />
                                    Uploaden...
                                </span>
                            ) : isSaving ? (
                                <span className="flex items-center justify-center gap-2">
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
