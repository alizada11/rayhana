import { useTranslation } from "react-i18next";
import { Camera, Heart, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useApprovedGallery,
  useCreateGallerySubmission,
  useToggleGalleryLike,
} from "@/hooks/useGallery";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useLocation } from "wouter";

export function CustomerGallery() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dishName, setDishName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeImage, setActiveImage] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const { isSignedIn } = useAuth();
  const { data: me } = useUserRole();
  const { data: galleryImages = [], isLoading } = useApprovedGallery();
  const createMutation = useCreateGallerySubmission();
  const toggleLikeMutation = useToggleGalleryLike();
  const [, setLocation] = useLocation();
  const loginRequiredMessage = t("login_page.loginRequired");

  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const revokePreview = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = 5 * 1024 * 1024; // 5MB client cap
    if (file.size > maxBytes) {
      toast.error(
        t("gallery.toast.under5mb", "Please choose an image under 5MB")
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

  // Cleanup created object URLs on unmount
  useEffect(() => {
    return () => revokePreview();
  }, []);

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
          setIsOpen(false);
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

  return (
    <section className="py-20 bg-stone-50 dark:bg-stone-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary dark:text-amber-500">
            {t("gallery.title")}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-lg max-w-2xl mx-auto">
            {t("gallery.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {isLoading && (
            <div className="text-stone-500 col-span-full text-center">
              {t("common.loading", "Loading...")}
            </div>
          )}
          {!isLoading && galleryImages.length === 0 && (
            <div className="text-stone-500 col-span-full text-center">
              {t("gallery.noPhotosYet", "No photos yet")}
            </div>
          )}
          {galleryImages.slice(0, 8).map((img, index) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
              onClick={() => setActiveImage(img)}
            >
              <img
                loading={index < 4 ? "eager" : "lazy"}
                src={resolveImageUrl(img.imageUrl)}
                alt={`Gallery by ${img.user?.name || "Guest"}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                <p className="font-bold text-lg mb-1">{img.dishName}</p>
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm opacity-90">
                    {img.user?.name || (isRTL ? "مهمان" : "Guest")}
                  </p>
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isSignedIn) {
                        toast.error(loginRequiredMessage);
                        setLocation("/login");
                        return;
                      }
                      toggleLikeMutation.mutate(img.id);
                    }}
                    className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm"
                  >
                    <Heart
                      className={`w-3 h-3 ${
                        img.viewerHasLiked ? "fill-white" : ""
                      }`}
                    />
                    {img.likesCount ?? 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Dialog
            open={isOpen}
            onOpenChange={open => {
              if (open && !canSubmit) {
                if (!isSignedIn) {
                  toast.error(loginRequiredMessage);
                  setLocation("/login");
                } else {
                  toast.error(
                    t("gallery.toast.guests_only", "Only guests can submit")
                  );
                }
                return;
              }
              setIsOpen(open);
              if (open) {
                setUploadProgress(null);
                revokePreview();
                setSelectedImage(null);
                setImageFile(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 text-white border-none text-lg px-6 py-2 h-auto shadow-lg hover:shadow-xl transition-all gap-2"
              >
                <Camera className="w-5 h-5" />
                {t("gallery.share_button")}
              </Button>
            </DialogTrigger>
            <DialogContent className={`sm:max-w-md ${isRTL ? "rtl" : "ltr"}`}>
              <DialogHeader>
                <DialogTitle className="text-center font-serif text-2xl text-amber-900 dark:text-amber-500">
                  {t("gallery.upload_title")}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="flex flex-col items-center justify-center w-full">
                  <Label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-stone-300 border-dashed rounded-xl cursor-pointer bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:border-stone-600 dark:hover:border-stone-500 dark:hover:bg-stone-700 transition-all duration-300 group"
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
                          }}
                          className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-stone-400 group-hover:text-amber-700 transition-colors">
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
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>{t("profile.uploading", "uploading...")}</span>
                        <span>{uploadProgress ?? 0}%</span>
                      </div>
                      <Progress value={uploadProgress ?? 0} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label
                      htmlFor="dish-name"
                      className="text-stone-600 dark:text-stone-300"
                    >
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
                      className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-stone-600 dark:text-stone-300"
                    >
                      {t("gallery.dishDescription", "Description (Optional)")}
                    </Label>
                    <Textarea
                      id="description"
                      placeholder={t("gallery.upload_note")}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="resize-none bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 focus:ring-amber-500 min-h-[80px]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full rounded-full bg-amber-700 hover:bg-amber-800 text-white h-11 text-base font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {createMutation.isPending
                    ? t("gallery.uploading", "Uploading...")
                    : t("gallery.submit_photo")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 shadow-sm hover:shadow-md transition-all"
            onClick={() => setLocation("/gallery")}
          >
            {t("gallery.view_all", "View all photos")}
          </Button>
        </div>
      </div>

      <Dialog
        open={Boolean(activeImage)}
        onOpenChange={() => setActiveImage(null)}
      >
        <DialogContent className={`max-w-4xl ${isRTL ? "rtl" : "ltr"}`}>
          {activeImage && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden bg-black">
                <img
                  src={resolveImageUrl(activeImage.imageUrl)}
                  alt={activeImage.dishName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-serif font-bold">
                  {activeImage.dishName}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {activeImage.user?.name || (isRTL ? "مهمان" : "Guest")}
                </p>
                {activeImage.description && (
                  <p className="text-stone-700 dark:text-stone-300">
                    {activeImage.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <Heart className="w-4 h-4" />
                  <span>{activeImage.likesCount ?? 0}</span>
                </div>
                <div className="text-xs text-stone-400">
                  {new Date(activeImage.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
