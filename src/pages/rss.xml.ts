import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig } from '../config/site.config';

export async function GET(context: APIContext) {
    return rss({
        title: 'De Koninklijke Loop',
        description: siteConfig.brand.description,
        site: context.site!.href,
        items: [
            {
                title: 'De Koninklijke Loop 2026 — Inschrijving Open',
                description: 'Schrijf je nu in voor De Koninklijke Loop 2026 op 16 mei in Kootwijk–Apeldoorn. Gratis deelname, routes van 2,5 tot 15 km. Goede doel: Only Friends.',
                link: '/register',
                pubDate: new Date('2026-01-01'),
            },
            {
                title: 'Programma 2026 Bekend',
                description: 'Bekijk het volledige dagprogramma voor De Koninklijke Loop 2026. Routes, tijden, rustpunten en meer.',
                link: '/programma',
                pubDate: new Date('2026-01-15'),
            },
            {
                title: 'Routes & Kaart 2026',
                description: 'Ontdek de vier wandelroutes (2,5, 6, 10 en 15 km) over de Koninklijke Weg van Kootwijk naar Paleis Het Loo.',
                link: '/routes',
                pubDate: new Date('2026-01-15'),
            },
            {
                title: 'Only Friends — Goede Doel 2026',
                description: 'Dit jaar steunen we Only Friends. Lees meer over het goede doel van De Koninklijke Loop 2026.',
                link: '/charity',
                pubDate: new Date('2026-01-01'),
            },
            {
                title: 'Media — Foto\'s en Aftermovies',
                description: 'Bekijk foto\'s en aftermovies van eerdere edities van De Koninklijke Loop.',
                link: '/media',
                pubDate: new Date('2025-06-01'),
            },
        ],
        customData: `<language>nl-NL</language>`,
    });
}
