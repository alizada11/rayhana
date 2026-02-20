import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, User } from "lucide-react";

export default function Blog() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa';

  type Post = {
    id: number;
    title: string;
    excerpt: string;
    author: string;
    time: string;
    category: string;
    image?: string;
  };

  const posts: Post[] = [
    {
      id: 1,
      title: t('blog_page.recipe_1_title'),
      excerpt: t('blog_page.recipe_1_desc'),
      author: 'Rayhana Chef',
      time: '45 min',
      category: 'Recipes'
    },
    {
      id: 2,
      title: t('blog_page.recipe_2_title'),
      excerpt: t('blog_page.recipe_2_desc'),
      author: 'Food Expert',
      time: '10 min read',
      category: 'Tips'
    },
    {
      id: 3,
      title: t('blog_page.recipe_3_title'),
      excerpt: t('blog_page.recipe_3_desc'),
      author: 'Design Team',
      time: '5 min read',
      category: 'Lifestyle'
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-6xl font-bold text-primary"
          >
            {t('blog_page.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {t('blog_page.subtitle')}
          </motion.p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={post.id}
              className="group flex flex-col bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                {post.image ? (
                  <img
                    loading={index === 0 ? "eager" : "lazy"}
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/30 to-background"
                    aria-hidden="true"
                  />
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary uppercase tracking-wider">
                  {post.category}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.time}
                  </div>
                </div>

                <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                  {post.excerpt}
                </p>

                <Button variant="link" className="p-0 h-auto self-start font-bold text-primary">
                  {t('blog_page.read_more')}
                  {isRTL ? <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
