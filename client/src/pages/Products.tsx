import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Star,
  CheckCircle,
  Gift,
  ShieldCheck,
  Heart,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProducts, type Product } from "@/hooks/useProducts";

export default function Products() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  const { data: products = [], isLoading } = useProducts();
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const localize = (value: any) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[i18n.language] || value.en || "";
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-6xl font-bold text-primary"
          >
            {t("products_page.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {t("products_page.subtitle")}
          </motion.p>
        </div>

        {/* Market Info */}
        <div className="text-center mb-12 p-4 bg-secondary/30 rounded-2xl border border-primary/10">
          <p className="text-primary font-medium">
            {t("products_page.coming_soon_markets")}
          </p>
        </div>

        {/* Product Grid - Centered */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24"
        >
          {isLoading && (
            <div className="text-muted-foreground text-center col-span-full">
              {t("common.loading")}
            </div>
          )}
          {!isLoading && products.length === 0 && (
            <div className="text-muted-foreground text-center col-span-full">
              {t("products_page.no_products")}
            </div>
          )}
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              t={t}
              isRTL={isRTL}
              resolveImageUrl={resolveImageUrl}
              localize={localize}
            />
          ))}
        </motion.div>

        {/* Brand Message Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center space-y-8 p-8 md:p-12 bg-card/50 rounded-3xl border border-primary/10 backdrop-blur-sm"
        >
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary fill-primary/20" />
            </div>
          </div>

          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            {t("products_page.brand_message_title")}
          </h2>

          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>{t("products_page.brand_message_p1")}</p>

            <p className="text-xl md:text-2xl font-serif font-bold text-foreground py-4">
              {t("products_page.brand_message_highlight")}
            </p>

            <p>{t("products_page.brand_message_p2")}</p>

            <div className="pt-8 flex justify-center">
              <p className="font-serif italic text-lg text-primary/80">
                {t("products_page.brand_signature")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  t,
  isRTL,
  resolveImageUrl,
  localize,
}: {
  product: Product;
  t: any;
  isRTL: boolean;
  resolveImageUrl: (url: string) => string;
  localize: (value: any) => string;
}) {
  const [selectedSize, setSelectedSize] = useState(
    product.sizes ? product.sizes[0] : null
  );

  const currentPrice =
    product.prices && selectedSize ? product.prices[selectedSize] : undefined;
  const productLink = product.productUrl;

  const reviews = [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      text: t("products_page.review_1"),
      verified: true,
    },
    {
      id: 2,
      author: "David K.",
      rating: 5,
      text: t("products_page.review_2"),
      verified: true,
    },
    {
      id: 3,
      author: "Emily R.",
      rating: 5,
      text: t("products_page.review_3"),
      verified: true,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="group bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 cursor-pointer"
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-secondary/20">
            <img
              src={resolveImageUrl(product.imageUrl)}
              alt={localize(product.title)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold shadow-sm z-10">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              {product.rating}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-serif text-xl font-bold mb-2">
                {localize(product.title)}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                {localize(product.description)}
              </p>

              {product.sizes && (
                <div className="space-y-2" onClick={e => e.stopPropagation()}>
                  <div className="text-xs font-bold text-muted-foreground">
                    {t("products_page.sizes")}:
                  </div>
                  <div className="flex gap-2">
                    {product.sizes.map((size: number) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                          selectedSize === size
                            ? "bg-primary text-white"
                            : "bg-secondary hover:bg-secondary/80 text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <span className="text-xl font-bold text-primary">
                {currentPrice !== undefined
                  ? `${isRTL ? "" : "$"}${currentPrice}${isRTL ? " دلار" : ""}`
                  : t("products_page.price_na")}
              </span>
              <Button
                size="sm"
                className="rounded-full bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-bold"
                onClick={e => {
                  e.stopPropagation();
                  const searchQuery = encodeURIComponent(
                    `Rayhana Kitchen ${localize(product.title)} ${
                      selectedSize ? `size ${selectedSize}` : ""
                    }`
                  );
                  const href =
                    productLink ||
                    `https://www.amazon.com/s?k=${searchQuery}`;
                  window.open(href, "_blank", "noopener,noreferrer");
                }}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t("products_page.buy_amazon")}
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold text-primary">
            {localize(product.title)}
          </DialogTitle>
          <DialogDescription>{localize(product.description)}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 py-4">
          <div className="space-y-6">
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary/20">
              <img
                src={resolveImageUrl(product.imageUrl)}
                alt={localize(product.title)}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center flex-col justify-between p-4 bg-secondary/30 rounded-xl">
              <span className="text-2xl font-bold text-primary">
                {currentPrice !== undefined
                  ? `${isRTL ? "" : "$"}${currentPrice}${isRTL ? " تومان" : ""}`
                  : t("products_page.price_na")}
              </span>
              <Button
                className="rounded-full bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-bold px-8"
                onClick={() => {
                  const searchQuery = encodeURIComponent(
                    `Rayhana Kitchen ${localize(product.title)} ${
                      selectedSize ? `size ${selectedSize}` : ""
                    }`
                  );
                  const href =
                    productLink ||
                    `https://www.amazon.com/s?k=${searchQuery}`;
                  window.open(href, "_blank", "noopener,noreferrer");
                }}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t("products_page.buy_amazon")}
              </Button>
            </div>

            {/* Bonus Gifts Section */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-center gap-2 mb-2 text-primary font-bold">
                <Gift className="w-5 h-5" />
                <span>{t("products_page.bonus_gifts")}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("products_page.bonus_desc")}
              </p>
            </div>

            {/* Certifications */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-secondary/20 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>{t("products_page.sgs_certified")}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {product.rating}
                </div>
                <div className="flex text-yellow-500 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t("products_page.out_of_5")}
                </div>
              </div>
              <div className="h-12 w-px bg-border mx-2"></div>
              <div>
                <h4 className="font-serif font-bold text-lg">
                  {t("products_page.amazon_reviews")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Based on global ratings
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map(review => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl bg-card border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">{review.author}</div>
                    {review.verified && (
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t("products_page.verified_purchase")}
                      </div>
                    )}
                  </div>
                  <div className="flex text-yellow-500 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "{review.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
