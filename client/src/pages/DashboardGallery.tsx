import {
  useAllGallery,
  useApproveGallerySubmission,
  useRejectGallerySubmission,
  useDeleteGallerySubmission,
  type GallerySubmission,
  useGalleryLikes,
} from "@/hooks/useGallery";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Check,
  X,
  Trash2,
  Clock,
  ThumbsUp,
  User,
  Calendar,
  Eye,
  Heart,
} from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmProvider";

export default function DashboardGallery() {
  const { data: submissions = [], isLoading } = useAllGallery();
  const approveMutation = useApproveGallerySubmission();
  const rejectMutation = useRejectGallerySubmission();
  const deleteMutation = useDeleteGallerySubmission();
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [preview, setPreview] = useState<GallerySubmission | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [likesDialogId, setLikesDialogId] = useState<string | null>(null);
  const confirm = useConfirm();
  const activeLikesId = likesDialogId || preview?.id;
  const {
    data: likesPages,
    isLoading: likesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGalleryLikes(activeLikesId);
  const likes = likesPages?.pages.flatMap(page => page.items) ?? [];

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-100";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100";
      default:
        return "bg-muted/80 text-foreground";
    }
  };

  const filtered = submissions.filter(s =>
    statusFilter === "all" ? true : s.status === statusFilter
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Gallery Submissions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} submission{filtered.length !== 1 ? "s" : ""} total
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            {
              key: "pending",
              label: "Pending",
              icon: <Clock className="w-3.5 h-3.5" />,
            },
            {
              key: "approved",
              label: "Approved",
              icon: <Check className="w-3.5 h-3.5" />,
            },
            {
              key: "rejected",
              label: "Rejected",
              icon: <X className="w-3.5 h-3.5" />,
            },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key as any);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground/90 border-border hover:border-primary/50"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {pageItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <div className="text-muted-foreground/80">No submissions found</div>
          <div className="text-sm text-muted-foreground mt-1">
            Try selecting a different filter
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pageItems.map(item => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image Preview */}
              <div className="relative aspect-square bg-muted/80">
                <button
                  onClick={() => setPreview(item)}
                  className="absolute inset-0 w-full h-full group"
                >
                  <img loading="lazy"
                    src={resolveImageUrl(item.imageUrl)}
                    alt={item.dishName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <Eye className="absolute top-3 right-3 w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {item.dishName}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{item.user?.name || "Anonymous"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLikesDialogId(item.id)}
                      className="flex items-center gap-1.5 text-foreground/90 hover:text-foreground"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{item.likesCount ?? 0} likes</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(item.createdAt), "MMM d, yyyy · h:mm a")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          approveMutation.mutate(item.id, {
                            onSuccess: () => {
                              toast.success("Gallery submission approved.");
                            },
                            onError: () => {
                              toast.error("Failed to approve submission.");
                            },
                          })
                        }
                        className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          rejectMutation.mutate(item.id, {
                            onSuccess: () => {
                              toast.success("Gallery submission rejected.");
                            },
                            onError: () => {
                              toast.error("Failed to reject submission.");
                            },
                          })
                        }
                        className="flex-1 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {item.status === "approved" && (
                    <button
                      onClick={() =>
                        rejectMutation.mutate(item.id, {
                          onSuccess: () => {
                            toast.success("Gallery submission unapproved.");
                          },
                          onError: () => {
                            toast.error("Failed to unapprove submission.");
                          },
                        })
                      }
                      className="flex-1 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      Unapprove
                    </button>
                  )}
                  {item.status === "rejected" && (
                    <button
                      onClick={() =>
                        approveMutation.mutate(item.id, {
                          onSuccess: () => {
                            toast.success("Gallery submission approved.");
                          },
                          onError: () => {
                            toast.error("Failed to approve submission.");
                          },
                        })
                      }
                      className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Delete this submission?",
                        description:
                          "This will permanently remove the gallery submission.",
                        confirmText: "Delete submission",
                        cancelText: "Cancel",
                        tone: "danger",
                      });
                      if (!ok) return;
                      deleteMutation.mutate(item.id, {
                        onSuccess: () => {
                          toast.success("Gallery submission deleted.");
                        },
                        onError: () => {
                          toast.error("Failed to delete submission.");
                        },
                      });
                    }}
                    className="px-3 py-2 bg-muted/80 text-foreground/90 text-sm font-medium rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card text-foreground/90 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 text-sm font-medium rounded-lg ${
                  page === p
                    ? "bg-primary text-white"
                    : "bg-card text-foreground/90 hover:bg-muted/80"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card text-foreground/90 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={Boolean(preview)} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-4xl p-0 border-0">
          <DialogHeader>
            <DialogTitle className="text-center font-serif p-2 text-2xl text-foreground dark:text-amber-500">
              Submission Details
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="bg-card rounded-xl overflow-hidden">
              <div className="relative">
                <img loading="lazy"
                  src={resolveImageUrl(preview.imageUrl)}
                  alt={preview.dishName}
                  className="w-full max-h-[50vh] object-contain"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(preview.status)}`}
                  >
                    {preview.status.charAt(0).toUpperCase() +
                      preview.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {preview.dishName}
                  </h2>
                  {preview.description && (
                    <p className="text-muted-foreground mt-2">{preview.description}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Submitted by</div>
                    <div className="font-medium">
                      {preview.user?.name || "Anonymous"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Likes</div>
                    <button
                      type="button"
                      onClick={() => {
                        setLikesDialogId(preview.id);
                        setPreview(null);
                      }}
                      className="font-medium text-left text-foreground hover:text-foreground underline-offset-2 hover:underline"
                    >
                      {preview.likesCount ?? 0}{" "}
                      {likesLoading ? "(loading...)" : ""}
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Status</div>
                    <div className="font-medium capitalize">
                      {preview.status}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Submitted on</div>
                    <div className="font-medium">
                      {format(new Date(preview.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
                {/* Likes list moved to dedicated dialog */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Likes Dialog */}
      <Dialog
        open={Boolean(likesDialogId)}
        onOpenChange={open => {
          if (!open) setLikesDialogId(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Likes</DialogTitle>
          </DialogHeader>
          {likesLoading ? (
            <div className="text-sm text-muted-foreground">Loading likes...</div>
          ) : likes.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No likes yet for this submission.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="max-h-72 overflow-auto space-y-2">
                {likes.map(like => (
                  <div
                    key={like.id}
                    className="flex items-center justify-between text-sm text-foreground border border-border/80 rounded-lg px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {like.user?.name || "Anonymous"}
                      </span>
                      {like.user?.email && (
                        <span className="text-xs text-muted-foreground">
                          {like.user.email}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Heart className="fill-primary" />
                    </div>
                  </div>
                ))}
              </div>
              {hasNextPage && (
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full text-sm font-medium text-foreground/90 border border-border rounded-lg py-2 hover:bg-muted disabled:opacity-50"
                >
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
