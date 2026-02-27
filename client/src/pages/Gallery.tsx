import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Camera, Heart, Search, Upload, X } from "lucide-react";
import {
  useApprovedGallery,
  useCreateGallerySubmission,
  useToggleGalleryLike,
} from "@/hooks/useGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import SeoTags from "@/components/SeoTags";
import { formatDate, displayUser } from "@/utils/formatters";

export default function Gallery() {
  const { t, i18n } = useTranslation();
  const isRTL = ["fa", "ps"].includes(i18n.language);
  const { data: galleryImages = [], isLoading } = useApprovedGallery();
  const createMutation = useCreateGallerySubmission();
  const toggleLikeMutation = useToggleGalleryLike();
  const { isSignedIn } = useAuth();
  const { data: me, isLoading: isRoleLoading } = useUserRole();
  const [, setLocation] = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dishName, setDishName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };
  const locale = i18n.language;
  const loginRequiredMessage = t(
    "login_page.loginRequired",
    "You need to log in to access this feature."
  );

  const revokePreview = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = 5 * 1024 * 1024; // 5MB cap
    if (file.size > maxBytes) {
      toast.error(
        isRTL
          ? "حجم تصویر باید کمتر از ۵ مگابایت باشد"
          : "Please choose an image under 5MB"
      );
      e.target.value = "";
      return;
    }

    revokePreview();
    const preview = URL.createObjectURL(file);
    setObjectUrl(preview);
    setSelectedImage(preview);
    setImageFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error(t("gallery.toast.no_image", "Please select an image"));
      return;
    }
    if (!dishName.trim()) {
      toast.error(t("gallery.toast.no_name", "Dish name is required"));
      return;
    }

    const payload = new FormData();
    payload.append("image", imageFile);
    payload.append("dishName", dishName.trim());
    if (description.trim()) payload.append("description", description.trim());

    setUploadProgress(0);
    createMutation.mutate(
      { payload, onProgress: setUploadProgress },
      {
        onSuccess: () => {
          toast.success(
            t(
              "gallery.toast.submitted",
              "Photo submitted. It will appear after approval."
            )
          );
          setIsDialogOpen(false);
          setSelectedImage(null);
          setImageFile(null);
          setDishName("");
          setDescription("");
          revokePreview();
          setUploadProgress(null);
        },
        onError: () => {
          setUploadProgress(null);
        },
      }
    );
  };

  const canSubmit = isSignedIn && me?.role === "guest";

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const base = term
      ? galleryImages.filter(item => {
          const name = item.dishName?.toLowerCase() || "";
          const user = item.user?.name?.toLowerCase() || "";
          return name.includes(term) || user.includes(term);
        })
      : galleryImages;

    const sorted = [...base].sort((a, b) => {
      if (sortBy === "popular") {
        return (b.likesCount ?? 0) - (a.likesCount ?? 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted;
  }, [galleryImages, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleToggleLike = (id: string) => {
    if (!isSignedIn) {
      toast.error(loginRequiredMessage);
      setLocation("/login");
      return;
    }
    toggleLikeMutation.mutate(id);
  };

  const activeImage = useMemo(
    () => galleryImages.find(item => item.id === activeImageId) || null,
    [activeImageId, galleryImages]
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <SeoTags
        pageKey="gallery"
        title={t("gallery.title", "Customer Gallery")}
        description={t(
          "gallery.subtitle",
          "See dishes from our community and share your own."
        )}
        url={`${import.meta.env.VITE_BASE_URL || ""}/gallery`}
      />
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              {t("gallery.title", "Your Kitchen, Our Story")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t(
                "gallery.subtitle",
                "Join the Rayhana family by sharing your culinary creations"
              )}
            </p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={open => {
              if (isRoleLoading) {
                return;
              }
              if (open && !canSubmit) {
                if (!isSignedIn) {
                  setLocation("/login");
                } else {
                  toast.error(
                    t("gallery.toast.guests_only", "Only guests can submit")
                  );
                }
                return;
              }
              setIsDialogOpen(open);
              if (open) {
                setUploadProgress(null);
                revokePreview();
                setSelectedImage(null);
                setImageFile(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-full gap-2">
                <Camera className="w-4 h-4" />
                {t("gallery.share_button", "Share Your Photo")}
              </Button>
            </DialogTrigger>
            <DialogContent className={`sm:max-w-md ${isRTL ? "rtl" : "ltr"}`}>
              <DialogHeader>
                <DialogTitle className="text-center font-serif text-2xl">
                  {t("gallery.upload_title")}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="flex flex-col items-center justify-center w-full">
                  <Label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-border border-dashed rounded-xl cursor-pointer bg-muted/60 hover:bg-muted transition-all duration-300 group"
                  >
                    {selectedImage ? (
                      <div className="relative w-full h-full group-hover:opacity-90 transition-opacity">
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={e => {
                            e.preventDefault();
                            setSelectedImage(null);
                            setImageFile(null);
                          }}
                          className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground group-hover:text-primary transition-colors">
                        <Upload className="w-12 h-12 mb-3" />
                        <p className="mb-2 text-sm font-medium">
                          {t("gallery.upload_placeholder")}
                        </p>
                        <p className="text-xs opacity-70">
                          {t("gallery.uploadSize", "JPG, PNG (MAX. 5MB)")}
                        </p>
                      </div>
                    )}
                    <Input
                      id="dropzone-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </Label>
                </div>

                <div className="space-y-4">
                  {(createMutation.isPending || uploadProgress !== null) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t("profile.uploading", "uploading...")}</span>
                        <span>{uploadProgress ?? 0}%</span>
                      </div>
                      <Progress value={uploadProgress ?? 0} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="dish-name">
                      {t("gallery.dishName", "Dish Name")}
                    </Label>
                    <Input
                      id="dish-name"
                      placeholder={t(
                        "gallery.dishPlaceholder",
                        "e.g. Qabili Palau"
                      )}
                      required
                      value={dishName}
                      onChange={e => setDishName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {t("gallery.dishDescription", "Description (Optional)")}
                    </Label>
                    <Textarea
                      id="description"
                      placeholder={t("gallery.upload_note")}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="resize-none min-h-[80px]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full rounded-full"
                >
                  {createMutation.isPending
                    ? t("gallery.uploading", "Uploading...")
                    : t("gallery.submit_photo")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card border rounded-2xl p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder={t("gallery.search", "Search by dish or name")}
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value as "newest" | "popular");
                setPage(1);
              }}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="newest">
                {t("gallery.sort_newest", "Newest")}
              </option>
              <option value="popular">
                {t("gallery.sort_popular", "Most liked")}
              </option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-muted-foreground py-12">
            {t("common.loading", "Loading...")}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            {t("gallery.empty", "No photos found.")}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pageItems.map(item => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              onClick={() => setActiveImageId(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveImageId(item.id);
                }
              }}
            >
              <img
                loading="lazy"
                src={resolveImageUrl(item.imageUrl)}
                alt={item.dishName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                <p className="text-white font-semibold line-clamp-1">
                  {item.dishName}
                </p>
                {item.description && (
                  <p className="text-white/80 text-xs line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="mt-2 text-[11px] text-white/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {item.submittedBy || displayUser(item.user, { isRTL })}
                    </span>
                    <span>
                      {formatDate(item.createdAt, locale) ||
                        t("gallery.unknown_date", "Date unavailable")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t("gallery.likes", "Likes")}:</span>
                    <span>{item.likesCount ?? 0}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleToggleLike(item.id);
                }}
                className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-primary shadow"
              >
                <Heart
                  className={`w-3 h-3 ${
                    item.viewerHasLiked ? "fill-primary" : ""
                  }`}
                />
                {item.likesCount ?? 0}
              </button>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t("common.prev", "Previous")}
            </Button>
            <div className="text-sm text-muted-foreground">
              {t("common.page", "Page")} {page} {t("common.of", "of")}{" "}
              {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {t("common.next", "Next")}
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(activeImageId)}
        onOpenChange={() => setActiveImageId(null)}
      >
        <DialogContent className="max-w-4xl">
          {activeImage && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden bg-black">
                <img
                  loading="lazy"
                  src={resolveImageUrl(activeImage.imageUrl)}
                  alt={activeImage.dishName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-3">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-serif font-bold">
                    {activeImage.dishName}
                  </DialogTitle>
                </DialogHeader>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    <strong>{t("gallery.sender", "Sender")}:</strong>{" "}
                    {activeImage.submittedBy ||
                      displayUser(activeImage.user, { isRTL })}
                  </div>
                  <div className="text-xs">
                    <strong>{t("gallery.date_sent", "Date sent")}:</strong>{" "}
                    {formatDate(activeImage.createdAt, locale) ||
                      t("gallery.unknown_date", "Date unavailable")}
                  </div>
                </div>
                {activeImage.description && (
                  <p className="text-sm text-muted-foreground">
                    {activeImage.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span>
                    {t("gallery.likes", "Likes")}: {activeImage.likesCount ?? 0}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (activeImage) {
                      handleToggleLike(activeImage.id);
                    }
                  }}
                  disabled={toggleLikeMutation.isPending}
                >
                  {toggleLikeMutation.isPending
                    ? t("common.loading", "Loading...")
                    : activeImage.viewerHasLiked
                      ? t("gallery.unlike", "Unlike")
                      : t("gallery.like", "Like")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
