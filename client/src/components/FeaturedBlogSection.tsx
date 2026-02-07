import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useBlogs } from "@/hooks/useBlogs";

export default function FeaturedBlogSection() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const { data, isLoading } = useBlogs({ page: 1, limit: 3, featured: true });
  const posts = data?.items ?? [];
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  if (isLoading || posts.length === 0) return null;

  return (
    <section className="container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            {t("blog.featuredTitle", "Featured Stories")}
          </h2>
          <p className="text-muted-foreground">
            {t(
              "blog.featuredSubtitle",
              "Our most loved recipes and cultural journeys."
            )}
          </p>
        </div>
        <Link href="/blog">
          <button className="text-primary font-medium hover:underline">
            {t("blog.viewAll", "View all")}
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post, index) => {
          const title = post.title?.[currentLang] || post.title?.en || "";
          const excerpt =
            post.excerpt?.[currentLang] || post.excerpt?.en || "";
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-lg transition-shadow"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={resolveImageUrl(post.imageUrl)}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-primary shadow">
                    <Star className="w-3 h-3" />
                    {t("blog.featured", "Featured")}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-serif text-lg font-bold line-clamp-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {excerpt}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
