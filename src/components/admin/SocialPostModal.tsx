import { useState, useEffect, useRef } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { AdminModal } from "./AdminModal";
import { uploadFileToImageKit } from "./ServerSideUploadButton";
import { ImageIcon, Loader2, Film, Image as ImageLucide, Plus, X, ChevronUp, ChevronDown, Link as LinkIcon } from "lucide-react";

// ─── Types ───

interface MediaItem {
    url: string;
    type: "image" | "video";
    videoUrl?: string;
}

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
        isVisible: boolean;
        postedDate?: number;
        mediaType?: "image" | "video";
        videoUrl?: string;
        mediaItems?: MediaItem[];
    } | null;
}

export interface SocialPostFormData {
    imageUrl: string;
    caption: string;
    instagramUrl: string;
    isFeatured: boolean;
    isVisible: boolean;
    postedDate?: number;
    year?: string;
    mediaType?: "image" | "video";
    videoUrl?: string;
    mediaItems?: MediaItem[];
}

// ─── Helpers ───

function extractStreamableShortcode(url: string): string | null {
    const match = url.match(/streamable\.com\/(?:e\/|o\/)?([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

function getStreamableThumbnail(shortcode: string): string {
    return `https://thumbs-east.streamable.com/image/${shortcode}.jpg`;
}

function isVideoFile(file: File): boolean {
    return file.type.startsWith("video/");
}

// ─── Component ───

export function SocialPostModal({ isOpen, onClose, onSave, editingPost }: Props) {
    // Core form state
    const [caption, setCaption] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [postedDate, setPostedDate] = useState("");

    // Media state
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [pendingFiles, setPendingFiles] = useState<Map<number, File>>(new Map());

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [urlError, setUrlError] = useState("");
    const [uploadProgress, setUploadProgress] = useState("");

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamableInputRef = useRef<HTMLInputElement>(null);

    // ─── Populate form when editing ───
    useEffect(() => {
        if (!isOpen) return;

        if (editingPost) {
            setCaption(editingPost.caption);
            setInstagramUrl(editingPost.instagramUrl);
            setIsFeatured(editingPost.isFeatured);
            setIsVisible(editingPost.isVisible);
            setPostedDate(
                editingPost.postedDate
                    ? new Date(editingPost.postedDate).toISOString().split("T")[0]
                    : ""
            );

            // Populate media items: prefer mediaItems array, fallback to single imageUrl
            if (editingPost.mediaItems && editingPost.mediaItems.length > 0) {
                setMediaItems(editingPost.mediaItems);
            } else {
                // Legacy single-media post → convert to array
                const single: MediaItem = {
                    url: editingPost.imageUrl,
                    type: (editingPost.mediaType as "image" | "video") || "image",
                    videoUrl: editingPost.videoUrl,
                };
                setMediaItems([single]);
            }
        } else {
            setCaption("");
            setInstagramUrl("");
            setIsFeatured(false);
            setIsVisible(true);
            setPostedDate("");
            setMediaItems([]);
        }
        setPendingFiles(new Map());
        setFormError("");
        setUrlError("");
        setUploadProgress("");
    }, [editingPost, isOpen]);

    // U3: Clean up blob URLs on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            mediaItems.forEach(item => {
                if (item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
                if (item.videoUrl?.startsWith("blob:")) URL.revokeObjectURL(item.videoUrl);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Media Item Management ───

    const addFilesFromInput = (files: File[]) => {
        setMediaItems(prev => {
            const newItems: MediaItem[] = files.map(file => {
                const blobUrl = URL.createObjectURL(file);
                if (isVideoFile(file)) {
                    return { url: blobUrl, type: "video" as const, videoUrl: blobUrl };
                }
                return { url: blobUrl, type: "image" as const };
            });

            const startIdx = prev.length;
            setPendingFiles(prevFiles => {
                const next = new Map(prevFiles);
                files.forEach((file, i) => next.set(startIdx + i, file));
                return next;
            });

            return [...prev, ...newItems];
        });
    };

    const addStreamableUrl = (url: string) => {
        const shortcode = extractStreamableShortcode(url);
        if (!shortcode) return;

        setMediaItems(prev => [...prev, {
            url: getStreamableThumbnail(shortcode),
            type: "video",
            videoUrl: url,
        }]);
    };

    const removeMediaItem = (index: number) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
        setPendingFiles(prev => {
            const next = new Map<number, File>();
            prev.forEach((file, key) => {
                if (key < index) next.set(key, file);
                else if (key > index) next.set(key - 1, file);
            });
            return next;
        });
    };

    const moveMediaItem = (index: number, direction: "up" | "down") => {
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= mediaItems.length) return;

        setMediaItems(prev => {
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });

        setPendingFiles(prev => {
            const next = new Map<number, File>();
            prev.forEach((file, key) => {
                if (key === index) next.set(target, file);
                else if (key === target) next.set(index, file);
                else next.set(key, file);
            });
            return next;
        });
    };

    // ─── Validation ───

    const validateInstagramUrl = (url: string): boolean => {
        if (!url) return false;
        return url.includes("instagram.com");
    };

    // ─── Submit ───

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setUrlError("");

        // Validate
        if (mediaItems.length === 0) {
            setFormError("Voeg minimaal 1 foto of video toe");
            return;
        }
        if (!caption.trim()) {
            setFormError("Voeg een caption toe");
            return;
        }
        if (!validateInstagramUrl(instagramUrl)) {
            setUrlError("Voeg een geldige Instagram URL toe (moet instagram.com bevatten)");
            return;
        }

        setIsSaving(true);
        try {
            // Upload pending files
            const finalItems: MediaItem[] = [...mediaItems];
            for (const [idx, file] of pendingFiles.entries()) {
                setUploadProgress(`Uploaden ${idx + 1}/${pendingFiles.size}...`);
                try {
                    const uploadedUrl = await uploadFileToImageKit(file);
                    if (isVideoFile(file)) {
                        finalItems[idx] = {
                            url: uploadedUrl + "/ik-thumbnail.jpg",
                            type: "video",
                            videoUrl: uploadedUrl,
                        };
                    } else {
                        finalItems[idx] = {
                            url: uploadedUrl,
                            type: "image",
                        };
                    }
                } catch (err) {
                    const msg = err instanceof Error ? err.message : "Onbekend";
                    setFormError(`Upload mislukt voor item ${idx + 1}: ${msg}`);
                    setIsSaving(false);
                    setUploadProgress("");
                    return;
                }
            }
            setUploadProgress("");

            // Determine cover image and mediaType from first item
            const cover = finalItems[0];
            const hasAnyVideo = finalItems.some(item => item.type === "video");

            await onSave({
                imageUrl: cover.url,
                caption,
                instagramUrl,
                isFeatured,
                isVisible,
                postedDate: postedDate ? new Date(postedDate).getTime() : undefined,
                mediaType: hasAnyVideo ? "video" : "image",
                videoUrl: cover.type === "video" ? cover.videoUrl : undefined,
                mediaItems: finalItems,
            });
            onClose();
        } catch (error) {
            if (import.meta.env.DEV) console.error("Error saving post:", error);
            setFormError("Fout bij opslaan. Probeer opnieuw.");
        } finally {
            setIsSaving(false);
            setUploadProgress("");
        }
    };

    // ─── Streamable URL Popup ───

    const [showStreamableInput, setShowStreamableInput] = useState(false);
    const [streamableUrl, setStreamableUrl] = useState("");

    const handleAddStreamable = () => {
        if (streamableUrl.trim()) {
            const shortcode = extractStreamableShortcode(streamableUrl.trim());
            if (shortcode) {
                addStreamableUrl(streamableUrl.trim());
                setStreamableUrl("");
                setShowStreamableInput(false);
            } else {
                setFormError("Ongeldige Streamable URL (bijv. https://streamable.com/abc123)");
            }
        }
    };

    // ─── Render ───

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
                {/* Error Banner */}
                {formError && (
                    <div className="mx-0 mb-4 px-4 py-3 rounded-xl bg-[rgb(var(--error))]/10 border border-[rgb(var(--error))]/20 text-[rgb(var(--error))] text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        {formError}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto overscroll-contain">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                        {/* ─── Left Column: Form Fields ─── */}
                        <div className="space-y-4 md:space-y-5">

                            {/* Media Items Strip */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2 md:mb-3">
                                    Media ({mediaItems.length}/10)
                                </label>

                                {/* Thumbnail strip */}
                                <div className="flex flex-wrap gap-2">
                                    {mediaItems.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-glass-border hover:border-brand-orange/50 transition-all bg-glass-bg/40"
                                        >
                                            <img
                                                src={item.url}
                                                alt={`Media ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23333' width='80' height='80'/%3E%3Ctext fill='%23888' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='10'%3EError%3C/text%3E%3C/svg%3E";
                                                }}
                                            />

                                            {/* Video badge */}
                                            {item.type === "video" && (
                                                <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/70 text-white text-[8px] font-bold flex items-center gap-0.5">
                                                    <Film className="w-2.5 h-2.5" />
                                                </div>
                                            )}

                                            {/* Cover badge (first item) */}
                                            {idx === 0 && mediaItems.length > 1 && (
                                                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-brand-orange/90 text-white text-[8px] font-bold">
                                                    Cover
                                                </div>
                                            )}

                                            {/* Hover controls */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                {idx > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => moveMediaItem(idx, "up")}
                                                        className="p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
                                                        title="Naar links"
                                                    >
                                                        <ChevronUp className="w-3 h-3 -rotate-90" />
                                                    </button>
                                                )}
                                                {idx < mediaItems.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => moveMediaItem(idx, "down")}
                                                        className="p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
                                                        title="Naar rechts"
                                                    >
                                                        <ChevronDown className="w-3 h-3 -rotate-90" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeMediaItem(idx)}
                                                    className="p-1 rounded bg-red-500/80 hover:bg-red-500 text-white transition-colors cursor-pointer"
                                                    title="Verwijder"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add buttons */}
                                    {mediaItems.length < 10 && (
                                        <div className="flex gap-2">
                                            {/* Add image/video file */}
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-20 h-20 rounded-xl border-2 border-dashed border-glass-border hover:border-brand-orange/50 flex flex-col items-center justify-center gap-1 text-text-muted hover:text-brand-orange transition-all cursor-pointer bg-glass-bg/20 hover:bg-glass-bg/40"
                                            >
                                                <Plus className="w-5 h-5" />
                                                <span className="text-[9px] font-medium">Upload</span>
                                            </button>

                                            {/* Add Streamable */}
                                            <button
                                                type="button"
                                                onClick={() => setShowStreamableInput(true)}
                                                className="w-20 h-20 rounded-xl border-2 border-dashed border-glass-border hover:border-brand-orange/50 flex flex-col items-center justify-center gap-1 text-text-muted hover:text-brand-orange transition-all cursor-pointer bg-glass-bg/20 hover:bg-glass-bg/40"
                                            >
                                                <LinkIcon className="w-5 h-5" />
                                                <span className="text-[9px] font-medium">Streamable</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        const files = e.target.files;
                                        if (!files) return;
                                        const remaining = 10 - mediaItems.length;
                                        addFilesFromInput(Array.from(files).slice(0, remaining));
                                        e.target.value = "";
                                    }}
                                />

                                {/* Streamable URL input */}
                                {showStreamableInput && (
                                    <div className="mt-3 flex gap-2">
                                        <input
                                            ref={streamableInputRef}
                                            type="url"
                                            value={streamableUrl}
                                            onChange={(e) => setStreamableUrl(e.target.value)}
                                            placeholder="https://streamable.com/abc123"
                                            className="flex-1 px-3 py-2 text-sm bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddStreamable(); } }}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddStreamable}
                                            className="px-3 py-2 rounded-xl bg-brand-orange text-white text-sm font-medium hover:bg-orange-400 transition-colors cursor-pointer"
                                        >
                                            Voeg toe
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowStreamableInput(false); setStreamableUrl(""); }}
                                            className="px-3 py-2 rounded-xl bg-glass-border/30 text-text-muted text-sm hover:bg-glass-border/50 transition-colors cursor-pointer"
                                        >
                                            Annuleer
                                        </button>
                                    </div>
                                )}

                                <p className="mt-1.5 text-xs text-text-muted">
                                    Upload foto's/video's of voeg Streamable links toe. Eerste item = cover.
                                </p>
                            </div>

                            {/* Caption */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2 md:mb-3">
                                    Bericht *
                                </label>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Schrijf een pakkende caption..."
                                    rows={4}
                                    maxLength={2200}
                                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/50 resize-none"
                                    required
                                />
                                <p className="mt-1.5 text-xs text-text-muted">
                                    {caption.length} / 2200 tekens
                                </p>
                            </div>

                            {/* Instagram URL */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2 md:mb-3">
                                    Instagram Post URL *
                                </label>
                                <input
                                    type="url"
                                    value={instagramUrl}
                                    onChange={(e) => {
                                        setInstagramUrl(e.target.value);
                                        if (e.target.value && !validateInstagramUrl(e.target.value)) {
                                            setUrlError("URL moet een Instagram link zijn");
                                        } else {
                                            setUrlError("");
                                        }
                                    }}
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
                                    value={postedDate}
                                    onChange={(e) => setPostedDate(e.target.value)}
                                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                                />
                            </div>
                        </div>

                        {/* ─── Right Column: Preview & Settings ─── */}
                        <div className="space-y-4 md:space-y-5">

                            {/* Preview */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2 md:mb-3">
                                    Preview {mediaItems.length > 1 && `(${mediaItems.length} slides)`}
                                </label>
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-glass-bg/30 border border-glass-border">
                                    {mediaItems.length > 0 ? (
                                        <>
                                            {mediaItems[0].type === "video" && mediaItems[0].videoUrl?.startsWith("blob:") ? (
                                                <video
                                                    src={mediaItems[0].videoUrl}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    autoPlay
                                                    loop
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <img
                                                    src={mediaItems[0].url}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}

                                            {/* Slide count overlay */}
                                            {mediaItems.length > 1 && (
                                                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1.5">
                                                    <ImageLucide className="w-3 h-3" />
                                                    1/{mediaItems.length}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                                            <div className="text-center p-4">
                                                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                <p className="text-xs md:text-sm">Geen media geselecteerd</p>
                                            </div>
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
                                            checked={isFeatured}
                                            onChange={(e) => setIsFeatured(e.target.checked)}
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
                                            checked={isVisible}
                                            onChange={(e) => setIsVisible(e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-10 h-6 bg-glass-border rounded-full cursor-pointer transition-colors duration-200 peer-checked:bg-brand-orange" />
                                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-4 pointer-events-none" />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 lg:relative shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6 pt-6 border-t border-glass-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-glass-border/30 text-text-muted hover:bg-glass-border/50 transition-all duration-200 text-sm md:text-base font-medium cursor-pointer min-h-[44px]"
                        disabled={isSaving}
                    >
                        Annuleren
                    </button>
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-all duration-200 shadow-lg shadow-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base cursor-pointer min-h-[44px]"
                        disabled={isSaving}
                    >
                        {uploadProgress ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {uploadProgress}
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
