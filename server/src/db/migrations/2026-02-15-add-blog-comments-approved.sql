ALTER TABLE blog_comments
ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false;