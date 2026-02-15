import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
    showFooter?: boolean;
    footer?: React.ReactNode;
    fullScreen?: boolean; // Mobile full-screen support (default: auto on mobile)
}

/**
 * AdminModal - Reusable Modal Base Component
 * 
 * Features:
 * - ESC key + backdrop click to close
 * - Mobile: auto fullscreen with dvh units (no iOS viewport bounce)
 * - Tablet/Desktop: centered floating with max-h-[90dvh]
 * - iOS scroll-lock (position: fixed pattern)
 * - 44px min touch targets on all interactive elements
 * - Accessible (ARIA labels, keyboard navigation)
 * - Theme-aware (uses semantic tokens)
 */
export function AdminModal({
    isOpen,
    onClose,
    title,
    children,
    size = '4xl',
    showFooter = true,
    footer,
    fullScreen
}: AdminModalProps) {
    // ESC key handler
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // iOS-safe scroll lock
    useEffect(() => {
        if (!isOpen) return;

        const scrollY = window.scrollY;
        const body = document.body;
        const html = document.documentElement;

        // Lock body scroll — iOS-safe pattern
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.overflow = 'hidden';
        html.style.overflow = 'hidden';

        return () => {
            body.style.position = '';
            body.style.top = '';
            body.style.left = '';
            body.style.right = '';
            body.style.overflow = '';
            html.style.overflow = '';
            window.scrollTo(0, scrollY);
        };
    }, [isOpen]);

    // Prevent backdrop click from propagating during scroll
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl',
        '6xl': 'max-w-6xl'
    };

    // Auto fullscreen on mobile unless explicitly set to false
    const isFullScreen = fullScreen ?? true;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                className="fixed inset-0 z-50 overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={handleBackdropClick}
            >
                <div className={`flex min-h-full items-end md:items-center justify-center ${isFullScreen ? 'p-0 md:p-4' : 'p-4'}`}>
                    <div
                        className={`relative w-full ${isFullScreen ? 'h-dvh md:h-auto md:rounded-2xl' : 'rounded-2xl'} ${sizeClasses[size]} bg-surface/95 backdrop-blur-md shadow-2xl border-0 md:border md:border-border flex flex-col ${isFullScreen ? 'max-h-dvh md:max-h-[90dvh]' : 'max-h-[90dvh]'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-border bg-surface/90 backdrop-blur-md safe-area-top">
                            <h2
                                id="modal-title"
                                className="text-xl md:text-2xl font-display font-bold text-text-primary"
                            >
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-glass-border/30 transition-colors text-text-muted hover:text-text-primary min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                                aria-label="Sluit modal"
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 overscroll-contain">
                            {children}
                        </div>

                        {/* Footer */}
                        {showFooter && footer && (
                            <div className="shrink-0 flex items-center justify-end gap-3 p-4 md:p-6 border-t border-border bg-surface/95 backdrop-blur-md safe-area-bottom">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

/**
 * AdminModalFooterButtons - Standard footer button set
 */
export function AdminModalFooterButtons({
    onCancel,
    onConfirm,
    cancelText = 'Annuleren',
    confirmText = 'Opslaan',
    isLoading = false,
    cancelDisabled = false,
    confirmDisabled = false,
}: {
    onCancel: () => void;
    onConfirm: () => void;
    cancelText?: string;
    confirmText?: string;
    isLoading?: boolean;
    cancelDisabled?: boolean;
    confirmDisabled?: boolean;
}) {
    return (
        <>
            <button
                type="button"
                onClick={onCancel}
                disabled={cancelDisabled || isLoading}
                className="px-4 py-2.5 rounded-xl bg-glass-border/30 text-text-muted hover:bg-glass-border/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] min-h-[44px] cursor-pointer"
            >
                {cancelText}
            </button>
            <button
                type="button"
                onClick={onConfirm}
                disabled={confirmDisabled || isLoading}
                className="px-6 py-2.5 rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-colors shadow-lg shadow-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] min-h-[44px] cursor-pointer"
            >
                {isLoading ? 'Even geduld...' : confirmText}
            </button>
        </>
    );
}
