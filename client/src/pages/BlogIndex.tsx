import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { blogPosts } from '@/data/blog-posts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BlogIndex() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'fa' | 'ps';

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {t('blog.title', 'Rayhana Culinary Journal')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('blog.subtitle', 'Exploring the rich heritage of Silk Road cuisine, one story at a time.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
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
                      src={post.image} 
                      alt={post.title[currentLang]} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-serif leading-tight group-hover:text-primary transition-colors">
                      {post.title[currentLang]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.excerpt[currentLang]}
                    </p>
                    <div className="mt-4 text-primary font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                      {t('blog.readMore', 'Read Story')} 
                      <span className="text-lg">→</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
