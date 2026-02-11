-- Adds optional external product link for storefront buttons.
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_url TEXT;
