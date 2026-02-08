import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Heart, Search } from "lucide-react";
import { useApprovedGallery, useToggleGalleryLike } from "@/hooks/useGallery";
import { Button } from "@/components/ui/button";

export default function Gallery() {
  const { t, i18n } = useTranslation();
  const isRTL = ["fa", "ps"].includes(i18n.language);
  const { data: galleryImages = [], isLoading } = useApprovedGallery();
  const toggleLikeMutation = useToggleGalleryLike();
  const [, setLocation] = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

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
    toggleLikeMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
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
          <Button
            className="rounded-full"
            onClick={() => setLocation("/submit-photo")}
          >
            {t("gallery.share_button", "Share Your Photo")}
          </Button>
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
            >
              <img
                src={resolveImageUrl(item.imageUrl)}
                alt={item.dishName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                <p className="text-white font-semibold">{item.dishName}</p>
                <p className="text-white/80 text-xs">
                  {item.user?.name || (isRTL ? "مهمان" : "Guest")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleLike(item.id)}
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
    </div>
  );
}
