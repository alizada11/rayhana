type LocalizedValue = string | Record<string, string> | undefined | null;

function localize(value: LocalizedValue, lang: string) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || "";
}

export function createOrganizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Rayhana",
    url: baseUrl,
    logo: `${baseUrl.replace(/\/+$/, "")}/images/logo.png`,
  };
}

export function createProductCollectionSchema(
  baseUrl: string,
  products: Array<any>,
  lang: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Rayhana Products",
    url: `${baseUrl.replace(/\/+$/, "")}/products`,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: localize(product.title, lang),
        description: localize(product.description, lang),
        image: product.imageUrl,
        sku: String(product.id),
        brand: {
          "@type": "Brand",
          name: "Rayhana",
        },
        aggregateRating: product.rating
          ? {
              "@type": "AggregateRating",
              ratingValue: Number(product.rating),
              reviewCount: Array.isArray(product.reviews) ? product.reviews.length : 0,
            }
          : undefined,
      },
    })),
  };
}

export function createArticleSchema(baseUrl: string, post: any, lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: localize(post.title, lang),
    description:
      localize(post.excerpt, lang) || localize(post.content, lang).slice(0, 160),
    image: post.imageUrl,
    author: {
      "@type": "Person",
      name: post.authorName || post.user?.name || "Rayhana",
    },
    publisher: {
      "@type": "Organization",
      name: "Rayhana",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl.replace(/\/+$/, "")}/images/logo.png`,
      },
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    mainEntityOfPage: `${baseUrl.replace(/\/+$/, "")}/blog/${post.slug}`,
  };
}

export function createFaqSchema(helpContent: any, lang: string) {
  const faqs = Array.isArray(helpContent?.center?.faqs)
    ? helpContent.center.faqs
    : [];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item: any) => ({
      "@type": "Question",
      name: localize(item.question, lang),
      acceptedAnswer: {
        "@type": "Answer",
        text: localize(item.answer, lang),
      },
    })),
  };
}
