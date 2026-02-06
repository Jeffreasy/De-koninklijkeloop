import { useState, useEffect } from "react";
import type { MergedImage } from "./MediaManagerIsland.tsx";
import { AdminModal, AdminModalFooterButtons } from "./AdminModal.tsx";

interface Props {
    isOpen: boolean;
    image: MergedImage | null;
    onClose: () => void;
    onSave: (publicId: string, altText: string, title?: string, tags?: string[]) => Promise<void>;
    accessToken: string;
}

export function MediaDetailModal({ isOpen, image, onClose, onSave, accessToken }: Props) {
    const [altText, setAltText] = useState(image?.alt_text || "");
    const [title, setTitle] = useState(image?.public_id.split('/').pop() || "");
    const [tags, setTags] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Reset form when image changes
    useEffect(() => {
        if (image) {
            setAltText(image.alt_text || "");
            setTitle(image.title || image.public_id.split('/').pop() || "");
            setTags(image.tags || []);
        }
    }, [image]);

    const handleSave = async () => {
        if (!image) return;

        setIsSaving(true);
        try {
            console.log("[MediaDetailModal] Saving metadata:", {
                publicId: image.public_id,
                altText,
                title,
                tags
            });
            await onSave(image.public_id, altText, title || undefined, tags.length > 0 ? tags : undefined);
            console.log("[MediaDetailModal] Save successful, closing modal");
            onClose();
        } catch (error) {
            console.error("[MediaDetailModal] Failed to save metadata", error);
            alert("Kon metadata niet opslaan. Probeer opnieuw.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !image) return null;

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title="Media Details"
            size="4xl"
            fullScreen={true}
            showFooter={false}
        >
            {/* Year Badge + Filename */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-glass-border">
                <div className="px-3 py-1.5 rounded-lg text-sm font-bold bg-accent-secondary/90 text-white dark:bg-accent-secondary/80">
                    {image.folder?.includes('2024') ? '2024' : '2025'}
                </div>
                <p className="text-text-muted text-sm flex-1 min-w-0 truncate" title={image.public_id}>
                    {image.public_id.split('/').pop()}
                </p>
            </div>

            {/* Swipe Handle (Mobile Visual Indicator) */}
            <div className="lg:hidden flex justify-center pb-2">
                <div className="w-12 h-1 rounded-full bg-glass-border/50" />
            </div>

            {/* Content - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Image Preview */}
                <div className="space-y-4">
                    <div className="aspect-4/3 rounded-2xl overflow-hidden bg-surface/50 dark:bg-surface/30">
                        <img
                            src={`https://res.cloudinary.com/${import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgfuv7wif'}/image/upload/w_800,h_600,c_fit,f_auto,q_auto/${image.public_id}`}
                            alt={image.alt_text || "Preview"}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes(image.secure_url)) {
                                    target.src = image.secure_url;
                                }
                            }}
                        />
                    </div>

                    {/* Image Info */}
                    <div className="glass-card p-4 space-y-2">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Bestandsinformatie</h3>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted">Formaat</span>
                            <span className="text-text-primary font-mono uppercase">{image.format}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted">Afmetingen</span>
                            <span className="text-text-primary font-mono">{image.width} × {image.height}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted">Grootte</span>
                            <span className="text-text-primary font-mono">
                                {(image.bytes / 1024).toFixed(1)} KB
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted">Folder</span>
                            <span className="text-text-primary text-right truncate max-w-[200px]" title={image.folder}>
                                {image.folder?.replace('De Koninklijkeloop/', '')}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted">Public ID</span>
                            <span className="text-text-primary font-mono text-right truncate max-w-[200px]" title={image.public_id}>
                                {image.public_id.split('/').pop()}
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                        <a
                            href={image.secure_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-2 rounded-xl bg-glass-border/30 text-text-primary hover:bg-glass-border/50 transition-colors text-center text-sm font-medium"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <iconify-icon icon="lucide:external-link" width="16" />
                                <span>Open Origineel</span>
                            </div>
                        </a>
                        <button
                            onClick={() => navigator.clipboard.writeText(image.secure_url)}
                            className="flex-1 px-4 py-2 rounded-xl bg-glass-border/30 text-text-primary hover:bg-glass-border/50 transition-colors text-center text-sm font-medium"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <iconify-icon icon="lucide:copy" width="16" />
                                <span>Kopieer URL</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="space-y-5">
                    <h3 className="text-lg font-semibold text-text-primary">Metadata Bewerken</h3>

                    {/* Alt Text Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-primary">
                            Alt Text <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                            placeholder="Beschrijf de afbeelding voor screenreaders en SEO..."
                            rows={4}
                            className="w-full px-4 py-3 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/50 resize-y min-h-[80px] max-h-[200px]"
                        />
                        <p className="text-xs text-text-muted">
                            {altText.length} karakters • Aanbevolen: 50-125 karakters
                        </p>
                        {!altText && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-[rgb(var(--warning))]/10 border border-[rgb(var(--warning))]/20">
                                <iconify-icon icon="lucide:alert-triangle" width="16" className="text-warning mt-0.5 shrink-0" />
                                <p className="text-xs text-warning">
                                    Alt text is verplicht voor toegankelijkheid en SEO
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Title Field (Optional) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-primary">
                            Titel (Optioneel)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Geef de afbeelding een titel..."
                            className="w-full px-4 py-3 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                        />
                        <p className="text-xs text-text-muted">
                            Wordt gebruikt als caption in galerijen
                        </p>
                    </div>

                    {/* Tags Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-primary">
                            Tags (Optioneel)
                        </label>
                        <input
                            type="text"
                            value={tags.join(', ')}
                            onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                            placeholder="2.5km, finish, actie..."
                            className="w-full px-4 py-3 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                        />
                        <p className="text-xs text-text-muted">
                            Gescheiden door komma's
                        </p>
                    </div>

                    {/* Alt Text Tips */}
                    <div className="glass-card p-4 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <iconify-icon icon="lucide:lightbulb" width="16" className="text-brand-orange" />
                            <h4 className="text-sm font-semibold text-text-primary">Alt Text Tips</h4>
                        </div>
                        <ul className="space-y-1.5 text-xs text-text-muted">
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange shrink-0">✓</span>
                                <span>Beschrijf wat je ziet, niet "foto van"</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange shrink-0">✓</span>
                                <span>Wees specifiek: "Lopers bij De Grote Kerk"</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange shrink-0">✓</span>
                                <span>Vermijd "afbeelding van" of "plaatje"</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange shrink-0">✓</span>
                                <span>Houd het kort maar informatief</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 lg:relative mt-6 pt-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    {image.hasAltText ? (
                        <>
                            <iconify-icon icon="lucide:check-circle" width="16" className="text-success" />
                            <span>Alt text aanwezig</span>
                        </>
                    ) : (
                        <>
                            <iconify-icon icon="lucide:alert-circle" width="16" className="text-warning" />
                            <span>Alt text ontbreekt</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <AdminModalFooterButtons
                        onCancel={onClose}
                        onConfirm={handleSave}
                        confirmText="Wijzigingen Opslaan"
                        isLoading={isSaving}
                        confirmDisabled={!altText}
                    />
                </div>
            </div>
        </AdminModal>
    );
}
