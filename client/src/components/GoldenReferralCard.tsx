import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Copy, Share2, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function GoldenReferralCard() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  
  // 3D Card Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const generateCode = () => {
    if (!name.trim()) {
      toast.error(t('referral.enter_name_error'));
      return;
    }
    const code = `RAYHANA-${name.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedCode(code);
    setIsFlipped(true);
    toast.success(t('referral.code_generated'));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success(t('referral.code_copied'));
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(t('referral.share_message', { code: generatedCode }));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="perspective-1000 w-full max-w-md mx-auto p-4">
      <motion.div
        style={{ rotateX, rotateY, z: 100 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-[1.6/1] cursor-pointer preserve-3d"
        onClick={() => generatedCode && setIsFlipped(!isFlipped)}
        transition={{ duration: 0.8, type: "spring" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front of Card */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl border border-yellow-500/30 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
          {/* Golden Texture Overlay */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/gold-scale.png')] mix-blend-overlay"></div>
          
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-500/10 to-transparent transform -translate-x-full animate-shimmer"></div>

          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Gift className="w-8 h-8 text-black" />
            </div>
            
            <div>
              <h3 className="font-serif text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200">
                {t('referral.card_title')}
              </h3>
              <p className="text-yellow-100/60 text-sm mt-2">
                {t('referral.card_subtitle')}
              </p>
            </div>

            {!generatedCode && (
              <div className="w-full space-y-3" onClick={e => e.stopPropagation()}>
                <Input
                  placeholder={t('referral.name_placeholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-yellow-500/30 text-yellow-100 placeholder:text-yellow-500/30 text-center focus:border-yellow-500"
                />
                <Button 
                  onClick={generateCode}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('referral.generate_btn')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl border border-yellow-500/30 bg-neutral-900 rotate-y-180">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/gold-scale.png')] mix-blend-overlay"></div>
          
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="text-yellow-100/80 text-sm font-medium">
              {t('referral.your_code_label')}
            </div>
            
            <div className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 tracking-wider">
              {generatedCode}
            </div>

            <div className="flex gap-3 w-full" onClick={e => e.stopPropagation()}>
              <Button 
                variant="outline" 
                className="flex-1 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                onClick={copyCode}
              >
                <Copy className="w-4 h-4 mr-2" />
                {t('referral.copy')}
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-500 text-white border-none"
                onClick={shareOnWhatsApp}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t('referral.share')}
              </Button>
            </div>
            
            <p className="text-xs text-yellow-100/40">
              {t('referral.terms')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
