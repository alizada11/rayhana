ALTER TABLE "world_cup_campaign_settings"
ADD COLUMN IF NOT EXISTS "semi_final_france_score" integer,
ADD COLUMN IF NOT EXISTS "semi_final_spain_score" integer,
ADD COLUMN IF NOT EXISTS "semi_final_england_score" integer,
ADD COLUMN IF NOT EXISTS "semi_final_argentina_score" integer;
