import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { $ as $$BaseLayout, a as $$Navbar, b as $$Footer } from '../chunks/Footer_vW1z91-v.mjs';
import { B as Button } from '../chunks/button_CPvoipf7.mjs';
import { c as charityHistory } from '../chunks/charityConfig_BGrXsFnU.mjs';
export { renderers } from '../renderers.mjs';

const $$Charity = createComponent(($$result, $$props, $$slots) => {
  const currentYearCharity = charityHistory[0];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Het Goede Doel | De Koninklijke Loop" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Navbar", $$Navbar, {})} ${maybeRenderHead()}<main class="pt-32 pb-20 px-6 min-h-screen"> <div class="max-w-4xl mx-auto space-y-12"> <!-- Hero Text --> <div class="text-center space-y-6"> <h1 class="text-4xl md:text-6xl font-display font-bold">
Wandelen voor <span class="text-transparent bg-clip-text bg-linear-to-r from-brand-orange to-orange-400">${currentYearCharity.name}</span> </h1> <p class="text-xl text-muted max-w-2xl mx-auto"> ${currentYearCharity.subtitle} </p> </div> <!-- Content Grid --> <div class="grid md:grid-cols-2 gap-8 items-center"> <div class="glass-card rounded-2xl p-8 space-y-4"> <h3 class="text-2xl font-bold text-primary">Onze Missie</h3> <div class="text-muted leading-relaxed whitespace-pre-line"> ${currentYearCharity.description} </div> <ul class="space-y-2 text-primary pt-4"> ${currentYearCharity.features?.map((item) => renderTemplate`<li class="flex items-center gap-2">
✅ ${item.value} ${item.label} </li>`)} </ul> </div> <div class="bg-brand-primary/10 rounded-2xl p-8 border border-brand-primary/20 text-center space-y-6"> <h3 class="text-2xl font-bold text-text-body">Doe Meer</h3> <p class="text-text-body">
Naast uw inschrijfgeld kunt u ook een extra donatie doen
                        of uw eigen sponsoractie starten.
</p> ${renderComponent($$result2, "Button", Button, { "variant": "default", "size": "lg", "className": "w-full" }, { "default": ($$result3) => renderTemplate`
Doneer Direct
` })} </div> </div> <!-- Quote / Impact --> <div class="border-l-4 border-brand-primary pl-6 py-2"> <blockquote class="text-2xl italic text-text-body font-display">
"Dankzij het Liliane Fonds kan ik nu naar school en heb ik
                    vrienden gemaakt. Ik hoor er eindelijk bij."
</blockquote> <p class="mt-2 text-text-muted">
— Een kind gesteund door uw deelname
</p> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/charity.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/charity.astro";
const $$url = "/charity";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Charity,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
