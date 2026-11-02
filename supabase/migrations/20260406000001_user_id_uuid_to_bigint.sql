-- ============================================================
-- MIGRATION: users.id          UUID → BIGSERIAL
--            expenses.user_id  UUID → BIGINT (nullable)
--
-- Estratégia segura (preserva todos os dados):
--   1. Cria tabelas de backup antes de qualquer alteração
--   2. Adiciona colunas novas sem remover as antigas
--   3. Popula as novas colunas via JOIN
--   4. Troca constraints e remove colunas antigas
-- ============================================================

BEGIN;
-- ============================================================
-- PASSO 1: Backup de segurança (cópias das tabelas originais)
-- ============================================================
CREATE TABLE backup_users     AS TABLE users;
CREATE TABLE backup_expenses2 AS TABLE expenses;
-- ============================================================
-- PASSO 2: Adicionar coluna sequencial em users
-- ============================================================
ALTER TABLE users ADD COLUMN id_new BIGINT;
CREATE SEQUENCE users_id_seq;
UPDATE users SET id_new = nextval('users_id_seq');
ALTER SEQUENCE users_id_seq OWNED BY users.id_new;
-- ============================================================
-- PASSO 3: Adicionar coluna nova em expenses e popular via JOIN
--          (nullable pois expenses.user_id já é nullable)
-- ============================================================
ALTER TABLE expenses ADD COLUMN user_id_new BIGINT;
UPDATE expenses e
SET user_id_new = u.id_new
FROM users u
WHERE e.user_id = u.id;
-- ============================================================
-- PASSO 4: Remover FK e PK antigas
-- ============================================================
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
ALTER TABLE users    DROP CONSTRAINT users_pkey;
-- ============================================================
-- PASSO 5: Remover colunas UUID antigas
-- ============================================================
ALTER TABLE expenses DROP COLUMN user_id;
ALTER TABLE users    DROP COLUMN id;
-- ============================================================
-- PASSO 6: Renomear colunas novas
-- ============================================================
ALTER TABLE users    RENAME COLUMN id_new     TO id;
ALTER TABLE expenses RENAME COLUMN user_id_new TO user_id;
-- ============================================================
-- PASSO 7: Aplicar NOT NULL em users.id e recriar PK + FK
-- ============================================================
ALTER TABLE users ALTER COLUMN id SET NOT NULL;
ALTER TABLE users ADD PRIMARY KEY (id);
ALTER TABLE expenses
  ADD CONSTRAINT expenses_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users (id);
-- ============================================================
-- PASSO 8: Configurar BIGSERIAL (default da sequência)
-- ============================================================
ALTER TABLE users
  ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
COMMIT;
