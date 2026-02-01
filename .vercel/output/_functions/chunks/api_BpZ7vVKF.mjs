import './auth_ELwR6sTw.mjs';

const API_URL = "/api";
const TENANT_ID = "b2727666-7230-4689-b58b-ceab8c2898d5";
async function apiRequest(endpoint, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("X-Tenant-ID", TENANT_ID);
  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include"
    // Ensure cookies are sent/received
  });
  if (res.status === 401) {
    console.warn("[API] 401 Unauthorized - Attempting Refresh...");
    try {
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "X-Tenant-ID": TENANT_ID },
        credentials: "include"
      });
      if (refreshRes.ok) {
        console.log("[API] Refresh Successful. Retrying original request.");
        res = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include"
        });
      } else {
        console.error("[API] Refresh Failed. Redirecting to login.");
        throw new Error("Session expired");
      }
    } catch (e) {
      window.location.href = "/login?expired=true";
      throw e;
    }
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Er is een onbekende fout opgetreden." }));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export { apiRequest as a };
