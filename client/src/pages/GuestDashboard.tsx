import { useMyGallery, useDeleteMyGallerySubmission } from "@/hooks/useGallery";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  ThumbsUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmProvider";

export default function GuestDashboard() {
  const { t } = useTranslation();
  const { data: submissions = [], isLoading } = useMyGallery();
  const deleteMutation = useDeleteMyGallerySubmission();
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const confirm = useConfirm();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: t("my_submissions.status.approved", "Approved"),
          className:
            "bg-green-500/10 text-green-700 border-green-500/30 dark:bg-green-400/10 dark:text-green-200 dark:border-green-400/30",
        };
      case "rejected":
        return {
          icon: <XCircle className="w-4 h-4" />,
          label: t("my_submissions.status.rejected", "Not Selected"),
          className:
            "bg-red-500/10 text-red-700 border-red-500/30 dark:bg-red-400/10 dark:text-red-200 dark:border-red-400/30",
        };
      case "pending":
        return {
          icon: <Clock className="w-4 h-4" />,
          label: t("my_submissions.status.pending", "Under Review"),
          className:
            "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/30",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          label: status,
          className: "bg-muted text-foreground/90 border-border",
        };
    }
  };

  const normalized = useMemo(
    () =>
      submissions.map(s => ({
        ...s,
        // Safety: backend should always send a status, but default to pending if missing
        status: (s.status as typeof statusFilter | undefined) ?? "pending",
      })),
    [submissions]
  );

  const filtered = useMemo(
    () =>
      normalized.filter(s =>
        statusFilter === "all" ? true : s.status === statusFilter
      ),
    [normalized, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-10 w-full mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 dark:to-muted/10">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            {t("my_submissions.title", "My Gallery Submissions")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t(
              "my_submissions.subtitle",
              "View all your submitted photos. Your photos are reviewed by our team before appearing in the public gallery."
            )}
          </p>
        </div>

        {/* Stats & Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("my_submissions.total", "Total Submissions")}
              </p>
              <p className="text-2xl font-semibold">{submissions.length}</p>
            </div>

            <Tabs
              value={statusFilter}
              onValueChange={v => {
                setStatusFilter(v as any);
                setPage(1);
              }}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="all">
                  {t("my_submissions.filters.all", "All")}
                </TabsTrigger>
                <TabsTrigger value="pending">
                  {t("my_submissions.filters.pending", "Reviewing")}
                </TabsTrigger>
                <TabsTrigger value="approved">
                  {t("my_submissions.filters.approved", "Approved")}
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  {t("my_submissions.filters.rejected", "Not Selected")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/80 mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground/80" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              {t("my_submissions.empty.title", "No submissions found")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {statusFilter === "all"
                ? t(
                    "my_submissions.empty.body_all",
                    "You haven't submitted any photos yet."
                  )
                : t(
                    "my_submissions.empty.body_filtered",
                    "No submissions found for this filter."
                  )}
            </p>
            <Button asChild>
              <a href="/gallery">
                {t("my_submissions.empty.cta", "Submit your first photo")}
              </a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map(item => {
              const statusConfig = getStatusConfig(item.status);
              const imageUrl = resolveImageUrl(item.imageUrl);

              return (
                <Card
                  key={item.id}
                  className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-card/80 backdrop-blur"
                >
                  {/* Image with Overlay */}
                  <div className="relative aspect-[4/3] bg-muted/80 overflow-hidden">
                    <img loading="lazy"
                      src={imageUrl}
                      alt={item.dishName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onClick={() => setPreviewImage(imageUrl)}
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1.5 ${statusConfig.className}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Likes Counter */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1.5"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {item.likesCount}
                      </Badge>
                    </div>

                    {/* Hover Overlay */}
                    <div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 cursor-pointer"
                      onClick={() => setPreviewImage(imageUrl)}
                    />
                  </div>

                  {/* Content */}
                  <CardHeader className="p-4 pb-2">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {item.dishName}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>

                      {item.status === "approved" && (
                        <span className="text-green-600 font-medium">
                          {t("my_submissions.live", "Live in Gallery")}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-200 dark:hover:text-red-100 dark:hover:bg-red-500/10 dark:border-red-400/40"
                      onClick={async () => {
                        const ok = await confirm({
                          title: t("confirm.title", "Delete this submission?"),
                          description: t(
                            "confirm.description",
                            "This will permanently remove your photo."
                          ),
                          confirmText: t("common.delete", "Delete"),
                          cancelText: t("common.cancel", "Cancel"),
                          tone: "danger",
                        });
                        if (!ok) return;
                        deleteMutation.mutate(item.id, {
                          onSuccess: () => {
                            toast.success(
                              t(
                                "gallery.toast.submission_deleted",
                                "Submission deleted."
                              )
                            );
                          },
                          onError: () => {
                            toast.error(
                              t(
                                "gallery.toast.submission_delete_failed",
                                "Failed to delete submission."
                              )
                            );
                          },
                        });
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deleteMutation.isPending
                        ? t("my_submissions.deleting", "Deleting...")
                        : t("my_submissions.remove", "Remove")}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-10">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t("my_submissions.pagination.prev", "Previous")}
            </Button>
            <div className="text-sm text-muted-foreground">
              {t(
                "my_submissions.pagination.page_of",
                "Page {{page}} of {{total}}",
                {
                  page,
                  total: totalPages,
                }
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {t("my_submissions.pagination.next", "Next")}
            </Button>
          </div>
        )}

        {/* Image Preview Dialog */}
        <Dialog
          open={!!previewImage}
          onOpenChange={() => setPreviewImage(null)}
        >
          <DialogContent className="max-w-4xl p-0 border-0">
            {previewImage && (
              <img loading="lazy"
                src={previewImage}
                alt="Preview"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
