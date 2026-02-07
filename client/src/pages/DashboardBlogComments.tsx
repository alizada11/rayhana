import { useMemo, useState, useEffect } from "react";
import {
  useBlogs,
  useBlogComments,
  useUpdateBlogComment,
  useDeleteBlogComment,
} from "@/hooks/useBlogs";
import { Edit, Trash2, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function DashboardBlogComments() {
  const { data: blogsData } = useBlogs({ page: 1, limit: 100 });
  const blogs = blogsData?.items ?? [];
  const [selectedBlogId, setSelectedBlogId] = useState<string>("");
  const { data: comments = [], isLoading } = useBlogComments(selectedBlogId);
  const updateMutation = useUpdateBlogComment();
  const deleteMutation = useDeleteBlogComment();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    if (!selectedBlogId && blogs[0]?.id) {
      setSelectedBlogId(String(blogs[0].id));
    }
  }, [blogs, selectedBlogId]);

  const selectedBlog = useMemo(
    () => blogs.find(b => String(b.id) === selectedBlogId),
    [blogs, selectedBlogId]
  );

  const startEdit = (comment: any) => {
    setEditingId(String(comment.id));
    setEditingContent(comment.content || "");
  };

  const handleSave = (commentId: string) => {
    if (!editingContent.trim()) return;
    updateMutation.mutate({
      blogId: selectedBlogId,
      commentId,
      content: editingContent.trim(),
    });
    setEditingId(null);
    setEditingContent("");
  };

  const handleDelete = (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    deleteMutation.mutate({ blogId: selectedBlogId, commentId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            Comment Moderation
          </h1>
          <p className="text-sm text-gray-500">
            Review and manage blog comments
          </p>
        </div>
        <div className="min-w-[240px]">
          <label className="text-xs text-gray-500">Blog Post</label>
          <select
            value={selectedBlogId}
            onChange={e => setSelectedBlogId(e.target.value)}
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {blogs.map(blog => (
              <option key={blog.id} value={String(blog.id)}>
                {blog.title?.en || blog.slug}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="mb-4 text-sm text-gray-500">
          {selectedBlog?.title?.en || selectedBlog?.slug || "Select a blog"}
        </div>
        {isLoading && (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        )}
        {!isLoading && comments.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No comments yet.
          </div>
        )}
        <div className="space-y-4">
          {comments.map(comment => (
            <div
              key={comment.id}
              className="border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {comment.user?.name || comment.user?.email || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === String(comment.id) ? (
                    <button
                      onClick={() => handleSave(String(comment.id))}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(comment)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(String(comment.id))}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingId === String(comment.id) ? (
                <Textarea
                  value={editingContent}
                  onChange={e => setEditingContent(e.target.value)}
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-sm text-gray-700">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
