import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, User, Send, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useBlogComments,
  useCreateBlogComment,
  useDeleteBlogComment,
  useUpdateBlogComment,
} from "@/hooks/useBlogs";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const { t, i18n } = useTranslation();
  const isRTL = ["fa", "ps"].includes(i18n.language);
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { data: me } = useUserRole();
  const [, setLocation] = useLocation();

  const { data: comments = [], isLoading } = useBlogComments(postId);
  const createMutation = useCreateBlogComment();
  const updateMutation = useUpdateBlogComment();
  const deleteMutation = useDeleteBlogComment();

  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const canManage = (comment: any) =>
    me?.role === "admin" || (userId && comment.userId === userId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!isSignedIn) {
      setLocation("/pamik-sign-in");
      return;
    }

    createMutation.mutate(
      { blogId: postId, content: message.trim() },
      {
        onSuccess: () => {
          setMessage("");
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2500);
        },
        onError: () => {
          toast.error(
            isRTL ? "ارسال نظر ناموفق بود" : "Failed to submit comment"
          );
        },
      }
    );
  };

  const handleEdit = (comment: any) => {
    setEditingId(String(comment.id));
    setEditingMessage(comment.content || "");
  };

  const handleUpdate = (commentId: string) => {
    if (!editingMessage.trim()) return;
    updateMutation.mutate(
      { blogId: postId, commentId, content: editingMessage.trim() },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditingMessage("");
        },
        onError: () => {
          toast.error(isRTL ? "ویرایش ناموفق بود" : "Update failed");
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    deleteMutation.mutate(
      { blogId: postId, commentId },
      {
        onError: () => {
          toast.error(isRTL ? "حذف ناموفق بود" : "Delete failed");
        },
      }
    );
  };

  return (
    <div className="mt-16 max-w-3xl mx-auto">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-serif flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            {t("comments.title", "Comments")} ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {/* Comment Form */}
          <form
            onSubmit={handleSubmit}
            className="mb-12 bg-card p-6 rounded-xl border shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10 border-2 border-background">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {user?.fullName || user?.username || t("comments.guest", "Guest")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isSignedIn
                    ? t("comments.signedIn", "Signed in")
                    : t("comments.signInToComment", "Sign in to comment")}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label
                htmlFor="message"
                className="text-sm font-medium text-muted-foreground"
              >
                {t("comments.message", "Message")}
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t("comments.message", "Message")}
                required
                className="min-h-[100px] bg-background"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createMutation.isPending ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <Send className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("comments.submit", "Post Comment")}
                  </>
                )}
              </Button>

              <AnimatePresence>
                {showSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-green-600 text-sm font-medium"
                  >
                    {t("comments.success", "Comment submitted successfully!")}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {isLoading && (
              <p className="text-center text-muted-foreground py-8">
                {t("comments.loading", "Loading comments...")}
              </p>
            )}
            {!isLoading && comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t(
                  "comments.noComments",
                  "No comments yet. Be the first to share your thoughts!"
                )}
              </p>
            ) : (
              comments.map(comment => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 p-4 rounded-lg bg-muted/30"
                >
                  <Avatar className="w-10 h-10 border-2 border-background">
                    <AvatarImage src={comment.user?.imageUrl} />
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm">
                        {comment.user?.name || comment.user?.email || "User"}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>

                    {editingId === String(comment.id) ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingMessage}
                          onChange={e => setEditingMessage(e.target.value)}
                          className="min-h-[80px] bg-background"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleUpdate(String(comment.id))}
                            disabled={updateMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditingMessage("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {comment.content}
                      </p>
                    )}
                  </div>
                  {canManage(comment) && editingId !== String(comment.id) && (
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(comment)}
                        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(String(comment.id))}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
