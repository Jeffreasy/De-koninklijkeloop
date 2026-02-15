import { useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { $accessToken } from "../../lib/auth";
import { useStore } from "@nanostores/react";
import { MediaCard } from "./MediaCard.tsx";
import { MediaToolbar } from "./MediaToolbar.tsx";
import { PaginationControls } from "./PaginationControls.tsx";
import { BulkEditModal } from "./BulkEditModal.tsx";
import { MediaDetailModal } from "./MediaDetailModal.tsx";
import { Loader2 } from "lucide-react";
import { ToastContainer } from "../ui/ToastContainer.tsx";
import { addToast } from "../../lib/toast.ts";

/** Image structure from ImageKit used across the media manager (fully migrated from Cloudinary) */
interface ImageKitFileBase {
    public_id: string;
    secure_url: string;
    format: string;
    resource_type: string;
    folder?: string;
    created_at: string;
    bytes: number;
    width?: number;
    height?: number;
}

/**
 * Merged interface combining ImageKit data with Convex metadata
 */
export interface MergedImage extends ImageKitFileBase {
    alt_text?: string; // From Convex
    title?: string; // From Convex
    tags?: string[]; // From Convex
    hasAltText: boolean; // Computed
}

const ITEMS_PER_PAGE = 12;

export default function MediaManagerIsland() {
    // State
    const [images, setImages] = useState<MergedImage[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [folderFilter, setFolderFilter] = useState<string>("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<MergedImage | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    // Convex hooks
    const accessToken = useStore($accessToken);
    const metadata = useQuery(api.mediaMetadata.getAll);
    const saveAltTextMutation = useMutation(api.mediaMetadata.saveAltText);

    // Fetch ImageKit images
    const loadImages = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/imagekit-images');
            const imagekitImages = await response.json();

            // Merge with Convex metadata
            const merged: MergedImage[] = imagekitImages.map((img: any) => {
                const meta = metadata?.find((m: any) => m.cloudinary_public_id === img.filePath); // Legacy field name in Convex schema
                return {
                    ...img,
                    // Map ImageKit fields to expected structure
                    public_id: img.filePath,
                    secure_url: img.url,
                    format: img.fileType,
                    resource_type: 'image',
                    folder: img.filePath?.split('/').slice(0, -1).join('/'),
                    created_at: img.createdAt,
                    bytes: img.size,
                    alt_text: meta?.alt_text || img.customMetadata?.alt,
                    title: meta?.title,
                    tags: meta?.tags,
                    hasAltText: !!(meta?.alt_text || img.customMetadata?.alt)
                };
            });

            setImages(merged);
        } catch (error) {
            if (import.meta.env.DEV) console.error("Failed to fetch ImageKit images", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load & Metadata updates
    useEffect(() => {
        loadImages();
    }, [metadata]);

    // Handle Upload Success
    const handleUploadSuccess = (url: string) => {
        if (import.meta.env.DEV) console.log("Upload successful, refreshing images...", url);
        // Add a small delay to allow ImageKit API to update
        setTimeout(() => {
            loadImages();
        }, 1000);
    };

    // Filtering
    const filteredImages = images.filter(img => {
        // Search filter
        const matchesSearch = img.public_id.toLowerCase().includes(searchTerm.toLowerCase());

        // Folder filter
        const matchesFolder = folderFilter === "all" ||
            (folderFilter === "2024" && img.folder?.includes("2024")) ||
            (folderFilter === "2025" && img.folder?.includes("2025"));

        return matchesSearch && matchesFolder;
    });

    // Pagination
    const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedImages = filteredImages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Handlers
    const handleToggleSelect = (publicId: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(publicId)) {
            newSet.delete(publicId);
        } else {
            newSet.add(publicId);
        }
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === paginatedImages.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedImages.map(img => img.public_id)));
        }
    };

    const handleCardClick = (image: MergedImage) => {
        setSelectedImage(image);
        setIsDetailModalOpen(true);
    };

    const handleDetailModalSave = async (publicId: string, altText: string, title?: string, tags?: string[]) => {
        if (!accessToken) {
            if (import.meta.env.DEV) console.error("[MediaManagerIsland] No access token available");
            addToast("Geen toegangstoken beschikbaar", "error");
            return;
        }

        try {
            await saveAltTextMutation({
                cloudinary_public_id: publicId, // Legacy Convex field name (maps to ImageKit filePath)
                alt_text: altText,
                title,
                tags,
                folder: images.find(img => img.public_id === publicId)?.folder,
                token: accessToken
            });

            // Update local state
            setImages(prev => prev.map(img =>
                img.public_id === publicId
                    ? { ...img, alt_text: altText, hasAltText: !!altText, title, tags }
                    : img
            ));

            addToast("Wijzigingen opgeslagen", "success");
        } catch (error) {
            if (import.meta.env.DEV) console.error("[MediaManagerIsland] Failed to save metadata", error);
            addToast("Kon wijzigingen niet opslaan", "error");
            throw error;
        }
    };

    const handleBulkUpdate = (updates: { publicId: string; altText: string; title?: string; tags?: string[] }[]) => {
        setImages(prev => prev.map(img => {
            const update = updates.find(u => u.publicId === img.public_id);
            if (update) {
                return {
                    ...img,
                    alt_text: update.altText,
                    hasAltText: !!update.altText,
                    title: update.title !== undefined ? update.title : img.title,
                    tags: update.tags !== undefined ? update.tags : img.tags
                };
            }
            return img;
        }));
        addToast(`${updates.length} afbeeldingen bijgewerkt`, "success");
    };

    const handleBulkEditOpen = () => {
        setIsBulkModalOpen(true);
    };

    const handleBulkEditClose = () => {
        setIsBulkModalOpen(false);
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, folderFilter]);

    const handleDelete = async () => {
        if (!accessToken) {
            addToast("Geen toegang om te verwijderen", "error");
            return;
        }

        const count = selectedIds.size;
        if (count === 0) return;

        if (!confirm(`Weet je zeker dat je ${count} afbeelding(en) wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
            return;
        }

        setIsLoading(true);
        try {
            // 1. Delete from ImageKit via API
            // Map filePaths to fileIds for deletion
            const fileIdsToDelete = images
                .filter(img => selectedIds.has(img.public_id))
                .map(img => (img as any).fileId)
                .filter(Boolean);

            const response = await fetch('/api/admin/imagekit-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileIds: fileIdsToDelete })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Delete failed');
            }

            // 2. Update local state
            setImages(prev => prev.filter(img => !selectedIds.has(img.public_id)));
            setSelectedIds(new Set());
            addToast(`${result.deleted} afbeeldingen verwijderd`, "success");

        } catch (error) {
            if (import.meta.env.DEV) console.error("Delete failed", error);
            addToast("Kon afbeeldingen niet verwijderen", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Bulk AI metadata generation with abort support
    const abortRef = useRef<AbortController | null>(null);

    const handleAiGenerate = async () => {
        if (selectedIds.size === 0) return;

        const selected = images.filter(img => selectedIds.has(img.public_id));

        // M2: Confirm overwrite if existing metadata found
        const withExisting = selected.filter(img => img.hasAltText);
        if (withExisting.length > 0) {
            if (!confirm(`${withExisting.length} van ${selected.length} foto's hebben al metadata. Overschrijven?`)) return;
        }

        const controller = new AbortController();
        abortRef.current = controller;
        setIsAiGenerating(true);
        let success = 0;
        let failed = 0;

        addToast(`AI metadata genereren voor ${selected.length} foto's...`, "info");

        for (const img of selected) {
            // H3: Check if aborted
            if (controller.signal.aborted) break;

            try {
                const response = await fetch('/api/admin/media/generate-metadata', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageUrl: img.secure_url,
                        filename: img.public_id.split('/').pop(),
                        folder: img.folder,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    failed++;
                    continue;
                }

                const data = await response.json();
                if (data.alt_text && accessToken) {
                    await saveAltTextMutation({
                        cloudinary_public_id: img.public_id,
                        alt_text: data.alt_text,
                        title: data.title || undefined,
                        tags: data.tags?.length ? data.tags : undefined,
                        folder: img.folder,
                        token: accessToken,
                    });

                    // Update local state
                    setImages(prev => prev.map(i =>
                        i.public_id === img.public_id
                            ? { ...i, alt_text: data.alt_text, title: data.title, tags: data.tags, hasAltText: true }
                            : i
                    ));
                    success++;
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    addToast(`Gestopt na ${success} foto's`, "info");
                    break;
                }
                failed++;
            }
        }

        abortRef.current = null;
        setIsAiGenerating(false);
        setSelectedIds(new Set());

        if (success > 0) {
            addToast(`${success} foto's verwerkt${failed > 0 ? `, ${failed} mislukt` : ''}`, "success");
        } else if (!controller.signal.aborted) {
            addToast("AI generatie mislukt voor alle foto's", "error");
        }
    };

    const handleAiCancel = () => {
        abortRef.current?.abort();
    };

    if (isLoading) {
        return (
            <div
                className="flex items-center justify-center py-20 text-text-muted animate-pulse gap-2"
                role="status"
                aria-live="polite"
            >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Afbeeldingen laden...</span>
                <span className="sr-only">Media library gegevens worden geladen...</span>
            </div>
        );
    }

    const selectedImages = images.filter(img => selectedIds.has(img.public_id));

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <MediaToolbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                folderFilter={folderFilter}
                setFolderFilter={setFolderFilter}
                selectedCount={selectedIds.size}
                totalCount={filteredImages.length}
                onBulkEdit={handleBulkEditOpen}
                onDeselectAll={() => setSelectedIds(new Set())}
                onSelectAll={handleSelectAll}
                allSelected={selectedIds.size === paginatedImages.length && paginatedImages.length > 0}
                onUploadSuccess={handleUploadSuccess}
                onDelete={handleDelete}
                onAiGenerate={handleAiGenerate}
                onAiCancel={handleAiCancel}
                isAiGenerating={isAiGenerating}
                availableYears={[...new Set(images.map(img => img.folder?.match(/\d{4}/)?.[0]).filter(Boolean) as string[])].sort()}
            />

            {/* Media Grid */}
            {paginatedImages.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <iconify-icon icon="lucide:search-x" width="48" height="48" className="mx-auto mb-4 text-text-muted" />
                    <p className="text-text-muted text-lg">Geen afbeeldingen gevonden</p>
                    <p className="text-text-muted/60 text-sm mt-1">
                        Probeer een andere zoekterm of filter
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedImages.map(image => (
                        <MediaCard
                            key={image.public_id}
                            image={image}
                            isSelected={selectedIds.has(image.public_id)}
                            onToggleSelect={handleToggleSelect}
                            onCardClick={handleCardClick}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredImages.length}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Media Detail Modal */}
            <MediaDetailModal
                isOpen={isDetailModalOpen}
                image={selectedImage}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedImage(null);
                }}
                onSave={handleDetailModalSave}
                accessToken={accessToken || ""}
            />

            {/* Bulk Edit Modal */}
            <BulkEditModal
                isOpen={isBulkModalOpen}
                selectedImages={selectedImages}
                onClose={() => setIsBulkModalOpen(false)}
                onBulkUpdate={handleBulkUpdate}
                accessToken={accessToken || ""}
            />

            <ToastContainer />
        </div>
    );
}
