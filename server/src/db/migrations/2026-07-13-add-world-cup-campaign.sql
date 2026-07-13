CREATE TYPE "world_cup_semi_final_one_team" AS ENUM ('FRANCE', 'SPAIN');
CREATE TYPE "world_cup_semi_final_two_team" AS ENUM ('ENGLAND', 'ARGENTINA');
CREATE TYPE "world_cup_winner_status" AS ENUM ('PENDING', 'FIRST', 'SECOND', 'THIRD', 'DISCOUNT', 'NOT_WINNER');
CREATE TYPE "world_cup_final_status" AS ENUM ('COMING_SOON', 'OPEN', 'CLOSED', 'RESULTS');
CREATE TYPE "world_cup_final_champion" AS ENUM ('TEAM_A', 'TEAM_B');
CREATE TYPE "world_cup_lottery_criterion" AS ENUM ('ALL_VALID', 'CORRECT_ONLY', 'NON_PRIZE');

CREATE TABLE "world_cup_predictions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "full_name" text NOT NULL,
  "email" text NOT NULL,
  "country" text NOT NULL,
  "france_spain_advances" "world_cup_semi_final_one_team" NOT NULL,
  "france_spain_france_score" integer NOT NULL,
  "france_spain_spain_score" integer NOT NULL,
  "england_argentina_advances" "world_cup_semi_final_two_team" NOT NULL,
  "england_argentina_england_score" integer NOT NULL,
  "england_argentina_argentina_score" integer NOT NULL,
  "winner_status" "world_cup_winner_status" DEFAULT 'PENDING' NOT NULL,
  "accepted_terms_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "world_cup_predictions_email_unique" ON "world_cup_predictions" ("email");

CREATE TABLE "world_cup_campaign_settings" (
  "id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
  "final_team_a" text,
  "final_team_b" text,
  "final_deadline" timestamp,
  "final_status" "world_cup_final_status" DEFAULT 'COMING_SOON' NOT NULL,
  "final_result_a_score" integer,
  "final_result_b_score" integer,
  "final_champion" "world_cup_final_champion",
  "public_winners_visible" boolean DEFAULT false NOT NULL,
  "updated_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "world_cup_final_predictions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "prediction_id" uuid NOT NULL REFERENCES "world_cup_predictions"("id") ON DELETE CASCADE,
  "team_a_score" integer NOT NULL,
  "team_b_score" integer NOT NULL,
  "champion" "world_cup_final_champion" NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "world_cup_final_prediction_unique" ON "world_cup_final_predictions" ("prediction_id");

CREATE TABLE "world_cup_lottery_draws" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "criterion" "world_cup_lottery_criterion" NOT NULL,
  "winner_count" integer NOT NULL,
  "eligible_count" integer NOT NULL,
  "eligible_snapshot" text NOT NULL,
  "audit_seed" text NOT NULL,
  "audit_hash" text NOT NULL,
  "executed_by" text NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "published" boolean DEFAULT false NOT NULL,
  "executed_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "world_cup_lottery_winners" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "draw_id" uuid NOT NULL REFERENCES "world_cup_lottery_draws"("id") ON DELETE CASCADE,
  "prediction_id" uuid NOT NULL REFERENCES "world_cup_predictions"("id") ON DELETE CASCADE,
  "position" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

