import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const { request, cookies, redirect, locals } = context;
    const url = new URL(request.url);

    // 1. Bypass Asset/API calls that don't need Tunneling
    if (url.pathname.startsWith("/_astro") ||
        url.pathname.startsWith("/api/auth") ||
        url.pathname.includes(".")) {
        return next();
    }

    // 2. Extract Token (Prioritize cookies)
    const token = cookies.get("dkl_auth_token")?.value ||
        cookies.get("access_token")?.value;

    let user = null;

    // 3. Auth Tunneling (Zero-Trust Validation)
    if (token) {
        try {
            // BACKEND_URL from env or fallback
            // We use the internal docker/network URL if possible, but for Vercel/Render -> Render, we use public
            const API_URL = import.meta.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
            const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID || "b2727666-7230-4689-b58b-ceab8c2898d5";

            // Forward the cookie to the backend to validate
            // ENDPOINT CONFIRMED: /auth/me (based on proxy maps)
            const verifyReq = await fetch(`${API_URL}/auth/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": `access_token=${token}`, // Simulate browser
                    "X-Tenant-ID": TENANT_ID
                }
            });

            if (verifyReq.ok) {
                user = await verifyReq.json();
                // Normalize user object if needed
                if (user.data) user = user.data;
                // If backend returns { user: ... } wrapper
                if (user.user) user = user.user;
            } else {
                console.warn(`[Middleware] Token validation failed: ${verifyReq.status}`);
            }
        } catch (error) {
            console.error(`[Middleware] Tunnel Error:`, error);
        }
    }

    // 4. Set Locals
    locals.token = token || null;
    locals.user = user || null;

    // 5. Guard Protected Routes
    const protectedRoutes = ["/admin", "/dashboard", "/profile"];
    const isProtected = protectedRoutes.some(path => url.pathname.startsWith(path));

    if (isProtected) {
        if (!locals.user) {
            console.log(`[Middleware] Unauthorized access to ${url.pathname}. Redirecting.`);
            return redirect("/login");
        }

        // Role based access control (Example: Admin only)
        if (url.pathname.startsWith("/admin") && locals.user.role !== "admin") {
            console.log(`[Middleware] Forbidden access (Role mismatch) to ${url.pathname}.`);
            return redirect("/dashboard"); // Or 403 page
        }
    }

    // 6. Anti-Flicker & Headers
    const response = await next();

    // Add security headers to the response (Redundancy for Vercel)
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");

    return response;
});
