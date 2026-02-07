import { useState } from "react";
import { useMedia, useUploadMedia } from "@/hooks/useMedia";
import { X, Upload, Check } from "lucide-react";

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  accept?: "image" | "video" | "both";
};

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  accept = "image",
}: MediaPickerProps) {
  const { data: media = [], isLoading } = useMedia();
  const uploadMutation = useUploadMedia();
  const [file, setFile] = useState<File | null>(null);
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  const resolveUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  if (!open) return null;

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate({ file });
    setFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold">Media Library</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <input
              type="file"
              accept="image/*"
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

          {isLoading && (
            <div className="text-center text-gray-500 py-6">Loading...</div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {media
              .filter((item: any) => {
                if (accept === "both") return true;
                if (accept === "video") return item.mimeType?.startsWith("video/");
                return item.mimeType?.startsWith("image/");
              })
              .map((item: any) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(resolveUrl(item.url))}
                className="group border rounded-xl overflow-hidden text-left hover:ring-2 hover:ring-primary transition-all"
                title="Select"
              >
                <div className="aspect-square bg-gray-50 relative">
                  {item.mimeType?.startsWith("video/") ? (
                    <video
                      src={resolveUrl(item.url)}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={resolveUrl(item.url)}
                      alt={item.altText || item.fileName}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-primary rounded-full p-2">
                      <Check className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="p-2 text-xs text-gray-500 line-clamp-1">
                  {item.fileName}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
