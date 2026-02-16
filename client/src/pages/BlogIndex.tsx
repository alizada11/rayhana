import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useBlogs } from "@/hooks/useBlogs";
import { useEffect, useMemo, useState } from "react";
import SeoTags from "@/components/SeoTags";

export default function BlogIndex() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const { data, isLoading } = useBlogs({ page, limit: pageSize });
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const isRTL = ["fa", "ps"].includes(i18n.language);

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const posts = useMemo(() => data?.items ?? [], [data]);
  const totalPages = data?.totalPages ?? 1;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <SeoTags
        pageKey="blog-index"
        title={t("blog.title", "Rayhana Blog")}
        description={t(
          "blog.subtitle",
          "Stories, recipes, and tips from the Rayhana kitchen."
        )}
        url={`${import.meta.env.VITE_BASE_URL || ""}/blog`}
      />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {t("blog.title", "Rayhana Culinary Journal")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              "blog.subtitle",
              "Exploring the rich heritage of Silk Road cuisine, one story at a time."
            )}
          </p>
        </motion.div>

        {isLoading && (
          <div className="text-center text-muted-foreground py-12">
            {t("common.loading", "Loading stories...")}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            {t("blog.no_stories", "No stories yet. Check back soon.")}
          </div>
        )}

        {!isLoading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any, index: number) => {
              const title = post.title?.[currentLang] || post.title?.en || "";
              const excerpt =
                post.excerpt?.[currentLang] || post.excerpt?.en || "";
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group border-none bg-card/50 backdrop-blur-sm">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={resolveImageUrl(post.imageUrl)}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {post.featured && (
                          <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {t("blog.featured", "Featured")}
                          </div>
                        )}
                        {post.status === "draft" && (
                          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            {t("blog.draft", "Draft")}
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {post.publishedAt
                                ? new Date(
                                    post.publishedAt
                                  ).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>
                              {post.authorName || post.user?.name || "Rayhana"}
                            </span>
                          </div>
                        </div>
                        <CardTitle className="text-xl font-serif leading-tight group-hover:text-primary transition-colors">
                          {title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                          {excerpt}
                        </p>
                        <div className="mt-4 text-primary font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                          {t("blog.readMore", "Read Story")}
                          {isRTL ? (
                            <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                          ) : (
                            <ArrowRight className="ml-2 h-5 w-5" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50"
            >
              {t("blog.prev", "Previous")}
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  page === i + 1
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50"
            >
              {t("blog.next", "Next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
