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
                    srcSet={`https://res.cloudinary.com/${import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgfuv7wif'}/image/upload/w_400,h_300,c_fill,f_auto,q_auto/${image.public_id} 400w,
                             https://res.cloudinary.com/${import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgfuv7wif'}/image/upload/w_800,h_600,c_fill,f_auto,q_auto/${image.public_id} 800w,
                             https://res.cloudinary.com/${import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgfuv7wif'}/image/upload/w_1200,h_900,c_fill,f_auto,q_auto/${image.public_id} 1200w`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={`https://res.cloudinary.com/${import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgfuv7wif'}/image/upload/w_400,h_300,c_fill,f_auto,q_auto/${image.public_id}`}
                    alt={image.alt_text || "Geen alt text"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                        // Fallback to secure_url if transformation fails
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes(image.secure_url)) {
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
            <div className="p-4 space-y-2">
                {/* Folder Path */}
                <div className="text-xs text-text-muted/70 truncate" title={image.folder}>
                    📁 {image.folder?.replace('De Koninklijkeloop/', '') || 'Onbekend'}
                </div>

                {/* Title or Filename */}
                <div className="text-sm font-semibold text-text-primary truncate" title={image.title || image.public_id}>
                    {image.title || image.public_id.split('/').pop()}
                </div>

                {/* Filename (if title exists) */}
                {image.title && (
                    <div className="text-xs font-mono text-text-muted/60 truncate" title={image.public_id}>
                        {image.public_id.split('/').pop()}
                    </div>
                )}

                {/* Alt Text Preview */}
                <div className="text-xs text-text-primary/80 line-clamp-2 min-h-10">
                    {image.alt_text || (
                        <span className="text-text-muted/60 italic">Klik om alt text toe te voegen...</span>
                    )}
                </div>
            </div>
        </div>
    );
}
