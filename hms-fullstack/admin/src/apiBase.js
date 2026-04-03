/**
 * Base URL for API calls. In dev with empty VITE_BACKEND_URL, use "" so requests
 * hit the Vite dev server and are proxied to the backend (avoids CORS issues).
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_BACKEND_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return "http://localhost:4000";
}

/** Matches backend middleware: req.headers.atoken */
export function adminAuthHeaders(token) {
  return token ? { atoken: token } : {};
}

/** Matches backend middleware: req.headers.dtoken */
export function doctorAuthHeaders(token) {
  return token ? { dtoken: token } : {};
}

export function axiosErrorMessage(error) {
  return (
    error?.response?.data?.message || error?.message || "Something went wrong"
  );
}
