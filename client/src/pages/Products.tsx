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
  CreditCard,
  Wallet,
  Smartphone,
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
import SeoTags from "@/components/SeoTags";
import ReserveDiscountSection from "@/components/ReserveDiscountSection";
import {
  getDirectStoreUrl,
  suppliedDirectUrls,
} from "@/blackfriday/redesign/data/directStores";

const amazonMarketplaces = [
  { id: "US", en: "Amazon United States", fa: "آمازون آمریکا", ps: "د امریکا امازون" },
  { id: "CA", en: "Amazon Canada", fa: "آمازون کانادا", ps: "د کاناډا امازون" },
  { id: "AU", en: "Amazon Australia", fa: "آمازون استرالیا", ps: "د استرالیا امازون" },
  { id: "DE", en: "Amazon Germany", fa: "آمازون آلمان", ps: "د جرمني امازون" },
  { id: "UK", en: "Amazon United Kingdom", fa: "آمازون بریتانیا", ps: "د بریتانیا امازون" },
  { id: "BE", en: "Amazon Belgium", fa: "آمازون بلژیک", ps: "د بلجیم امازون" },
  { id: "NL", en: "Amazon Netherlands", fa: "آمازون هلند", ps: "د هالنډ امازون" },
  { id: "IT", en: "Amazon Italy", fa: "آمازون ایتالیا", ps: "د ایټالیا امازون" },
  { id: "SE", en: "Amazon Sweden", fa: "آمازون سوئد", ps: "د سویډن امازون" },
] as const;

const validHttpUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol.toLowerCase())
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
};

export default function Products() {
  const { t, i18n } = useTranslation();
  const isRTL = ["fa", "ps"].includes(i18n.language);
  const { data: products = [], isLoading } = useProducts();
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/images/")) return url;
    return `${apiBase}${url}`;
  };

  const localize = (value: any) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[i18n.language] || value.en || "";
  };

  const potProducts = products.map(product => ({
    ...product,
    productUrl: suppliedDirectUrls.pot?.US,
    amazonCaUrl: suppliedDirectUrls.pot?.CA,
    amazonAuUrl: suppliedDirectUrls.pot?.AU,
    amazonMarketLinks: amazonMarketplaces.map(market => ({
      market: market.id,
      label: market[i18n.language as "en" | "fa" | "ps"] || market.en,
      url: suppliedDirectUrls.pot?.[market.id],
    })),
    shopino24Url: getDirectStoreUrl("pot", "AF"),
  }));
  const mandoline = {
    id: "rayhana-mandoline",
    title: {
      en: "Rayhana Adjustable Mandoline Slicer",
      fa: "ماندولین قابل تنظیم ریحانه",
      ps: "د ریحانې تنظیمېدونکی ماندولین سلایسر",
    },
    description: {
      en: "Julienne carrots for qabili, slice potatoes for chips or crisps, and adjust the thickness of salad vegetables. Always use the food holder and keep your fingers away from the blade.",
      fa: "برای قابلی زردک را خلالی کنید، برای چیپس کچالو را ورقه کنید و ضخامت برش سبزیجات سالاد را تنظیم کنید. همیشه از نگهدارندهٔ مواد غذایی استفاده کنید و انگشتان را از تیغه دور نگه دارید.",
      ps: "د قابلي لپاره ګازرې خلال کړئ، د چپس لپاره کچالو ټوټې کړئ، او د سلاد د سبزیو د ټوټو پنډوالی تنظیم کړئ. تل د خوړو نیوونکی وکاروئ او ګوتې له تیغې لرې وساتئ.",
    },
    imageUrl: "/images/mandoline-product-store.png",
    productUrl: suppliedDirectUrls.mandoline?.US,
    amazonCaUrl: suppliedDirectUrls.mandoline?.CA,
    amazonAuUrl: suppliedDirectUrls.mandoline?.AU,
    amazonMarketLinks: amazonMarketplaces.map(market => ({
      market: market.id,
      label: market[i18n.language as "en" | "fa" | "ps"] || market.en,
      url: suppliedDirectUrls.mandoline?.[market.id],
    })),
    rating: null,
    reviews: [],
    sizes: [],
    price: 36.99,
    prices: {},
  } as Product;

  return (
    <div className="min-h-screen py-20">
      <SeoTags
        pageKey="products"
        title={t("products_page.title", "Shop Rayhana Products")}
        description={t(
          "seo.products.description",
          "Shop Rayhana Heritage Pot for authentic Qabili Palaw, Qabili Pilaf, and Qabili Pilau. Premium non-stick cookware designed for traditional Afghan rice dishes."
        )}
        url={`${import.meta.env.VITE_BASE_URL || ""}/products`}
      />
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
          {potProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              t={t}
              isRTL={isRTL}
              resolveImageUrl={resolveImageUrl}
              localize={localize}
            />
          ))}
          {!isLoading && (
            <ProductCard
              key={mandoline.id}
              product={mandoline}
              t={t}
              isRTL={isRTL}
              resolveImageUrl={resolveImageUrl}
              localize={localize}
            />
          )}
        </motion.div>

        <ReserveDiscountSection products={products} localize={localize} />

        {/* In a Hurry - Regional Shop CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto mb-24 p-6 md:p-10 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl border border-primary/20"
        >
          <div className="text-center mb-6">
            <h3
              className={`text-2xl md:text-3xl font-semibold mb-2 ${isRTL ? "font-[Vazirmatn]" : "font-serif"} text-primary`}
            >
              {t("products_page.hurry_title")}
            </h3>
            <p
              className={`text-muted-foreground text-sm md:text-base max-w-2xl mx-auto ${isRTL ? "font-[Vazirmatn]" : "font-sans"}`}
            >
              {t("products_page.hurry_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8 max-w-3xl mx-auto">
            <a
              href="https://www.paypal.com/ncp/payment/6YR8TPB4YFSPY"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-card hover:bg-primary hover:text-primary-foreground border-2 border-primary/30 hover:border-primary rounded-xl transition-all shadow-sm hover:shadow-md group"
            >
              <span className="text-3xl mb-2">🇬🇧</span>
              <span
                className={`font-semibold text-sm md:text-base ${isRTL ? "font-[Vazirmatn]" : ""}`}
              >
                {t("products_page.region_uk")}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 mt-1">
                GBP £
              </span>
            </a>
            <a
              href="https://www.paypal.com/ncp/payment/A44VPB9VDT72J"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-card hover:bg-primary hover:text-primary-foreground border-2 border-primary/30 hover:border-primary rounded-xl transition-all shadow-sm hover:shadow-md group"
            >
              <span className="text-3xl mb-2">🇪🇺</span>
              <span
                className={`font-semibold text-sm md:text-base ${isRTL ? "font-[Vazirmatn]" : ""}`}
              >
                {t("products_page.region_eu")}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 mt-1">
                EUR €
              </span>
            </a>
            <a
              href="https://www.paypal.com/ncp/payment/XLH22LR32VGKQ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-card hover:bg-primary hover:text-primary-foreground border-2 border-primary/30 hover:border-primary rounded-xl transition-all shadow-sm hover:shadow-md group"
            >
              <span className="text-3xl mb-2">🌍</span>
              <span
                className={`font-semibold text-sm md:text-base ${isRTL ? "font-[Vazirmatn]" : ""}`}
              >
                {t("products_page.region_arabic")}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 mt-1">
                USD $
              </span>
            </a>
          </div>

          <div className="flex flex-col items-center gap-3 mb-8 pb-8 border-b border-primary/10">
            <p
              className={`text-xs uppercase tracking-wider text-muted-foreground ${isRTL ? "font-[Vazirmatn]" : ""}`}
            >
              {t("products_page.payment_methods")}
            </p>
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <span className="text-sm font-medium">PayPal</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <span className="text-sm font-medium">Apple Pay</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <span
                  className={`text-sm font-medium ${isRTL ? "font-[Vazirmatn]" : ""}`}
                >
                  {t("products_page.card")}
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <p
              className={`text-xs uppercase tracking-wider text-muted-foreground text-center mb-4 ${isRTL ? "font-[Vazirmatn]" : ""}`}
            >
              {t("products_page.shipping_status")}
            </p>
            <div
              className={`flex items-start gap-3 p-3 bg-card/50 rounded-lg ${isRTL ? "text-right" : "text-left"}`}
            >
              <span className="text-2xl flex-shrink-0">🇹🇷</span>
              <p
                className={`text-sm text-muted-foreground flex-1 ${isRTL ? "font-[Vazirmatn] text-right" : "text-left"}`}
              >
                {t("products_page.shipping_tr")}
              </p>
            </div>
            <div
              className={`flex items-start gap-3 p-3 bg-card/50 rounded-lg ${isRTL ? "text-right" : "text-left"}`}
            >
              <span className="text-2xl flex-shrink-0">🇮🇷</span>
              <p
                className={`text-sm text-muted-foreground flex-1 ${isRTL ? "font-[Vazirmatn] text-right" : "text-left"}`}
              >
                {t("products_page.shipping_ir")}
              </p>
            </div>
          </div>
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
    product.price ??
    (product.prices && selectedSize ? product.prices[selectedSize] : undefined);
  const marketLinks = (product.amazonMarketLinks || [])
    .filter((item: any) => item.url)
    .map((item: any) => ({ ...item, href: validHttpUrl(item.url) }))
    .filter((item: any) => item.href);
  const shopinoLink = (() => {
    const url = product.shopino24Url;
    if (!url || typeof url !== "string") return null;
    try {
      const parsed = new URL(url);
      const proto = parsed.protocol.toLowerCase();
      if (proto === "http:" || proto === "https:") return parsed.toString();
    } catch {
      return null;
    }
    return null;
  })();

  const reviews = product.reviews?.length
    ? product.reviews.map((rev: any) => ({
        id: rev.id,
        author: rev.author,
        rating: rev.rating ?? 5,
        text: localize(rev.text) || "",
        verified: rev.verified ?? true,
      }))
    : product.rating
      ? [
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
      ]
      : [];

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
              loading="lazy"
              src={resolveImageUrl(product.imageUrl)}
              alt={localize(product.title)}
              className={`w-full h-full transition-transform duration-500 ${
                product.id === "rayhana-mandoline"
                  ? "object-contain p-3"
                  : "object-cover group-hover:scale-110"
              }`}
            />
            {!!product.rating && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold shadow-sm z-10">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {product.rating}
              </div>
            )}
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

              {!!product.sizes?.length && (
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

            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <span className="w-[30%] shrink-0 text-xl font-bold text-primary">
                {currentPrice !== undefined
                  ? `${isRTL ? "" : "$"}${currentPrice}${isRTL ? " دلار" : ""}`
                  : t("products_page.price_na")}
              </span>
              <div className="flex w-[70%] min-w-0 flex-col items-stretch gap-2" onClick={e => e.stopPropagation()}>
                {marketLinks.map((item: any) => (
                  <Button
                    key={item.market}
                    size="sm"
                    className="w-full rounded-full bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-bold"
                    onClick={e => {
                      e.stopPropagation();
                      window.open(item.href, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {item.label} <span className="ml-1 text-xs font-semibold uppercase">{item.market}</span>
                  </Button>
                ))}
                {shopinoLink && (
                  <Button
                    size="sm"
                    className="w-full rounded-full bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-bold"
                    onClick={e => {
                      e.stopPropagation();
                      window.open(shopinoLink, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {t("products_page.buy_shopino24")}
                  </Button>
                )}
              </div>
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
                loading="lazy"
                src={resolveImageUrl(product.imageUrl)}
                alt={localize(product.title)}
                className={`w-full h-full ${
                  product.id === "rayhana-mandoline"
                    ? "object-contain p-3"
                    : "object-cover"
                }`}
              />
            </div>

            <div className="flex flex-col items-center gap-3 p-4 bg-secondary/30 rounded-xl">
              <span className="text-2xl font-bold text-primary">
                {currentPrice !== undefined
                  ? `${isRTL ? "" : "$"}${currentPrice}${isRTL ? " دلار" : ""}`
                  : t("products_page.price_na")}
              </span>
              <div className="flex w-full max-w-70 flex-col items-stretch gap-2">
                {marketLinks.map((item: any) => (
                  <Button
                    key={item.market}
                    className="w-full rounded-full bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-bold px-8"
                    onClick={() => {
                      window.open(item.href, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {item.label} <span className="ml-1 text-xs font-semibold uppercase">{item.market}</span>
                  </Button>
                ))}
                {shopinoLink && (
                  <Button
                    className="w-full rounded-full bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-bold px-8"
                    onClick={() => {
                      window.open(shopinoLink, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {t("products_page.buy_shopino24")}
                  </Button>
                )}
              </div>
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
            {!!product.rating && (
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
                Based on product ratings
                </p>
              </div>
            </div>
            )}

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
              {!reviews.length && (
                <p className="text-sm text-muted-foreground">{localize(product.description)}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


