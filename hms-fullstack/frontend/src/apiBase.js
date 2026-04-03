/** Same pattern as admin: dev uses Vite proxy when VITE_BACKEND_URL is unset. */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_BACKEND_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return "http://localhost:4000";
}

export function axiosErrorMessage(error) {
  return (
    error?.response?.data?.message || error?.message || "Something went wrong"
  );
}
