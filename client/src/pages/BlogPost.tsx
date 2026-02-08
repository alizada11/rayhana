import { useTranslation } from "react-i18next";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import Comments from "@/components/Comments";
import { motion } from "framer-motion";
import { useBlogBySlug } from "@/hooks/useBlogs";
import DOMPurify from "dompurify";

export default function BlogPost() {
  const { t, i18n } = useTranslation();
  const [match, params] = useRoute("/blog/:slug");
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const isRTL = currentLang === "fa" || currentLang === "ps";
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  const { data: post, isLoading } = useBlogBySlug(params?.slug);

  if (!match || !params) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t("blog.loading", "Loading post...")}
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const title = post.title?.[currentLang] || post.title?.en || "";
  const content = post.content?.[currentLang] || post.content?.en || "";
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <article className="min-h-screen bg-background pb-16">
      {/* Hero + Metadata */}
      <div className="relative mb-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${resolveImageUrl(post.imageUrl)})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background to-transparent" />

        <div className="container mx-auto px-8">
          <div className="py-16 md:py-24 relative z-10">
            <Link href="/blog">
              <Button
                variant="ghost"
                className="mb-6 hover:bg-muted/60 text-foreground"
              >
                <ArrowLeft
                  className={`w-4 h-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`}
                />
                {t("blog.back", "Back to Blog")}
              </Button>
            </Link>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6 leading-tight"
            >
              {title}
            </motion.h1>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.authorName || post.user?.name || "Rayhana"}</span>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                <Share2 className="w-4 h-4 mr-2" />
                {t("referral.share", "Share")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via
          DOMPurify
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg dark:prose-invert max-w-none font-sans"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
          <div className="mt-16 pt-8 border-t border-border">
            <h3 className="text-2xl font-serif font-bold mb-6 text-center">
              {t("blog.cookWithUs", "Ready to cook authentic Qabili Pulao?")}
            </h3>
            <div className="flex justify-center">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                >
                  {t("hero.cta", "Shop Rayhana Pots")}
                </Button>
              </Link>
            </div>
          </div>
          {/* Comments Section */}
          <Comments postId={String(post.id)} />
        </div>
      </div>
    </article>
  );
}
