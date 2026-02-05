import { useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { $accessToken } from "../../lib/auth";
import { useStore } from "@nanostores/react";
import type { CloudinaryImageAdmin } from "../../lib/cloudinary";
import { MediaCard } from "./MediaCard.tsx";
import { MediaToolbar } from "./MediaToolbar.tsx";
import { PaginationControls } from "./PaginationControls.tsx";
import { BulkEditModal } from "./BulkEditModal.tsx";
import { MediaDetailModal } from "./MediaDetailModal.tsx";
import { Loader2 } from "lucide-react";

/**
 * Merged interface combining Cloudinary data with Convex metadata
 */
export interface MergedImage extends CloudinaryImageAdmin {
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

    // Convex hooks
    const accessToken = useStore($accessToken);
    const metadata = useQuery(api.mediaMetadata.getAll);
    const saveAltTextMutation = useMutation(api.mediaMetadata.saveAltText);

    // Fetch Cloudinary images
    const loadImages = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/cloudinary-images');
            const cloudinaryImages: CloudinaryImageAdmin[] = await response.json();

            // Merge with Convex metadata
            const merged: MergedImage[] = cloudinaryImages.map(img => {
                const meta = metadata?.find((m: any) => m.cloudinary_public_id === img.public_id);
                return {
                    ...img,
                    alt_text: meta?.alt_text || img.context?.custom?.alt,
                    title: meta?.title,
                    tags: meta?.tags,
                    hasAltText: !!(meta?.alt_text || img.context?.custom?.alt)
                };
            });

            setImages(merged);
        } catch (error) {
            console.error("Failed to fetch Cloudinary images", error);
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
        console.log("Upload successful, refreshing images...", url);
        // Add a small delay to allow Cloudinary API to update
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
            console.error("[MediaManagerIsland] No access token available");
            return;
        }

        console.log("[MediaManagerIsland] Saving metadata:", {
            publicId,
            altText,
            title,
            tags,
            accessToken: accessToken ? "present" : "missing"
        });

        try {
            const result = await saveAltTextMutation({
                cloudinary_public_id: publicId,
                alt_text: altText,
                title,
                tags,
                folder: images.find(img => img.public_id === publicId)?.folder,
                token: accessToken
            });

            console.log("[MediaManagerIsland] Mutation result:", result);

            // Update local state
            setImages(prev => prev.map(img =>
                img.public_id === publicId
                    ? { ...img, alt_text: altText, hasAltText: !!altText, title, tags }
                    : img
            ));

            console.log("[MediaManagerIsland] Local state updated successfully");
        } catch (error) {
            console.error("[MediaManagerIsland] Failed to save metadata", error);
            throw error;
        }
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
                onSave={handleDetailModalSave}
                accessToken={accessToken || ""}
            />
        </div>
    );
}
