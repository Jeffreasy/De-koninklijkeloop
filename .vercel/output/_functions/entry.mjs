import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_jBvlSYY-.mjs';
import { manifest } from './manifest_CyUBITLO.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/admin/dashboard.astro.mjs');
const _page3 = () => import('./pages/admin/deelnemers.astro.mjs');
const _page4 = () => import('./pages/admin/donaties.astro.mjs');
const _page5 = () => import('./pages/admin/media.astro.mjs');
const _page6 = () => import('./pages/admin/settings.astro.mjs');
const _page7 = () => import('./pages/admin/status.astro.mjs');
const _page8 = () => import('./pages/api/auth/_---path_.astro.mjs');
const _page9 = () => import('./pages/api/sign-cloudinary.astro.mjs');
const _page10 = () => import('./pages/api/_---all_.astro.mjs');
const _page11 = () => import('./pages/charity.astro.mjs');
const _page12 = () => import('./pages/contact.astro.mjs');
const _page13 = () => import('./pages/dashboard.astro.mjs');
const _page14 = () => import('./pages/dkl.astro.mjs');
const _page15 = () => import('./pages/faq.astro.mjs');
const _page16 = () => import('./pages/login.astro.mjs');
const _page17 = () => import('./pages/media.astro.mjs');
const _page18 = () => import('./pages/programma.astro.mjs');
const _page19 = () => import('./pages/register.astro.mjs');
const _page20 = () => import('./pages/routes.astro.mjs');
const _page21 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/admin/dashboard.astro", _page2],
    ["src/pages/admin/deelnemers.astro", _page3],
    ["src/pages/admin/donaties.astro", _page4],
    ["src/pages/admin/media.astro", _page5],
    ["src/pages/admin/settings.astro", _page6],
    ["src/pages/admin/status.astro", _page7],
    ["src/pages/api/auth/[...path].ts", _page8],
    ["src/pages/api/sign-cloudinary.ts", _page9],
    ["src/pages/api/[...all].ts", _page10],
    ["src/pages/charity.astro", _page11],
    ["src/pages/contact.astro", _page12],
    ["src/pages/dashboard.astro", _page13],
    ["src/pages/dkl.astro", _page14],
    ["src/pages/faq.astro", _page15],
    ["src/pages/login.astro", _page16],
    ["src/pages/media.astro", _page17],
    ["src/pages/programma.astro", _page18],
    ["src/pages/register.astro", _page19],
    ["src/pages/routes.astro", _page20],
    ["src/pages/index.astro", _page21]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "6bf9f236-1030-44f7-b9ad-14c80a972e37",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
