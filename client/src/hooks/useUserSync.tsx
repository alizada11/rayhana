import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { syncUser } from "../lib/api";

// Best: use Clerk webhooks; fallback: sync once per session on client.
function useUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const attemptedRef = useRef(false);

  const { mutate: syncUserMutation, isPending, isSuccess } = useMutation({
    mutationFn: syncUser,
    onSuccess: () => {
      attemptedRef.current = true;
    },
    onError: () => {
      attemptedRef.current = false; // allow retry on next render
    },
  });

  useEffect(() => {
    if (!isSignedIn) {
      attemptedRef.current = false;
      return;
    }
    if (!user?.id) return;
    if (isPending || isSuccess) return;
    if (attemptedRef.current) return;

    attemptedRef.current = true;
    syncUserMutation({
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName || user.firstName,
      imageUrl: user.imageUrl,
    });
  }, [isSignedIn, user?.id, user?.fullName, user?.firstName, user?.imageUrl, user?.primaryEmailAddress, isPending, isSuccess, syncUserMutation]);

  return { isSynced: isSuccess };
}

export default useUserSync;
