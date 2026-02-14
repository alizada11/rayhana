import { useAuth } from "@/lib/auth";

function useAuthReq() {
  const { isSignedIn, isLoaded } = useAuth();
  // withCredentials is already enabled in api client; nothing extra to inject
  return { isSignedIn, isLoaded };
}

export default useAuthReq;
