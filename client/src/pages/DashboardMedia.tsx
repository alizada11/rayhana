import { useState } from "react";
import { useDeleteMedia, useMedia, useUploadMedia } from "@/hooks/useMedia";
import { Trash2, Upload } from "lucide-react";

export default function DashboardMedia() {
  const { data: media = [], isLoading } = useMedia();
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();
  const [file, setFile] = useState<File | null>(null);
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  const resolveUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate({ file });
    setFile(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this media item?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            Media Library
          </h1>
          <p className="text-sm text-gray-500">
            Upload and manage site images
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <input
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
      </div>

      {isLoading && (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      )}

      {!isLoading && media.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No media uploaded yet.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((item: any) => (
          <div
            key={item.id}
            className="border rounded-xl overflow-hidden bg-white shadow-sm"
          >
            <div className="aspect-square bg-gray-50">
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
              <p className="text-xs text-gray-500 line-clamp-1">
                {item.fileName}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {item.width && item.height
                    ? `${item.width}x${item.height}`
                    : ""}
                </span>
                <button
                  onClick={() => handleDelete(String(item.id))}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
