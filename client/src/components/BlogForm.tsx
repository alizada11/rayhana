import { useEffect, useState } from "react";
import { useCreateBlog, useUpdateBlog } from "@/hooks/useBlogs";
import BlogRichTextEditor from "@/components/BlogRichTextEditor";
import MediaPicker from "@/components/MediaPicker";
import { X, Star, Image as ImageIcon } from "lucide-react";

type BlogFormProps = {
  post?: any;
  onClose: () => void;
};

export default function BlogForm({ post, onClose }: BlogFormProps) {
  const isEdit = Boolean(post);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const resolveImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };
  const [imagePreview, setImagePreview] = useState<string | null>(
    resolveImageUrl(post?.imageUrl) || null
  );

  const [formData, setFormData] = useState({
    title: post?.title || { en: "", fa: "", ps: "" },
    excerpt: post?.excerpt || { en: "", fa: "", ps: "" },
    content: post?.content || { en: "", fa: "", ps: "" },
    slug: post?.slug || "",
    authorName: post?.authorName || "",
    status: post?.status || "published",
    featured: Boolean(post?.featured),
    imageUrl: post?.imageUrl || "",
  });

  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleJSONFieldChange = (
    field: "title" | "excerpt" | "content",
    lang: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile && !formData.imageUrl) {
      alert("Please provide a cover image.");
      return;
    }

    const payload = new FormData();
    payload.append("title", JSON.stringify(formData.title));
    payload.append("excerpt", JSON.stringify(formData.excerpt));
    payload.append("content", JSON.stringify(formData.content));
    payload.append("slug", formData.slug);
    payload.append("authorName", formData.authorName);
    payload.append("status", formData.status);
    payload.append("featured", String(formData.featured));
    payload.append("imageUrl", formData.imageUrl);
    if (imageFile) payload.append("image", imageFile);

    if (isEdit) {
      updateMutation.mutate({ id: post.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }

    onClose();
  };

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!imageFile && post?.imageUrl) {
      setImagePreview(resolveImageUrl(post.imageUrl));
    }
  }, [imageFile, post?.imageUrl]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-gray-900">
            {isEdit ? "Edit Blog Post" : "Add New Blog Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Title</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {["en", "fa", "ps"].map(lang => (
                <div key={lang}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {lang.toUpperCase()}
                  </label>
                  <input
                    type="text"
                    placeholder={`Title in ${lang}`}
                    value={formData.title[lang]}
                    onChange={e =>
                      handleJSONFieldChange("title", lang, e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Excerpt</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["en", "fa", "ps"].map(lang => (
                <div key={lang}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {lang.toUpperCase()}
                  </label>
                  <textarea
                    placeholder={`Excerpt in ${lang}`}
                    value={formData.excerpt[lang]}
                    onChange={e =>
                      handleJSONFieldChange("excerpt", lang, e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Content</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {["en", "fa", "ps"].map(lang => (
                <div key={lang}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {lang.toUpperCase()}
                  </label>
                  <BlogRichTextEditor
                    value={formData.content[lang]}
                    onChange={value =>
                      handleJSONFieldChange("content", lang, value)
                    }
                    placeholder={`Write content in ${lang}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Slug / Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                placeholder="e.g., world-of-qabili-pulao"
                value={formData.slug}
                onChange={e => handleChange("slug", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author Name
              </label>
              <input
                type="text"
                placeholder="Rayhana Kitchen"
                value={formData.authorName}
                onChange={e => handleChange("authorName", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Status / Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => handleChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => handleChange("featured", !formData.featured)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  formData.featured
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 hover:border-primary"
                }`}
              >
                <Star className="w-4 h-4" />
                Featured
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="blog-image-upload"
                  />
                  <label htmlFor="blog-image-upload" className="cursor-pointer">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xl">🖼️</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload cover image
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or paste image URL"
                  value={formData.imageUrl}
                  onChange={e => handleChange("imageUrl", e.target.value)}
                  className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ImageIcon className="w-4 h-4" />
                  Choose from Media Library
                </button>
              </div>

              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </span>
              ) : isEdit ? (
                "Update Post"
              ) : (
                "Create Post"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <MediaPicker
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={url => {
          handleChange("imageUrl", url);
          setShowMediaPicker(false);
        }}
      />
    </div>
  );
}
