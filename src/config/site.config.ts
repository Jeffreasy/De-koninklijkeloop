/**
 * Site Configuration
 * Single source of truth for all site-wide data
 */

type NavItem = {
    name: string;
    href: string;
    highlight?: boolean;
    badge?: string;
};

export const siteConfig = {
    // Brand & Identity
    brand: {
        name: "De Koninklijke Loop",
        logo: "https://ik.imagekit.io/a0oim4e3e/tr:w-200,f-auto,q-80/De%20Koninklijkeloop/webassets/DKLLogoV1_kx60i9.webp",
        description:
            "De Koninklijke Loop is een initiatief voor en door mensen met een beperking. Samen wandelen we voor een inclusieve wereld.",
    },

    // Event Information
    event: {
        date: "16 Mei 2026",
        location: "Kootwijk - Apeldoorn",
        heroVideo: "tt6k80", // Streamable shortcode
    },

    // Navigation
    navigation: [
        { name: "Home", href: "/" },
        { name: "Routes", href: "/routes" },
        { name: "Programma", href: "/programma", badge: "'25" },
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
            { name: "Media", href: "/media" },
            { name: "Veelgestelde Vragen", href: "/contact#faq" },
        ],
        organisatie: [
            { name: "Over Ons", href: "/about" },
            { name: "Het Goede Doel", href: "/charity" },
            { name: "Contact", href: "/contact" },
            { name: "Inloggen", href: "/login" },
        ],
    },

    // Social Media
    social: {
        facebook: "https://www.facebook.com/p/De-Koninklijke-Loop-61556315443279/",
        instagram: "https://www.instagram.com/koninklijkeloop/",
        linkedin: "https://www.linkedin.com/company/de-koninklijke-loop/",
    },

    // Sponsors
    sponsors: [
        { name: "3x3 Anders", src: "/De Koninklijkeloop/Sponsors/3x3anderslogo_itwm3g.webp", url: "https://3x3anders.nl" },
        { name: "Beeld Pakker", src: "/De Koninklijkeloop/Sponsors/BeeldpakkerLogo_wijjmq.webp", url: "https://beeldpakker.nl/" },
        { name: "Mojo Dojo", src: "/De Koninklijkeloop/Sponsors/LogoLayout_1_iphclc.webp", url: "https://mojodojo.studio/" },
        { name: "Sterk In Vloeren", src: "/De Koninklijkeloop/Sponsors/SterkinVloerenLOGO_zrdofb.webp", url: "https://sterkinvloeren.nl/" },
        { name: "Bas Visual Storytelling", src: "/De Koninklijkeloop/Sponsors/vrookpkj9aghvyc28ix5_i2dwx0.webp", url: "https://basvisualstorytelling.nl" },
    ],

    // Featured Media
    featuredMedia: {

        images: [
            {
                src: "/De Koninklijkeloop/DKL25/WhatsApp_Image_2025-05-17_at_19.21.14_3f7fd59e_gme3eo.jpg",
                alt: "Sfeer aan de start",
                class: "row-span-2 col-span-2 md:col-span-1 h-full",
            },
            {
                src: "/De Koninklijkeloop/DKL25/WhatsApp_Image_2025-05-17_at_19.12.14_8ab77c07_gs2zsy.jpg",
                alt: "Feestelijke finish",
                class: "col-span-1 h-48 md:h-auto",
            },
            {
                src: "/De Koninklijkeloop/DKL25/WhatsApp_Image_2025-05-17_at_19.21.15_5468f944_go97uz.jpg",
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



    // Page Metadata Templates
    meta: {
        titleSuffix: " | De Koninklijke Loop",
        defaultDescription:
            "De Koninklijke Loop - Inclusief wandelevenement op 16 mei 2026. Goede doel: Only Friends.",
    },
} as const;
