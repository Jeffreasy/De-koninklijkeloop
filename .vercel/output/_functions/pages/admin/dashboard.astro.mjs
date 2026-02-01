import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_B02uxOAN.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { a as api, C as ConvexClientProvider } from '../../chunks/api_BSdU9rnf.mjs';
import { useAction } from 'convex/react';
import { $ as $user, a as $accessToken } from '../../chunks/auth_ELwR6sTw.mjs';
import { useStore } from '@nanostores/react';
import { useState, useEffect } from 'react';
import { B as Button } from '../../chunks/button_CPvoipf7.mjs';
import { UserCheck, Loader2, Users, Map, Search } from 'lucide-react';
export { renderers } from '../../renderers.mjs';

function DashboardTable() {
  const user = useStore($user);
  const [isMounted, setIsMounted] = useState(false);
  const [registrations, setRegistrations] = useState(void 0);
  const [searchTerm, setSearchTerm] = useState("");
  const accessToken = useStore($accessToken);
  const getRegistrations = useAction(api.admin.getRegistrations);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    if (accessToken) {
      getRegistrations({ token: accessToken }).then((data) => setRegistrations(data)).catch((err) => console.error("Auth Failed", err));
    }
  }, [accessToken, getRegistrations]);
  if (!isMounted) return null;
  if (!user) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500", children: /* @__PURE__ */ jsx(UserCheck, { className: "w-6 h-6" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-text-primary", children: "Toegang Beveiligd" }),
        /* @__PURE__ */ jsx("p", { className: "text-text-muted", children: "Log in om het dashboard te bekijken." })
      ] }),
      /* @__PURE__ */ jsx("a", { href: "/login", children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Inloggen" }) })
    ] });
  }
  if (registrations === void 0) {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-20 text-text-muted animate-pulse gap-2", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }),
      /* @__PURE__ */ jsx("span", { children: "Gegevens ophalen..." })
    ] });
  }
  const filteredRegistrations = registrations.filter(
    (reg) => reg.name.toLowerCase().includes(searchTerm.toLowerCase()) || reg.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsx(
        StatsCard,
        {
          label: "Totaal Inschrijvingen",
          value: registrations.length.toString(),
          icon: /* @__PURE__ */ jsx(Users, { className: "w-5 h-5 text-accent-primary" }),
          trend: "+12% vs vorige maand"
        }
      ),
      /* @__PURE__ */ jsx(
        StatsCard,
        {
          label: "10 KMlopers",
          value: registrations.filter((r) => r.distance === "10").length.toString(),
          icon: /* @__PURE__ */ jsx(Map, { className: "w-5 h-5 text-blue-400" }),
          color: "blue"
        }
      ),
      /* @__PURE__ */ jsx(
        StatsCard,
        {
          label: "Vrijwilligers",
          value: registrations.filter((r) => r.role === "vrijwilliger").length.toString(),
          icon: /* @__PURE__ */ jsx(UserCheck, { className: "w-5 h-5 text-green-400" }),
          color: "green"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-glass-bg/40 backdrop-blur-xl shadow-2xl overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-5 border-b border-glass-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-display font-semibold text-text-primary hidden sm:block", children: "Recente Inschrijvingen" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 w-full sm:w-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex-1 sm:w-72 group", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-text-muted group-focus-within:text-accent-primary transition-colors" }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Zoeken...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "block w-full pl-9 pr-3 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary/50 transition-all"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "px-3 py-2 rounded-xl bg-glass-border/20 text-xs font-medium text-text-muted border border-glass-border whitespace-nowrap", children: filteredRegistrations.length })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-glass-bg/20 border-b border-glass-border", children: [
          /* @__PURE__ */ jsx("th", { className: "py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider", children: "Naam" }),
          /* @__PURE__ */ jsx("th", { className: "py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider hidden md:table-cell", children: "Email" }),
          /* @__PURE__ */ jsx("th", { className: "py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider", children: "Rol" }),
          /* @__PURE__ */ jsx("th", { className: "py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider", children: "Afstand" }),
          /* @__PURE__ */ jsx("th", { className: "py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider hidden md:table-cell", children: "Datum" }),
          /* @__PURE__ */ jsx("th", { className: "py-4 px-6 font-semibold text-text-muted text-xs uppercase tracking-wider text-right" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-glass-border/50", children: [
          filteredRegistrations.map((reg, index) => /* @__PURE__ */ jsxs(
            "tr",
            {
              className: "group hover:bg-white/[0.03] transition-colors duration-200",
              children: [
                /* @__PURE__ */ jsx("td", { className: "py-4 px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-glass-border to-transparent border border-glass-border flex items-center justify-center text-text-primary font-bold text-xs", children: reg.name.charAt(0).toUpperCase() }),
                  /* @__PURE__ */ jsx("div", { className: "font-medium text-text-primary", children: reg.name })
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "py-4 px-6 text-text-muted hidden md:table-cell", children: reg.email }),
                /* @__PURE__ */ jsx("td", { className: "py-4 px-6", children: /* @__PURE__ */ jsx(Badge, { role: reg.role }) }),
                /* @__PURE__ */ jsx("td", { className: "py-4 px-6 text-text-primary font-mono text-xs", children: reg.distance ? `${reg.distance} KM` : "-" }),
                /* @__PURE__ */ jsx("td", { className: "py-4 px-6 text-text-muted hidden md:table-cell", children: new Date(reg.createdAt).toLocaleDateString() }),
                /* @__PURE__ */ jsx("td", { className: "py-4 px-6 text-right", children: /* @__PURE__ */ jsxs("button", { className: "p-2 hover:bg-glass-border/30 rounded-lg transition-colors text-text-muted hover:text-text-primary", children: [
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Details" }),
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
                ] }) })
              ]
            },
            reg._id
          )),
          filteredRegistrations.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: 6, className: "py-16 text-center text-text-muted", children: [
            'Geen resultaten voor "',
            searchTerm,
            '"'
          ] }) })
        ] })
      ] }) })
    ] })
  ] });
}
function StatsCard({ label, value, icon, trend, color = "orange" }) {
  const gradients = {
    orange: "from-accent-primary/10 to-transparent",
    blue: "from-blue-500/10 to-transparent",
    green: "from-green-500/10 to-transparent"
  };
  const bgClass = gradients[color];
  return /* @__PURE__ */ jsxs("div", { className: `relative overflow-hidden bg-glass-bg/30 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 group`, children: [
    /* @__PURE__ */ jsx("div", { className: `absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgClass} blur-2xl opacity-50 -mr-10 -mt-10 pointer-events-none` }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex justify-between items-start", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-text-muted mb-1", children: label }),
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-display font-bold text-text-primary tracking-tight", children: value })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-2 rounded-xl bg-glass-border/20 border border-glass-border/20 text-text-primary", children: icon })
    ] }),
    trend && /* @__PURE__ */ jsx("div", { className: "mt-4 pt-4 border-t border-glass-border/50 flex items-center gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full", children: trend }) })
  ] });
}
function Badge({ role }) {
  const r = (role || "").toLowerCase();
  let styles = "bg-gray-500/10 text-gray-400 border-gray-500/20";
  let glowClass = "";
  if (r === "admin") {
    styles = "bg-red-500/10 text-red-400 border-red-500/20";
    glowClass = "shadow-[0_0_8px_rgba(239,68,68,0.3)]";
  }
  if (r === "vrijwilliger") {
    styles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    glowClass = "shadow-[0_0_8px_rgba(16,185,129,0.3)]";
  }
  if (r === "begeleider") {
    styles = "bg-blue-500/10 text-blue-400 border-blue-500/20";
    glowClass = "shadow-[0_0_8px_rgba(59,130,246,0.3)]";
  }
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${styles} ${glowClass} capitalize transition-all duration-200 hover:scale-105`, children: r.replace("_", " ") || "Onbekend" });
}

function DashboardWrapper() {
  return /* @__PURE__ */ jsx(ConvexClientProvider, { children: /* @__PURE__ */ jsx(DashboardTable, {}) });
}

const $$Dashboard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard | De Koninklijke Loop Admin" }, { "default": ($$result2) => renderTemplate`  ${renderComponent($$result2, "DashboardWrapper", DashboardWrapper, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/admin/DashboardWrapper", "client:component-export": "default" })} ` })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/admin/dashboard.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/admin/dashboard.astro";
const $$url = "/admin/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Dashboard,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
