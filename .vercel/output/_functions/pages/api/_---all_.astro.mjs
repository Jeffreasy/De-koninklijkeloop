export { renderers } from '../../renderers.mjs';

const prerender = false;
const API_URL = "https://laventecareauthsystems.onrender.com/api/v1";
const ALL = async ({ request, params, cookies, locals }) => {
  const path = params.all;
  if (!path) {
    return new Response("API Root", { status: 404 });
  }
  const targetUrl = `${API_URL}/${path}`;
  try {
    const token = cookies.get("access_token")?.value || cookies.get("dkl_auth_token")?.value;
    const headers = new Headers(request.headers);
    headers.set("Host", new URL(API_URL).host);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    console.log(`[Proxy] Forwarding ${request.method} to ${targetUrl}`);
    console.log(`[Proxy] X-Tenant-ID: ${headers.get("X-Tenant-ID")}`);
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== "GET" ? request.clone().body : void 0,
      duplex: "half"
      // Required for Node, harmless on Vercel
    });
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("set-cookie");
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (e) {
    console.error("API Proxy Error:", e);
    return new Response(JSON.stringify({ error: "Backend Protocol Violation" }), { status: 502 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    ALL,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
