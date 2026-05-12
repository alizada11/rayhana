# SEO Changelog

## Before

- Public pages were delivered as a client-rendered SPA shell.
- Titles, descriptions, canonicals, and social metadata were injected after hydration.
- Language selection depended on client storage instead of crawlable language URLs.
- Blog and product detail content was not guaranteed in the initial HTML source.
- `robots.txt` and `sitemap.xml` were single-language and too limited for production multilingual SEO.

## After

- Added a hybrid SSR foundation on the existing Vite + Express stack.
- Added locale-prefixed public routing with `/en`, `/fa`, and `/ps`.
- Added safe redirects from legacy unprefixed URLs to locale-prefixed canonical URLs.
- Added server-rendered head generation for titles, descriptions, canonical tags, hreflang, Open Graph, Twitter, and JSON-LD.
- Added a crawlable product detail route at `/products/:id`.
- Added per-request i18n bootstrapping and SSR-safe request context.
- Added multilingual sitemap index and per-locale sitemap endpoints.
- Added updated `robots.txt` rules with explicit allow/block directives and sitemap index reference.

## Major Decisions

- Kept the existing PERN architecture and Vite frontend instead of forcing a Next.js rewrite.
- Used hybrid SSR for high-value public routes and preserved client-side flows for dashboard/auth areas.
- Used URL-driven locale routing rather than local-storage-driven language state for SEO pages.
- Reused existing API/query contracts by hydrating React Query on the server instead of duplicating frontend data logic.

## Remaining Work

- Expand structured data coverage across homepage, blog index, blog post, FAQ, contact, and organization/sitewide entities.
- Preload and enrich additional static content routes beyond the first SSR tranche.
- Add technical redirect enforcement for HTTPS and preferred host if that is handled upstream in deployment.
- Add dedicated validation scripts and deeper Lighthouse/performance baselines.

