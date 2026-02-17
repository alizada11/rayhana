import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useRef,
} from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import api from "./axios";

type User = {
  id: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
  role: "admin" | "guest";
};

type AuthState = {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  error?: string | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<any>;
  register: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{
    verificationRequired?: boolean;
    email?: string;
    message?: string;
  }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoaded: false,
    isSignedIn: false,
    error: null,
  });
  const latestFetchIdRef = useRef(0);

  const fetchMe = async () => {
    const fetchId = ++latestFetchIdRef.current;
    try {
      const res = await api.get("/auth/me", { withCredentials: true });
      const user = res.data?.user as User;
      if (fetchId !== latestFetchIdRef.current) return;
      setState({
        user,
        isLoaded: true,
        isSignedIn: Boolean(user),
        error: null,
      });
    } catch {
      if (fetchId !== latestFetchIdRef.current) return;
      setState({
        user: null,
        isLoaded: true,
        isSignedIn: false,
        error: null,
      });
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post(
      "/auth/login",
      { email, password },
      { withCredentials: true }
    );
    await fetchMe();
    return res.data;
  };

  const register = async (email: string, password: string, name?: string) => {
    const res = await api.post(
      "/auth/register",
      { email, password, name },
      { withCredentials: true }
    );
    await fetchMe();
    return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout", {}, { withCredentials: true });
    queryClient.removeQueries({ queryKey: ["me"] });
    setState({
      user: null,
      isLoaded: true,
      isSignedIn: false,
      error: null,
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      refresh: fetchMe,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return {
    ...ctx,
    userId: ctx.user?.id ?? null,
  };
}

export function useUser() {
  const ctx = useAuth();
  return { user: ctx.user };
}

// UI helpers mimicking Clerk primitives
export function SignedIn({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded || !isSignedIn) return null;
  return <>{children}</>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
}

type ButtonLikeProps = {
  children: ReactNode;
  forceRedirectUrl?: string;
  mode?: "modal" | "redirect";
};

export function SignInButton({ children, forceRedirectUrl }: ButtonLikeProps) {
  const [, setLocation] = useLocation();
  return (
    <span
      onClick={e => {
        e.preventDefault();
        setLocation(forceRedirectUrl || "/login?mode=signin");
      }}
      className="contents"
    >
      {children}
    </span>
  );
}

export function SignUpButton({ children, forceRedirectUrl }: ButtonLikeProps) {
  const [, setLocation] = useLocation();
  return (
    <span
      onClick={e => {
        e.preventDefault();
        setLocation(forceRedirectUrl || "/login?mode=signup");
      }}
      className="contents"
    >
      {children}
    </span>
  );
}

export function SignOutButton({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  return (
    <span
      onClick={async e => {
        e.preventDefault();
        await logout();
      }}
      className="contents"
    >
      {children}
    </span>
  );
}

export function UserButton() {
  const { user } = useUser();
  const initial = user?.name?.[0] || user?.email?.[0] || "U";
  return (
    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold">
      {initial}
    </div>
  );
}
