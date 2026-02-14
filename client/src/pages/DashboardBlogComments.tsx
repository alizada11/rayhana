import { useState } from "react";
import {
  useAllBlogComments,
  useUpdateBlogComment,
  useDeleteBlogComment,
} from "@/hooks/useBlogs";
import { Edit, Trash2, Save, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmProvider";

export default function DashboardBlogComments() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useAllBlogComments();
  const comments = data?.pages.flatMap(page => page.items) ?? [];
  const updateMutation = useUpdateBlogComment();
  const deleteMutation = useDeleteBlogComment();
  const confirm = useConfirm();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const startEdit = (comment: any) => {
    setEditingId(String(comment.id));
    setEditingContent(comment.content || "");
  };

  const handleSave = (commentId: string) => {
    const comment = comments.find(c => String(c.id) === commentId);
    if (!comment) return;
    if (!editingContent.trim()) return;
    updateMutation.mutate(
      {
        blogId: comment.blogId,
        commentId,
        content: editingContent.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Comment updated.");
          setEditingId(null);
          setEditingContent("");
        },
        onError: () => {
          toast.error("Failed to update comment.");
        },
      }
    );
  };

  const handleDelete = async (commentId: string) => {
    const comment = comments.find(c => String(c.id) === commentId);
    if (!comment) return;
    const ok = await confirm({
      title: "Delete this comment?",
      description: "This will permanently remove the comment from the blog.",
      confirmText: "Delete comment",
      cancelText: "Cancel",
      tone: "danger",
    });
    if (!ok) return;
    deleteMutation.mutate(
      { blogId: comment.blogId, commentId },
      {
        onSuccess: () => {
          toast.success("Comment deleted.");
        },
        onError: () => {
          toast.error("Failed to delete comment.");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Comment Moderation
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and manage blog comments
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {comments.length} comment{comments.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl p-4">
        {isLoading && (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        )}
        {!isLoading && comments.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No comments yet.
          </div>
        )}
        <div className="space-y-4">
          {comments.map(comment => (
            <div
              key={comment.id}
              className="border border-border rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {comment.user?.name || comment.user?.email || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground flex flex-wrap gap-2 items-center">
                    <span>
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleString()
                        : ""}
                    </span>
                    <span className="text-muted-foreground/60">•</span>
                    <a
                      className="text-primary hover:underline"
                      href={`/blog/${comment.blog?.slug ?? comment.blogId ?? ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {comment.blog?.title?.en || comment.blog?.slug || "Blog"}
                    </a>
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
                <p className="text-sm text-foreground/90 leading-6">
                  {comment.content}
                </p>
              )}
            </div>
          ))}
        </div>

        {hasNextPage && (
          <div className="flex justify-center pt-4">
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
    </div>
  );
}
