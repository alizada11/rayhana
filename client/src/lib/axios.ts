import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // send cookies with req
  xsrfCookieName: "csrfToken",
  xsrfHeaderName: "x-csrf-token",
});

api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;

    if (message) {
      error.message = message;
    }

    return Promise.reject(error);
  }
);

export default api;
