import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { syncUser } from "../lib/api";

// Best: use Clerk webhooks; fallback: sync once per session on client.
function useUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const attemptedRef = useRef(false);
  const lastSyncedUserIdRef = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: syncUser,
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000),
    onSuccess: () => {
      attemptedRef.current = true;
      lastSyncedUserIdRef.current = user?.id ?? null;
    },
    onError: () => {
      attemptedRef.current = true;
    },
  });

  useEffect(() => {
    if (!isSignedIn) {
      attemptedRef.current = false;
      lastSyncedUserIdRef.current = null;
      mutation.reset();
      return;
    }
    if (!user?.id) return;
    if (mutation.isPending) return;

    const alreadySyncedCurrentUser =
      mutation.isSuccess && lastSyncedUserIdRef.current === user.id;
    if (alreadySyncedCurrentUser) return;
    if (attemptedRef.current) return;

    attemptedRef.current = true;
    mutation.mutate({
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName || user.firstName,
      imageUrl: user.imageUrl,
    });
  }, [
    isSignedIn,
    user?.id,
    user?.fullName,
    user?.firstName,
    user?.imageUrl,
    user?.primaryEmailAddress?.emailAddress,
    mutation,
  ]);

  useEffect(() => {
    attemptedRef.current = false;
    if (user?.id !== lastSyncedUserIdRef.current) {
      mutation.reset();
    }
  }, [user?.id, mutation]);

  return {
    isSynced: mutation.isSuccess && lastSyncedUserIdRef.current === user?.id,
  };
}

export default useUserSync;
