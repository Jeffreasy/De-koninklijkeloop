/**
 * Site Configuration
 * Single source of truth for all site-wide data
 */

type NavItem = {
    name: string;
    href: string;
    highlight?: boolean;
};

export const siteConfig = {
    // Brand & Identity
    brand: {
        name: "De Koninklijke Loop",
        logo: "https://res.cloudinary.com/dgfuv7wif/image/upload/v1748030388/DKLLogoV1_kx60i9.webp",
        description:
            "De Koninklijke Loop is een initiatief voor en door mensen met een beperking. Samen wandelen we voor een inclusieve wereld.",
    },

    // Event Information
    event: {
        date: "17 Mei 2026",
        location: "Kootwijk - Apeldoorn",
        heroVideo: "tt6k80", // Streamable shortcode
    },

    // Navigation
    navigation: [
        { name: "Home", href: "/" },
        { name: "Routes", href: "/routes" },
        { name: "Media", href: "/media" },
        { name: "DKL", href: "/dkl" },
        { name: "Inschrijven", href: "/register", highlight: true },
        { name: "Over Ons", href: "/about" },
        { name: "Contact", href: "/contact" },
    ] as NavItem[],

    // Footer specific links
    footerLinks: {
        evenement: [
            { name: "Routes & Kaart", href: "/routes" },
            { name: "Programma", href: "/programma" },
            { name: "Veelgestelde Vragen", href: "/faq" },
        ],
        organisatie: [
            { name: "Over Ons", href: "/about" },
            { name: "Het Goede Doel", href: "/charity" },
            { name: "Contact", href: "/contact" },
        ],
    },

    // Social Media
    social: {
        facebook: "#", // TODO: Add real URLs
        instagram: "#",
        linkedin: "#",
    },

    // Sponsors
    sponsors: [
        { name: "3x3 Anders", src: "3x3anderslogo_itwm3g" },
        { name: "Beeld Pakker", src: "BeeldpakkerLogo_wijjmq" },
        { name: "Mojo Dojo", src: "LogoLayout_1_iphclc" },
        { name: "Sterk In Vloeren", src: "SterkinVloerenLOGO_zrdofb" },
    ],

    // Featured Media
    featuredMedia: {
        video: {
            shortcode: "xabadh",
            title: "DKL Sfeerimpressie",
        },
        images: [
            {
                src: "WhatsApp_Image_2025-05-17_at_19.21.14_3f7fd59e_gme3eo",
                alt: "Sfeer aan de start",
                class: "row-span-2 col-span-2 md:col-span-1 h-full",
            },
            {
                src: "WhatsApp_Image_2025-05-17_at_19.12.14_8ab77c07_gs2zsy",
                alt: "Feestelijke finish",
                class: "col-span-1 h-48 md:h-auto",
            },
            {
                src: "WhatsApp_Image_2025-05-17_at_19.21.15_5468f944_go97uz",
                alt: "Wandelaars in het groen",
                class: "col-span-1 h-48 md:h-auto",
            },
        ],
    },

    // Contact Information
    contact: {
        email: "info@dekoninklijkeloop.nl",
        phone: null, // Voeg toe als beschikbaar
    },

    // Charity Partner
    // Moved to src/data/charityConfig.ts for annual rotation
    // charity: { ... },

    // Media Gallery (complete gallery images)
    gallery: [
        {
            src: "WhatsApp_Image_2025-05-17_at_19.12.14_8ab77c07_gs2zsy",
            alt: "Sfeerimpressie DKL 2025",
            aspect: "vertical",
        },
        {
            src: "WhatsApp_Image_2025-05-17_at_19.21.14_3f7fd59e_gme3eo",
            alt: "Sfeerimpressie DKL 2025",
            aspect: "horizontal",
        },
        {
            src: "WhatsApp_Image_2025-05-17_at_19.21.14_acb21990_pnlxto",
            alt: "Sfeerimpressie DKL 2025",
            aspect: "vertical",
        },
        {
            src: "WhatsApp_Image_2025-05-17_at_19.21.15_5468f944_go97uz",
            alt: "Sfeerimpressie DKL 2025",
            aspect: "horizontal",
        },
        {
            src: "WhatsApp_Image_2025-05-17_at_19.21.15_acf57c9c_hrdiqk",
            alt: "Sfeerimpressie DKL 2025",
            aspect: "horizontal",
        },
        {
            src: "WhatsApp_Image_2025-05-17_at_19.21.15_d34fe483_feytla",
            alt: "Sfeerimpressie DKL 2025",
            aspect: "horizontal",
        },
    ],

    // Page Metadata Templates
    meta: {
        titleSuffix: " | De Koninklijke Loop",
        defaultDescription:
            "De Koninklijke Loop - Inclusief wandelevenement op 17 mei 2026",
    },
} as const;
