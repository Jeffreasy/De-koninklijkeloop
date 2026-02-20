import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { IMAGEKIT_URL_ENDPOINT } from '../../lib/imagekit';

export type MediaItem = {
    type: 'image' | 'video';
    src: string;              // ImageKit file path or Streamable shortcode
    alt?: string;
    title?: string;
    year?: string;
}

interface MediaLightboxModalProps {
    items: MediaItem[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function MediaLightboxModal({
    items,
    initialIndex,
    isOpen: propIsOpen,
    onClose: propOnClose
}: MediaLightboxModalProps) {
    // Internal state management for lightbox (controlled by events)
    const [isOpen, setIsOpen] = useState(propIsOpen);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const imageRef = useRef<HTMLDivElement>(null);
    const currentItem = items[currentIndex] || items[0];

    // Listen to global lightbox events from Astro
    useEffect(() => {
        const handleLightboxChange = (e: CustomEvent<{ index: number; isOpen: boolean }>) => {
            if (import.meta.env.DEV) {
                console.log('Lightbox event:', e.detail);
                console.log('Current items:', items);
                console.log('Item to show:', items[e.detail.index]);
            }

            setCurrentIndex(e.detail.index);
            setIsOpen(e.detail.isOpen);
            if (e.detail.isOpen) {
                resetZoom();
            }
        };

        window.addEventListener('lightbox-state-change', handleLightboxChange as EventListener);
        return () => {
            window.removeEventListener('lightbox-state-change', handleLightboxChange as EventListener);
        };
    }, [items]);

    // Close handler
    const handleClose = () => {
        setIsOpen(false);
        propOnClose?.();
    };

    // Reset state when index changes
    useEffect(() => {
        resetZoom();
    }, [currentIndex]);

    // iOS-safe scroll lock
    useEffect(() => {
        if (!isOpen) return;

        const scrollY = window.scrollY;
        const body = document.body;
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.overflow = 'hidden';

        return () => {
            body.style.position = '';
            body.style.top = '';
            body.style.left = '';
            body.style.right = '';
            body.style.overflow = '';
            window.scrollTo(0, scrollY);
        };
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    handleClose();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    const resetZoom = () => {
        setIsZoomed(false);
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    // Touch/Mouse handlers for swipe
    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (isZoomed) return; // Don't swipe when zoomed

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        setTouchStart({ x: clientX, y: clientY });
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!touchStart || !isDragging) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        if (isZoomed && imageRef.current) {
            // Pan when zoomed
            const deltaX = clientX - touchStart.x;
            const deltaY = clientY - touchStart.y;
            setPanOffset({ x: deltaX, y: deltaY });
        }
    };

    const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
        if (!touchStart || !isDragging) return;

        const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
        const deltaX = clientX - touchStart.x;

        // Swipe threshold: 50px
        if (!isZoomed && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                goToPrevious();
            } else {
                goToNext();
            }
        }

        setTouchStart(null);
        setIsDragging(false);
    };

    // Double-tap to zoom (touch only)
    const handleDoubleClick = () => {
        if (currentItem.type !== 'image') return;

        if (isZoomed) {
            resetZoom();
        } else {
            setIsZoomed(true);
            setZoomLevel(2);
        }
    };

    // Scroll to zoom (desktop) - Must use native listener to prevent passive warning
    useEffect(() => {
        if (!isOpen) return;

        const handleWheel = (e: WheelEvent) => {
            if (currentItem.type !== 'image') return;

            e.preventDefault();

            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newZoom = Math.max(1, Math.min(4, zoomLevel + delta));

            setZoomLevel(newZoom);
            setIsZoomed(newZoom > 1);

            if (newZoom === 1) {
                setPanOffset({ x: 0, y: 0 });
            }
        };

        // Must specify { passive: false } to allow preventDefault()
        const contentArea = document.getElementById('lightbox-content-area');
        if (contentArea) {
            contentArea.addEventListener('wheel', handleWheel, { passive: false });
            return () => contentArea.removeEventListener('wheel', handleWheel);
        }
    }, [isOpen, currentItem.type, zoomLevel]);


    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
            style={{ height: '100dvh' }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className="h-full w-full md:max-w-7xl md:mx-auto md:p-8">
                {/* Safe area container */}
                <div className="flex flex-col h-full safe-area-inset">

                    {/* Header */}
                    <div className="premium-glass p-4 flex justify-between items-center shrink-0 animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-3">
                            {/* Year Badge */}
                            {currentItem.year && (
                                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${currentItem.year === '2024'
                                    ? 'bg-blue-500/90 text-white'
                                    : 'bg-emerald-500/90 text-white'
                                    }`}>
                                    {currentItem.year}
                                </div>
                            )}

                            {/* Counter */}
                            <div className="text-text-primary font-medium">
                                {currentIndex + 1} / {items.length}
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                            aria-label="Sluiten"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div
                        id="lightbox-content-area"
                        className="flex-1 relative overflow-hidden touch-none"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleTouchStart}
                        onMouseMove={handleTouchMove}
                        onMouseUp={handleTouchEnd}
                        onDoubleClick={handleDoubleClick}
                    >
                        <div
                            ref={imageRef}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                                cursor: isZoomed ? 'grab' : currentItem.type === 'image' ? 'zoom-in' : 'default'
                            }}
                        >
                            {currentItem.type === 'image' ? (
                                <img
                                    src={
                                        // If src contains https://, use it directly (secure_url)
                                        // Otherwise, use src as file path for ImageKit
                                        currentItem.src.startsWith('https://')
                                            ? currentItem.src
                                            : `${IMAGEKIT_URL_ENDPOINT}/tr:f-auto,q-80,w-1920/${currentItem.src}`
                                    }
                                    alt={currentItem.alt || currentItem.title || 'Afbeelding'}
                                    className="max-w-full max-h-full object-contain select-none"
                                    draggable={false}
                                    onError={(e) => {
                                        if (import.meta.env.DEV) {
                                            console.error('Image failed to load:', currentItem.src);
                                            console.log('Full item:', currentItem);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    <div className="relative w-full max-w-5xl aspect-video">
                                        <iframe
                                            src={`https://streamable.com/e/${currentItem.src}?autoplay=1`}
                                            className="absolute inset-0 w-full h-full rounded-xl"
                                            frameBorder="0"
                                            allowFullScreen
                                            allow="autoplay"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Arrows (Desktop) */}
                        {items.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToPrevious();
                                    }}
                                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-white"
                                    aria-label="Vorige"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToNext();
                                    }}
                                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-white"
                                    aria-label="Volgende"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="premium-glass p-4 shrink-0 animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between">
                            {/* Metadata */}
                            <div className="flex-1 min-w-0 mr-4">
                                {currentItem.title && (
                                    <h3 className="text-text-primary font-display font-bold text-lg truncate">
                                        {currentItem.title}
                                    </h3>
                                )}
                                {currentItem.alt && (
                                    <p className="text-text-muted text-sm line-clamp-2">
                                        {currentItem.alt}
                                    </p>
                                )}
                            </div>

                            {/* Zoom Controls (Photos Only) */}
                            {currentItem.type === 'image' && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const newZoom = Math.max(1, zoomLevel - 0.5);
                                            setZoomLevel(newZoom);
                                            setIsZoomed(newZoom > 1);
                                            if (newZoom === 1) setPanOffset({ x: 0, y: 0 });
                                        }}
                                        disabled={zoomLevel <= 1}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                                        aria-label="Uitzoomen"
                                    >
                                        <ZoomOut className="w-5 h-5" />
                                    </button>

                                    <div className="text-white text-sm font-medium min-w-12 text-center">
                                        {Math.round(zoomLevel * 100)}%
                                    </div>

                                    <button
                                        onClick={() => {
                                            const newZoom = Math.min(4, zoomLevel + 0.5);
                                            setZoomLevel(newZoom);
                                            setIsZoomed(true);
                                        }}
                                        disabled={zoomLevel >= 4}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                                        aria-label="Inzoomen"
                                    >
                                        <ZoomIn className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .safe-area-inset {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
        </div>
    );
}
