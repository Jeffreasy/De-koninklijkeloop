import { useState, useEffect } from "react";
import type { MergedImage } from "./MediaManagerIsland.tsx";

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };

    if (!isOpen || !image) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="premium-glass rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                <div className="p-6 border-b border-glass-border bg-glass-bg/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`px - 3 py - 1.5 rounded - lg text - sm font - bold ${image.folder?.includes('2024')
                                ? 'bg-blue-500/90 text-white'
                                : 'bg-purple-500/90 text-white'
                                } `}>
                                {image.folder?.includes('2024') ? '2024' : '2025'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-text-primary">
                                    Media Details
                                </h2>
                                <p className="text-text-muted text-sm mt-0.5">
                                    {image.public_id.split('/').pop()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-glass-border/30 transition-colors text-text-muted hover:text-text-primary"
                            aria-label="Sluit modal"
                        >
                            <iconify-icon icon="lucide:x" width="24" />
                        </button>
                    </div>
                </div>

                {/* Swipe Handle (Mobile Visual Indicator) */}
                <div className="lg:hidden flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1 rounded-full bg-glass-border/50" />
                </div>

                {/* Content - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Left Column: Image Preview */}
                    <div className="space-y-4">
                        <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-800/50">
                            <img
                                src={`${image.secure_url}?w = 800 & h=600 & c_fit & f_auto & q_auto`}
                                alt={image.alt_text || "Preview"}
                                className="w-full h-full object-contain"
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
                                className="w-full px-4 py-3 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 resize-y min-h-[80px] max-h-[200px]"
                            />
                            <p className="text-xs text-text-muted">
                                {altText.length} karakters • Aanbevolen: 50-125 karakters
                            </p>
                            {!altText && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    <iconify-icon icon="lucide:alert-triangle" width="16" className="text-yellow-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-yellow-400">
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
                                className="w-full px-4 py-3 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
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
                                className="w-full px-4 py-3 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                            />
                            <p className="text-xs text-text-muted">
                                Gescheiden door komma's
                            </p>
                        </div>

                        {/* Alt Text Tips */}
                        <div className="glass-card p-4 space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <iconify-icon icon="lucide:lightbulb" width="16" className="text-accent-primary" />
                                <h4 className="text-sm font-semibold text-text-primary">Alt Text Tips</h4>
                            </div>
                            <ul className="space-y-1.5 text-xs text-text-muted">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-primary shrink-0">✓</span>
                                    <span>Beschrijf wat je ziet, niet "foto van"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-primary shrink-0">✓</span>
                                    <span>Wees specifiek: "Lopers bij De Grote Kerk"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-primary shrink-0">✓</span>
                                    <span>Vermijd "afbeelding van" of "plaatje"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-primary shrink-0">✓</span>
                                    <span>Houd het kort maar informatief</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 lg:relative p-6 border-t border-glass-border bg-glass-bg/95 backdrop-blur-xl z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                        {image.hasAltText ? (
                            <>
                                <iconify-icon icon="lucide:check-circle" width="16" className="text-green-400" />
                                <span>Alt text aanwezig</span>
                            </>
                        ) : (
                            <>
                                <iconify-icon icon="lucide:alert-circle" width="16" className="text-yellow-400" />
                                <span>Alt text ontbreekt</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-5 py-2.5 rounded-xl bg-glass-border/30 text-text-muted hover:bg-glass-border/50 transition-colors disabled:opacity-50 font-medium"
                        >
                            Annuleren
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !altText}
                            className="px-6 py-2.5 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? "Opslaan..." : "Wijzigingen Opslaan"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
