import type { CloudinaryImage } from "./cloudinary";

export function getSponsors(): CloudinaryImage[] {
    // Hardcoded sponsors based on user-provided URLs
    return [
        {
            src: "3x3anderslogo_itwm3g",
            alt: "3x3 Anders",
            aspect: "horizontal",
            year: "2026"
        },
        {
            src: "BeeldpakkerLogo_wijjmq",
            alt: "Beeld Pakker",
            aspect: "horizontal",
            year: "2026"
        },
        {
            src: "LogoLayout_1_iphclc",
            alt: "Mojo Dojo",
            aspect: "horizontal",
            year: "2026"
        },
        {
            src: "SterkinVloerenLOGO_zrdofb",
            alt: "Sterk in Vloeren",
            aspect: "horizontal",
            year: "2026"
        }
    ];
}
