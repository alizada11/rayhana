import { useMyGallery, useDeleteMyGallerySubmission } from "@/hooks/useGallery";
import { useState, useMemo } from "react";
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

export default function GuestDashboard() {
  const { t } = useTranslation();
  const { data: submissions = [], isLoading } = useMyGallery();
  const deleteMutation = useDeleteMyGallerySubmission();
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
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
          label: "Approved",
          className: "bg-green-50 text-green-700 border-green-200",
        };
      case "rejected":
        return {
          icon: <XCircle className="w-4 h-4" />,
          label: "Not Selected",
          className: "bg-red-50 text-red-700 border-red-200",
        };
      case "pending":
        return {
          icon: <Clock className="w-4 h-4" />,
          label: "Under Review",
          className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          label: status,
          className: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  const filtered = useMemo(
    () =>
      submissions.filter(s =>
        statusFilter === "all" ? true : s.status === statusFilter
      ),
    [submissions, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            My Gallery Submissions
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View all your submitted photos. Your photos are reviewed by our team
            before appearing in the public gallery.
          </p>
        </div>

        {/* Stats & Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Total Submissions</p>
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
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Reviewing</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Not Selected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No submissions found
            </h3>
            <p className="text-gray-500 mb-6">
              {statusFilter === "all"
                ? "You haven't submitted any photos yet."
                : `No ${statusFilter} submissions found.`}
            </p>
            <Button asChild>
              <a href="/">Submit Your First Photo</a>
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
                  className="group overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Image with Overlay */}
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img
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
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {item.dishName}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>

                      {item.status === "approved" && (
                        <span className="text-green-600 font-medium">
                          Live in Gallery
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this submission?"
                          )
                        ) {
                          deleteMutation.mutate(item.id, {
                            onSuccess: () => {
                              toast.success(
                                t("gallery.toast.submission_deleted", "Submission deleted.")
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
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deleteMutation.isPending ? "Deleting..." : "Remove"}
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
              Previous
            </Button>
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
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
              <img
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
