import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Centralize logging so failed requests are never fully invisible, even when a
// caller decides to swallow the rejection to keep working offline.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    const method = (config?.method || "get").toUpperCase();
    const url = `${config?.baseURL || ""}${config?.url || ""}`;

    if (response) {
      console.error(`[api] ${method} ${url} failed with ${response.status}`, response.data);
    } else {
      console.error(`[api] ${method} ${url} failed`, error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
