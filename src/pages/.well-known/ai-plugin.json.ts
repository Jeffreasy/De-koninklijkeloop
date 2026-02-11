import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
    const manifest = {
        schema_version: "v1",
        name_for_human: "De Koninklijke Loop",
        name_for_model: "de_koninklijke_loop",
        description_for_human: "Inclusief wandelevenement op 16 mei 2026 in Kootwijk–Apeldoorn, voor en door mensen met een beperking.",
        description_for_model: "De Koninklijke Loop is an inclusive walking event held annually in Kootwijk-Apeldoorn, Netherlands. The 2026 edition takes place on May 16th with routes of 2.5, 6, 10, and 15 km along the Koninklijke Weg (Royal Road) from Kootwijk to Paleis Het Loo. Free participation, max 75 walkers. The 2.5km route is wheelchair accessible. Charity partner 2026: Only Friends. Previous editions: 2024 and 2025 supported Liliane Fonds. Organized by and for people with disabilities. Contact: info@dekoninklijkeloop.nl",
        api: {
            type: "openapi",
            url: "https://dekoninklijkeloop.nl/llms.txt",
        },
        logo_url: "https://dekoninklijkeloop.nl/favicon.webp",
        contact_email: "info@dekoninklijkeloop.nl",
        legal_info_url: "https://dekoninklijkeloop.nl/about",
    };

    return new Response(JSON.stringify(manifest, null, 2), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400',
        },
    });
};
