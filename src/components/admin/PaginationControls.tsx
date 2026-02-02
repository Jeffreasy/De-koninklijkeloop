interface Props {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export function PaginationControls({ currentPage, totalPages, totalItems, onPageChange }: Props) {
    const getVisiblePages = () => {
        const pages: number[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, currentPage - 1, currentPage, currentPage + 1, totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 md:mt-8 glass-card p-3 md:p-4 rounded-xl md:rounded-2xl">
            {/* Page Info */}
            <div className="text-xs md:text-sm text-text-muted text-center sm:text-left">
                Pagina {currentPage} van {totalPages} • {totalItems} afbeeldingen
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1 md:gap-2">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 md:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-glass-border/30 text-text-primary hover:bg-glass-border/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Vorige pagina"
                >
                    <iconify-icon icon="lucide:chevron-left" width="18" />
                </button>

                {/* Page Numbers - Show fewer on mobile */}
                <div className="hidden sm:flex items-center gap-2">
                    {getVisiblePages().map((page, index, array) => {
                        // Add ellipsis for gaps
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                            <div key={page} className="flex items-center gap-2">
                                {showEllipsis && (
                                    <span className="text-text-muted px-2">...</span>
                                )}
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg font-medium transition-colors ${page === currentPage
                                            ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                                            : 'bg-glass-border/30 text-text-primary hover:bg-glass-border/50'
                                        }`}
                                    aria-label={`Ga naar pagina ${page}`}
                                    aria-current={page === currentPage ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile: Just show current page */}
                <div className="sm:hidden px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-accent-primary text-white font-medium text-sm">
                    {currentPage}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 md:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-glass-border/30 text-text-primary hover:bg-glass-border/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Volgende pagina"
                >
                    <iconify-icon icon="lucide:chevron-right" width="18" />
                </button>
            </div>
        </div>
    );
}
