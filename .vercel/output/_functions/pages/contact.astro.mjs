import { e as createComponent, m as maybeRenderHead, g as addAttribute, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { s as siteConfig, $ as $$BaseLayout, a as $$Navbar, b as $$Footer } from '../chunks/Footer_vW1z91-v.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { c as cn, B as Button } from '../chunks/button_CPvoipf7.mjs';
import { L as Label, I as Input } from '../chunks/label_0OJ09Ij3.mjs';
import * as React from 'react';
import { useState } from 'react';
import { Mail, HelpCircle, Instagram, Facebook, Linkedin, ChevronDown, ArrowRight } from 'lucide-react';
export { renderers } from '../renderers.mjs';

const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[120px] w-full rounded-xl border border-glass-border bg-glass-bg px-4 py-3 text-sm text-primary shadow-sm transition-all placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:border-accent-primary disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-xl hover:bg-glass-bg/80 resize-y",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";

const schema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 karakters zijn"),
  email: z.string().email("Ongeldig email adres"),
  message: z.string().min(10, "Bericht moet minimaal 10 karakters zijn")
});
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    console.log(data);
    setIsSubmitting(false);
    setSuccess(true);
  };
  if (success) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl text-center animate-fade-in", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-2", children: "Bericht Verzonden!" }),
      /* @__PURE__ */ jsx("p", { children: "We nemen zo snel mogelijk contact met je op." }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", className: "mt-4", onClick: () => setSuccess(false), children: "Nog een bericht sturen" })
    ] });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Naam" }),
      /* @__PURE__ */ jsx(Input, { id: "name", ...register("name"), placeholder: "Jouw naam" }),
      errors.name && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-xs", children: errors.name.message })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
      /* @__PURE__ */ jsx(Input, { id: "email", type: "email", ...register("email"), placeholder: "jouw@email.nl" }),
      errors.email && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-xs", children: errors.email.message })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "message", children: "Bericht" }),
      /* @__PURE__ */ jsx(Textarea, { id: "message", ...register("message"), placeholder: "Waar kunnen we je mee helpen?" }),
      errors.message && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-xs", children: errors.message.message })
    ] }),
    /* @__PURE__ */ jsx(Button, { type: "submit", variant: "default", className: "w-full", disabled: isSubmitting, children: isSubmitting ? "Verzenden..." : "Verstuur Bericht" })
  ] });
}

const $$ContactSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="py-12 md:py-24"> <div class="grid lg:grid-cols-2 gap-16 items-start">  <div class="space-y-12"> <div> <h2 class="text-3xl md:text-4xl font-display font-bold text-primary mb-6">
We horen graag van je
</h2> <p class="text-lg text-secondary leading-relaxed">
Heb je vragen over de inschrijving, het parcours of wil je helpen als vrijwilliger? 
                    Ons team staat klaar om je vragen te beantwoorden.
</p> </div> <div class="grid gap-6">  <a${addAttribute(`mailto:${siteConfig.contact.email}`, "href")} class="glass-card p-6 rounded-2xl group hover:border-brand-orange/50 transition-all duration-300"> <div class="flex items-center gap-4"> <div class="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform"> ${renderComponent($$result, "Mail", Mail, { "className": "w-6 h-6" })} </div> <div> <h3 class="text-sm font-bold text-primary uppercase tracking-wider mb-1">Email ons</h3> <p class="text-lg text-secondary group-hover:text-brand-orange transition-colors"> ${siteConfig.contact.email} </p> </div> </div> </a>  <a href="/faq" class="glass-card p-6 rounded-2xl group hover:border-brand-blue-light/50 transition-all duration-300"> <div class="flex items-center gap-4"> <div class="w-12 h-12 bg-brand-blue-light/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"> ${renderComponent($$result, "HelpCircle", HelpCircle, { "className": "w-6 h-6" })} </div> <div> <h3 class="text-sm font-bold text-primary uppercase tracking-wider mb-1">Veelgestelde Vragen</h3> <p class="text-lg text-secondary">
Bekijk onze FAQ
</p> </div> </div> </a> </div>  <div> <h3 class="text-lg font-bold text-primary mb-6">Volg ons online</h3> <div class="flex gap-4"> <a${addAttribute(siteConfig.social.instagram, "href")} target="_blank" rel="noopener noreferrer" class="w-12 h-12 glass-card rounded-full flex items-center justify-center text-secondary hover:text-brand-orange hover:border-brand-orange/30 transition-all hover:-translate-y-1"> ${renderComponent($$result, "Instagram", Instagram, { "className": "w-5 h-5" })} </a> <a${addAttribute(siteConfig.social.facebook, "href")} target="_blank" rel="noopener noreferrer" class="w-12 h-12 glass-card rounded-full flex items-center justify-center text-secondary hover:text-blue-400 hover:border-blue-400/30 transition-all hover:-translate-y-1"> ${renderComponent($$result, "Facebook", Facebook, { "className": "w-5 h-5" })} </a> <a${addAttribute(siteConfig.social.linkedin, "href")} target="_blank" rel="noopener noreferrer" class="w-12 h-12 glass-card rounded-full flex items-center justify-center text-secondary hover:text-blue-500 hover:border-blue-500/30 transition-all hover:-translate-y-1"> ${renderComponent($$result, "Linkedin", Linkedin, { "className": "w-5 h-5" })} </a> </div> </div> </div>  <div class="premium-glass p-8 md:p-10 rounded-3xl relative overflow-hidden"> <div class="absolute top-0 right-0 p-12 opacity-5 text-brand-orange pointer-events-none"> ${renderComponent($$result, "Mail", Mail, { "className": "w-64 h-64" })} </div> <div class="relative z-10"> <h3 class="text-2xl font-display font-bold text-primary mb-6">Stuur een bericht</h3> ${renderComponent($$result, "ContactForm", ContactForm, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/islands/ContactForm", "client:component-export": "default" })} </div> </div> </div> </section>`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/ContactSection.astro", void 0);

function FAQAccordion({ items }) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [openId, setOpenId] = useState(null);
  const toggleItem = (questionId) => {
    const id = `${activeCategoryIndex}-${questionId}`;
    setOpenId(openId === id ? null : id);
  };
  const activeCategory = items[activeCategoryIndex];
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:grid md:grid-cols-12 gap-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "md:col-span-4", children: [
      /* @__PURE__ */ jsx("div", { className: "md:hidden mb-4 text-xs font-bold text-muted uppercase tracking-widest pl-1", children: "Kies een onderwerp" }),
      /* @__PURE__ */ jsx("div", { className: "flex md:flex-col gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide snap-x px-1", children: items.map((category, index) => {
        const isActive = activeCategoryIndex === index;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setActiveCategoryIndex(index);
              setOpenId(null);
            },
            className: cn(
              "relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-500 min-w-[85%] md:min-w-0 snap-center text-left group border",
              isActive ? "bg-gradient-to-r from-brand-orange to-orange-600 text-white border-brand-orange shadow-lg shadow-brand-orange/20 scale-[1.02]" : "bg-surface/40 md:bg-transparent border-white/5 hover:bg-surface/50 hover:border-white/10 text-secondary hover:text-primary"
            ),
            children: [
              /* @__PURE__ */ jsx("span", { className: cn(
                "text-2xl shrink-0 transition-transform duration-500",
                isActive ? "scale-110 drop-shadow-md" : "group-hover:scale-110 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
              ), children: category.icon }),
              /* @__PURE__ */ jsx("span", { className: cn(
                "font-display font-medium tracking-wide truncate",
                isActive ? "text-white" : "text-secondary group-hover:text-primary"
              ), children: category.title }),
              isActive && /* @__PURE__ */ jsx("div", { className: "hidden md:block absolute right-4 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse" })
            ]
          },
          index
        );
      }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "md:col-span-8 min-h-[500px]", children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "premium-glass rounded-3xl p-6 md:p-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-8 md:hidden flex items-center gap-3 border-b border-white/5 pb-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl filter drop-shadow-lg", children: activeCategory.icon }),
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-display font-bold text-primary tracking-tight", children: activeCategory.title })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: activeCategory.questions.map((item, qIndex) => {
            const isOpen = openId === `${activeCategoryIndex}-${qIndex}`;
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: cn(
                  "rounded-2xl border transition-all duration-500 overflow-hidden group/item",
                  isOpen ? "bg-brand-blue-light/10 border-accent-primary/40 shadow-lg shadow-brand-orange/5" : "bg-white/2 border-white/5 hover:border-white/10 hover:bg-white/5"
                ),
                children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => toggleItem(qIndex),
                      className: "w-full px-5 py-5 flex items-center justify-between text-left focus:outline-none",
                      children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 pr-4", children: [
                          /* @__PURE__ */ jsx("span", { className: cn(
                            "text-xl transition-all duration-500",
                            isOpen ? "opacity-100 scale-110" : "opacity-50 grayscale group-hover/item:opacity-100 group-hover/item:grayscale-0"
                          ), children: item.icon }),
                          /* @__PURE__ */ jsx("span", { className: cn(
                            "text-lg font-medium transition-colors duration-300",
                            isOpen ? "text-accent-primary" : "text-primary group-hover/item:text-white"
                          ), children: item.question })
                        ] }),
                        /* @__PURE__ */ jsx("div", { className: cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shrink-0",
                          isOpen ? "bg-accent-primary/20 text-accent-primary rotate-180" : "bg-white/5 text-secondary group-hover/item:bg-white/10"
                        ), children: /* @__PURE__ */ jsx(ChevronDown, { className: "w-5 h-5" }) })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: cn(
                        "transition-all duration-500 ease-in-out overflow-hidden",
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      ),
                      children: /* @__PURE__ */ jsxs("div", { className: "px-5 pb-8 pt-0 pl-[4rem] md:pl-[4.5rem]", children: [
                        /* @__PURE__ */ jsx("p", { className: "text-secondary text-base leading-relaxed max-w-2xl", children: item.answer }),
                        item.action && /* @__PURE__ */ jsxs(
                          "a",
                          {
                            href: item.actionText?.includes("inschrijven") ? "/register" : "/contact",
                            className: "inline-flex items-center gap-2 mt-6 text-sm font-bold text-white bg-accent-primary hover:bg-orange-600 px-5 py-2.5 rounded-lg shadow-lg shadow-brand-orange/20 transition-all hover:scale-105 active:scale-95",
                            children: [
                              item.actionText,
                              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
                            ]
                          }
                        )
                      ] })
                    }
                  )
                ]
              },
              qIndex
            );
          }) })
        ]
      },
      activeCategoryIndex
    ) })
  ] });
}

const faqData = [
  {
    title: "Over het evenement",
    icon: "❗",
    questions: [
      {
        question: "Wat maakt De Koninklijke Loop zo bijzonder?",
        answer: "De Koninklijke Loop is een sponsorloop mede georganiseerd door mensen met een beperking voor mensen met een beperking. We lopen de route over de Koninklijke weg, een rolstoelvriendelijke wandelroute.",
        icon: "🏃"
      },
      {
        question: "Waar vindt de Koninklijke Loop plaats?",
        answer: "De Koninklijke Loop vindt plaats op de Koninklijke Weg, een rolstoelvriendelijke route. We lopen verschillende afstanden tussen Assel en Paleis het Loo, Apeldoorn. De deelnemers worden vanaf de Grote Kerk in Apeldoorn naar de startpunten van de verschillende afstanden gebracht. Vanuit hier wandelen de deelnemers naar de finish, de Grote Kerk, waar de feestelijke inhuldiging plaatsvindt.",
        icon: "📍"
      },
      {
        question: "Wanneer vindt de Koninklijke Loop 2026 plaats?",
        answer: "De Koninklijke Loop vindt op zaterdag 17 mei 2026 plaats.",
        icon: "📅"
      },
      {
        question: "Kun je winnen bij de Koninklijke Loop?",
        answer: "De Koninklijke Loop is geen wedstrijd. Wel krijgt iedereen die de finish haalt een mooie medaille. Dus ook al is het geen wedstrijd, bij de Koninklijke Loop is iedereen een winnaar.",
        icon: "🏆"
      }
    ]
  },
  {
    title: "Deelname",
    icon: "🏅",
    questions: [
      {
        question: "Hoe kan ik meedoen?",
        answer: "Super dat je mee wilt doen! Je kunt je nu al inschrijven voor De Koninklijke Loop 2026. Vul het formulier in en je ontvangt direct een bevestiging.",
        icon: "✍",
        action: true,
        actionText: "Schrijf je nu in"
      },
      {
        question: "Moet je betalen om mee te doen met DKL 26?",
        answer: "Deelname aan de loop is helemaal gratis. Wel moet je jezelf van tevoren opgeven.",
        icon: "💸"
      },
      {
        question: "Wat als je hulp of begeleiding nodig hebt tijdens de loop?",
        answer: "Een begeleider of iemand die je helpt, kan zich ook via het formulier opgeven. Heb je niemand die je kan begeleiden of helpen en heb je dit wel nodig, geef dit even aan bij de bijzonderheden, dan kijken we of we je vanuit de organisatie kunnen helpen.",
        icon: "🤖"
      },
      {
        question: "Hoeveel mensen kunnen er maximaal meelopen tijdens DKL 26?",
        answer: "Er kunnen maximaal 75 mensen meedoen met de Koninklijke Loop. Zorg dus dat je op tijd inschrijft!",
        icon: "💡"
      },
      {
        question: "Wanneer sluit de inschrijving?",
        answer: "Je kunt je inschrijven t/m 7 mei 2026. Let wel op: er kunnen maximaal 75 wandelaars deelnemen, dus wees er op tijd bij!",
        icon: "⚠"
      },
      {
        question: "Oeps, ik kan toch niet meedoen. Wat nu?",
        answer: "Wat vervelend, maar je kunt je altijd afmelden via de contactgegevens van de organisatie. Deze heb je gekregen bij je aanmelding. Of je kunt het contactformulier op deze site gebruiken. Voor de afmelding worden verder geen kosten in rekening gebracht.",
        icon: "😢"
      }
    ]
  },
  {
    title: "Looproutes",
    icon: "🗺",
    questions: [
      {
        question: "Welke afstanden kan ik kiezen?",
        answer: "Je kunt kiezen uit de 15, 10, 6 of 2,5 km.",
        icon: "🚩"
      },
      {
        question: "Is de 2,5 km iets voor mij?",
        answer: "Tijdens de 2,5 km afstand lopen we vanaf Berg en Bos in Apeldoorn door de groene buitenwijken rond Paleis het Loo naar de finish. Hier wandel je over vlak terrein en deze afstand is geschikt voor de onervaren wandelaar.",
        icon: "🌱"
      },
      {
        question: "Hoe pittig is de 6 km?",
        answer: "In Hoog Soeren start de loop van de 6 kilometer. Hier ga je over heuvelachtig landschap, deze afstand is geschikt voor de licht getrainde wandelaar.",
        icon: "⛰"
      },
      {
        question: "Ben ik klaar voor de 10 km?",
        answer: "Bij halte Assel is het beginpunt van de 10 kilometerloop. Over de prachtige Asselse hei lopen we dan verder naar Hoog Soeren en Apeldoorn. Voor de 10 km moet je een redelijk goed getrainde wandelaar zijn en ga je door heuvelachtig gebied.",
        icon: "🌄"
      },
      {
        question: "Wie durft de 15 km aan?",
        answer: "Bij het oude kerkje in het hartje Kootwijk start de 15 km van de Koninklijk Loop. De 15 km is geschikt voor getrainde lopers, want je gaat over heuvelachtig terrein lopen.",
        icon: "🏃🏻♂️"
      }
    ]
  },
  {
    title: "Ondersteuning",
    icon: "⚡",
    questions: [
      {
        question: "Zijn er plekken om even op adem te komen?",
        answer: "Er zijn diverse punten onderweg waar je even kunt zitten en uitrusten, hier wordt drinken uitgedeeld. Voordat je start, krijg je ook een pakketje met drinken en wat snacks mee. Dus als je moe bent, kun je ook tussen de rustpunten door even stoppen.",
        icon: "☕"
      },
      {
        question: "Is er hulp tijdens de loop?",
        answer: "Heb je een persoonlijke begeleider of hulp nodig, dan kan hij of zij zich ook inschrijven voor de loop. Tijdens de loop lopen er ook verschillende vrijwilligers mee om de loop in zijn geheel te begeleiden. Zij hebben bijvoorbeeld een EHBO-kit bij zich en kunnen medische hulp verlenen.",
        icon: "🪑"
      },
      {
        question: "Kan ik zelf vrijwilliger worden?",
        answer: "Alle hulp is welkom! Neem contact op via het contactformulier, we horen graag van je!",
        icon: "🦾"
      }
    ]
  },
  {
    title: "Goede doel & sponsoring",
    icon: "💰",
    questions: [
      {
        question: "Hoe kan ik doneren?",
        answer: "Doneren kan direct via onze GoFundMe pagina. Alle giften komen, op de administratieve kosten van GoFundMe na, volledig ten goede van het Liliane Fonds.",
        icon: "💳"
      },
      {
        question: "Welk goed doel steunen we dit jaar?",
        answer: "Dit jaar is het goede doel wederom het Liliane Fonds. Het Liliane Fonds ondersteunt wereldwijd kinderen met een beperking en helpt hen door hun leefsituatie te verbeteren.",
        icon: "❤️"
      },
      {
        question: "Wil je ons als bedrijf of organisatie sponsoren?",
        answer: "Bedrijven of organisaties zijn natuurlijk van harte welkom om de Koninklijke Loop of het goede doel te sponsoren. We horen graag van je via ons contactformulier.",
        icon: "👨💼"
      }
    ]
  },
  {
    title: "Contact",
    icon: "📞",
    questions: [
      {
        question: "Hoe kan ik contact opnemen?",
        answer: "Je kunt direct contact met ons opnemen via het contactformulier. We reageren zo snel mogelijk op je bericht.",
        icon: "✉️",
        action: true,
        actionText: "Open contactformulier"
      }
    ]
  }
];

const $$FAQSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="py-16 md:py-24 relative overflow-hidden" id="faq"> <div class="max-w-3xl mx-auto px-6 relative z-10"> <div class="text-center mb-12"> <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-blue-light/10 text-brand-sky border border-white/10 mb-6"> ${renderComponent($$result, "HelpCircle", HelpCircle, { "className": "w-6 h-6 text-blue-400" })} </div> <h2 class="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
Veelgestelde Vragen
</h2> <p class="text-lg text-secondary">
Antwoorden op de meest voorkomende vragen over de loop.
</p> </div> ${renderComponent($$result, "FAQAccordion", FAQAccordion, { "client:visible": true, "items": faqData, "client:component-hydration": "visible", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/islands/FAQAccordion", "client:component-export": "default" })} <div class="mt-12 text-center"> <p class="text-muted">
Staat je vraag er niet tussen? <a href="/contact" class="text-brand-orange hover:underline font-medium">Neem contact op</a> </p> </div> </div> </section>`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/blocks/FAQSection.astro", void 0);

const $$Contact = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Contact | De Koninklijke Loop 2026" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Navbar", $$Navbar, {})} ${maybeRenderHead()}<main class="pt-32 pb-20 relative overflow-hidden">  <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue-light/10 rounded-full blur-[128px] pointer-events-none"></div> <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[128px] pointer-events-none"></div> <div class="max-w-7xl mx-auto px-6 relative z-10">  <div class="text-center max-w-4xl mx-auto mb-12"> <h1 class="text-5xl md:text-6xl font-display font-bold text-primary mb-6">
Neem <span class="text-transparent bg-clip-text bg-linear-to-r from-brand-orange to-orange-400">Contact</span> Op
</h1> <p class="text-xl text-secondary leading-relaxed max-w-2xl mx-auto">
Klaar om mee te lopen? Of wil je iets anders weten?
</p> </div> ${renderComponent($$result2, "ContactSection", $$ContactSection, {})} <div class="border-t border-white/5 mt-12"> ${renderComponent($$result2, "FAQSection", $$FAQSection, {})} </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/contact.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/contact.astro";
const $$url = "/contact";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Contact,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
