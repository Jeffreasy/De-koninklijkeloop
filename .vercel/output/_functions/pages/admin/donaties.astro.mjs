import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_B02uxOAN.mjs';
export { renderers } from '../../renderers.mjs';

const $$Donaties = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Donaties | De Koninklijke Loop Admin" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Page Header --> <div class="flex items-center justify-between"> <div> <h1 class="text-3xl font-bold font-display text-text-primary">Donaties</h1> <p class="text-text-muted mt-1">Overzicht van alle donaties en giften</p> </div> <button class="px-4 py-2 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/20"> <div class="flex items-center gap-2"> ${renderComponent($$result2, "iconify-icon", "iconify-icon", { "icon": "lucide:download", "width": "18", "height": "18" })} <span>Exporteren</span> </div> </button> </div> <!-- Stats Cards --> <div class="grid grid-cols-1 md:grid-cols-4 gap-4"> <div class="glass-card p-4"> <div class="text-text-muted text-sm mb-1">Totaal Opgehaald</div> <div class="text-2xl font-bold text-green-400">€ 0,00</div> </div> <div class="glass-card p-4"> <div class="text-text-muted text-sm mb-1">Aantal Donaties</div> <div class="text-2xl font-bold text-text-primary">0</div> </div> <div class="glass-card p-4"> <div class="text-text-muted text-sm mb-1">In Behandeling</div> <div class="text-2xl font-bold text-yellow-400">0</div> </div> <div class="glass-card p-4"> <div class="text-text-muted text-sm mb-1">Mislukt</div> <div class="text-2xl font-bold text-red-400">0</div> </div> </div> <!-- Main Content --> <div class="glass-card p-6"> <div class="flex items-center justify-between mb-6"> <h2 class="text-lg font-semibold text-text-primary">Recente Donaties</h2> <div class="flex items-center gap-3"> <!-- Status Filter --> <select class="px-3 py-2 rounded-lg bg-glass-border/30 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-accent-primary/50"> <option>Alle statussen</option> <option>Voltooid</option> <option>In behandeling</option> <option>Mislukt</option> <option>Terugbetaald</option> </select> <!-- Payment Method Filter --> <select class="px-3 py-2 rounded-lg bg-glass-border/30 border border-glass-border text-text-primary text-sm focus:ring-2 focus:ring-accent-primary/50"> <option>Alle methodes</option> <option>iDEAL</option> <option>Creditcard</option> <option>Bancontact</option> <option>PayPal</option> </select> </div> </div> <!-- Empty State --> <div class="text-center py-12"> ${renderComponent($$result2, "iconify-icon", "iconify-icon", { "icon": "lucide:coins", "width": "48", "height": "48", "class": "text-text-muted mx-auto mb-4" })} <p class="text-text-muted mb-2">Nog geen donaties ontvangen</p> <p class="text-text-muted/60 text-sm">Donaties worden hier automatisch bijgehouden</p> </div> </div> </div> ` })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/admin/donaties.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/admin/donaties.astro";
const $$url = "/admin/donaties";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Donaties,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
