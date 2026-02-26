import { useAuth, useUser } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { syncUser } from "../lib/api";

// Best: use Clerk webhooks; fallback: sync once per session on client.
function useUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const attemptedRef = useRef(false);
  const lastSyncedUserIdRef = useRef<string | null>(null);

  // ✅ FIX: Store mutation in a ref so we can call it from effects without
  // adding it to dependency arrays. `useMutation` returns a new object every
  // render, so including it in deps caused an infinite loop:
  // render → new mutation object → effect re-runs → reset/mutate → re-render → repeat
  const mutation = useMutation({
    mutationFn: syncUser,
    retry: false,
    onSuccess: () => {
      attemptedRef.current = true;
      lastSyncedUserIdRef.current = user?.id ?? null;
      markSyncedThisSession();
    },
    onError: () => {
      attemptedRef.current = true;
    },
  });
  const mutationRef = useRef(mutation);
  mutationRef.current = mutation;

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

  // Sync once per user session
  useEffect(() => {
    const m = mutationRef.current; // ✅ read from ref, not from deps

    if (!isSignedIn) {
      attemptedRef.current = false;
      lastSyncedUserIdRef.current = null;
      m.reset();
      return;
    }
    if (!user?.id) return;
    if (m.isPending || m.isSuccess) return;
    if (hasSyncedThisSession()) return;

    const alreadySyncedCurrentUser =
      m.isSuccess && lastSyncedUserIdRef.current === user.id;
    if (alreadySyncedCurrentUser) return;
    if (attemptedRef.current) return;

    // cross-tab throttling (24h)
    const lsKey = `user_sync:last:${user.id}`;
    const last = lsKey ? Number(localStorage.getItem(lsKey)) : 0;
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (last && Date.now() - last < ONE_DAY) return;

    attemptedRef.current = true;
    m.mutate({
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
    });

    if (lsKey) {
      try {
        localStorage.setItem(lsKey, `${Date.now()}`);
      } catch {
        /* ignore */
      }
    }
  }, [isSignedIn, user?.id]); // ✅ mutation removed from deps

  // Reset when user changes
  useEffect(() => {
    if (user?.id !== lastSyncedUserIdRef.current) {
      attemptedRef.current = false;
      mutationRef.current.reset(); // ✅ call via ref, not dep
    }
  }, [user?.id]); // ✅ mutation removed from deps

  return {
    isSynced: mutation.isSuccess && lastSyncedUserIdRef.current === user?.id,
  };
}

export default useUserSync;
