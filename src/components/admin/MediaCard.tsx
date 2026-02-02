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
            className="group relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/30 backdrop-blur-md hover:border-white/20 transition-all duration-300 cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Image Container */}
            <div className="aspect-4/3 relative overflow-hidden bg-slate-800/50">
                <img
                    src={`${image.secure_url}?w=400&h=300&c_fill&f_auto&q_auto`}
                    alt={image.alt_text || "Geen alt text"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Top Row: Folder Badge + Missing Alt Warning */}
                <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                    {/* Folder Year Badge */}
                    <div className={`px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm shadow-lg ${image.folder?.includes('2024')
                        ? 'bg-blue-500/90 text-white'
                        : 'bg-purple-500/90 text-white'
                        }`}>
                        {image.folder?.includes('2024') ? '2024' : '2025'}
                    </div>

                    {/* Missing Alt Warning */}
                    {!image.hasAltText && (
                        <div className="px-2 py-1 rounded-lg bg-yellow-500/90 text-yellow-950 text-xs font-bold backdrop-blur-sm shadow-lg">
                            ⚠️ Geen Alt
                        </div>
                    )}
                </div>

                {/* Selection Checkbox */}
                <div
                    className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCheckboxClick}
                >
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }} // Handled by div onClick
                        className="w-5 h-5 rounded border-2 border-white/50 bg-glass-bg/80 checked:bg-accent-primary checked:border-accent-primary cursor-pointer pointer-events-none"
                    />
                </div>

                {/* Edit Icon Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
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
