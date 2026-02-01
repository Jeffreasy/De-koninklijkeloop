import { e as createComponent, r as renderTemplate, n as renderScript, o as defineScriptVars, p as renderSlot, q as renderHead, k as renderComponent, g as addAttribute, h as createAstro, m as maybeRenderHead } from './astro/server_Dvn5AkW6.mjs';
import 'piccolore';
/* empty css                             */
import { $ as $$ClientRouter } from './ClientRouter_CxbU7b1H.mjs';
import { jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { B as Button } from './button_CPvoipf7.mjs';
import { Sun, Moon } from 'lucide-react';
import 'clsx';
/* empty css                         */

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(cooked.slice()) }));
var _a$1;
const $$Astro$2 = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description = "De Koninklijke Loop 2026 - Wandel mee voor het Liliane Fonds"
  } = Astro2.props;
  return renderTemplate(_a$1 || (_a$1 = __template$1(['<html lang="nl" class="scroll-smooth"> <head><meta charset="UTF-8"><meta name="description"', '><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"', "><title>", "</title>", `<script>
            // Anti-Flicker & Theme Initialization Script
            // Service Worker Cleanup - Ensures mobile users get fresh content
            if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
                // Register cleanup workers to remove old cached Service Workers
                const registerCleanupWorker = (path, label) => {
                    navigator.serviceWorker.register(path, { 
                        updateViaCache: 'none',
                        scope: '/' 
                    })
                    .then(registration => {
                        // Update check (may fail if SW unregisters itself - this is expected)
                        registration.update().catch(() => {
                            // Silent catch - SW may have already unregistered
                        });
                    })
                    .catch(() => {
                        // Silent catch - Expected after cleanup completes
                    });
                };

                // Register both cleanup workers for compatibility
                registerCleanupWorker('/sw.js', 'primary');
                registerCleanupWorker('/service-worker.js', 'legacy');

                // Fallback: Manual cleanup for any remaining registrations
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    registrations.forEach(reg => reg.unregister());
                });

                // Clear any orphaned caches
                if ("caches" in window) {
                    caches.keys().then((names) => {
                        names.forEach(name => caches.delete(name));
                    });
                }
            }
            
            const getTheme = () => {
                const stored = localStorage.getItem("theme");
                if (stored) return stored;
                return window.matchMedia("(prefers-color-scheme: light)").matches
                    ? "light"
                    : "dark";
            };

            const setTheme = (theme) => {
                const root = document.documentElement;
                if (theme === "light") {
                    root.setAttribute("data-theme", "light");
                    root.classList.add("light");
                    root.classList.remove("dark");
                } else {
                    root.setAttribute("data-theme", "dark");
                    root.classList.add("dark");
                    root.classList.remove("light");
                }
                localStorage.setItem("theme", theme);
            };

            // Initial Run
            setTheme(getTheme());

            // View Transitions Hook
            document.addEventListener("astro:after-swap", () => {
                setTheme(getTheme());
            });
        <\/script><link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap" rel="stylesheet"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preconnect" href="https://res.cloudinary.com" crossorigin><link rel="preconnect" href="https://streamable.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`, '</head> <body class="bg-background text-text-body antialiased selection:bg-brand-primary/20"> ', " <script>(function(){", "\n            window.DKL_INITIAL_USER = user;\n        })();<\/script> ", " </body> </html>"])), addAttribute(description, "content"), addAttribute(Astro2.generator, "content"), title, renderComponent($$result, "ClientRouter", $$ClientRouter, {}), renderHead(), renderSlot($$result, $$slots["default"]), defineScriptVars({ user: Astro2.locals.user }), renderScript($$result, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts"));
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/layouts/BaseLayout.astro", void 0);

function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme) {
      setTheme(currentTheme);
    } else {
      const saved = localStorage.getItem("theme");
      const system = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      setTheme(saved || system);
    }
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    root.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };
  return /* @__PURE__ */ jsx(
    Button,
    {
      variant: "ghost",
      size: "icon",
      onClick: toggleTheme,
      className: "rounded-full text-text-body hover:bg-glass-bg/50",
      title: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
      children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Moon, { className: "h-5 w-5" })
    }
  );
}

const siteConfig = {
  // Brand & Identity
  brand: {
    name: "De Koninklijke Loop",
    logo: "https://res.cloudinary.com/dgfuv7wif/image/upload/v1748030388/DKLLogoV1_kx60i9.webp",
    description: "De Koninklijke Loop is een initiatief voor en door mensen met een beperking. Samen wandelen we voor een inclusieve wereld."
  },
  // Event Information
  event: {
    date: "16 Mei 2026",
    location: "Kootwijk - Apeldoorn",
    heroVideo: "tt6k80"
    // Streamable shortcode
  },
  // Navigation
  navigation: [
    { name: "Home", href: "/" },
    { name: "Routes", href: "/routes" },
    { name: "Programma", href: "/programma" },
    { name: "Media", href: "/media" },
    { name: "DKL", href: "/dkl" },
    { name: "Inschrijven", href: "/register", highlight: true },
    { name: "Over Ons", href: "/about" },
    { name: "Contact", href: "/contact" }
  ],
  // Footer specific links
  footerLinks: {
    evenement: [
      { name: "Routes & Kaart", href: "/routes" },
      { name: "Programma", href: "/programma" },
      { name: "Media", href: "/media" },
      { name: "Veelgestelde Vragen", href: "/faq" }
    ],
    organisatie: [
      { name: "Over Ons", href: "/about" },
      { name: "Het Goede Doel", href: "/charity" },
      { name: "Contact", href: "/contact" },
      { name: "Inloggen", href: "/login" }
    ]
  },
  // Social Media
  social: {
    facebook: "#",
    // TODO: Add real URLs
    instagram: "#",
    linkedin: "#"
  },
  // Contact Information
  contact: {
    email: "info@dekoninklijkeloop.nl"}};

const $$Astro$1 = createAstro();
const $$CloudinaryImage = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CloudinaryImage;
  const {
    src,
    alt,
    widths,
    sizes,
    class: className = "",
    loading = "lazy",
    fetchpriority = "auto",
    crop = "limit",
    aspectRatio
  } = Astro2.props;
  if (!src) {
    throw new Error(`[CloudinaryImage] Missing required prop: src`);
  }
  if (!widths || widths.length === 0) {
    throw new Error(`[CloudinaryImage] Missing or empty required prop: widths (got: ${JSON.stringify(widths)})`);
  }
  if (!sizes) {
    throw new Error(`[CloudinaryImage] Missing required prop: sizes`);
  }
  if (!alt) {
    console.warn(`[CloudinaryImage] Missing alt text for image: ${src}`);
  }
  const CLOUDINARY_CLOUD_NAME = "dgfuv7wif";
  const BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  function buildCloudinaryUrl(width) {
    const transformations = [
      `c_${crop}`,
      `w_${width}`,
      aspectRatio ? `ar_${aspectRatio.replace(":", "_")}` : null,
      "f_auto",
      // Auto format (WebP/AVIF)
      "q_auto:good",
      // Auto quality optimization
      "dpr_auto"
      // Device Pixel Ratio optimization
    ].filter(Boolean).join(",");
    return `${BASE_URL}/${transformations}/${src}`;
  }
  const srcset = widths.map((width) => `${buildCloudinaryUrl(width)} ${width}w`).join(", ");
  const defaultSrc = buildCloudinaryUrl(widths[widths.length - 1]);
  return renderTemplate`${maybeRenderHead()}<img${addAttribute(defaultSrc, "src")}${addAttribute(srcset, "srcset")}${addAttribute(sizes, "sizes")}${addAttribute(alt, "alt")}${addAttribute(loading, "loading")}${addAttribute(fetchpriority, "fetchpriority")}${addAttribute(className, "class")} decoding="async">`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/ui/CloudinaryImage.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Navbar;
  const pathname = Astro2.url.pathname;
  const navItems = siteConfig.navigation;
  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };
  return renderTemplate(_a || (_a = __template(["", '<nav id="main-nav" class="fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-transparent" data-astro-cid-hihy2odu> <div class="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between relative" data-astro-cid-hihy2odu> <a href="/" class="shrink-0 group z-10 flex items-center gap-2" data-astro-cid-hihy2odu> <div class="p-2 bg-white/50 dark:bg-white/15 border border-white/40 dark:border-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/60 dark:group-hover:bg-white/25 transition-all duration-300" data-astro-cid-hihy2odu> ', ' </div> </a> <div class="hidden md:flex items-center gap-1" data-astro-cid-hihy2odu> <div class="flex items-center gap-1 p-1.5 bg-white/70 dark:bg-brand-blue/60 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-full px-4 shadow-xl" data-astro-cid-hihy2odu> ', ' </div> <div class="pl-4 ml-4 border-l border-black/10 dark:border-white/10 h-8 flex items-center opacity-70 hover:opacity-100 transition-opacity" data-astro-cid-hihy2odu> ', ' </div> </div> <div class="md:hidden flex items-center gap-4" data-astro-cid-hihy2odu> ', ' <button id="mobile-menu-btn" class="p-2 text-primary dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors z-50 relative border border-transparent hover:border-black/5 dark:hover:border-white/10" aria-label="Toggle Menu" data-astro-cid-hihy2odu> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu" data-astro-cid-hihy2odu> <line x1="4" x2="20" y1="12" y2="12" data-astro-cid-hihy2odu></line> <line x1="4" x2="20" y1="6" y2="6" data-astro-cid-hihy2odu></line> <line x1="4" x2="20" y1="18" y2="18" data-astro-cid-hihy2odu></line> </svg> </button> </div> </div> </nav> <!-- Mobile Menu Overlay (Moved outside Nav to avoid backdrop-filter clipping) --> <div id="mobile-menu" class="fixed inset-0 bg-[#020617]/98 backdrop-blur-3xl z-100 translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden flex flex-col" aria-hidden="true" data-astro-cid-hihy2odu> <div class="absolute inset-0 overflow-hidden pointer-events-none" data-astro-cid-hihy2odu> <div class="absolute top-0 right-0 w-2/3 h-1/3 bg-brand-orange/10 blur-[120px] rounded-full" data-astro-cid-hihy2odu></div> <div class="absolute bottom-0 left-0 w-2/3 h-1/3 bg-brand-blue/10 blur-[120px] rounded-full" data-astro-cid-hihy2odu></div> </div> <!-- Mobile Header (Close Button) --> <div class="flex items-center justify-between px-6 h-24 border-b border-white/5 relative z-10" data-astro-cid-hihy2odu> <div class="flex items-center gap-2" data-astro-cid-hihy2odu> <div class="p-2 bg-white/5 rounded-xl border border-white/5" data-astro-cid-hihy2odu> ', ' </div> </div> <button id="mobile-menu-close" class="p-2 text-white hover:text-brand-orange transition-colors rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10" aria-label="Close Menu" data-astro-cid-hihy2odu> <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-hihy2odu> <line x1="18" y1="6" x2="6" y2="18" data-astro-cid-hihy2odu></line> <line x1="6" y1="6" x2="18" y2="18" data-astro-cid-hihy2odu></line> </svg> </button> </div> <!-- Mobile Links --> <div class="flex-1 flex flex-col justify-center items-center gap-6 p-8 w-full max-w-md mx-auto relative z-10" data-astro-cid-hihy2odu> ', ' <div class="w-24 h-1 bg-white/10 rounded-full my-8" data-astro-cid-hihy2odu></div> <a href="/register" class="w-full max-w-xs mobile-nav-link transform translate-y-4 opacity-0"', ' data-astro-cid-hihy2odu> <button class="w-full py-4 rounded-xl bg-linear-to-r from-brand-orange to-orange-600 text-white font-bold text-xl shadow-xl shadow-brand-orange/20 active:scale-95 transition-all hover:scale-[1.02]" data-astro-cid-hihy2odu>\nInschrijven\n</button> </a> </div> </div> <script>\n    // Inline script to ensure immediate execution and no bundling issues\n    (() => {\n        function initMobileMenu() {\n            const nav = document.getElementById("main-nav");\n            const btn = document.getElementById("mobile-menu-btn");\n            const closeBtn = document.getElementById("mobile-menu-close");\n            const menu = document.getElementById("mobile-menu");\n            const links = menu?.querySelectorAll("a");\n            const navItems = menu?.querySelectorAll(".mobile-nav-link");\n\n            // Scroll Logic\n            function updateNav() {\n                if (!nav) return;\n                const isScrolled = window.scrollY > 20;\n                nav.setAttribute(\n                    "data-scrolled",\n                    isScrolled ? "true" : "false",\n                );\n            }\n            window.addEventListener("scroll", updateNav);\n            updateNav();\n\n            function toggleMenu(show) {\n                if (!menu) return;\n\n                if (show) {\n                    menu.classList.remove("translate-x-full");\n                    menu.classList.add("translate-x-0");\n                    menu.setAttribute("aria-hidden", "false");\n                    document.body.style.overflow = "hidden"; // Lock scroll\n\n                    // Animate Items In\n                    setTimeout(() => {\n                        navItems?.forEach((item) => {\n                            item.classList.remove("translate-y-4", "opacity-0");\n                        });\n                    }, 50);\n                } else {\n                    menu.classList.remove("translate-x-0");\n                    menu.classList.add("translate-x-full");\n                    menu.setAttribute("aria-hidden", "true");\n                    document.body.style.overflow = ""; // Unlock scroll\n\n                    // Reset specific animations\n                    setTimeout(() => {\n                        navItems?.forEach((item) => {\n                            item.classList.add("translate-y-4", "opacity-0");\n                        });\n                    }, 300); // Wait for transition\n                }\n            }\n\n            // Mobile Menu Logic\n            if (btn && menu) {\n                // Remove old listeners to prevent duplicates (if any)\n                const newBtn = btn.cloneNode(true);\n                btn.parentNode.replaceChild(newBtn, btn);\n                newBtn.addEventListener("click", () => toggleMenu(true));\n\n                if (closeBtn) {\n                    const newCloseBtn = closeBtn.cloneNode(true);\n                    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);\n                    newCloseBtn.addEventListener("click", () =>\n                        toggleMenu(false),\n                    );\n                }\n\n                // Close on link click\n                links?.forEach((link) => {\n                    link.addEventListener("click", () => toggleMenu(false));\n                });\n            }\n        }\n\n        // Run on initial load\n        initMobileMenu();\n\n        // Run on View Transitions navigation\n        document.addEventListener("astro:page-load", initMobileMenu);\n    })();\n<\/script>  '])), maybeRenderHead(), renderComponent($$result, "CloudinaryImage", $$CloudinaryImage, { "src": "DKLLogoV1_kx60i9", "alt": siteConfig.brand.name, "widths": [228, 456], "sizes": "228px", "fetchpriority": "high", "loading": "eager", "class": "h-8 w-auto object-contain", "data-astro-cid-hihy2odu": true }), navItems.map((item) => {
    const active = isActive(item.href);
    return renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute([
      "px-4 py-2 rounded-full text-sm font-medium transition-all relative font-display tracking-wide",
      item.highlight ? "bg-accent-primary text-white shadow-lg shadow-brand-orange/20 hover:bg-orange-600 hover:scale-105" : active ? "text-primary bg-black/5 dark:text-white dark:bg-white/10 font-bold shadow-inner" : "text-secondary hover:text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
      // Default
    ], "class:list")} data-astro-cid-hihy2odu> ${item.name} </a>`;
  }), renderComponent($$result, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/islands/ThemeToggle", "client:component-export": "default", "data-astro-cid-hihy2odu": true }), renderComponent($$result, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/islands/ThemeToggle", "client:component-export": "default", "data-astro-cid-hihy2odu": true }), renderComponent($$result, "CloudinaryImage", $$CloudinaryImage, { "src": "DKLLogoV1_kx60i9", "alt": siteConfig.brand.name, "widths": [228, 456], "sizes": "228px", "class": "h-8 w-auto opacity-100", "data-astro-cid-hihy2odu": true }), navItems.filter((item) => item.name !== "Inschrijven").map((item, index) => renderTemplate`<a${addAttribute(item.href, "href")} class="mobile-nav-link text-4xl font-display font-bold text-white hover:text-brand-orange transition-all transform translate-y-4 opacity-0 tracking-tight"${addAttribute(`transition-delay: ${index * 50}ms`, "style")} data-astro-cid-hihy2odu> ${item.name} </a>`), addAttribute(`transition-delay: ${navItems.length * 50}ms`, "style"));
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/Navbar.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const icons = {
    facebook: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    instagram: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0",
    linkedin: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 4a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"
  };
  return renderTemplate`${maybeRenderHead()}<footer class="relative z-50 bg-[#020617]/80 backdrop-blur-xl border-t border-white/5 pt-20 pb-10 overflow-hidden" data-astro-cid-5dd27owy>  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-brand-orange/50 to-transparent" data-astro-cid-5dd27owy></div> <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-24 bg-brand-orange/10 blur-[100px] -z-10 pointer-events-none" data-astro-cid-5dd27owy></div> <div class="max-w-7xl mx-auto px-6" data-astro-cid-5dd27owy> <div class="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16" data-astro-cid-5dd27owy>  <div class="md:col-span-4 space-y-6" data-astro-cid-5dd27owy> <a href="/" class="block group w-fit" data-astro-cid-5dd27owy> <div class="p-2 bg-white/15 border border-white/20 rounded-2xl group-hover:bg-white/25 transition-all duration-300" data-astro-cid-5dd27owy> <img${addAttribute(siteConfig.brand.logo, "src")}${addAttribute(`${siteConfig.brand.name} Logo`, "alt")} class="h-12 w-auto object-contain" data-astro-cid-5dd27owy> </div> </a> <p class="text-slate-400 leading-relaxed max-w-sm" data-astro-cid-5dd27owy> ${siteConfig.brand.description} </p>  <div class="flex gap-3" data-astro-cid-5dd27owy> <a${addAttribute(siteConfig.social.facebook, "href")} target="_blank" rel="noopener" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-orange hover:text-white transition-all duration-300 hover:-translate-y-1" data-astro-cid-5dd27owy> <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" data-astro-cid-5dd27owy><path${addAttribute(icons.facebook, "d")} data-astro-cid-5dd27owy></path></svg> </a> <a${addAttribute(siteConfig.social.instagram, "href")} target="_blank" rel="noopener" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-orange hover:text-white transition-all duration-300 hover:-translate-y-1" data-astro-cid-5dd27owy> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5" data-astro-cid-5dd27owy><path${addAttribute(icons.instagram, "d")} data-astro-cid-5dd27owy></path></svg> </a> <a${addAttribute(siteConfig.social.linkedin, "href")} target="_blank" rel="noopener" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-orange hover:text-white transition-all duration-300 hover:-translate-y-1" data-astro-cid-5dd27owy> <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" data-astro-cid-5dd27owy><path${addAttribute(icons.linkedin, "d")} data-astro-cid-5dd27owy></path></svg> </a> </div> </div>  <div class="md:col-span-2" data-astro-cid-5dd27owy> <h4 class="text-white font-bold mb-6 font-display text-lg tracking-wide" data-astro-cid-5dd27owy>
Evenement
</h4> <ul class="space-y-3" data-astro-cid-5dd27owy> ${siteConfig.footerLinks.evenement.map((link) => renderTemplate`<li data-astro-cid-5dd27owy> <a${addAttribute(link.href, "href")} class="text-slate-400 hover:text-brand-orange transition-all duration-200 inline-block hover:translate-x-1" data-astro-cid-5dd27owy> ${link.name} </a> </li>`)} </ul> </div> <div class="md:col-span-2" data-astro-cid-5dd27owy> <h4 class="text-white font-bold mb-6 font-display text-lg tracking-wide" data-astro-cid-5dd27owy>
Organisatie
</h4> <ul class="space-y-3" data-astro-cid-5dd27owy> ${siteConfig.footerLinks.organisatie.map((link) => renderTemplate`<li data-astro-cid-5dd27owy> <a${addAttribute(link.href, "href")} class="text-slate-400 hover:text-brand-orange transition-all duration-200 inline-block hover:translate-x-1" data-astro-cid-5dd27owy> ${link.name} </a> </li>`)} </ul> </div>  <div class="md:col-span-4" data-astro-cid-5dd27owy> <h4 class="text-white font-bold mb-6 font-display text-lg tracking-wide" data-astro-cid-5dd27owy>
Project Team
</h4> <div class="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-orange/30 transition-colors group" data-astro-cid-5dd27owy> <p class="text-xs font-bold text-brand-orange mb-3 uppercase tracking-wider" data-astro-cid-5dd27owy>
Lead Engineering & Design
</p> <div class="flex items-center gap-4" data-astro-cid-5dd27owy> <div class="w-10 h-10 rounded-full bg-linear-to-br from-brand-orange to-orange-600 flex items-center justify-center text-white font-bold" data-astro-cid-5dd27owy>
JL
</div> <div data-astro-cid-5dd27owy> <span class="block font-bold text-white group-hover:text-brand-orange transition-colors" data-astro-cid-5dd27owy>Jeffrey Lavente</span> <span class="text-xs text-slate-400" data-astro-cid-5dd27owy>Full-Stack prompt-engineer</span> </div> </div> </div> </div> </div>  <div class="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500" data-astro-cid-5dd27owy> <p data-astro-cid-5dd27owy>
&copy; ${currentYear} ${siteConfig.brand.name}. Alle rechten voorbehouden.
</p> <p class="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity" data-astro-cid-5dd27owy> <span data-astro-cid-5dd27owy>Powered by</span> <a href="https://www.laventecare.nl" target="_blank" rel="noopener noreferrer" class="font-bold text-white hover:text-brand-orange transition-colors" data-astro-cid-5dd27owy>
LaventeCare
</a> <span class="w-1 h-1 rounded-full bg-brand-orange" data-astro-cid-5dd27owy></span> <span class="font-mono text-brand-orange/80" data-astro-cid-5dd27owy>v1.0.4</span> </p> </div> </div> </footer> `;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/Footer.astro", void 0);

export { $$BaseLayout as $, $$Navbar as a, $$Footer as b, $$CloudinaryImage as c, siteConfig as s };
