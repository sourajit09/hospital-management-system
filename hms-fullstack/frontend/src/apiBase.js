const FALLBACK_BACKEND_URL = "http://localhost:4000";
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeBackendUrl(raw) {
  return raw?.trim()?.replace(/\/$/, "") || "";
}

/**
 * In dev, prefer the Vite proxy for loopback URLs so auth works reliably
 * across browsers, LAN devices, and environments where "localhost" differs.
 */
export function getApiBaseUrl() {
  const raw = normalizeBackendUrl(import.meta.env.VITE_BACKEND_URL);

  if (import.meta.env.DEV) {
    if (!raw) return "";

    try {
      const parsed = new URL(raw);
      if (LOOPBACK_HOSTS.has(parsed.hostname)) {
        return "";
      }
    } catch {
      return "";
    }
  }

  return raw || FALLBACK_BACKEND_URL;
}

export function axiosErrorMessage(error) {
  return (
    error?.response?.data?.message || error?.message || "Something went wrong"
  );
}
