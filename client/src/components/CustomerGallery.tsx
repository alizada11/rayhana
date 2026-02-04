import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Camera, Heart, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CustomerGallery() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa';
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Placeholder images for the gallery - using food related images
  const galleryImages = [
    { id: 1, src: "https://images.unsplash.com/photo-1626804475297-411d8631c8df?q=80&w=800&auto=format&fit=crop", author: "Sarah K.", likes: 124, dish: "Qabili Palau" },
    { id: 2, src: "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop", author: "Maryam A.", likes: 89, dish: "Uzbek Plov" },
    { id: 3, src: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop", author: "John D.", likes: 256, dish: "Lamb Stew" },
    { id: 4, src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop", author: "Elham R.", likes: 167, dish: "Chicken Biryani" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would upload the image to a server
    setIsOpen(false);
    setSelectedImage(null);
    // Show success message (could be a toast)
  };

  return (
    <section className="py-20 bg-stone-50 dark:bg-stone-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl font-bold text-amber-900 dark:text-amber-500"
          >
            {t('gallery.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-stone-600 dark:text-stone-400 text-lg max-w-2xl mx-auto"
          >
            {t('gallery.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {galleryImages.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img 
                src={img.src} 
                alt={`Gallery by ${img.author}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                <p className="font-bold text-lg mb-1">{img.dish}</p>
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm opacity-90">{img.author}</p>
                  <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                    <Heart className="w-3 h-3 fill-white" /> {img.likes}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full bg-amber-700 hover:bg-amber-800 text-white px-8 shadow-lg hover:shadow-xl transition-all gap-2">
                <Camera className="w-5 h-5" />
                {t('gallery.share_button')}
              </Button>
            </DialogTrigger>
            <DialogContent className={`sm:max-w-md ${isRTL ? 'rtl' : 'ltr'}`}>
              <DialogHeader>
                <DialogTitle className="text-center font-serif text-2xl text-amber-900 dark:text-amber-500">
                  {t('gallery.upload_title')}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="flex flex-col items-center justify-center w-full">
                  <Label 
                    htmlFor="dropzone-file" 
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-stone-300 border-dashed rounded-xl cursor-pointer bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:border-stone-600 dark:hover:border-stone-500 dark:hover:bg-stone-700 transition-all duration-300 group"
                  >
                    {selectedImage ? (
                      <div className="relative w-full h-full group-hover:opacity-90 transition-opacity">
                        <img 
                          src={selectedImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded-xl" 
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedImage(null);
                          }}
                          className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-stone-400 group-hover:text-amber-700 transition-colors">
                        <Upload className="w-12 h-12 mb-3" />
                        <p className="mb-2 text-sm font-medium">
                          {t('gallery.upload_placeholder')}
                        </p>
                        <p className="text-xs opacity-70">
                          JPG, PNG (MAX. 5MB)
                        </p>
                      </div>
                    )}
                    <Input 
                      id="dropzone-file" 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </Label>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dish-name" className="text-stone-600 dark:text-stone-300">
                      {isRTL ? 'نام غذا' : 'Dish Name'}
                    </Label>
                    <Input 
                      id="dish-name" 
                      placeholder={isRTL ? 'مثلاً: قابلی پلو' : 'e.g. Qabili Palau'} 
                      required 
                      className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-stone-600 dark:text-stone-300">
                      {isRTL ? 'توضیحات (اختیاری)' : 'Description (Optional)'}
                    </Label>
                    <Textarea 
                      id="description" 
                      placeholder={t('gallery.upload_note')} 
                      className="resize-none bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 focus:ring-amber-500 min-h-[80px]"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-full bg-amber-700 hover:bg-amber-800 text-white h-11 text-base font-medium shadow-md hover:shadow-lg transition-all">
                  {t('gallery.submit_photo')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
