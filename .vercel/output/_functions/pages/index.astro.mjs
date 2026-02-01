import { e as createComponent, m as maybeRenderHead, g as addAttribute, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { s as siteConfig, c as $$CloudinaryImage, $ as $$BaseLayout, a as $$Navbar, b as $$Footer } from '../chunks/Footer_vW1z91-v.mjs';
import { B as Button, c as cn } from '../chunks/button_CPvoipf7.mjs';
/* empty css                                 */
import { Users, Trees, HeartHandshake, Crown, Heart, History, ArrowRight, Play } from 'lucide-react';
import { c as charityHistory } from '../chunks/charityConfig_BGrXsFnU.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { v as videos, g as getImagesFromFolder } from '../chunks/cloudinary_Ch7D9O-N.mjs';
export { renderers } from '../renderers.mjs';

const $$HeroSection = createComponent(($$result, $$props, $$slots) => {
  const eventDate = siteConfig.event?.date;
  const eventLocation = siteConfig.event?.location;
  const videoId = siteConfig.event?.heroVideo;
  return renderTemplate`${maybeRenderHead()}<section class="relative h-screen min-h-[600px] flex flex-col items-center justify-center overflow-hidden bg-brand-blue" data-astro-cid-bhgcymcd> <div class="absolute inset-0 w-full h-full overflow-hidden" data-astro-cid-bhgcymcd> <iframe${addAttribute(`https://streamable.com/e/${videoId}?autoplay=1&nocontrols=1&muted=1&loop=1`, "src")} frameborder="0" allow="autoplay" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover hero-video opacity-90" style="aspect-ratio: 16/9; width: 177.77vh; height: 56.25vw;" data-astro-cid-bhgcymcd></iframe> </div> <div class="absolute inset-0 bg-linear-to-b from-brand-blue/70 via-brand-blue/50 to-brand-blue/80 pointer-events-none" data-astro-cid-bhgcymcd></div> <div class="absolute inset-0 bg-body pointer-events-none motion-reduce-fallback hidden" data-astro-cid-bhgcymcd> <div class="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] bg-brand-orange/20 blur-[120px] rounded-full animate-pulse" data-astro-cid-bhgcymcd></div> <div class="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-brand-blue-light/20 blur-[120px] rounded-full" data-astro-cid-bhgcymcd></div> </div> <div class="relative z-10 w-full h-full max-w-5xl mx-auto px-6 pt-32 pb-20 flex flex-col justify-between items-center text-center" data-astro-cid-bhgcymcd> <div class="space-y-8 animate-fade-in-up" data-astro-cid-bhgcymcd> <div class="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass border border-white/10 text-sm text-white/90 font-medium shadow-lg backdrop-blur-md" data-astro-cid-bhgcymcd> <span class="relative flex h-2.5 w-2.5" data-astro-cid-bhgcymcd> <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75" data-astro-cid-bhgcymcd></span> <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-orange" data-astro-cid-bhgcymcd></span> </span> <span class="tracking-wide" data-astro-cid-bhgcymcd> ${eventDate} • ${eventLocation} </span> </div> <h1 class="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-[1.1] drop-shadow-2xl max-w-4xl mx-auto" data-astro-cid-bhgcymcd>
De Sponsorloop van mensen met een beperking voor een goed doel!
<span class="text-transparent bg-clip-text bg-linear-to-r from-brand-orange to-orange-400 block mt-4 pb-2" data-astro-cid-bhgcymcd>
Samen maken we het verschil
</span> </h1> </div> <div class="flex flex-col sm:flex-row gap-5 justify-center items-center w-full sm:w-auto" data-astro-cid-bhgcymcd> <a href="/register" class="w-full sm:w-auto" data-astro-cid-bhgcymcd> ${renderComponent($$result, "Button", Button, { "variant": "default", "size": "lg", "className": "w-full sm:w-auto rounded-full px-10 text-lg h-14 shadow-[0_0_20px_rgba(255,147,40,0.4)] hover:shadow-[0_0_30px_rgba(255,147,40,0.6)] transition-all hover:scale-105 bg-brand-orange text-white border-none", "data-astro-cid-bhgcymcd": true }, { "default": ($$result2) => renderTemplate`
Schrijf je nu in
` })} </a> <a href="/routes" class="w-full sm:w-auto" data-astro-cid-bhgcymcd> ${renderComponent($$result, "Button", Button, { "variant": "glass", "size": "lg", "className": "w-full sm:w-auto rounded-full px-10 text-lg h-14 transition-transform hover:scale-105 text-white hover:text-white border-white/20 hover:bg-white/10", "data-astro-cid-bhgcymcd": true }, { "default": ($$result2) => renderTemplate`
Bekijk Routes
` })} </a> </div> </div> </section> `;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/HeroSection.astro", void 0);

const $$MissionSection = createComponent(($$result, $$props, $$slots) => {
  const features = [
    {
      title: "Inclusiviteit",
      description: "Een evenement waar iedereen meedoet, ongeacht beperking of achtergrond. Samen breken we barri\xE8res.",
      icon: Users
      // Referentie naar het component, niet een string
    },
    {
      title: "Gezondheid",
      description: "Bewegen is leven. We stimuleren een actieve levensstijl in de prachtige natuur van de Veluwe.",
      icon: Trees
    },
    {
      title: "Verbinding",
      description: "Ontmoet nieuwe mensen, deel verhalen en wandel samen naar de finish. Niemand loopt alleen.",
      icon: HeartHandshake
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="relative py-24 overflow-hidden bg-surface border-y border-border"> <div class="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue-light/10 rounded-full blur-[128px] pointer-events-none"></div> <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-orange/5 rounded-full blur-[128px] pointer-events-none"></div> <div class="max-w-7xl mx-auto px-6 relative z-10"> <div class="grid lg:grid-cols-2 gap-16 items-center"> <div class="space-y-8"> <div> <h2 class="text-4xl md:text-5xl font-display font-bold text-primary leading-tight">
Wandelen voor een
<span class="text-transparent bg-clip-text bg-linear-to-r from-brand-orange to-orange-400">
Inclusieve Wereld
</span> </h2> <p class="mt-6 text-lg text-muted leading-relaxed">
De Koninklijke Loop is meer dan een wandeltocht; het is
                        een beweging. Een initiatief <strong class="text-primary font-semibold">voor en door</strong> mensen met een beperking, waarbij we laten zien dat beperkingen
                        wegvallen als we samen optrekken.
</p> <p class="mt-4 text-lg text-muted leading-relaxed">
Op 17 Mei 2026 kleuren we Kootwijk oranje en blauw. Van
                        de 2.5KM "Roll & Stroll" tot de uitdagende 15KM
                        bosroute: er is plek voor iedereen.
</p> </div> <div class="flex flex-wrap gap-4"> <a href="/register"> ${renderComponent($$result, "Button", Button, { "size": "lg", "className": "rounded-full px-8 bg-accent-primary hover:bg-orange-600 shadow-lg shadow-brand-orange/20 text-white font-medium border-none" }, { "default": ($$result2) => renderTemplate`
Schrijf je in
` })} </a> <a href="/about"> ${renderComponent($$result, "Button", Button, { "variant": "ghost", "size": "lg", "className": "rounded-full px-8 text-primary hover:bg-primary/5 border border-border" }, { "default": ($$result2) => renderTemplate`
Lees ons verhaal
` })} </a> </div> </div> <div class="grid gap-6"> <div class="glass-card p-8 rounded-3xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500"> <div class="absolute inset-0 bg-linear-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div> <div class="relative z-10"> <div class="w-14 h-14 bg-accent-primary/10 rounded-xl flex items-center justify-center mb-6 text-brand-orange"> ${renderComponent($$result, "Crown", Crown, { "className": "w-7 h-7" })} </div> <h3 class="text-xl font-bold text-primary mb-3">
Koninklijke Allure
</h3> <p class="text-muted leading-relaxed">
Start en finish in een vorstelijke ambiance.
                            Begeleid door muziek, sfeer en applaus voelt elke
                            deelnemer zich een winnaar.
</p> </div> </div> <div class="grid sm:grid-cols-2 gap-6"> ${features.slice(0, 2).map((feature) => renderTemplate`<div class="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300"> <div class="mb-4 text-brand-sky"> ${renderComponent($$result, "feature.icon", feature.icon, { "className": "w-8 h-8" })} </div> <h4 class="font-bold text-primary mb-2"> ${feature.title} </h4> <p class="text-sm text-muted"> ${feature.description} </p> </div>`)} </div> <div class="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 sm:col-span-2 lg:col-span-1 lg:hidden"> <div class="mb-4 text-brand-orange"> ${renderComponent($$result, "HeartHandshake", HeartHandshake, { "className": "w-8 h-8" })} </div> <h4 class="font-bold text-primary mb-2"> ${features[2].title} </h4> <p class="text-sm text-muted"> ${features[2].description} </p> </div> </div> </div> </div> </section>`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/MissionSection.astro", void 0);

const $$CharitySpotlight = createComponent(($$result, $$props, $$slots) => {
  const [latest, ...pastCampaigns] = charityHistory;
  const currentCampaign = latest;
  return renderTemplate`${maybeRenderHead()}<section class="py-24 relative overflow-hidden bg-body transition-colors duration-300"> <div class="container mx-auto px-6 relative z-10"> <div class="mb-24"> <!-- Split Header Section --> <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20"> <!-- Left Column: Content --> <div class="text-left order-2 lg:order-1"> <div class="flex justify-start mb-6"> <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm font-medium animate-fade-in-up"> <span class="relative flex h-2 w-2"> <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span> <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span> </span>
Goede Doel ${currentCampaign.year} </span> </div> <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 font-display tracking-tight leading-tight"> ${currentCampaign.header} </h2> <p class="text-xl md:text-2xl text-accent-primary font-medium font-body mb-8"> ${currentCampaign.subtitle} </p> <p class="text-lg text-muted leading-relaxed mb-10 max-w-xl"> ${currentCampaign.description} </p> <div> <a${addAttribute(currentCampaign.links.donation, "href")} target="_blank" rel="noopener noreferrer"> ${renderComponent($$result, "Button", Button, { "size": "lg", "className": "rounded-full px-10 h-14 text-lg bg-accent-primary hover:bg-orange-600 text-white shadow-[0_0_20px_rgba(255,147,40,0.3)] hover:shadow-[0_0_30px_rgba(255,147,40,0.5)] border-none transition-all group" }, { "default": ($$result2) => renderTemplate`
Steun ${currentCampaign.name}${renderComponent($$result2, "ArrowRight", ArrowRight, { "className": "ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" })} ` })} </a> </div> </div> <!-- Right Column: Professional Banner --> <div class="relative group perspective-1000 order-1 lg:order-2"> <div class="absolute inset-0 bg-brand-orange/20 rounded-3xl blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div> <div class="relative rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl transform-gpu transition-transform duration-700 hover:scale-[1.02] hover:rotate-1"> <div class="absolute inset-0 bg-linear-to-tr from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div> ${renderComponent($$result, "CloudinaryImage", $$CloudinaryImage, { "src": "OnlyFriendsBanner_wpltle", "alt": `Banner ${currentCampaign.name}`, "widths": [400, 640, 768, 1024, 1280, 1536], "sizes": "(max-width: 768px) 100vw, 50vw", "class": "w-full h-auto object-cover md:min-h-[400px]" })} <!-- Overlay Tag --> <div class="absolute bottom-4 left-4 z-20"> <div class="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white font-display font-bold text-sm flex items-center gap-2"> ${renderComponent($$result, "Heart", Heart, { "className": "w-4 h-4 text-brand-orange fill-brand-orange" })} ${currentCampaign.name} </div> </div> </div> </div> </div> <!-- Features Grid --> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"> ${currentCampaign.features.map((feature) => renderTemplate`<div class="glass-card group p-8 rounded-2xl text-center hover:-translate-y-1 transition-all duration-300 border border-white/10 bg-surface/50 hover:bg-surface/80"> <div class="text-4xl font-bold text-brand-sky group-hover:text-brand-orange transition-colors duration-300 mb-2 font-display"> ${feature.value} </div> <div class="text-sm text-muted uppercase tracking-wider font-medium group-hover:text-primary transition-colors"> ${feature.label} </div> </div>`)} </div> </div> ${pastCampaigns.length > 0 && renderTemplate`<div class="relative border-t border-border pt-16"> <div class="flex items-center gap-4 mb-10"> <div class="h-10 w-10 rounded-full bg-surface border border-border flex items-center justify-center text-muted"> ${renderComponent($$result, "History", History, { "className": "w-5 h-5" })} </div> <h3 class="text-2xl font-bold text-primary font-display">
Onze Impact Historie
</h3> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> ${pastCampaigns.map((campaign) => renderTemplate`<div class="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:bg-surface/80 transition-all border border-white/5"> <div class="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-brand-blue/10 text-brand-sky border border-brand-blue/20 group-hover:border-brand-sky/50 transition-colors"> <span class="text-lg font-bold"> ${campaign.year} </span> </div> <div class="flex-1"> <h4 class="text-xl font-bold text-primary flex items-center gap-2"> ${campaign.name} ${renderComponent($$result, "Heart", Heart, { "className": "w-4 h-4 text-brand-orange fill-brand-orange opacity-0 group-hover:opacity-100 transition-opacity" })} </h4> <p class="text-sm text-muted mt-1 mb-2 line-clamp-2"> ${campaign.description} </p> ${campaign.amountRaised && renderTemplate`<div class="text-sm font-medium text-brand-sky">
Opgehaald:${" "} <span class="text-primary"> ${campaign.amountRaised} </span> </div>`} </div> <div class="hidden sm:block text-muted group-hover:text-brand-orange transition-colors"> ${renderComponent($$result, "ArrowRight", ArrowRight, { "className": "w-5 h-5" })} </div> </div>`)} </div> </div>`} </div> <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40 dark:opacity-20"> <div class="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-brand-blue-light/30 rounded-full blur-[120px]"></div> <div class="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-brand-orange/20 rounded-full blur-[100px]"></div> </div> </section>`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/CharitySpotlight.astro", void 0);

function getPartners() {
  return [
    {
      src: "accres_logo_ochsmg_zma2pl",
      alt: "Accres",
      aspect: "horizontal",
      year: "2026"
    },
    {
      src: "GroteKerk_1_gldtlw",
      alt: "Grote Kerk",
      aspect: "horizontal",
      year: "2026"
    },
    {
      src: "LogoLayout_busfsf",
      alt: "Liliane Fonds",
      aspect: "horizontal",
      year: "2026"
    },
    {
      src: "asdasdqwdr_rvqey8",
      alt: "Voetlopers",
      aspect: "horizontal",
      year: "2026"
    },
    {
      src: "sqcqweq_ncn3om",
      alt: "Partner",
      aspect: "horizontal",
      year: "2026"
    }
  ];
}

const $$PartnerCarousel = createComponent(($$result, $$props, $$slots) => {
  const rawPartners = getPartners();
  const partners = rawPartners.length < 10 ? [...rawPartners, ...rawPartners, ...rawPartners] : rawPartners;
  const carouselItems = [...partners, ...partners];
  return renderTemplate`${maybeRenderHead()}<section class="relative py-16 overflow-hidden bg-body border-y border-border/40" data-astro-cid-27oxmg55> <div class="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-body to-transparent z-10" data-astro-cid-27oxmg55></div> <div class="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-body to-transparent z-10" data-astro-cid-27oxmg55></div> <div class="flex overflow-hidden relative z-0" data-astro-cid-27oxmg55> <div class="flex gap-16 animate-infinite-scroll items-center hover:pause-animation" data-astro-cid-27oxmg55> ${carouselItems.map((partner, index) => renderTemplate`<div class="shrink-0 w-[180px] h-[100px] flex items-center justify-center group bg-white rounded-xl p-4 hover:scale-105 transition-all duration-500 shadow-md hover:shadow-xl ring-1 ring-slate-200" data-astro-cid-27oxmg55> ${renderComponent($$result, "CloudinaryImage", $$CloudinaryImage, { "src": partner.src, "alt": partner.name, "widths": [180, 360], "sizes": "180px", "crop": "pad", "class": "partner-logo transition-transform duration-300", "data-astro-cid-27oxmg55": true })} </div>`)} </div> </div> </section> `;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/PartnerCarousel.astro", void 0);

function getSponsors() {
  return [
    {
      src: "3x3anderslogo_itwm3g",
      alt: "3x3 Anders",
      aspect: "horizontal",
      year: "2026"
    },
    {
      src: "BeeldpakkerLogo_wijjmq",
      alt: "Beeld Pakker",
      aspect: "horizontal",
      year: "2026"
    },
    {
      src: "LogoLayout_1_iphclc",
      alt: "Mojo Dojo",
      aspect: "horizontal",
      year: "2026"
    },
    {
      src: "SterkinVloerenLOGO_zrdofb",
      alt: "Sterk in Vloeren",
      aspect: "horizontal",
      year: "2026"
    }
  ];
}

const $$SponsorSection = createComponent(($$result, $$props, $$slots) => {
  const sponsors = getSponsors();
  return renderTemplate`${maybeRenderHead()}<section class="py-24 relative overflow-hidden">  <div class="absolute inset-0 z-0 pointer-events-none"> <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[128px]"></div> <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-action-blue/5 rounded-full blur-[128px]"></div> </div> <div class="container mx-auto px-4 relative z-10"> <div class="text-center mb-16"> <h2 class="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
Onze <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-action-blue">Partners</span> </h2> <p class="text-muted max-w-2xl mx-auto text-lg leading-relaxed">
Mede mogelijk gemaakt door deze fantastische organisaties die onze visie ondersteunen.
</p> </div> ${sponsors.length > 0 ? renderTemplate`<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"> ${sponsors.map((sponsor) => renderTemplate`<div class="group relative aspect-[3/2] flex items-center justify-center p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl backdrop-blur-md transition-all duration-300 hover:border-brand-orange/30 hover:shadow-[0_0_30px_-10px_rgba(255,147,40,0.15)]">  <div class="absolute inset-0 bg-gradient-to-br from-brand-orange/0 to-action-blue/0 opacity-0 group-hover:from-brand-orange/5 group-hover:to-action-blue/5 group-hover:opacity-100 transition-all duration-500 rounded-xl"></div> ${renderComponent($$result, "CloudinaryImage", $$CloudinaryImage, { "src": sponsor.src, "widths": [400, 600, 800], "sizes": "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw", "alt": sponsor.alt, "class": "relative z-10 w-full h-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 mix-blend-multiply dark:mix-blend-screen" })} </div>`)} </div>` : renderTemplate`<div class="text-center py-12 glass-card rounded-2xl max-w-lg mx-auto"> <p class="text-muted">Nog geen sponsoren geladen.</p> </div>`} <div class="mt-16 text-center"> <a href="/contact" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-brand-orange rounded-full hover:bg-orange-600 hover:shadow-lg hover:shadow-brand-orange/25 hover:-translate-y-0.5">
Ook Sponsor Worden?
</a> </div> </div> </section>`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/SponsorSection.astro", void 0);

function VideoShowcase({ videos }) {
  const sortedVideos = [...videos].sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const uniqueVideos = sortedVideos.reduce((acc, current) => {
    const x = acc.find((item) => item.year === current.year);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  const [activeVideo, setActiveVideo] = useState(uniqueVideos[0] || videos[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const handleVideoChange = (video) => {
    setActiveVideo(video);
    setIsPlaying(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "group relative rounded-3xl p-2 bg-surface border border-border hover:border-brand-blue-light/30 transition-colors duration-500 shadow-xl h-full flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-brand-blue/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col gap-4 h-full", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl overflow-hidden w-full shadow-inner bg-black aspect-video relative", children: isPlaying ? /* @__PURE__ */ jsx(
        "iframe",
        {
          src: `https://streamable.com/e/${activeVideo.shortcode}?autoplay=1`,
          className: "absolute inset-0 w-full h-full",
          frameBorder: "0",
          width: "100%",
          height: "100%",
          allowFullScreen: true,
          style: { width: "100%", height: "100%", position: "absolute", left: 0, top: 0, overflow: "hidden" },
          allow: "autoplay;"
        }
      ) : /* @__PURE__ */ jsxs(
        "div",
        {
          className: "streamable-facade relative w-full h-full cursor-pointer bg-black/10 group/facade",
          onClick: () => setIsPlaying(true),
          children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: `https://thumbs-east.streamable.com/image/${activeVideo.shortcode}.jpg`,
                onError: (e) => {
                  e.currentTarget.src = "https://placehold.co/1920x1080/000000/FFF?text=Video+Laden";
                  e.currentTarget.onerror = null;
                },
                alt: activeVideo.title,
                className: "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/facade:scale-105",
                loading: "lazy"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/20 group-hover/facade:bg-black/10 transition-colors" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-transform duration-300 group-hover/facade:scale-110 shadow-xl", children: /* @__PURE__ */ jsx(Play, { className: "w-6 h-6 text-white ml-1", fill: "currentColor" }) }) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "px-4 pb-2 flex justify-between items-center mt-auto", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-display font-bold text-primary group-hover:text-brand-sky transition-colors", children: activeVideo.title }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted text-sm flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsx(Play, { className: "w-3 h-3 text-brand-orange" }),
            "Officiële Aftermovie ",
            activeVideo.year
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: uniqueVideos.map((video) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleVideoChange(video),
            className: cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border",
              activeVideo.year === video.year ? "bg-brand-orange text-white border-brand-orange shadow-md" : "bg-surface text-muted border-border hover:border-brand-orange/50 hover:text-primary"
            ),
            children: video.year
          },
          video.year
        )) })
      ] })
    ] })
  ] });
}

function LiveImageGrid({ images }) {
  const slotSize = Math.floor(images.length / 4);
  const gridSlots = [
    images.slice(0, slotSize),
    // Slot 0
    images.slice(slotSize, slotSize * 2),
    // Slot 1
    images.slice(slotSize * 2, slotSize * 3),
    // Slot 2
    images.slice(slotSize * 3)
    // Slot 3
  ];
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 grid-rows-2 gap-4 h-full min-h-[400px]", children: gridSlots.map((stack, slotIndex) => /* @__PURE__ */ jsx(FadingCell, { images: stack, offset: slotIndex * 2e3 }, slotIndex)) });
}
function FadingCell({ images, offset }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 6e3);
      return () => clearInterval(interval);
    }, offset);
    return () => clearTimeout(timeout);
  }, [images.length, offset]);
  return /* @__PURE__ */ jsx("div", { className: "relative rounded-2xl overflow-hidden group border border-white/10 shadow-md bg-surface w-full h-full", children: images.map((img, index) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: `absolute inset-0 transition-all duration-2000 ease-in-out ${index === currentIndex ? "opacity-100 scale-110" : "opacity-0 scale-100"}`,
      style: {
        // Ken Burns effect: de actieve foto zoomt heel langzaam nog iets verder in
        transitionProperty: "opacity, transform"
      },
      children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: img.src,
            alt: img.alt,
            className: "w-full h-full object-cover",
            loading: "lazy"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-brand-blue/20 mix-blend-multiply" }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-brand-blue/90 via-brand-blue/40 to-transparent flex items-end", children: /* @__PURE__ */ jsx(
          "p",
          {
            className: "text-white font-medium text-sm font-display tracking-wide drop-shadow-md translate-y-2 opacity-0 transition-all duration-500 delay-300",
            style: {
              opacity: index === currentIndex ? 1 : 0,
              transform: index === currentIndex ? "translateY(0)" : "translateY(10px)"
            },
            children: img.alt
          }
        ) })
      ]
    },
    img.src + index
  )) });
}

const gallery = [
  {
    src: "WhatsApp_Image_2025-05-17_at_19.12.14_8ab77c07_gs2zsy",
    alt: "Sfeerimpressie DKL 2025",
    aspect: "vertical",
    year: "2025"
  },
  {
    src: "WhatsApp_Image_2025-05-17_at_19.21.14_3f7fd59e_gme3eo",
    alt: "Sfeerimpressie DKL 2025",
    aspect: "horizontal",
    year: "2025"
  },
  {
    src: "WhatsApp_Image_2025-05-17_at_19.21.14_acb21990_pnlxto",
    alt: "Sfeerimpressie DKL 2025",
    aspect: "vertical",
    year: "2025"
  },
  {
    src: "WhatsApp_Image_2025-05-17_at_19.21.15_5468f944_go97uz",
    alt: "Sfeerimpressie DKL 2025",
    aspect: "horizontal",
    year: "2025"
  },
  {
    src: "WhatsApp_Image_2025-05-17_at_19.21.15_acf57c9c_hrdiqk",
    alt: "Sfeerimpressie DKL 2025",
    aspect: "horizontal",
    year: "2025"
  },
  {
    src: "WhatsApp_Image_2025-05-17_at_19.21.15_d34fe483_feytla",
    alt: "Sfeerimpressie DKL 2025",
    aspect: "horizontal",
    year: "2025"
  }
];

const $$MediaMosaic = createComponent(async ($$result, $$props, $$slots) => {
  videos.find((v) => v.featured) || videos[0];
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  const [images2024, images2025] = await Promise.all([
    getImagesFromFolder("De Koninklijkeloop/DKLFoto's 2024", "2024"),
    getImagesFromFolder("De Koninklijkeloop/DKLFoto's 2025", "2025")
  ]);
  const cloudImages = [...images2025, ...images2024];
  let mappedImages = cloudImages.map((img) => ({
    src: `https://res.cloudinary.com/${"dgfuv7wif"}/image/upload/${img.src}`,
    alt: img.alt || `Sfeerimpressie DKL ${img.year}`,
    class: "h-full w-full object-cover"
  }));
  if (mappedImages.length < 16) {
    console.log(`[MediaMosaic] Only found ${mappedImages.length} images. Augmenting with local gallery.`);
    const localFallback = gallery.map((img) => ({
      src: `https://res.cloudinary.com/dgfuv7wif/image/upload/${img.src}`,
      alt: img.alt,
      class: "h-full w-full object-cover"
    }));
    const combined = [...mappedImages, ...localFallback];
    const uniqueMap = /* @__PURE__ */ new Map();
    combined.forEach((img) => uniqueMap.set(img.src, img));
    mappedImages = Array.from(uniqueMap.values());
  }
  let displayImages = shuffleArray([...mappedImages]);
  if (displayImages.length > 0) {
    while (displayImages.length < 16) {
      displayImages = [...displayImages, ...shuffleArray([...mappedImages])];
    }
  }
  if (displayImages.length > 32) {
    displayImages = displayImages.slice(0, 32);
  }
  return renderTemplate`${maybeRenderHead()}<section class="py-24 relative overflow-hidden bg-body"> <div class="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-brand-blue-light/10 rounded-full blur-[128px] pointer-events-none -z-10"></div> <div class="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[128px] pointer-events-none -z-10"></div> <div class="max-w-7xl mx-auto px-6 relative z-10"> <div class="text-center mb-16 space-y-4"> <h2 class="text-4xl md:text-5xl font-display font-bold text-primary tracking-tight">
Beleef de <span class="text-transparent bg-clip-text bg-linear-to-r from-brand-orange to-orange-400">Sfeer</span> </h2> <p class="text-muted text-lg max-w-2xl mx-auto">
Van de energieke start tot de feestelijke finish. Bekijk de
                hoogtepunten van de laatste editie.
</p> </div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"> <div class="group relative rounded-3xl p-2 bg-surface border border-border hover:border-brand-blue-light/30 transition-colors duration-500 shadow-xl h-full flex flex-col"> <div class="absolute inset-0 bg-brand-blue/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div> ${renderComponent($$result, "VideoShowcase", VideoShowcase, { "videos": [
    videos.find((v) => v.year === "2025" && v.featured),
    videos.find((v) => v.year === "2024" && v.featured)
  ].filter(Boolean), "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/islands/VideoShowcase", "client:component-export": "default" })} </div> <div class="h-full min-h-[400px]"> ${renderComponent($$result, "LiveImageGrid", LiveImageGrid, { "images": displayImages, "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/islands/LiveImageGrid", "client:component-export": "default" })} </div> </div> <div class="mt-12 text-center"> <a href="/media"> ${renderComponent($$result, "Button", Button, { "variant": "ghost", "size": "lg", "className": "rounded-full px-8 border border-border text-primary hover:bg-surface hover:text-brand-orange transition-all group" }, { "default": async ($$result2) => renderTemplate`
Bekijk alle foto's
${renderComponent($$result2, "ArrowRight", ArrowRight, { "className": "ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" })} ` })} </a> </div> </div> </section>`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/MediaMosaic.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "De Koninklijke Loop 2026 | Inclusief Wandelevenement" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Navbar", $$Navbar, {})} ${maybeRenderHead()}<main> ${renderComponent($$result2, "HeroSection", $$HeroSection, {})} ${renderComponent($$result2, "MissionSection", $$MissionSection, {})} ${renderComponent($$result2, "PartnerCarousel", $$PartnerCarousel, {})} ${renderComponent($$result2, "SponsorSection", $$SponsorSection, {})} ${renderComponent($$result2, "CharitySpotlight", $$CharitySpotlight, {})} ${renderComponent($$result2, "MediaMosaic", $$MediaMosaic, {})} </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/index.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
