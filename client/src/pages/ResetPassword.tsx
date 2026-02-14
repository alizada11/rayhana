import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function ResetPassword() {
  const { t, i18n } = useTranslation();
  const rtlLangs = ["fa", "ps", "ar", "ku"];
  const isRTL = rtlLangs.includes(i18n.language) || i18n.dir?.() === "rtl";
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t("login_page.error", "Something went wrong"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("login_page.password_mismatch", "Passwords do not match"));
      return;
    }
    if (password.length < 8) {
      toast.error(
        t(
          "login_page.password_too_short",
          "Password must be at least 8 characters"
        )
      );
      return;
    }
    setPending(true);
    try {
      await api.post("/auth/password/reset", { token, password });
      toast.success(
        t("login_page.reset_success", "Password updated. Please sign in.")
      );
      setLocation("/login");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
          t("login_page.error", "Something went wrong")
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 bg-card p-6 rounded-xl border"
      >
        <h1 className="font-serif text-2xl font-semibold">
          {t("login_page.reset_title", "Set a new password")}
        </h1>
        <div className="space-y-2 relative">
          <label className="mb-1 text-sm font-medium text-muted-foreground">
            {t("login_page.password", "Password")}
          </label>
          <div className=" relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              placeholder={t("login_page.password", "Password")}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={`absolute inset-y-0 ${isRTL ? "left-3" : "right-3"} text-xs text-muted-foreground`}
              onClick={() => setShowPassword(s => !s)}
            >
              {showPassword
                ? t("login_page.hide", "Hide password")
                : t("login_page.show", "Show password")}
            </button>
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-sm font-medium text-muted-foreground">
            {t("login_page.confirm_password", "Confirm password")}
          </label>
          <div className=" relative">
            <Input
              type={showConfirm ? "text" : "password"}
              required
              placeholder={t("login_page.confirm_password", "Confirm password")}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className={`absolute inset-y-0 ${isRTL ? "left-3" : "right-3"} text-xs text-muted-foreground`}
              onClick={() => setShowConfirm(s => !s)}
            >
              {showConfirm
                ? t("login_page.hide", "Hide password")
                : t("login_page.show", "Show password")}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={pending || !token}>
          {pending
            ? t("common.loading", "Loading...")
            : t("login_page.save_password", "Save password")}
        </Button>
      </form>
    </div>
  );
}
