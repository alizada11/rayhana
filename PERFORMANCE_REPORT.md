# Performance Report

## Implemented

- Preserved route-level code splitting and existing Vite manual chunking.
- Kept local font loading and SSR-safe bootstrap to reduce blank-shell rendering cost.
- Added SSR for indexable routes so meaningful content is available before hydration.
- Kept image dimensions on major brand assets and the new product detail route image.

## Current Risks

- CSS output is still large and should be audited for dead utility/styles.
- Three font families are still present; the target of two families has not been fully enforced yet.
- Homepage media remains heavy and still needs a dedicated image/video budget review.
- Some static pages still rely on client fetches for content and should be folded into broader route preloading.

## Recommended Next Pass

- Reduce typography to one Latin family plus one Arabic-script family.
- Audit `vendor`, `editor`, and `dashboard` chunks and split admin-only code more aggressively.
- Add image transformation rules for uploaded assets and migrate metadata-aware media delivery.
- Run Lighthouse mobile and desktop against `/en/`, `/en/blog`, `/en/blog/:slug`, `/en/products`, and `/en/products/:id`.

