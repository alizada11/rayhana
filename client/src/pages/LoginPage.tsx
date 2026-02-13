import { motion } from "framer-motion";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";

function LoginPage() {
  const { t } = useTranslation();
  const { isSignedIn, user, login, register, logout } = useAuth();
  const { data: me } = useUserRole();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  const title = useMemo(() => {
    if (mode === "signup") return t("login_page.sign_up", "Create account");
    if (mode === "forgot")
      return t("login_page.forgot_title", "Reset your password");
    return t("login_page.sign_in", "Sign In");
  }, [mode, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      if (mode === "signin") {
        await login(email, password);
        toast.success(t("login_page.signed_in", "Signed in"));
        setLocation("/dashboard");
      } else if (mode === "signup") {
        if (password !== confirmPassword) {
          toast.error(
            t("login_page.password_mismatch", "Passwords do not match")
          );
          setPending(false);
          return;
        }
        const res = await register(email, password, name);
        if (res?.verificationRequired) {
          toast.success(
            t(
              "login_page.verify_needed",
              "Check your email to verify your account"
            )
          );
          setLocation(`/verify-email?email=${encodeURIComponent(email)}`);
        } else {
          toast.success(t("login_page.account_created", "Account created"));
          setLocation("/login");
        }
      } else {
        await api.post("/auth/password/forgot", { email });
        toast.success(
          t(
            "login_page.reset_sent",
            "If that email exists, a reset link was sent."
          )
        );
        setMode("signin");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        t("login_page.error", "Something went wrong");
      if (err?.response?.data?.verificationRequired) {
        toast.error(
          t(
            "login_page.verify_first",
            "Please verify your email before signing in"
          )
        );
        setLocation(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setPending(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-2 text-left">
          <label className="text-sm font-medium text-muted-foreground">
            {t("login_page.name", "Name")}
          </label>
          <Input
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t("login_page.name_placeholder", "Your name")}
          />
        </div>
      )}
      <div className="space-y-2 text-left">
        <label className="text-sm font-medium text-muted-foreground">
          {t("login_page.email", "Email")}
        </label>
        <Input
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      {mode !== "forgot" && (
        <>
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-muted-foreground">
              {t("login_page.password", "Password")}
            </label>
            <div className="relative">
              <Input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute inset-y-0 right-3 text-xs text-muted-foreground"
              >
                {showPassword
                  ? t("login_page.hide", "Hide")
                  : t("login_page.show", "Show")}
              </button>
            </div>
          </div>
          {mode === "signup" && (
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium text-muted-foreground">
                {t("login_page.confirm_password", "Confirm password")}
              </label>
              <div className="relative">
                <Input
                  required
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  className="absolute inset-y-0 right-3 text-xs text-muted-foreground"
                >
                  {showConfirm
                    ? t("login_page.hide", "Hide")
                    : t("login_page.show", "Show")}
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? t("common.loading", "Loading...")
          : mode === "signin"
            ? t("login_page.sign_in", "Sign In")
            : mode === "signup"
              ? t("login_page.sign_up", "Create Account")
              : t("login_page.send_reset", "Send reset link")}
      </Button>
      {mode !== "forgot" && (
        <a
          href={`${import.meta.env.VITE_API_URL}/auth/oauth/google`}
          className="flex items-center justify-center gap-2 border border-border rounded-md py-2 text-sm hover:bg-muted transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-4 h-4"
          />
          {t("login_page.google", "Continue with Google")}
        </a>
      )}
      {mode === "signin" && (
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={() => setMode("forgot")}
        >
          {t("login_page.forgot_password", "Forgot your password?")}
        </button>
      )}
    </form>
  );

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-background via-background/95 to-muted/60 dark:from-background dark:via-background dark:to-muted/20 text-foreground transition-colors">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-card text-card-foreground rounded-2xl shadow-xl shadow-primary/10 dark:shadow-primary/20 border border-border overflow-hidden transition-colors"
            >
              <div className="bg-primary/10 dark:bg-primary/20 p-8 text-center transition-colors">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center text-2xl">
                  <span className="text-2xl">🔐</span>
                </div>
                <h1 className="font-serif text-3xl font-bold text-primary">
                  {title}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t("login_page.subtitle", "Access your account")}
                </p>
              </div>

              <div className="p-8 bg-gradient-to-b from-card to-muted/40 dark:from-card dark:to-muted/10 transition-colors space-y-6">
                {!isSignedIn ? (
                  renderForm()
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="bg-secondary/10 rounded-xl p-6">
                      <p className="text-lg font-semibold">
                        {t("login_page.welcome", "Welcome!")}&nbsp;
                        {user?.name || user?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("login_page.access_granted", "Full access granted")}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {me?.role === "admin" && (
                        <Button onClick={() => setLocation("/dashboard")}>
                          {t("login_page.dashboard", "Dashboard")}
                        </Button>
                      )}
                      {me?.role === "guest" && (
                        <Button
                          variant="outline"
                          onClick={() => setLocation("/my-submissions")}
                        >
                          {t("login_page.guest_dashboard", "My Photos")}
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => setLocation("/")}>
                        {t("login_page.go_home", "Go to Home")}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          await logout();
                          toast.success(t("login_page.signed_out", "Signed out"));
                        }}
                      >
                        {t("login_page.sign_out", "Sign Out")}
                      </Button>
                    </div>
                  </div>
                )}

                {!isSignedIn && (
                  <div className="text-center text-sm text-muted-foreground">
                    {mode === "signin" ? (
                      <span>
                        {t("login_page.sign_up_prompt", "Don't have an account?")}{" "}
                        <button
                          onClick={() => setMode("signup")}
                          className="text-primary font-semibold"
                        >
                          {t("login_page.sign_up", "Create Account")}
                        </button>
                      </span>
                    ) : (
                      <span>
                        {t("login_page.have_account", "Already have an account?")}{" "}
                        <button
                          onClick={() => setMode("signin")}
                          className="text-primary font-semibold"
                        >
                          {t("login_page.sign_in", "Sign In")}
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-muted/70 dark:bg-muted/20 px-8 py-4 border-t border-border transition-colors">
                <div className="flex justify-center space-x-6">
                  <Link
                    href="/help"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("login_page.help", "Help")}
                  </Link>
                  <Link
                    href="/privacy"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("login_page.privacy", "Privacy")}
                  </Link>
                  <Link
                    href="/terms"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("login_page.terms", "Terms")}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
