-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  username      TEXT,
  phone_number  TEXT,
  password_hash TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_email ON users (email);
-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE expenses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description         TEXT NOT NULL,
  amount              NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  date                DATE NOT NULL,
  category_id         UUID NOT NULL REFERENCES categories (id),
  user_id             UUID REFERENCES users (id),
  is_active           BOOLEAN NOT NULL DEFAULT true,
  is_advance_payment  BOOLEAN NOT NULL DEFAULT false,
  is_personal         BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_expenses_date         ON expenses (date);
CREATE INDEX idx_expenses_active_date  ON expenses (is_active, date);
CREATE INDEX idx_expenses_user_active  ON expenses (user_id, is_active, date);
-- ============================================================
-- SEED: Categories (migrated from MySQL)
-- ============================================================
INSERT INTO categories (description, is_active) VALUES
  ('Moradia',        true),
  ('Supermercado',   true),
  ('Conta serviços', true),
  ('Transporte',     true),
  ('Lazer',          true),
  ('Saúde',          true),
  ('Bares e Rest.',  true),
  ('Manut. Casa',    true),
  ('Padaria',        true),
  ('Farmácia',       true),
  ('Outros',         true),
  ('Pets',           true),
  ('Manut. Carro',   true);
