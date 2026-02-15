import { useState, useEffect } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { AdminModal } from "./AdminModal";
import { ServerSideUploadButton, uploadFileToImageKit } from "./ServerSideUploadButton";
import { ImageIcon, Loader2 } from "lucide-react";

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
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [imagePreviewError, setImagePreviewError] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [urlError, setUrlError] = useState("");
    const [formError, setFormError] = useState("");

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
        setSelectedFile(null);
        setFilePreviewUrl(null);
    }, [editingPost, isOpen]);

    const validateInstagramUrl = (url: string): boolean => {
        if (!url) return false;
        return url.includes("instagram.com");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        setFormError("");
        if (!formData.imageUrl.trim() && !selectedFile) {
            setFormError("Voeg een afbeelding toe (upload een bestand of plak een URL)");
            return;
        }
        if (!formData.caption.trim()) {
            setFormError("Voeg een caption toe");
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
                    if (import.meta.env.DEV) console.log('Uploading file before saving...');
                    finalImageUrl = await uploadFileToImageKit(selectedFile);
                    if (import.meta.env.DEV) console.log('File uploaded:', finalImageUrl);
                } catch (uploadError) {
                    const msg = uploadError instanceof Error ? uploadError.message : 'Onbekend';
                    if (import.meta.env.DEV) console.error('Upload failed:', msg);
                    setFormError(`Upload mislukt: ${msg}`);
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
            if (import.meta.env.DEV) console.error("Error saving post:", error);
            setFormError("Fout bij opslaan. Probeer opnieuw.");
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

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingPost ? "Post Bewerken" : "Nieuwe Post"}
            size="6xl"
            fullScreen={true}
            showFooter={false}
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                {/* Inline Error Banner */}
                {formError && (
                    <div className="mx-0 mb-4 px-4 py-3 rounded-xl bg-[rgb(var(--error))]/10 border border-[rgb(var(--error))]/20 text-[rgb(var(--error))] text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        {formError}
                    </div>
                )}
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Single column on mobile, grid on tablet+ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                                        // Generate preview URL for the selected file
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFilePreviewUrl(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                    onClearFile={() => {
                                        setSelectedFile(null);
                                        // Cleanup preview URL
                                        if (filePreviewUrl) {
                                            setFilePreviewUrl(null);
                                        }
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
                                            setFilePreviewUrl(null); // Clear file preview
                                        }}
                                        placeholder={selectedFile ? "Bestand geselecteerd - URL niet nodig" : "Of plak een URL (https://...)"}
                                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!!selectedFile}
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
                                    maxLength={500}
                                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/50 resize-none"
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
                                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                                    required
                                />
                                {urlError && (
                                    <p className="mt-1.5 text-xs text-[rgb(var(--error))]">{urlError}</p>
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
                                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
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
                                    {(filePreviewUrl || formData.imageUrl) ? (
                                        <img
                                            src={filePreviewUrl || formData.imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={() => setImagePreviewError(true)}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                                            <div className="text-center p-4">
                                                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                <p className="text-xs md:text-sm">Geen afbeelding geselecteerd</p>
                                            </div>
                                        </div>
                                    )}
                                    {imagePreviewError && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-[rgb(var(--error))]/10 text-[rgb(var(--error))]">
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
                                    <span className="text-xs md:text-sm text-text-primary group-hover:text-brand-orange transition-colors">
                                        Uitgelicht
                                    </span>
                                    <div className="relative inline-block w-10 h-6">
                                        <input
                                            type="checkbox"
                                            checked={formData.isFeatured}
                                            onChange={(e) =>
                                                setFormData({ ...formData, isFeatured: e.target.checked })
                                            }
                                            className="peer sr-only"
                                        />
                                        <div className="w-10 h-6 bg-glass-border rounded-full cursor-pointer transition-colors duration-200 peer-checked:bg-brand-orange" />
                                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-4 pointer-events-none" />
                                    </div>
                                </label>

                                {/* Visibility Toggle */}
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-xs md:text-sm text-text-primary group-hover:text-brand-orange transition-colors">
                                        Zichtbaar
                                    </span>
                                    <div className="relative inline-block w-10 h-6">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVisible}
                                            onChange={(e) =>
                                                setFormData({ ...formData, isVisible: e.target.checked })
                                            }
                                            className="peer sr-only"
                                        />
                                        <div className="w-10 h-6 bg-glass-border rounded-full cursor-pointer transition-colors duration-200 peer-checked:bg-brand-orange" />
                                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-4 pointer-events-none" />
                                    </div>
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
                                        className="w-full h-2 bg-glass-border rounded-lg appearance-none cursor-pointer accent-brand-orange"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Sticky on mobile, fixed on desktop */}
                <div className="sticky bottom-0 lg:relative shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6 pt-6 border-t border-glass-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-glass-border/30 text-text-muted hover:bg-glass-border/50 transition-all duration-200 text-sm md:text-base font-medium cursor-pointer"
                        disabled={isSaving || isUploading}
                    >
                        Annuleren
                    </button>
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all duration-200 shadow-lg shadow-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base cursor-pointer"
                        disabled={isSaving || isUploading}
                    >
                        {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploaden...
                            </span>
                        ) : isSaving ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Opslaan...
                            </span>
                        ) : (
                            editingPost ? "Wijzigingen Opslaan" : "Post Toevoegen"
                        )}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
}
