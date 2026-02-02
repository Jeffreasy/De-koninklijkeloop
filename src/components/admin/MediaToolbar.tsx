import { Search } from "lucide-react";

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
    allSelected
}: Props) {
    return (
        <div className="glass-card p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
                {/* Left: Search + Filters */}
                <div className="flex items-center gap-3 flex-wrap flex-1 w-full lg:w-auto">
                    {/* Search Input */}
                    <div className="relative group flex-1 min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Zoeken op bestandsnaam..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
                        />
                    </div>

                    {/* Folder Filter */}
                    < select
                        value={folderFilter}
                        onChange={(e) => setFolderFilter(e.target.value)}
                        className="px-3 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-accent-primary/50"
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
                            className="w-4 h-4 rounded border-2 border-glass-border bg-glass-bg/50 checked:bg-accent-primary checked:border-accent-primary cursor-pointer"
                        />
                        <span className="text-xs font-medium text-text-muted">Selecteer alle</span>
                    </label>

                    {/* Results Count */}
                    <div className="px-3 py-2 rounded-xl bg-glass-border/20 text-xs font-medium text-text-muted border border-glass-border whitespace-nowrap">
                        {totalCount} afbeeldingen
                    </div>
                </div>

                {/* Right: Bulk Actions */}
                {selectedCount > 0 && (
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <span className="text-sm text-text-muted whitespace-nowrap">
                            {selectedCount} geselecteerd
                        </span>
                        <button
                            onClick={onBulkEdit}
                            className="px-4 py-2 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/20"
                        >
                            <div className="flex items-center gap-2">
                                <iconify-icon icon="lucide:edit-3" width="16" />
                                <span>Bulk Bewerken</span>
                            </div>
                        </button>
                        <button
                            onClick={onDeselectAll}
                            className="px-4 py-2 rounded-xl bg-glass-border/30 text-text-muted hover:bg-glass-border/50 transition-colors"
                        >
                            Deselecteer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
