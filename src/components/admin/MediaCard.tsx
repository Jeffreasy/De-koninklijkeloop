import type { MergedImage } from "./MediaManagerIsland.tsx";

interface Props {
    image: MergedImage;
    isSelected: boolean;
    onToggleSelect: (publicId: string) => void;
    onCardClick: (image: MergedImage) => void;
}

export function MediaCard({ image, isSelected, onToggleSelect, onCardClick }: Props) {
    const handleCardClick = () => {
        onCardClick(image);
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        onToggleSelect(image.public_id);
    };

    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/30 backdrop-blur-md hover:border-brand-orange/30 transition-all duration-300 cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Image Container */}
            <div className="aspect-4/3 relative overflow-hidden bg-surface/50 dark:bg-surface/30">
                <img
                    srcSet={`${image.secure_url}?tr=w-400,h-300,c-maintain_ratio,f-auto,q-80 400w,
                             ${image.secure_url}?tr=w-800,h-600,c-maintain_ratio,f-auto,q-80 800w,
                             ${image.secure_url}?tr=w-1200,h-900,c-maintain_ratio,f-auto,q-80 1200w`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={`${image.secure_url}?tr=w-400,h-300,c-maintain_ratio,f-auto,q-80`}
                    alt={image.alt_text || "Geen alt text"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('?tr=')) {
                            target.src = image.secure_url;
                        }
                    }}
                />

                {/* Top Row: Folder Badge + Missing Alt Warning */}
                <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                    {/* Folder Year Badge */}
                    <div className="px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm shadow-lg bg-accent-secondary/90 text-white dark:bg-accent-secondary/80">
                        {image.folder?.includes('2024') ? '2024' : '2025'}
                    </div>

                    {/* Missing Alt Warning */}
                    {!image.hasAltText && (
                        <div className="px-2 py-1 rounded-lg bg-[rgb(var(--warning))]/90 text-white text-xs font-bold backdrop-blur-sm shadow-lg">
                            ⚠️ Geen Alt
                        </div>
                    )}
                </div>

                {/* Selection Checkbox - WCAG 2.5.5 Touch Target */}
                <div
                    className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                    onClick={handleCheckboxClick}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={isSelected ? "Deselecteer afbeelding" : "Selecteer afbeelding"}
                    tabIndex={0}
                >
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }} // Handled by div onClick
                        className="w-5 h-5 rounded border-2 border-glass-border bg-glass-bg/80 checked:bg-brand-orange checked:border-brand-orange cursor-pointer pointer-events-none"
                        aria-hidden="true"
                    />
                </div>

                {/* Edit Icon Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-4 py-2 rounded-xl bg-glass-bg/50 backdrop-blur-sm border border-glass-border">
                        <div className="flex items-center gap-2 text-white">
                            <iconify-icon icon="lucide:edit-3" width="18" />
                            <span className="text-sm font-medium">Bewerken</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Footer */}
            <div className="p-4 flex flex-col gap-2">
                {/* Header Row: Title & Folder */}
                {/* Header Row: Title & Folder */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <div className="text-[10px] uppercase tracking-wider text-text-muted/60 truncate mb-1">
                                {image.folder?.replace('De Koninklijkeloop/', '') || 'Folder onbekend'}
                            </div>

                            {/* Title Block - Conditional Styling */}
                            <div className={`
                                p-1.5 rounded-md text-sm font-semibold truncate transition-colors
                                ${image.title
                                    ? 'text-text-primary'
                                    : 'bg-[rgb(var(--warning))]/10 text-[rgb(var(--warning))] border border-[rgb(var(--warning))]/20'}
                            `}
                                title={image.title || "Geen titel"}
                            >
                                {image.title || (
                                    <div className="flex items-center gap-1.5">
                                        <iconify-icon icon="lucide:alert-circle" width="14" />
                                        <span>Naamloos</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metadata Badges / Info */}
                <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono pt-1 border-t border-glass-border/50 mt-1">
                    <span>{image.format?.toUpperCase()}</span>
                    <span>•</span>
                    <span>{image.width}x{image.height}</span>
                    <span>•</span>
                    <span>{(image.bytes / 1024).toFixed(0)}KB</span>
                </div>

                {/* Alt Text Preview - More distinct visual block */}
                <div className={`
                    mt-1 p-2 rounded-lg text-xs leading-relaxed border
                    ${image.alt_text
                        ? 'bg-glass-bg/30 border-glass-border/50 text-text-primary/90'
                        : 'bg-red-500/5 border-red-500/10 text-red-500/60 dashed-border'}
                `}>
                    <div className="line-clamp-2 min-h-[2.5em]">
                        {image.alt_text || "Nog geen alt tekst toegevoegd..."}
                    </div>
                </div>
            </div>
        </div>
    );
}
