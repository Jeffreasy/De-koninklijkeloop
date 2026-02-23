import { Upload } from "lucide-react";
import { useState, useRef } from "react";

interface Props {
    onUploadSuccess: (url: string) => void;
    currentUrl?: string;
}

export function ImageKitUploadButton({ onUploadSuccess, currentUrl }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Alleen JPG, PNG, GIF en WebP zijn toegestaan');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('Bestand is te groot (max 10MB)');
            return;
        }

        setIsLoading(true);
        try {
            // Use JSON+base64 to bypass Vercel Edge CSRF block on multipart/form-data.
            // Chunk-based base64: btoa(String.fromCharCode(...largeArray)) causes stack overflow
            const arrayBuffer = await file.arrayBuffer();
            const uint8 = new Uint8Array(arrayBuffer);
            let binary = '';
            const chunkSize = 8192;
            for (let i = 0; i < uint8.length; i += chunkSize) {
                binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
            }
            const base64 = btoa(binary);

            const response = await fetch('/api/admin/upload-image', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type,
                    fileBase64: base64,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload mislukt');
            }

            if (import.meta.env.DEV) console.log('✅ Upload SUCCESS! URL:', data.url);
            onUploadSuccess(data.url);
        } catch (error) {
            console.error('❌ Upload failed:', error);
            alert('Upload mislukt: ' + (error instanceof Error ? error.message : 'Onbekende fout'));
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload afbeelding"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-brand-orange/10 hover:bg-brand-orange/20 border-2 border-brand-orange/30 hover:border-brand-orange/50 text-brand-orange font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Upload className="w-5 h-5" />
                {isLoading ? 'Uploaden...' : 'Upload Afbeelding'}
            </button>

            {currentUrl && (
                <p className="text-xs text-text-muted text-center">
                    Of plak een bestaande URL hieronder
                </p>
            )}
        </div>
    );
}
