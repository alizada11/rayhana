export const SEO_ROUTE_KEYS = {
  home: "home",
  products: "products",
  about: "about",
  blogIndex: "blog-index",
  blogPost: "blog-post",
  help: "help",
  helpArticle: "help-article",
  terms: "terms",
} as const;

export const SEO_ROUTE_DEFAULTS = {
  home: {
    title: "Rayhana Afghan Cooking",
    description: "Discover authentic Afghan recipes, cookware, and stories.",
  },
  products: {
    title: "Shop Rayhana Products",
    description: "Cookware and tools crafted for authentic Afghan cooking.",
  },
  about: {
    title: "About Rayhana",
    description: "Our story, mission, and cultural roots.",
  },
  "blog-index": {
    title: "Rayhana Blog",
    description: "Stories, recipes, and tips from the Rayhana kitchen.",
  },
  "blog-post": {
    title: "Rayhana Blog",
    description: "Read the latest story from Rayhana.",
  },
  help: {
    title: "Help Center",
    description: "Find quick answers and support resources.",
  },
  "help-article": {
    title: "Help Article",
    description: "Guidance from the Rayhana help center.",
  },
  terms: {
    title: "Terms of Service",
    description: "Read the terms that govern the use of Rayhana.",
  },
} as const;
