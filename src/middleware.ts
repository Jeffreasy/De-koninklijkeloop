import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const { request, cookies, redirect, locals } = context;
    const url = new URL(request.url);

    // Skip middleware for static assets, API endpoints, and prerendered pages
    if (
        url.pathname.startsWith("/_astro") ||
        url.pathname.startsWith("/_vercel") ||
        url.pathname.startsWith("/api/") ||
        url.pathname.includes(".") ||
        context.isPrerendered
    ) {
        return next();
    }

    // Extract auth token
    const token = cookies.get("dkl_auth_token")?.value ||
        cookies.get("access_token")?.value;

    let user = null;

    // Zero-Trust token validation via backend
    if (token) {
        try {
            const API_URL = import.meta.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
            const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";

            const verifyReq = await fetch(`${API_URL}/auth/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": `access_token=${token}`,
                    "X-Tenant-ID": TENANT_ID
                }
            });

            if (verifyReq.ok) {
                user = await verifyReq.json();
                if (user.data) user = user.data;
                if (user.user) user = user.user;
                if (user?.role) user.role = user.role.toLowerCase();
                // Normalize: backend returns full_name, frontend type expects name
                if (user?.full_name && !user.name) user.name = user.full_name;
            } else {
                console.warn(`[Auth] Token validation failed: ${verifyReq.status}`);
            }
        } catch (error) {
            console.error(`[Auth] Validation error:`, error);
        }
    }

    locals.token = token || null;
    locals.user = user || null;

    // Guard protected routes
    const protectedRoutes = ["/admin", "/dashboard", "/profile"];
    const isProtected = protectedRoutes.some(path => url.pathname.startsWith(path));

    if (isProtected) {
        if (!locals.user) {
            return redirect("/login");
        }

        // RBAC: Admin/Editor only
        if (url.pathname.startsWith("/admin") && locals.user.role !== "admin" && locals.user.role !== "editor") {
            return redirect("/dashboard");
        }

        // Strict Admin-only routes
        if (url.pathname.startsWith("/admin/settings") && locals.user.role !== "admin") {
            return redirect("/admin/dashboard");
        }
    }

    const response = await next();

    // Security headers
    response.headers.set("X-Frame-Options", import.meta.env.DEV ? "SAMEORIGIN" : "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");

    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' data: https://*.convex.cloud https://ik.imagekit.io https://vercel.live https://va.vercel-scripts.com https://cdn.jsdelivr.net https://code.iconify.design https://cdn.vercel-insights.com https://www.gofundme.com",
        "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com https://unpkg.com",
        "img-src 'self' data: blob: https://ik.imagekit.io https://*.convex.cloud https://*.streamable.com https://placehold.co https://*.tile.openstreetmap.org https://unpkg.com https://*.basemaps.cartocdn.com",
        "media-src 'self' blob: data: https://ik.imagekit.io",
        "font-src 'self' data: * https://api.fontshare.com https://fonts.gstatic.com https://fonts.googleapis.com",
        "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://auth.laventecare.nl https://laventecareauthsystems.onrender.com http://localhost:8080 ws://localhost:8080 https://ik.imagekit.io https://upload.imagekit.io https://*.tile.openstreetmap.org https://va.vercel-analytics.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com https://cdn.jsdelivr.net",
        "frame-src 'self' https://streamable.com https://*.streamable.com https://vercel.live https://www.komoot.com https://*.komoot.com https://komoot.com https://komoot.de https://*.komoot.de https://www.gofundme.com",
        "frame-ancestors 'self' https://vercel.live",
        "upgrade-insecure-requests"
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);

    return response;
});
