DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pre_launch_reservation_status') THEN
    CREATE TYPE pre_launch_reservation_status AS ENUM ('pending', 'contacted', 'completed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS pre_launch_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_size text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  region text NOT NULL,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  status pre_launch_reservation_status NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS pre_launch_reservations_email_product_size_unique
  ON pre_launch_reservations (email, product_id, product_size);

CREATE INDEX IF NOT EXISTS pre_launch_reservations_product_id_idx
  ON pre_launch_reservations (product_id);

CREATE INDEX IF NOT EXISTS pre_launch_reservations_user_id_idx
  ON pre_launch_reservations (user_id);

CREATE INDEX IF NOT EXISTS pre_launch_reservations_status_idx
  ON pre_launch_reservations (status);

