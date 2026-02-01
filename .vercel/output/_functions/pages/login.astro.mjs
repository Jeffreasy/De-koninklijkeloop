import { e as createComponent, k as renderComponent, n as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Dvn5AkW6.mjs';
import 'piccolore';
import { $ as $$BaseLayout, a as $$Navbar, b as $$Footer } from '../chunks/Footer_vW1z91-v.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { a as apiRequest } from '../chunks/api_BpZ7vVKF.mjs';
import { s as setAuth } from '../chunks/auth_ELwR6sTw.mjs';
import { B as Button } from '../chunks/button_CPvoipf7.mjs';
import { L as Label, I as Input } from '../chunks/label_0OJ09Ij3.mjs';
export { renderers } from '../renderers.mjs';

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      const rawUser = data.User || data.user;
      if (!rawUser) {
        console.error("[LoginForm] 'User' or 'user' key missing in data:", Object.keys(data));
        throw new Error("Ongeldige server reactie (Geen user data)");
      }
      const user = {
        id: rawUser.ID || rawUser.id,
        email: rawUser.Email || rawUser.email,
        role: (rawUser.Role || rawUser.role || "").toLowerCase()
      };
      if (!user.role) {
        try {
          const meData = await apiRequest("/auth/me");
          if (meData.user && meData.user.role) {
            user.role = meData.user.role.toLowerCase();
          }
        } catch (e2) {
          console.error("[LoginForm] Could not fetch profile (Cookie missing?):", e2);
        }
      }
      if (!user.role) user.role = "viewer";
      setAuth(null, user);
      if (user.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("[LoginForm] Error:", err);
      setError(err.message || "Ongeldige inloggegevens. Probeer het opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "email",
          type: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          placeholder: "admin@dekoninklijkeloop.nl",
          required: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Wachtwoord" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "password",
          type: "password",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          placeholder: "••••••••",
          required: true
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      Button,
      {
        type: "submit",
        variant: "default",
        className: "w-full shadow-lg shadow-brand-primary/20",
        disabled: isSubmitting,
        children: isSubmitting ? "Inloggen..." : "Inloggen"
      }
    )
  ] });
}

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Login | De Koninklijke Loop" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Navbar", $$Navbar, {})} ${maybeRenderHead()}<main class="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center"> <div class="w-full max-w-md space-y-8"> <div class="text-center space-y-2"> <h1 class="text-3xl md:text-4xl font-display font-bold">
Welkom Terug
</h1> <p class="text-text-muted">
Log in om je inschrijving te beheren.
</p> </div> <div class="glass-card rounded-2xl p-8 space-y-6"> <!-- Registration Success Message --> <div id="success-message" class="hidden bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-center text-sm">
✅ Bedankt voor je inschrijving!<br>Je kunt nu inloggen.
</div> ${renderComponent($$result2, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/components/islands/LoginForm", "client:component-export": "default" })} <div class="text-center text-xs text-text-muted"> <a href="#" class="hover:text-text-body">Wachtwoord vergeten?</a> </div> </div> <div class="text-center text-sm text-text-muted"> <p>
Nog geen account? <a href="/register" class="text-text-body hover:underline">Schrijf je in</a> </p> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })} ${renderScript($$result, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/login.astro", void 0);

const $$file = "C:/Users/jeffrey/Desktop/Projecten/De-koninklijkeloop/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Login,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
