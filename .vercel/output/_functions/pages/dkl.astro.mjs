import { e as createComponent, m as maybeRenderHead, k as renderComponent, r as renderTemplate, g as addAttribute, h as createAstro } from '../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { $ as $$BaseLayout, a as $$Navbar, b as $$Footer } from '../chunks/Footer_DIWfRp3j.mjs';
import { Flag, Crown, MapPin, Accessibility, ExternalLink } from 'lucide-react';
export { renderers } from '../renderers.mjs';

const $$DKLInfo = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="space-y-16">  <div class="text-center max-w-3xl mx-auto"> <h2 class="text-3xl md:text-4xl font-display font-bold text-primary mb-6">
De Loop over <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-orange-400">De Koninklijke Weg</span> </h2> <p class="text-lg text-secondary leading-relaxed">
Op <strong class="text-primary">zaterdag 16 mei 2026</strong>, tijdens de Koninklijke Loop (DKL), wandelen we over een speciaal, toegankelijk wandelpad: het laatste stukje van de historische Koninklijke Weg. Hoewel de volledige Koninklijke Weg 170 km lang is (van Paleis Noordeinde naar Paleis Het Loo), focust de DKL zich op het prachtige deel van Kootwijk naar Apeldoorn, met afstanden van 2.5, 6, 10 en 15 km. We finishen feestelijk bij de Grote Kerk in Apeldoorn.
</p> </div>  <div class="grid md:grid-cols-2 gap-8">  <div class="glass-card p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"> <div class="absolute top-0 right-0 p-8 opacity-10 text-brand-orange group-hover:scale-110 transition-transform duration-500"> ${renderComponent($$result, "Flag", Flag, { "className": "w-24 h-24" })} </div> <div class="relative z-10"> <div class="w-12 h-12 bg-surface/50 rounded-xl flex items-center justify-center mb-6 text-brand-orange border border-white/10"> ${renderComponent($$result, "Crown", Crown, { "className": "w-6 h-6" })} </div> <h3 class="text-2xl font-display font-bold text-primary mb-4">Koninklijke Weg</h3> <p class="text-secondary leading-relaxed mb-6">
De Koninklijke Weg loopt van Paleis Noordeinde in Den Haag, via Soestdijk naar Paleis Het Loo. Onderweg loop je door het Groene Hart, over de Utrechtse Heuvelrug en via de Veluwe. De Koninklijke Loop (DKL) gebruikt het mooie laatste deel van deze route, van Kootwijk naar Apeldoorn.
</p> <figure class="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:shadow-brand-orange/20 transition-all duration-500"> <img src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1769727923/671ff32e5e9bec64a207e3b2_route_Koninklijke_weg_qawkhc.jpg" alt="Illustratie Koninklijke Weg" class="w-full h-auto object-cover"> <div class="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm py-1.5 px-4"> <figcaption class="text-[10px] text-white/80 font-medium text-center uppercase tracking-wider">
Tekening: Anneke van de Glind
</figcaption> </div> </figure> </div> </div>  <div class="glass-card p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"> <div class="absolute top-0 right-0 p-8 opacity-10 text-brand-blue-light group-hover:scale-110 transition-transform duration-500"> ${renderComponent($$result, "MapPin", MapPin, { "className": "w-24 h-24" })} </div> <div class="relative z-10"> <div class="w-12 h-12 bg-surface/50 rounded-xl flex items-center justify-center mb-6 text-brand-orange border border-white/10"> ${renderComponent($$result, "MapPin", MapPin, { "className": "w-6 h-6" })} </div> <h3 class="text-2xl font-display font-bold text-primary mb-4">Paleis Noordeinde</h3> <p class="text-secondary leading-relaxed">
Paleis Noordeinde is het beginpunt van de Koninklijke Weg. Het paleis is een van de drie paleizen die door de Nederlandse staat ter beschikking zijn gesteld aan het staatshoofd.
</p> </div> </div>  <div class="glass-card p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 md:col-span-2"> <div class="absolute -right-10 -bottom-10 opacity-5 text-brand-orange"> ${renderComponent($$result, "Accessibility", Accessibility, { "className": "w-64 h-64" })} </div> <div class="relative z-10 grid md:grid-cols-[1fr_2fr] gap-8 items-center"> <div> <div class="w-16 h-16 bg-accent-primary/10 rounded-2xl flex items-center justify-center mb-6 text-accent-primary border border-accent-primary/20"> ${renderComponent($$result, "Accessibility", Accessibility, { "className": "w-8 h-8" })} </div> <h3 class="text-2xl font-display font-bold text-primary mb-2">Toegankelijkheid</h3> <p class="text-sm text-muted">Iedereen doet mee</p> </div> <div class="prose prose-invert prose-p:text-secondary prose-strong:text-primary max-w-none"> <p>
Het pad is voor iedereen toegankelijk, ook voor mensen met een lichamelijke beperking. De route is <strong>rolstoelvriendelijk</strong>. Er zijn routebegeleiders, EHBO'ers en pendelbussen (inclusief rolstoelbus) beschikbaar om deelnemers naar de startpunten te brengen. Het volledige pad kent diverse etappes.
</p> </div> </div> </div> </div> </div>`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/DKLInfo.astro", void 0);

const $$Astro = createAstro();
const $$KomootEmbed = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$KomootEmbed;
  const {
    tourId,
    shareToken,
    title = "Komoot Route",
    height = "600px"
  } = Astro2.props;
  const embedUrl = `https://www.komoot.com/nl-nl/tour/${tourId}/embed?share_token=${shareToken}&profile=1`;
  const appUrl = `https://www.komoot.com/tour/${tourId}?share_token=${shareToken}`;
  return renderTemplate`${maybeRenderHead()}<div class="relative group">  <div class="glass-card p-1.5 md:p-3 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative z-10 transition-transform duration-300 hover:scale-[1.01]"> <iframe${addAttribute(embedUrl, "src")} width="100%"${addAttribute(parseInt(height), "height")}${addAttribute(`border:none; border-radius: 1rem; min-height: ${height};`, "style")}${addAttribute(title, "title")} loading="lazy" allow="geolocation" class="w-full bg-surface/50"></iframe> </div>  <div class="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-brand-blue-light/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>  <div class="absolute bottom-6 right-6 z-20 pointer-events-none"> <a${addAttribute(appUrl, "href")} target="_blank" rel="noopener noreferrer" class="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-surface/90 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-primary shadow-lg hover:bg-surface hover:scale-105 transition-all"> <span>Open in App</span> ${renderComponent($$result, "ExternalLink", ExternalLink, { "className": "w-3 h-3" })} </a> </div> </div>`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/KomootEmbed.astro", void 0);

const $$Dkl = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Over DKL | De Koninklijke Loop 2026" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Navbar", $$Navbar, {})} ${maybeRenderHead()}<main class="pt-32 pb-20 relative overflow-hidden">  <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue-light/10 rounded-full blur-[128px] pointer-events-none"></div> <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[128px] pointer-events-none"></div> <div class="max-w-7xl mx-auto px-6 relative z-10">  <div class="mb-24"> <h1 class="text-5xl md:text-6xl font-display font-bold text-center text-primary mb-16">
Over <span class="text-transparent bg-clip-text bg-linear-to-r from-brand-orange to-orange-400">DKL</span> </h1> ${renderComponent($$result2, "DKLInfo", $$DKLInfo, {})} </div>  <div class="max-w-4xl mx-auto"> <div class="text-center mb-12"> <h2 class="text-3xl font-display font-bold text-primary mb-4">
Onze Route
</h2> <p class="text-lg text-secondary leading-relaxed">
Dit is de toegankelijke wandelroute die we lopen tijdens
                        de Koninklijke Loop (DKL), met keuze uit 2.5, 6, 10 of
                        15 km. Bekijk de interactieve kaart hieronder voor meer
                        details over de route van Kootwijk naar Apeldoorn.
</p> </div>  ${renderComponent($$result2, "KomootEmbed", $$KomootEmbed, { "tourId": "1914852208", "shareToken": "amNaNnjQrpHjos4rnAN4E3jReDmCWWTlgUuoGvDgE4cA7mkSzG", "title": "Koninklijke Loop Route - Komoot" })} </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/dkl.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/dkl.astro";
const $$url = "/dkl";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Dkl,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
