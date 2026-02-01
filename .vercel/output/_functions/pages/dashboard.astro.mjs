import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { $ as $$BaseLayout, a as $$Navbar, b as $$Footer } from '../chunks/Footer_vW1z91-v.mjs';
export { renderers } from '../renderers.mjs';

const $$Dashboard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Mijn Dashboard | De Koninklijke Loop", "description": "Beheer je deelname" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="fixed inset-0 bg-black -z-10"> <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-brand-primary/20 via-black to-black opacity-50"></div> </div> ${renderComponent($$result2, "Navbar", $$Navbar, {})} <main class="pt-32 pb-20 px-6 min-h-screen"> <div class="max-w-7xl mx-auto space-y-8"> <!-- Header --> <div class="space-y-4"> <h1 class="text-4xl md:text-5xl font-bold font-display text-text-body">
Mijn Dashboard
</h1> <p class="text-text-muted max-w-2xl text-lg">
Welkom terug! Hier vind je alle details over je deelname aan
                    De Koninklijke Loop.
</p> </div> <!-- Dashboard Content (React Island) --> <div class="glass-card rounded-2xl p-8 min-h-[500px]"> ${renderComponent($$result2, "ParticipantDashboardWrapper", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/islands/ParticipantDashboardWrapper", "client:component-export": "default" })} </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/dashboard.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/dashboard.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Dashboard,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
