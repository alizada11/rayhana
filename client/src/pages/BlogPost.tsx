import { useTranslation } from 'react-i18next';
import { useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import Comments from '@/components/Comments';
import { motion } from 'framer-motion';
import { useBlogBySlug } from '@/hooks/useBlogs';

export default function BlogPost() {
  const { t, i18n } = useTranslation();
  const [match, params] = useRoute('/blog/:slug');
  const currentLang = i18n.language as 'en' | 'fa' | 'ps';
  const isRTL = currentLang === 'fa' || currentLang === 'ps';
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

  if (!match || !params) return null;

  const { data: post, isLoading } = useBlogBySlug(params.slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('blog.loading', 'Loading post...')}</p>
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
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${apiBase}${url}`;
  };

  const title = post.title?.[currentLang] || post.title?.en || '';
  const content = post.content?.[currentLang] || post.content?.en || '';

  return (
    <article className="min-h-screen bg-background pt-24 pb-16">
      {/* Hero Image */}
      <div className="w-full h-[60vh] relative mb-12 overflow-hidden">
        <img 
          src={resolveImageUrl(post.imageUrl)} 
          alt={title} 
          className="w-full h-full object-cover fixed top-0 left-0 -z-10 opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
          <Link href="/blog">
            <Button variant="ghost" className="mb-8 hover:bg-background/20 text-foreground">
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {t('blog.back', 'Back to Blog')}
            </Button>
          </Link>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6 leading-tight max-w-4xl"
          >
            {title}
          </motion.h1>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString()
                  : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{post.authorName || post.user?.name || 'Rayhana'}</span>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg dark:prose-invert max-w-none font-sans"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          
          <div className="mt-16 pt-8 border-t border-border">
            <h3 className="text-2xl font-serif font-bold mb-6 text-center">
              {t('blog.cookWithUs', 'Ready to cook authentic Qabili Pulao?')}
            </h3>
            <div className="flex justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  {t('hero.cta', 'Shop Rayhana Pots')}
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
