import { e as createComponent, g as addAttribute, n as renderScript, r as renderTemplate, h as createAstro } from './astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import 'clsx';
/* empty css                             */

const $$Astro = createAstro();
const $$ClientRouter = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ClientRouter;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>${renderScript($$result, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/node_modules/astro/components/ClientRouter.astro", void 0);

export { $$ClientRouter as $ };
