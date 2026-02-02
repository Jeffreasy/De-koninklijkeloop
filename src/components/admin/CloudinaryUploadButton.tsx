import { Upload } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
    onUploadSuccess: (url: string) => void;
    currentUrl?: string;
}

// Cloudinary Widget Types
declare global {
    interface Window {
        cloudinary: any;
    }
}

export function CloudinaryUploadButton({ onUploadSuccess, currentUrl }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Load Cloudinary Upload Widget script
        if (!document.getElementById('cloudinary-upload-widget')) {
            const script = document.createElement('script');
            script.id = 'cloudinary-upload-widget';
            script.src = 'https://upload-widget.cloudinary.com/global/all.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleUploadClick = () => {
        if (!window.cloudinary) {
            alert('Cloudinary widget is nog aan het laden. Probeer het opnieuw.');
            return;
        }

        console.log('🚀 Opening Cloudinary Upload Widget with config:', {
            cloudName: 'dd7inzxl5',
            uploadPreset: 'dkl_social_posts',
            note: 'Folder is configured in the preset itself'
        });

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: 'dd7inzxl5',
                uploadPreset: 'dkl_social_posts',
                // folder is defined in the preset, don't override it
                sources: ['local', 'url', 'camera'],
                multiple: false,
                maxFiles: 1,
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                maxFileSize: 10000000, // 10MB
                showPoweredBy: false,
                styles: {
                    palette: {
                        window: '#1A1A2E',
                        windowBorder: '#FF6B35',
                        tabIcon: '#FF6B35',
                        menuIcons: '#FFFFFF',
                        textDark: '#000000',
                        textLight: '#FFFFFF',
                        link: '#FF6B35',
                        action: '#FF6B35',
                        inactiveTabIcon: '#8E8E8E',
                        error: '#F44336',
                        inProgress: '#FF6B35',
                        complete: '#4CAF50',
                        sourceBg: '#16213E',
                    },
                },
            },
            (error: any, result: any) => {
                if (error) {
                    console.error('❌ Cloudinary Upload Error - Full details:', {
                        error,
                        status: error.status,
                        statusText: error.statusText,
                        message: error.message,
                        fullError: JSON.stringify(error, null, 2)
                    });

                    // Better error messages
                    if (error.statusText?.includes('API key') || error.status?.includes('API key')) {
                        alert(`⚠️ Upload Preset Issue!\n\nPreset: dkl_social_posts\nError: ${error.statusText || error.status}\n\nTry:\n1. Hard refresh (Ctrl+Shift+R)\n2. Check browser console for details`);
                    } else {
                        alert('Upload mislukt: ' + (error.statusText || error.message || 'Onbekende fout'));
                    }

                    setIsLoading(false);
                    return;
                }

                console.log('📤 Cloudinary event:', result.event, result);

                if (result.event === 'success') {
                    const imageUrl = result.info.secure_url;
                    console.log('✅ Upload SUCCESS! URL:', imageUrl);
                    onUploadSuccess(imageUrl);
                    setIsLoading(false);
                    widget.close();
                }

                if (result.event === 'upload-added') {
                    console.log('⏳ File added to upload queue');
                    setIsLoading(true);
                }

                if (result.event === 'close') {
                    console.log('🚪 Widget closed by user');
                    setIsLoading(false);
                }
            }
        );

        widget.open();
    };

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={handleUploadClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-brand-orange/10 hover:bg-brand-orange/20 border-2 border-brand-orange/30 hover:border-brand-orange/50 text-brand-orange font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Upload className="w-5 h-5" />
                {isLoading ? 'Uploaden...' : 'Upload naar Cloudinary'}
            </button>

            {currentUrl && (
                <p className="text-xs text-text-muted text-center">
                    Of plak een bestaande URL hieronder
                </p>
            )}
        </div>
    );
}
