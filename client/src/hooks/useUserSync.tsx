import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { syncUser } from "../lib/api";

// the best way to implement this is by using webhooks
const SYNC_KEY = "user_synced";
function useUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [hasSynced, setHasSynced] = useState(
    () => sessionStorage.getItem(SYNC_KEY) === "true"
  );
  const {
    mutate: syncUserMutation,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: syncUser,
    onSuccess: () => {
      sessionStorage.setItem(SYNC_KEY, "true");
      setHasSynced(true);
    },
  });
  useEffect(() => {
    if (!isSignedIn) return;
    if (!user?.id) return;
    if (isPending || isSuccess || hasSynced) return;

    setHasSynced(true);
    sessionStorage.setItem(SYNC_KEY, "true");

    syncUserMutation({
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName || user.firstName,
      imageUrl: user.imageUrl,
    });
  }, [isSignedIn, user?.id, isPending, isSuccess, hasSynced, syncUserMutation]);

  return { isSynced: isSuccess };
}

export default useUserSync;
