import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyEmail() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const emailParam = params.get("email") || "";
  const [status, setStatus] = useState<
    "pending" | "success" | "error" | "awaiting"
  >(token ? "pending" : "awaiting");
  const [email, setEmail] = useState(emailParam);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return;
    const run = async () => {
      try {
        await api.post("/auth/email/verify", { token });
        setStatus("success");
        toast.success(t("verify_email.success", "Email verified"));
      } catch (err: any) {
        setStatus("error");
        toast.error(
          err?.response?.data?.error ||
            t("verify_email.error", "Invalid or expired link")
        );
      }
    };
    run();
  }, [token, t]);

  const resend = async () => {
    if (!email) {
      toast.error(t("verify_email.need_email", "Enter your email first"));
      return;
    }
    setSending(true);
    try {
      await api.post("/auth/email/verify/resend", { email });
      toast.success(
        t("verify_email.resent", "Verification email sent. Check your inbox.")
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
          t("verify_email.error", "Something went wrong")
      );
    } finally {
      setSending(false);
    }
  };

  const ResendBlock = (
    <div className="space-y-3">
      <input
        type="email"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
        placeholder={t("verify_email.email_placeholder", "Your email")}
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={sending}
          onClick={resend}
          type="button"
        >
          {sending
            ? t("common.loading", "Loading...")
            : t("verify_email.resend", "Resend email")}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          type="button"
          onClick={() => setLocation("/login")}
        >
          {t("verify_email.back", "Return to login")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4 bg-card p-6 rounded-xl border text-center">
        <h1 className="text-2xl font-semibold">
          {t("verify_email.title", "Verify your email")}
        </h1>

        {status === "pending" && (
          <p className="text-muted-foreground">
            {t("verify_email.pending", "Verifying...")}
          </p>
        )}

        {status === "success" && (
          <>
            <p className="text-green-600">
              {t("verify_email.ok", "Your email is confirmed.")}
            </p>
            <Button onClick={() => setLocation("/login")}>
              {t("verify_email.back", "Return to login")}
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-destructive">
              {t("verify_email.error", "Invalid or expired link")}
            </p>
            {ResendBlock}
          </>
        )}

        {status === "awaiting" && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t(
                "verify_email.awaiting",
                "We sent you a confirmation email. Please click the link to continue."
              )}
            </p>
            {ResendBlock}
          </div>
        )}
      </div>
    </div>
  );
}
