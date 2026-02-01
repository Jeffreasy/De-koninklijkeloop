import { d as defineMiddleware, s as sequence } from './chunks/index_QA_ymzEL.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_1kQD772m.mjs';
import 'piccolore';
import './chunks/astro/server_Dvn5AkW6.mjs';
import 'clsx';

const onRequest$1 = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect, locals } = context;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/_astro") || url.pathname.startsWith("/api/auth") || url.pathname.includes(".")) {
    return next();
  }
  const token = cookies.get("dkl_auth_token")?.value || cookies.get("access_token")?.value;
  let user = null;
  if (token) {
    try {
      const API_URL = "https://laventecareauthsystems.onrender.com/api/v1";
      const TENANT_ID = "b2727666-7230-4689-b58b-ceab8c2898d5";
      const verifyReq = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `access_token=${token}`,
          // Simulate browser
          "X-Tenant-ID": TENANT_ID
        }
      });
      if (verifyReq.ok) {
        user = await verifyReq.json();
        if (user.data) user = user.data;
        if (user.user) user = user.user;
      } else {
        console.warn(`[Middleware] Token validation failed: ${verifyReq.status}`);
      }
    } catch (error) {
      console.error(`[Middleware] Tunnel Error:`, error);
    }
  }
  locals.token = token || null;
  locals.user = user || null;
  const protectedRoutes = ["/admin", "/dashboard", "/profile"];
  const isProtected = protectedRoutes.some((path) => url.pathname.startsWith(path));
  if (isProtected) {
    if (!locals.user) {
      console.log(`[Middleware] Unauthorized access to ${url.pathname}. Redirecting.`);
      return redirect("/login");
    }
    if (url.pathname.startsWith("/admin") && locals.user.role !== "admin") {
      console.log(`[Middleware] Forbidden access (Role mismatch) to ${url.pathname}.`);
      return redirect("/dashboard");
    }
  }
  const response = await next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
