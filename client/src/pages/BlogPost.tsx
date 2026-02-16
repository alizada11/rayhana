import { useTranslation } from "react-i18next";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  User,
  Share2,
  Link as LinkIcon,
  Copy,
} from "lucide-react";
import Comments from "@/components/Comments";
import { motion } from "framer-motion";
import { useBlogBySlug } from "@/hooks/useBlogs";
import DOMPurify from "dompurify";
import SeoTags from "@/components/SeoTags";
import { useState } from "react";

export default function BlogPost() {
  const { t, i18n } = useTranslation();
  const [match, params] = useRoute("/blog/:slug");
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const isRTL = currentLang === "fa" || currentLang === "ps";
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const [shareOpen, setShareOpen] = useState(false);

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
          <h1 className="text-2xl font-bold mb-4">
            {t("blog.post.not_found", "Post not found")}
          </h1>
          <Link href="/blog">
            <Button>{t("blog.post.back_to_blog", "Back to Blog")}</Button>
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
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${apiBase}/blog/${post.slug}`;

  const shareTargets = [
    {
      key: "share.copy",
      label: t("share.copy_link", "Copy link"),
      action: async () => {
        await navigator.clipboard.writeText(shareUrl);
        setShareOpen(false);
      },
      icon: Copy,
    },
    {
      key: "share.whatsapp",
      label: t("share.whatsapp", "Share on WhatsApp"),
      url: `https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`,
    },
    {
      key: "share.telegram",
      label: t("share.telegram", "Share on Telegram"),
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    },
    {
      key: "share.twitter",
      label: t("share.twitter", "Share on X"),
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    },
    {
      key: "share.facebook",
      label: t("share.facebook", "Share on Facebook"),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        /* fall back */
      }
    }
    setShareOpen(s => !s);
  };

  return (
    <article className="min-h-screen bg-background pb-16">
      <SeoTags
        pageKey="blog-post"
        title={title || post.title?.en}
        description={
          post.excerpt?.[currentLang] || post.excerpt?.en || content.slice(0, 150)
        }
        image={resolveImageUrl(post.imageUrl)}
        url={shareUrl}
        type="article"
        publishedTime={post.publishedAt || post.createdAt}
        modifiedTime={post.updatedAt}
      />
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
              <Button variant="default" className="mb-6 hover:bg-muted/70">
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

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm md:text-base">
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
              <div className={`${isRTL ? "mr-auto" : "ml-auto"} relative`}>
                <Button variant="outline" size="sm" onClick={handleNativeShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  {t("referral.share", "Share")}
                </Button>
                {shareOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-card shadow-lg z-10">
                    {shareTargets.map(target => {
                      const Icon = target.icon || LinkIcon;
                      const onClick = target.action
                        ? target.action
                        : () => window.open(target.url, "_blank", "noopener");
                      return (
                        <button
                          key={target.key}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                          onClick={onClick}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{target.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`prose prose-lg dark:prose-invert max-w-none font-sans
              prose-headings:font-serif prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
              prose-h2:font-serif
              prose-headings:mt-8 prose-headings:mb-3
              prose-p:text-base prose-p:leading-8 prose-p:mt-3 prose-p:mb-5
              prose-li:leading-8 prose-li:mt-2 prose-li:mb-2
              prose-img:rounded-2xl prose-img:shadow-md prose-img:border prose-img:border-border prose-img:my-6
              prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:rounded-lg prose-blockquote:my-6
              prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-6 prose-ol:pl-6 prose-ul:my-4 prose-ol:my-4
              prose-table:shadow-sm prose-table:border prose-td:border prose-th:border prose-table:my-6
              prose-a:text-primary hover:prose-a:text-primary/80
              ${isRTL ? "rtl prose-headings:font-[inherit]" : ""}`}
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
