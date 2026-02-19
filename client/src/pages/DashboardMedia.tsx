import { useRef, useState } from "react";
import { useDeleteMedia, useMedia, useUploadMedia } from "@/hooks/useMedia";
import { Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmProvider";

export default function DashboardMedia() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useMedia();
  const media = data?.pages.flatMap(page => page.items) ?? [];
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();
  const confirm = useConfirm();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  const resolveUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(
      { file, onProgress: setUploadProgress },
      {
        onSuccess: () => {
          setUploadProgress(null);
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          toast.success("Media uploaded successfully.");
        },
        onError: () => {
          setUploadProgress(null);
          toast.error("Failed to upload media.");
        },
        onSettled: () => {
          setUploadProgress(null);
        },
      }
    );
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete this media item?",
      description: "This will permanently remove the file from the library.",
      confirmText: "Delete media",
      cancelText: "Cancel",
      tone: "danger",
    });
    if (!ok) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Media deleted.");
      },
      onError: () => {
        toast.error("Failed to delete media.");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Media Library
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage site images
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg text-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </button>
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg text-sm"
            >
              {isFetchingNextPage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Load more"
              )}
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full md:w-auto"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploadMutation.isPending}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
        {uploadProgress !== null && (
          <div className="mt-4 space-y-1">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-[width]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadProgress}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      )}

      {!isLoading && media.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No media uploaded yet.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((item: any) => (
          <div
            key={item.id}
            className="border rounded-xl overflow-hidden bg-card shadow-sm"
          >
            <div className="aspect-square bg-muted">
              {item.mimeType?.startsWith("video/") ? (
                <video
                  src={resolveUrl(item.url)}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={resolveUrl(item.url)}
                  alt={item.altText || item.fileName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-3 space-y-2">
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.fileName}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/80">
                  {item.width && item.height
                    ? `${item.width}x${item.height}`
                    : ""}
                </span>
                <button
                  onClick={() => handleDelete(String(item.id))}
                  className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm"
          >
            {isFetchingNextPage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
