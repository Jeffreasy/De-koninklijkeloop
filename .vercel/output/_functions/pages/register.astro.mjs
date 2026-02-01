import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { $ as $$BaseLayout, a as $$Navbar, b as $$Footer } from '../chunks/Footer_DIWfRp3j.mjs';
export { renderers } from '../renderers.mjs';

const $$Register = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Registreren | De Koninklijke Loop" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Navbar", $$Navbar, {})} ${maybeRenderHead()}<main class="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center"> <div class="w-full max-w-lg space-y-8"> <div class="text-center space-y-2"> <h1 class="text-3xl md:text-4xl font-display font-bold">
Maak een Account aan
</h1> <p class="text-text-muted">
Schrijf je in voor de wandeltocht en beheer je inschrijving.
</p> </div> <div class="glass-card rounded-2xl p-8"> ${renderComponent($$result2, "RegisterPageWrapper", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/islands/RegisterPageWrapper", "client:component-export": "default" })} </div> <div class="text-center text-sm text-text-muted"> <p>
Al een account? <a href="/login" class="text-text-body hover:underline">Log in</a> </p> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/register.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Register,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
