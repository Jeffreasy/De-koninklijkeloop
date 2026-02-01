import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { $ as $$BaseLayout, a as $$Navbar, b as $$Footer } from '../chunks/Footer_vW1z91-v.mjs';
export { renderers } from '../renderers.mjs';

const $$Faq = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Coming Soon" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Navbar", $$Navbar, {})} ${maybeRenderHead()}<main class="pt-32 pb-20 px-6 min-h-screen text-center"> <h1 class="text-4xl font-bold">Coming Soon</h1> <p class="text-text-muted mt-4">Deze pagina is nog in ontwikkeling.</p> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/faq.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/faq.astro";
const $$url = "/faq";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Faq,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
