import { useTranslation } from "react-i18next";
import { useRoute, Link } from "wouter";
import { ArrowLeft, CheckCircle, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/hooks/useProducts";
import SeoTags from "@/components/SeoTags";

export default function ProductDetail() {
  const { t, i18n } = useTranslation();
  const [match, params] = useRoute("/products/:id");
  const currentLang = (i18n.language || "en").split("-")[0] as "en" | "fa" | "ps";
  const isRTL = currentLang === "fa" || currentLang === "ps";
  const { data: product, isLoading } = useProduct(params?.id);
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  if (!match) return null;

  const localize = (value: any) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[currentLang] || value.en || "";
  };

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  if (isLoading) {
    return <div className="min-h-screen py-24 text-center">{t("common.loading")}</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen py-24 text-center">
        <h1 className="font-serif text-3xl font-bold">{t("products_page.no_products")}</h1>
      </div>
    );
  }

  const productUrl = (() => {
    try {
      return product.productUrl ? new URL(product.productUrl).toString() : null;
    } catch {
      return null;
    }
  })();
  const amazonCaUrl = (() => {
    try {
      return product.amazonCaUrl ? new URL(product.amazonCaUrl).toString() : null;
    } catch {
      return null;
    }
  })();

  const title = localize(product.title);
  const description = localize(product.description);
  const imageUrl = resolveImageUrl(product.imageUrl);
  const offers = Object.entries(product.prices || {}).map(([size, price]) => ({
    "@type": "Offer",
    priceCurrency: "USD",
    price,
    availability: "https://schema.org/InStock",
    ...(productUrl || amazonCaUrl ? { url: productUrl || amazonCaUrl } : {}),
    itemOffered: title,
    size,
  }));
  const reviewCount = product.reviews?.length;
  const aggregateRating =
    typeof product.rating === "number" && reviewCount && reviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount,
        }
      : undefined;

  return (
    <article className="min-h-screen py-20">
      <SeoTags
        title={title}
        description={description}
        image={imageUrl}
        type="product"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: title,
            description,
            image: imageUrl ? [imageUrl] : undefined,
            sku: String(product.id),
            brand: {
              "@type": "Brand",
              name: "Rayhana",
            },
            ...(aggregateRating ? { aggregateRating } : {}),
            ...(offers.length ? { offers } : {}),
          },
        ]}
      />
      <div className="container space-y-10">
        <Button asChild variant="outline">
          <Link href="/products">
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`} />
            {t("blog.back", "Back")}
          </Link>
        </Button>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl bg-secondary/20">
              <img
                src={imageUrl}
                alt={title}
                width={960}
                height={960}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground">{product.category}</span>
            </div>
          </div>
          <div className="space-y-8">
            <header className="space-y-4">
              <h1 className="font-serif text-4xl font-bold text-primary md:text-5xl">
                {title}
              </h1>
              <p className="text-lg leading-8 text-muted-foreground">
                {description}
              </p>
            </header>

            {product.sizes?.length ? (
              <section className="space-y-3">
                <h2 className="font-serif text-2xl font-bold">
                  {t("products_page.sizes")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: number) => (
                    <span
                      key={size}
                      className="rounded-full border bg-secondary/30 px-4 py-2 text-sm font-medium"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {Object.keys(product.prices || {}).length ? (
              <section className="space-y-3">
                <h2 className="font-serif text-2xl font-bold">
                  {t("products_page.price_na", "Prices")}
                </h2>
                <div className="space-y-2 rounded-2xl border bg-card p-5">
                  {Object.entries(product.prices || {}).map(([size, price]) => (
                    <div key={size} className="flex items-center justify-between">
                      <span>{size}</span>
                      <span className="font-semibold">${Number(price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {product.reviews?.length ? (
              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-bold">
                  {t("products_page.amazon_reviews")}
                </h2>
                {product.reviews.slice(0, 3).map((review: any) => (
                  <div key={review.id} className="rounded-2xl border bg-card p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <strong>{review.author}</strong>
                      {review.verified ? (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          {t("products_page.verified_purchase")}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground">{localize(review.text)}</p>
                  </div>
                ))}
              </section>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              {productUrl ? (
                <Button
                  asChild
                  className="rounded-full bg-[#FF9900] text-black hover:bg-[#FF9900]/90"
                >
                  <a href={productUrl} target="_blank" rel="noopener noreferrer">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {t("products_page.buy_amazon")}
                  </a>
                </Button>
              ) : null}
              {amazonCaUrl ? (
                <Button
                  asChild
                  className="rounded-full bg-[#FF9900] text-black hover:bg-[#FF9900]/90"
                >
                  <a href={amazonCaUrl} target="_blank" rel="noopener noreferrer">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {t("products_page.buy_amazon_ca")}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
