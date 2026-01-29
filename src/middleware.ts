import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const tokenCookie = context.cookies.get("dkl_auth_token");
    const token = tokenCookie?.value;

    context.locals.token = token || null;
    context.locals.user = null;

    if (token) {
        try {
            // Rudimentary JWT parse without verify (Verification happens at Backend)
            // We just need the payload for UI state if needed
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                context.locals.user = {
                    id: payload.sub || payload.id || payload.ID,
                    email: payload.email || payload.Email,
                    role: (payload.role || payload.Role || "viewer").toLowerCase()
                } as any;
            }
        } catch (e) {
            // Invalid token format
            context.locals.token = null;
        }
    }

    // Protect sensitive routes (Simple Guard)
    const protectedRoutes = ["/dashboard", "/admin", "/profile"];
    const url = new URL(context.request.url);

    if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
        if (!context.locals.token) {
            return context.redirect("/login");
        }
    }

    return next();
});
