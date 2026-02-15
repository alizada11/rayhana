import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Redirect } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import useAuthReq from "@/hooks/useAuthReq";
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
} from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FullPageLoader from "@/components/FullPageLoader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOutIcon } from "lucide-react";
import { uploadMedia, deleteAvatarMedia } from "@/lib/api";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const rtlLangs = ["fa", "ps", "ar", "ku"];
  const isRTL = rtlLangs.includes(i18n.language) || i18n.dir?.() === "rtl";
  const { isLoaded: authLoaded, isSignedIn, user, logout } = useAuth();
  const { isLoaded: sessionLoaded } = useAuthReq();
  const { data, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordSet = data?.passwordSet;
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploadPending, setUploadPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [lastUploadId, setLastUploadId] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setEmail(data.email || "");
      setImageUrl(data.imageUrl || "");
    }
  }, [data]);

  const initial = useMemo(() => {
    const src = data?.imageUrl || "";
    if (src) return null;
    const ch = data?.name?.[0] || data?.email?.[0] || "U";
    return ch.toUpperCase();
  }, [data]);

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, ""),
    []
  );

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  if (!authLoaded || !sessionLoaded) return <FullPageLoader />;
  if (!isSignedIn) return <Redirect to="/login" />;
  if (user?.role === "admin") return <Redirect to="/dashboard" />;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { name, email, imageUrl },
      {
        onSuccess: () => {
          toast.success(t("profile.updated", "Profile updated"));
          setLastUploadId(null);
        },
        onError: (err: any) => {
          const data = err?.response?.data;
          const msg =
            (data?.errorKey && t(data.errorKey, data?.error)) ||
            data?.error ||
            t("profile.update_failed", "Failed to update profile");
          toast.error(msg);
        },
      }
    );
  };

  const handleImageFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.bad_file", "Please upload an image file"));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error(t("profile.too_large", "Image must be under 3MB"));
      return;
    }

    // Client-side dimension validation (e.g., min 200x200, max 4000x4000)
    const dims = await new Promise<{ w: number; h: number }>(
      (resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve({ w: img.width, h: img.height });
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Image load failed"));
        };
        img.src = objectUrl;
      }
    ).catch(() => null);

    if (!dims) {
      toast.error(t("profile.dim_failed", "Could not read image dimensions"));
      return;
    }

    const MIN = 200;
    const MAX = 4000;
    if (dims.w < MIN || dims.h < MIN) {
      toast.error(
        t("profile.dim_too_small", "Image must be at least 200x200 pixels")
      );
      return;
    }
    if (dims.w > MAX || dims.h > MAX) {
      toast.error(
        t("profile.dim_too_large", "Image must be under 4000x4000 pixels")
      );
      return;
    }

    setUploadPending(true);
    try {
      const data = await uploadMedia({ file });
      if (!data?.url || !data?.id) throw new Error("Upload failed");

      // delete previous upload from this session (best-effort)
      if (lastUploadId) {
        deleteAvatarMedia(lastUploadId).catch(() => {});
      }

      setLastUploadId(data.id);
      setImageUrl(resolveImageUrl(data.url));
      toast.success(t("profile.image_uploaded", "Image uploaded"));
    } catch (err: any) {
      toast.error(
        (err?.response?.data?.errorKey &&
          t(err.response.data.errorKey, err?.response?.data?.error)) ||
          err?.response?.data?.error ||
          t("profile.image_upload_failed", "Failed to upload image")
      );
    } finally {
      setUploadPending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("profile.password_mismatch", "Passwords do not match"));
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: async res => {
          const messageKey =
            res && "messageKey" in res ? (res as any).messageKey : undefined;
          const fallback =
            res?.message ||
            t(
              "profile.password_changed",
              "Password updated. Please sign in again."
            );
          const msg = messageKey ? t(messageKey, fallback) : fallback;
          toast.success(msg);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          await logout();
        },
        onError: (err: any) => {
          const data = err?.response?.data;
          const msg =
            (data?.errorKey &&
              t(
                data.errorKey,
                data?.error ||
                  t("profile.password_failed", "Failed to change password")
              )) ||
            data?.error ||
            t("profile.password_failed", "Failed to change password");
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 dark:to-muted/5">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center">
          <div className="mb-10">
            <h1 className="text-3xl font-serif font-bold">
              {t("profile.title", "Your Profile")}
            </h1>
            <p className="text-muted-foreground">
              {t("profile.subtitle", "Manage your info and security.")}
            </p>
          </div>
          <div className="mb-10">
            <Button
              className="flex-1"
              variant="destructive"
              onClick={async () => {
                await logout();
                toast.success(t("login_page.signed_out", "Signed out"));
              }}
            >
              <LogOutIcon className="w-4 h-4" />
              {t("login_page.sign_out", "Sign Out")}{" "}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.details", "Account details")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      {imageUrl ? (
                        <AvatarImage src={resolveImageUrl(imageUrl)} />
                      ) : null}
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground block mb-1">
                        {t("profile.avatar_url", "Avatar URL")}
                      </label>
                      <Input
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageFile(e.target.files?.[0])}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadPending}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploadPending
                            ? t("profile.uploading", "Uploading...")
                            : t("profile.upload_image", "Upload image")}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {t(
                            "profile.image_hint",
                            "Up to 3MB, square preferred"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      {t("profile.name", "Name")}
                    </label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t("profile.name_ph", "Your full name")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      {t("profile.email", "Email")}
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending
                      ? t("profile.saving", "Saving...")
                      : t("profile.save", "Save changes")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("profile.stats", "Your activity")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Stat
                    label={t("profile.stat.gallery", "Gallery")}
                    value={data.stats.gallerySubmissions}
                  />
                  <Stat
                    label={t("profile.stat.likes", "Likes")}
                    value={data.stats.galleryLikes}
                  />
                  <Stat
                    label={t("profile.stat.blogs", "Blogs")}
                    value={data.stats.blogPosts}
                  />
                  <Stat
                    label={t("profile.stat.blog_comments", "Blog comments")}
                    value={data.stats.blogComments}
                  />
                  <Stat
                    label={t("profile.stat.products", "Products")}
                    value={data.stats.products}
                  />
                  <Stat
                    label={t("profile.stat.media", "Media")}
                    value={data.stats.mediaAssets}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid md:grid-cols-[2fr,1fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {passwordSet
                  ? t("profile.password", "Change password")
                  : t("profile.create_password", "Create password")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSave} className="space-y-4">
                {passwordSet && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      {t("profile.current_password", "Current password")}
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required={passwordSet}
                      />
                      <button
                        type="button"
                        className={`absolute inset-y-0  ${isRTL ? "left-3" : "right-3"} text-xs text-muted-foreground`}
                        onClick={() => setShowCurrent(s => !s)}
                      >
                        {showCurrent
                          ? t("login_page.hide", "Hide")
                          : t("login_page.show", "Show")}
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    {passwordSet
                      ? t("profile.new_password", "New password")
                      : t("profile.set_password", "Set password")}
                  </label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={`absolute inset-y-0  ${isRTL ? "left-3" : "right-3"} text-xs text-muted-foreground`}
                      onClick={() => setShowNew(s => !s)}
                    >
                      {showNew
                        ? t("login_page.hide", "Hide")
                        : t("login_page.show", "Show")}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    {passwordSet
                      ? t("profile.confirm_password", "Confirm new password")
                      : t("profile.confirm_set_password", "Confirm password")}
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={`absolute inset-y-0  ${isRTL ? "left-3" : "right-3"} text-xs text-muted-foreground`}
                      onClick={() => setShowConfirm(s => !s)}
                    >
                      {showConfirm
                        ? t("login_page.hide", "Hide")
                        : t("login_page.show", "Show")}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending
                    ? t("profile.updating", "Updating...")
                    : passwordSet
                      ? t("profile.update_password", "Update password")
                      : t("profile.create_password_btn", "Create password")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border rounded-xl px-3 py-2 bg-card/60">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
