import { e as createComponent, m as maybeRenderHead, g as addAttribute, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { $ as $$BaseLayout, a as $$Navbar, b as $$Footer } from '../chunks/Footer_vW1z91-v.mjs';
import { Camera, Users, HeartHandshake, Heart, Lightbulb } from 'lucide-react';
export { renderers } from '../renderers.mjs';

const $$TeamSection = createComponent(($$result, $$props, $$slots) => {
  const teamPhoto = "https://res.cloudinary.com/dgfuv7wif/image/upload/v1769728270/66c263cb03f03f94f9921898_8c4a504471_f6x1us.jpg";
  return renderTemplate`${maybeRenderHead()}<section class="py-12 space-y-24">  <div class="relative max-w-5xl mx-auto px-6"> <div class="glass-card p-2 md:p-4 rounded-3xl overflow-hidden shadow-2xl relative group"> <div class="relative rounded-2xl overflow-hidden aspect-[16/9]"> <img${addAttribute(teamPhoto, "src")} alt="Team De Koninklijke Loop" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"> </div> <div class="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2"> <div class="text-sm text-secondary font-medium"> <span class="text-brand-orange font-bold uppercase tracking-wider text-xs block mb-1">Teamleden wandelend</span>
Van links naar rechts: Jeffrey | Salih | Peter | Fenny
<span class="block text-xs text-muted mt-1 italic opacity-70">* Michel kon helaas niet bij de fotoshoot aanwezig zijn.</span> </div> <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/50 border border-white/5"> ${renderComponent($$result, "Camera", Camera, { "className": "w-4 h-4 text-brand-orange" })} <span class="text-xs font-bold text-primary">Beeldpakker Fotografie</span> </div> </div> </div> </div>  <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">  <div class="space-y-8"> <div class="flex items-center gap-4 mb-8"> <div class="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20"> ${renderComponent($$result, "Users", Users, { "className": "w-6 h-6" })} </div> <h2 class="text-3xl font-display font-bold text-primary">Wij stellen ons voor</h2> </div> <div class="space-y-6 text-lg text-secondary leading-relaxed"> <p> <strong class="text-primary">Michel en Peter</strong> wonen in een woongroep op 's Heeren Loo Ermelo. Zij helpen mee in de organisatie van de loop.
</p> <p> <strong class="text-primary">Jeffrey</strong> heeft geholpen met het maken van de filmpjes en de bouw en beheer van de site. Hij is ook werkzaam als begeleider op 's Heeren Loo Ermelo.
</p> <p> <strong class="text-primary">Fenny</strong> werkt hier ook en helpt met de algemene organisatie van de dag en de vrijwilligers. <strong class="text-primary">Salih</strong> is een collega van Fenny en Jeffrey en is samen met Michel en Peter verantwoordelijk voor de algemene organisatie.
</p> </div> <div class="glass-card p-6 rounded-2xl border-l-4 border-brand-orange bg-surface/30"> <h3 class="text-lg font-bold text-primary mb-2">Editie 2025: Versterking uit Druten</h3> <p class="text-secondary">
Bij de editie van 2025 helpen <strong class="text-primary">Angelique, Wesley en Wesley</strong> ook mee. Zij zijn van 's Heeren Loo woonzorgpark Boldershof. Angelique werkt hier en de beide Wesley's wonen op dit park. Zij coördineren de deelnemers uit de regio Druten.
</p> </div> </div>  <div class="space-y-8"> <div class="flex items-center gap-4 mb-8"> <div class="w-12 h-12 rounded-xl bg-brand-blue-light/10 flex items-center justify-center text-brand-sky border border-white/10"> ${renderComponent($$result, "HeartHandshake", HeartHandshake, { "className": "w-6 h-6" })} </div> <h2 class="text-3xl font-display font-bold text-primary">Wie steunen ons</h2> </div> <div class="prose prose-invert prose-lg text-secondary"> <p>
Natuurlijk helpen daarnaast nog heel veel vrijwilligers mee om dit event tot een succes te maken. Naast de vrijwilligers hebben we ook hulp gekregen van verschillende organisaties en bedrijven.
</p> <p>
Het is mooi om te zien dat mensen het een heel leuk initiatief vinden en graag een steentje willen bijdragen door het te willen sponsoren.
</p> </div> <div class="mt-8 inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-brand-orange/10 to-transparent border border-brand-orange/20"> ${renderComponent($$result, "Heart", Heart, { "className": "w-6 h-6 text-brand-orange fill-brand-orange animate-pulse" })} <span class="font-display font-bold text-primary text-xl">Bij voorbaat heel erg bedankt!</span> </div> </div> </div>  <div class="max-w-4xl mx-auto px-6 text-center"> <div class="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface/80 border border-white/10 shadow-lg mb-6"> ${renderComponent($$result, "Lightbulb", Lightbulb, { "className": "w-8 h-8 text-yellow-400" })} </div> <h2 class="text-3xl md:text-4xl font-display font-bold text-primary mb-8">
Onze Missie & Visie
</h2> <div class="glass-card p-8 md:p-12 rounded-3xl text-lg md:text-xl leading-relaxed text-secondary space-y-6"> <p>
Iets voor een ander doen, geeft een goed gevoel. Ook dat is een ervaring waar iedereen recht op heeft, of je nu een beperking hebt of niet. Want elk mens kan altijd meer dan hij of zij denkt voor een ander betekenen.
</p> <p class="text-primary font-medium">
Dat geldt ook voor mensen met een beperking. Samen op een sportieve manier bijdragen aan een goed doel is daarom de mooie missie van onze Koninklijke Loop.
</p> <p>
Door gezamenlijk te wandelen van Kootwijk naar Paleis het Loo willen we geld inzamelen voor mensen die dat nodig hebben. En zo maken we met elkaar de wereld een stukje beter. <span class="text-brand-orange font-bold italic">Letterlijk stap voor stap.</span> </p> </div> </div> </section>`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/TeamSection.astro", void 0);

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Over Ons | De Koninklijke Loop 2026" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Navbar", $$Navbar, {})} ${maybeRenderHead()}<main class="pt-32 pb-20 relative overflow-hidden">  <div class="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-light/10 rounded-full blur-[128px] pointer-events-none"></div> <div class="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[128px] pointer-events-none"></div> <div class="max-w-7xl mx-auto px-6 relative z-10">  <div class="text-center max-w-4xl mx-auto mb-16"> <h1 class="text-5xl md:text-6xl font-display font-bold text-primary mb-6">
Over <span class="text-transparent bg-clip-text bg-linear-to-r from-brand-orange to-orange-400">DKL</span> </h1> <h2 class="text-2xl md:text-3xl font-display font-medium text-secondary mb-8">
De Koninklijke Loop
</h2> <p class="text-xl text-text-muted leading-relaxed">
De Koninklijke Loop wordt georganiseerd door een groep
                    mensen die elkaar allemaal door het werken en leven in
                    zorginstellingen hebben ontmoet.
</p> </div> ${renderComponent($$result2, "TeamSection", $$TeamSection, {})} </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/about.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$About,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
