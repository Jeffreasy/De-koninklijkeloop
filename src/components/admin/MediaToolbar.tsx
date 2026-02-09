import { Search } from "lucide-react";
import { CloudinaryUploadButton } from "./CloudinaryUploadButton.tsx";

interface Props {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    folderFilter: string;
    setFolderFilter: (filter: string) => void;
    selectedCount: number;
    totalCount: number;
    onBulkEdit: () => void;
    onDeselectAll: () => void;
    onSelectAll: () => void;
    allSelected: boolean;
    onUploadSuccess: (url: string) => void;
    onDelete: () => void;
}


export function MediaToolbar({
    searchTerm,
    setSearchTerm,
    folderFilter,
    setFolderFilter,
    selectedCount,
    totalCount,
    onBulkEdit,
    onDeselectAll,
    onSelectAll,
    allSelected,
    onUploadSuccess,
    onDelete
}: Props) {
    return (
        <div className="glass-card p-4">
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 justify-between">
                {/* Left: Search + Filters */}
                <div className="flex items-center gap-3 flex-wrap flex-1 w-full xl:w-auto">
                    {/* Search Input */}
                    <div className="relative group flex-1 min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-orange transition-colors" />
                        <input
                            type="text"
                            placeholder="Zoeken op bestandsnaam..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-brand-orange/50"
                        />
                    </div>

                    {/* Folder Filter */}
                    <select
                        value={folderFilter}
                        onChange={(e) => setFolderFilter(e.target.value)}
                        className="px-3 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-brand-orange/50"
                    >
                        <option value="all">Alle Mappen</option>
                        <option value="2024">DKLFoto's 2024</option>
                        <option value="2025">DKLFoto's 2025</option>
                    </select>

                    {/* Select All Checkbox */}
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-glass-border/20 border border-glass-border cursor-pointer hover:bg-glass-border/30 transition-colors">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={onSelectAll}
                            className="w-4 h-4 rounded border-2 border-glass-border bg-glass-bg/50 checked:bg-brand-orange checked:border-brand-orange cursor-pointer"
                        />
                        <span className="text-xs font-medium text-text-muted">Selecteer alle</span>
                    </label>

                    {/* Results Count */}
                    <div className="px-3 py-2 rounded-xl bg-glass-border/20 text-xs font-medium text-text-muted border border-glass-border whitespace-nowrap">
                        {totalCount} afbeeldingen
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                    {/* Bulk Actions (Only visible when selected) */}
                    {selectedCount > 0 && (
                        <>
                            <span className="text-sm text-text-muted whitespace-nowrap hidden sm:inline">
                                {selectedCount} geselecteerd
                            </span>
                            <button
                                onClick={onBulkEdit}
                                className="flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-brand-orange text-white font-medium hover:bg-orange-400 transition-colors shadow-lg shadow-brand-orange/20 cursor-pointer"
                                aria-label="Bulk bewerken geselecteerde afbeeldingen"
                            >
                                <iconify-icon icon="lucide:edit-3" width="16" />
                                <span className="hidden sm:inline">Bulk Bewerken</span>
                            </button>
                            <button
                                onClick={onDelete}
                                className="flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors font-medium cursor-pointer"
                                aria-label="Verwijder geselecteerde afbeeldingen"
                            >
                                <iconify-icon icon="lucide:trash-2" width="16" />
                                <span className="hidden sm:inline">Verwijderen</span>
                            </button>
                            <button
                                onClick={onDeselectAll}
                                className="px-4 py-2 min-h-[44px] rounded-xl bg-glass-border/30 text-text-muted hover:bg-glass-border/50 transition-colors cursor-pointer"
                                aria-label="Deselecteer alle afbeeldingen"
                            >
                                Deselecteer
                            </button>
                            <div className="w-px h-8 bg-glass-border mx-1"></div>
                        </>
                    )}

                    {/* Upload Button */}
                    <div className="w-full sm:w-auto">
                        <CloudinaryUploadButton onUploadSuccess={onUploadSuccess} />
                    </div>
                </div>
            </div>
        </div>
    );
}
