CREATE TABLE IF NOT EXISTS anonymous_community_responses (
  id uuid PRIMARY KEY,
  memory text NOT NULL CHECK (memory IN ('qabili', 'rice', 'other', 'skip')),
  safety boolean NOT NULL CHECK (safety = true),
  recipe text NOT NULL CHECK (recipe IN ('qabili', 'rice', 'suggestion')),
  vote text NOT NULL CHECK (vote IN ('yes', 'no', 'unsure')),
  pattern text CHECK (pattern IS NULL OR pattern IN ('simple', 'carpet')),
  submitted_at timestamp NOT NULL DEFAULT now()
);
