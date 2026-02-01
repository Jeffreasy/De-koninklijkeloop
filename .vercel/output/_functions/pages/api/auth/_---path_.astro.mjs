export { renderers } from '../../../renderers.mjs';

const prerender = false;
const API_URL = "https://laventecareauthsystems.onrender.com/api/v1";
const ALL = async ({ request, params, cookies }) => {
  const path = params.path;
  const targetUrl = `${API_URL}/auth/${path}`;
  if (path === "login" && request.method === "POST") {
    try {
      const body = await request.json();
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": "b2727666-7230-4689-b58b-ceab8c2898d5"
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        return new Response(await response.text(), { status: response.status });
      }
      const data = await response.json();
      const responseHeaders = new Headers();
      responseHeaders.set("Content-Type", "application/json");
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        let cookiesToSet = [];
        if (typeof response.headers.getSetCookie === "function") {
          cookiesToSet = response.headers.getSetCookie();
        } else {
          cookiesToSet = [setCookieHeader];
        }
        cookiesToSet.forEach((cookie) => {
          let adjustedCookie = cookie;
          adjustedCookie = adjustedCookie.replace(/SameSite=[a-zA-Z]+/gi, "SameSite=Lax");
          adjustedCookie = adjustedCookie.replace(/; Partitioned/gi, "");
          if (false) ;
          responseHeaders.append("Set-Cookie", adjustedCookie);
        });
      } else {
        console.warn("⚠️ No Set-Cookie header found in backend response!");
      }
      const { access_token, token: _, ...restData } = data;
      if (restData.user || restData.User) {
        const u = restData.user || restData.User;
        delete u.PasswordHash;
        delete u.MfaSecret;
      } else {
        delete restData.PasswordHash;
        delete restData.MfaSecret;
      }
      return new Response(JSON.stringify(restData), {
        status: 200,
        headers: responseHeaders
      });
    } catch (error) {
      console.error("Login Proxy Error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  }
  if (path === "token" && request.method === "GET") {
    const token = cookies.get("access_token")?.value || cookies.get("dkl_auth_token")?.value;
    if (token) {
      return new Response(JSON.stringify({ token }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "No session" }), { status: 401 });
  }
  if (path === "logout") {
    cookies.delete("dkl_auth_token", { path: "/" });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
  try {
    const token = cookies.get("dkl_auth_token")?.value;
    const headers = new Headers(request.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.clone().body,
      duplex: "half"
    });
    const newHeaders = new Headers(response.headers);
    newHeaders.delete("content-encoding");
    newHeaders.delete("content-length");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Proxy Failed" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    ALL,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
