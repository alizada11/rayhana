import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  avatar?: string;
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const { t, i18n } = useTranslation();
  const isRTL = ['fa', 'ps'].includes(i18n.language);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load comments from localStorage on mount
  useEffect(() => {
    const savedComments = localStorage.getItem(`comments-${postId}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      // Add some dummy comments for demonstration
      setComments([
        {
          id: '1',
          name: 'Sarah M.',
          email: 'sarah@example.com',
          message: 'I tried this recipe last weekend and it was amazing! The pot really makes a difference.',
          date: '2025-01-15',
          avatar: 'https://i.pravatar.cc/150?u=sarah'
        },
        {
          id: '2',
          name: 'Ahmad K.',
          email: 'ahmad@example.com',
          message: 'Authentic taste just like my grandmother used to make. Thank you Rayhana!',
          date: '2025-01-18',
          avatar: 'https://i.pravatar.cc/150?u=ahmad'
        }
      ]);
    }
  }, [postId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);

    // Simulate API delay
    setTimeout(() => {
      const newComment: Comment = {
        id: Date.now().toString(),
        name,
        email,
        message,
        date: new Date().toISOString().split('T')[0],
        avatar: `https://i.pravatar.cc/150?u=${name}`
      };

      const updatedComments = [newComment, ...comments];
      setComments(updatedComments);
      localStorage.setItem(`comments-${postId}`, JSON.stringify(updatedComments));

      setName('');
      setEmail('');
      setMessage('');
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="mt-16 max-w-3xl mx-auto">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-serif flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            {t('comments.title', 'Comments')} ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="mb-12 bg-card p-6 rounded-xl border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                  {t('comments.name', 'Name')}
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('comments.name', 'Name')}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  {t('comments.email', 'Email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('comments.email', 'Email')}
                  required
                  className="bg-background"
                />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <label htmlFor="message" className="text-sm font-medium text-muted-foreground">
                {t('comments.message', 'Message')}
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('comments.message', 'Message')}
                required
                className="min-h-[100px] bg-background"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('comments.submit', 'Post Comment')}
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
                    {t('comments.success', 'Comment submitted successfully!')}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('comments.noComments', 'No comments yet. Be the first to share your thoughts!')}
              </p>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 p-4 rounded-lg bg-muted/30"
                >
                  <Avatar className="w-10 h-10 border-2 border-background">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm">{comment.name}</h4>
                      <span className="text-xs text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {comment.message}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
