import type { CloudinaryImage } from "./cloudinary";

export function getPartners(): CloudinaryImage[] {
    // Hardcoded partners from DKLPartners folder
    // TODO: Make this dynamic with Cloudinary Search API in the future
    return [
        {
            src: "accres_logo_ochsmg_zma2pl",
            alt: "Accres",
            aspect: "horizontal",
            year: "2026"
        },
        {
            src: "GroteKerk_1_gldtlw",
            alt: "Grote Kerk",
            aspect: "horizontal",
            year: "2026"
        },
        {
            src: "LogoLayout_busfsf",
            alt: "Liliane Fonds",
            aspect: "horizontal",
            year: "2026"
        },
        {
            src: "asdasdqwdr_rvqey8",
            alt: "Voetlopers",
            aspect: "horizontal",
            year: "2026"
        },
        {
            src: "sqcqweq_ncn3om",
            alt: "Partner",
            aspect: "horizontal",
            year: "2026"
        }
    ];
}
