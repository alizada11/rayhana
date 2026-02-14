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

  const hasSyncedThisSession = () => {
    try {
      const key = user?.id ? `user_sync:${user.id}` : null;
      return key ? sessionStorage.getItem(key) === "1" : false;
    } catch {
      return false;
    }
  };

  const markSyncedThisSession = () => {
    try {
      const key = user?.id ? `user_sync:${user.id}` : null;
      if (key) sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
  };

  const mutation = useMutation({
    mutationFn: syncUser,
    retry: false, // avoid hammering the endpoint
    onSuccess: () => {
      attemptedRef.current = true;
      lastSyncedUserIdRef.current = user?.id ?? null;
      markSyncedThisSession();
    },
    onError: () => {
      attemptedRef.current = true;
    },
  });

  // Sync once per user session
  useEffect(() => {
    if (!isSignedIn) {
      attemptedRef.current = false;
      lastSyncedUserIdRef.current = null;
      mutation.reset();
      return;
    }
    if (!user?.id) return;
    if (mutation.isPending || mutation.isSuccess) return;
    if (hasSyncedThisSession()) return;

    const alreadySyncedCurrentUser =
      mutation.isSuccess && lastSyncedUserIdRef.current === user.id;
    if (alreadySyncedCurrentUser) return;
    if (attemptedRef.current) return;

    // cross-tab throttling (24h)
    const lsKey = `user_sync:last:${user.id}`;
    const last = lsKey ? Number(localStorage.getItem(lsKey)) : 0;
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (last && Date.now() - last < ONE_DAY) return;

    attemptedRef.current = true;
    mutation.mutate({
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName || user.firstName,
      imageUrl: user.imageUrl,
    });
    if (lsKey) {
      try {
        localStorage.setItem(lsKey, `${Date.now()}`);
      } catch {
        /* ignore */
      }
    }
  }, [isSignedIn, user?.id, mutation]);

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
