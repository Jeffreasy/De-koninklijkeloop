import { X } from 'lucide-react';
import { useEffect } from 'react';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
    showFooter?: boolean;
    footer?: React.ReactNode;
    fullScreen?: boolean; // Mobile full-screen support
}

/**
 * AdminModal - Reusable Modal Base Component
 * 
 * Features:
 * - Portal rendering to document.body
 * - ESC key handling
 * - Backdrop click to close
 * - Responsive sizing with mobile full-screen option
 * - Accessible (ARIA labels, keyboard navigation)
 * - Theme-aware (uses semantic tokens)
 * - Standardized glassmorphism (backdrop-blur-md)
 * 
 * Usage:
 * ```tsx
 * <AdminModal
 *     isOpen={isOpen}
 *     onClose={() => setIsOpen(false)}
 *     title="Edit Media"
 *     size="4xl"
 *     footer={<button>Save</button>}
 * >
 *     <div>Your content here</div>
 * </AdminModal>
 * ```
 */
export function AdminModal({
    isOpen,
    onClose,
    title,
    children,
    size = '4xl',
    showFooter = true,
    footer,
    fullScreen = false
}: AdminModalProps) {
    // ESC key handler
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl',
        '6xl': 'max-w-6xl'
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                className="fixed inset-0 z-50 overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className={`flex min-h-full items-center justify-center ${fullScreen ? 'p-0' : 'p-4'}`}>
                    <div
                        className={`relative w-full ${fullScreen ? 'h-full md:h-auto md:rounded-2xl' : 'rounded-2xl'} ${sizeClasses[size]} bg-surface/95 backdrop-blur-md shadow-2xl border-0 md:border md:border-border flex flex-col ${fullScreen ? 'max-h-screen md:max-h-[90vh]' : 'max-h-[90vh]'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-border bg-surface/90 backdrop-blur-md">
                            <h2
                                id="modal-title"
                                className="text-xl md:text-2xl font-display font-bold text-text-primary"
                            >
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-glass-border/30 transition-colors text-text-muted hover:text-text-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Sluit modal"
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            {children}
                        </div>

                        {/* Footer */}
                        {showFooter && footer && (
                            <div className="shrink-0 flex items-center justify-end gap-3 p-4 md:p-6 border-t border-border bg-surface/95 backdrop-blur-md sticky bottom-0 lg:relative z-10">
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
 * 
 * Usage:
 * ```tsx
 * <AdminModal
 *     footer={
 *         <AdminModalFooterButtons
 *             onCancel={onClose}
 *             onConfirm={handleSave}
 *             confirmText="Opslaan"
 *             isLoading={isSaving}
 *         />
 *     }
 * >
 * ```
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
                className="px-4 py-2 rounded-xl bg-glass-border/30 text-text-muted hover:bg-glass-border/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
            >
                {cancelText}
            </button>
            <button
                type="button"
                onClick={onConfirm}
                disabled={confirmDisabled || isLoading}
                className="px-6 py-2 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
            >
                {isLoading ? 'Even geduld...' : confirmText}
            </button>
        </>
    );
}
