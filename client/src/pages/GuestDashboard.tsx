import { useMyGallery, useDeleteMyGallerySubmission } from "@/hooks/useGallery";
import { useState } from "react";

export default function GuestDashboard() {
  const { data: submissions = [], isLoading } = useMyGallery();
  const deleteMutation = useDeleteMyGallerySubmission();
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const filtered = submissions.filter(s =>
    statusFilter === "all" ? true : s.status === statusFilter
  );

  if (isLoading) return <div>Loading your submissions...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-serif font-bold mb-4">
        Your Photo Submissions
      </h1>

      <div className="flex items-center gap-2 mb-4">
        {["all", "pending", "approved", "rejected"].map(status => (
          <button
            key={status}
            onClick={() =>
              setStatusFilter(status as "all" | "pending" | "approved" | "rejected")
            }
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              statusFilter === status
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-gray-500">No submissions yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="border rounded-xl p-3 bg-white">
              <img
                src={resolveImageUrl(item.imageUrl)}
                alt={item.dishName}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="mt-2">
                <div className="font-semibold">{item.dishName}</div>
                <div className="text-sm text-gray-500">{item.status}</div>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
