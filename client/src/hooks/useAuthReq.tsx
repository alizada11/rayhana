import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import api from "../lib/axios";

let isInterceptorRegistered = false;

function useAuthReq() {
  const { isSignedIn, getToken, isLoaded } = useAuth();
  const authRef = useRef({ isSignedIn, getToken });

  // Keep ref updated with latest values
  useEffect(() => {
    authRef.current = { isSignedIn, getToken };
  }, [isSignedIn, getToken]);

  // include the token to the request headers
  useEffect(() => {
    if (isInterceptorRegistered) return;
    isInterceptorRegistered = true;

    const interceptor = api.interceptors.request.use(async config => {
      if (authRef.current.isSignedIn) {
        const token = await authRef.current.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
      isInterceptorRegistered = false;
    };
  }, []);

  return { isSignedIn, isClerkLoaded: isLoaded };
}

export default useAuthReq;
