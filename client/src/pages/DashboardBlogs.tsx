import { useState, useEffect } from "react";
import { useBlogs, useDeleteBlog } from "@/hooks/useBlogs";
import BlogForm from "@/components/BlogForm";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Star,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmProvider";

const getTitle = (post: any) =>
  post.title?.en || post.title?.fa || post.title?.ps || post.slug || "Blog post";

function DashboardBlogs() {
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const confirm = useConfirm();

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, featuredFilter, debouncedSearchTerm]);

  useEffect(() => {
    const id = setTimeout(
      () => setDebouncedSearchTerm(searchTerm.trim()),
      300
    );
    return () => clearTimeout(id);
  }, [searchTerm]);

  const { data, isLoading } = useBlogs({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter === "all" ? undefined : statusFilter,
    featured: featuredFilter === "featured" ? true : undefined,
    search: debouncedSearchTerm || undefined,
  });
  const deleteMutation = useDeleteBlog();

  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };
  const posts = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingPost(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete this blog post?",
      description: "This will permanently remove the post and its content.",
      confirmText: "Delete post",
      cancelText: "Keep post",
      tone: "danger",
    });
    if (!ok) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Blog post deleted.");
      },
      onError: () => {
        toast.error("Failed to delete blog post.");
      },
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Blogs</h1>
          <p className="text-sm text-muted-foreground">Create and manage blog posts</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Post
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground/80" />
            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as "all" | "published" | "draft")
              }
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-muted-foreground/80" />
            <select
              value={featuredFilter}
              onChange={e =>
                setFeaturedFilter(e.target.value as "all" | "featured")
              }
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">All</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Posts</p>
          <p className="text-2xl font-bold text-foreground">{data?.total ?? 0}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Showing</p>
          <p className="text-2xl font-bold text-foreground">
            {posts.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Featured</p>
          <p className="text-2xl font-bold text-foreground">
            {posts.filter(p => p.featured).length}
          </p>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {posts.map(post => (
          <div
            key={post.id}
            className="border rounded-xl p-4 bg-card shadow-sm w-full box-border"
          >
            <div className="flex items-center gap-3">
              <img
                loading="lazy"
                src={resolveImageUrl(post.imageUrl)}
                alt={getTitle(post)}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{getTitle(post)}</p>
                <p className="text-xs text-muted-foreground">{post.slug}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <span className="px-2 py-1 rounded-full bg-muted/80 text-foreground/90">
                {post.status}
              </span>
              <span className="px-2 py-1 rounded-full bg-muted/80 text-foreground/90">
                {post.featured ? "Featured" : "Standard"}
              </span>
              <span className="px-2 py-1 rounded-full bg-muted/80 text-foreground/90">
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              <Link href={`/blog/${post.slug}`}>
                <button
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </Link>
              <button
                onClick={() => handleEdit(post)}
                className="p-2 text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(String(post.id))}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Blog Table (desktop) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.length > 0 ? (
                posts.map(post => (
                  <tr
                    key={post.id}
                    className="hover:bg-muted transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          loading="lazy"
                          src={resolveImageUrl(post.imageUrl)}
                          alt={getTitle(post)}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {getTitle(post)}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                            {post.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          post.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {post.featured ? (
                        <span className="inline-flex items-center gap-1 text-primary font-medium">
                          <Star className="w-4 h-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-muted-foreground/80">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/blog/${post.slug}`}>
                          <button
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(String(post.id))}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-muted-foreground/80">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/80 flex items-center justify-center">
                        <span className="text-2xl">📝</span>
                      </div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        No posts found
                      </p>
                      <p className="text-muted-foreground">
                        {searchTerm ||
                        statusFilter !== "all" ||
                        featuredFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Get started by creating your first blog post"}
                      </p>
                      {!searchTerm &&
                        statusFilter === "all" &&
                        featuredFilter === "all" && (
                          <button
                            onClick={handleAdd}
                            className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add New Post
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination (visible on all breakpoints) */}
      {totalPages > 1 && (
        <div className="bg-card border border-border rounded-xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-primary text-white"
                      : "text-foreground/90 hover:bg-muted/80"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <BlogForm post={editingPost} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

export default DashboardBlogs;
