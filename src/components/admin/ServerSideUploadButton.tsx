import { Upload, X } from "lucide-react";
import { useState, useRef } from "react";

interface Props {
    onFileSelect: (file: File) => void;
    onClearFile: () => void;
    currentUrl?: string;
    selectedFile?: File | null;
    acceptVideo?: boolean;
}

export function ServerSideUploadButton({ onFileSelect, onClearFile, currentUrl, selectedFile, acceptVideo = false }: Props) {
    const [preview, setPreview] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<"image" | "video">("image");
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        const validTypes = acceptVideo ? [...imageTypes, ...videoTypes] : imageTypes;
        const isVideo = videoTypes.includes(file.type);

        if (!validTypes.includes(file.type)) {
            setError(acceptVideo
                ? 'Alleen JPG, PNG, GIF, WebP, MP4, WebM en MOV zijn toegestaan'
                : 'Alleen JPG, PNG, GIF en WebP zijn toegestaan');
            return;
        }

        // Validate file size (100MB for video, 10MB for image)
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(isVideo ? 'Video is te groot (max 100MB)' : 'Afbeelding is te groot (max 10MB)');
            return;
        }

        setError(null);
        setPreviewType(isVideo ? "video" : "image");

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Pass file to parent (will upload on save)
        onFileSelect(file);
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleClearPreview = () => {
        setPreview(null);
        setPreviewType("image");
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClearFile();
    };

    return (
        <div className="space-y-3">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptVideo
                    ? "image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                    : "image/jpeg,image/jpg,image/png,image/gif,image/webp"}
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload button */}
            {!preview && !currentUrl && (
                <button
                    type="button"
                    onClick={handleButtonClick}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-brand-orange/10 hover:bg-brand-orange/20 border-2 border-brand-orange/30 hover:border-brand-orange/50 text-brand-orange font-medium transition-all duration-200"
                >
                    <Upload className="w-5 h-5" />
                    {acceptVideo ? "Kies Afbeelding of Video" : "Kies Afbeelding"}
                </button>
            )}

            {/* Preview */}
            {preview && (
                <div className="relative rounded-xl overflow-hidden border-2 border-brand-orange/30">
                    {previewType === "video" ? (
                        <video
                            src={preview}
                            className="w-full h-48 object-cover"
                            muted
                            playsInline
                            preload="metadata"
                        />
                    ) : (
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                        />
                    )}
                    <button
                        type="button"
                        onClick={handleClearPreview}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent text-white text-xs p-3">
                        <p className="font-medium">{previewType === "video" ? "✓ Video geselecteerd" : "✓ Afbeelding geselecteerd"}</p>
                        <p className="text-white/70 mt-0.5">Upload gebeurt bij opslaan</p>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Success indicator for URL */}
            {currentUrl && !preview && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <p className="text-xs text-green-400 font-medium">✓ Afbeelding URL opgegeven</p>
                </div>
            )}

            {/* Help text */}
            {!preview && !currentUrl && (
                <p className="text-xs text-text-muted text-center">
                    Of plak een URL in het veld hieronder
                </p>
            )}
        </div>
    );
}

// Export upload function for use in modal
export async function uploadFileToImageKit(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Upload mislukt');
    }

    return data.url;
}
