import axios from "axios";

const normalizeBaseUrl = (value) => {
    if (value === undefined || value === null || value === "") return "";
    return String(value).trim().replace(/\/$/, "");
};

export const API_BASE_URL = normalizeBaseUrl(
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL || ""
);

export function getApiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
    if (!err) return fallback;
    if (err.code === "ERR_CANCELED" || err.name === "CanceledError" || err.name === "AbortError") {
        return null;
    }
    if (err.code === "ECONNABORTED") {
        return "The request timed out. Please check your connection and try again.";
    }
    if (err.code === "ERR_NETWORK" || err.message === "Network Error" || !err.response) {
        return "Unable to reach the server. Please check your connection and try again.";
    }
    const data = err.response?.data;
    if (typeof data === "string" && data.length > 0 && data.length < 240) return data;
    return data?.message || data?.error || fallback;
}

const api = axios.create({
    baseURL: API_BASE_URL || undefined,
    timeout: 15000,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        if (config.headers) {
            delete config.headers["Content-Type"];
        }
    } else if (config.headers && !config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
    }

    try {
        const raw = localStorage.getItem("sampoorn_user_session");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${parsed.token}`;
            }
        }
    } catch {
        /* private mode or corrupt session */
    }
    return config;
});

export default api;