import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000"
});

export function apiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Unable to connect to the server. Please check that the API is running and try again.";
    }
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => {
        const field = Array.isArray(item.loc) ? item.loc.at(-1) : null;
        return field ? `${field}: ${item.msg}` : item.msg;
      }).join(", ");
    }
    return detail || "The request could not be completed. Please review the details and try again.";
  }
  return "Something went wrong.";
}
