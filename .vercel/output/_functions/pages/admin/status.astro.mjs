import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_B02uxOAN.mjs';
import { a as api, C as ConvexClientProvider } from '../../chunks/api_BSdU9rnf.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { a as apiRequest } from '../../chunks/api_BpZ7vVKF.mjs';
import { $ as $user } from '../../chunks/auth_ELwR6sTw.mjs';
import { useStore } from '@nanostores/react';
export { renderers } from '../../renderers.mjs';

function SystemStatus() {
  const user = useStore($user);
  const [backendHealth, setBackendHealth] = useState("pending");
  const [authStatus, setAuthStatus] = useState("pending");
  const [backendLatency, setBackendLatency] = useState(null);
  const convexData = useQuery(api.public.ping);
  useEffect(() => {
    checkBackend();
    checkAuth();
  }, []);
  const checkBackend = async () => {
    const start = performance.now();
    try {
      const res = await fetch("https://laventecareauthsystems.onrender.com/health");
      if (res.ok) {
        setBackendHealth("success");
        setBackendLatency(Math.round(performance.now() - start));
      } else {
        setBackendHealth("error");
      }
    } catch (e) {
      console.error(e);
      setBackendHealth("error");
    }
  };
  const checkAuth = async () => {
    if (!user) {
      setAuthStatus("error");
      return;
    }
    try {
      await apiRequest("/me");
      setAuthStatus("success");
    } catch (e) {
      console.error(e);
      setAuthStatus("error");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-text-body mb-6", children: "Systeem Status" }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
      /* @__PURE__ */ jsx(
        StatusCard,
        {
          title: "Backend Services (Go)",
          status: backendHealth,
          detail: backendLatency ? `${backendLatency}ms` : "Checking..."
        }
      ),
      /* @__PURE__ */ jsx(
        StatusCard,
        {
          title: "Authenticatie & Tenant",
          status: authStatus,
          detail: user ? `Ingelogd als ${user.email}` : "Niet ingelogd"
        }
      ),
      /* @__PURE__ */ jsx(
        StatusCard,
        {
          title: "Convex Realtime DB",
          status: convexData !== void 0 ? "success" : "pending",
          detail: convexData !== void 0 ? "Verbonden" : "Verbinden..."
        }
      )
    ] })
  ] });
}
function StatusCard({ title, status, detail }) {
  const colors = {
    pending: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    success: "bg-green-500/10 border-green-500/20 text-green-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400"
  };
  const icons = {
    pending: "⏳",
    success: "✅",
    error: "❌"
  };
  return /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl border flex items-center justify-between ${colors[status]}`, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "font-medium text-text-body", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-sm opacity-80", children: detail })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-xl", children: icons[status] })
  ] });
}

const prerender = false;
const $$Status = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "System Diagnostics | De Koninklijke Loop" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto space-y-8"> <div> <h1 class="text-3xl font-display font-bold text-text-primary">Systeem Status</h1> <p class="text-text-muted mt-1">Real-time status van database, API en services.</p> </div> <div class="glass-card rounded-3xl p-8 border border-glass-border"> ${renderComponent($$result2, "ConvexClientProvider", ConvexClientProvider, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/islands/ConvexClientProvider", "client:component-export": "ConvexClientProvider" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "SystemStatus", SystemStatus, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/islands/SystemStatus", "client:component-export": "default" })} ` })} </div> </div> ` })}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/admin/status.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/admin/status.astro";
const $$url = "/admin/status";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Status,
    file: $$file,
    prerender,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
