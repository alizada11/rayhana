import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send cookies with req
  xsrfCookieName: "csrfToken",
  xsrfHeaderName: "x-csrf-token",
});

export default api;
