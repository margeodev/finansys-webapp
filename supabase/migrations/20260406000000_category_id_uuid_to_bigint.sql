-- ============================================================
-- MIGRATION: categories.id  UUID → BIGSERIAL
--            expenses.category_id  UUID → BIGINT
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
CREATE TABLE backup_categories AS TABLE categories;
CREATE TABLE backup_expenses   AS TABLE expenses;
-- ============================================================
-- PASSO 2: Adicionar coluna sequencial em categories
-- ============================================================
ALTER TABLE categories ADD COLUMN id_new BIGINT;
CREATE SEQUENCE categories_id_seq;
UPDATE categories SET id_new = nextval('categories_id_seq');
ALTER SEQUENCE categories_id_seq OWNED BY categories.id_new;
-- ============================================================
-- PASSO 3: Adicionar coluna nova em expenses e popular via JOIN
-- ============================================================
ALTER TABLE expenses ADD COLUMN category_id_new BIGINT;
UPDATE expenses e
SET category_id_new = c.id_new
FROM categories c
WHERE e.category_id = c.id;
-- ============================================================
-- PASSO 4: Remover FK e PK antigas
-- ============================================================
ALTER TABLE expenses   DROP CONSTRAINT expenses_category_id_fkey;
ALTER TABLE categories DROP CONSTRAINT categories_pkey;
-- ============================================================
-- PASSO 5: Remover colunas UUID antigas
-- ============================================================
ALTER TABLE expenses   DROP COLUMN category_id;
ALTER TABLE categories DROP COLUMN id;
-- ============================================================
-- PASSO 6: Renomear colunas novas
-- ============================================================
ALTER TABLE categories RENAME COLUMN id_new TO id;
ALTER TABLE expenses   RENAME COLUMN category_id_new TO category_id;
-- ============================================================
-- PASSO 7: Aplicar NOT NULL e recriar PK + FK
-- ============================================================
ALTER TABLE categories ALTER COLUMN id SET NOT NULL;
ALTER TABLE expenses   ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE categories ADD PRIMARY KEY (id);
ALTER TABLE expenses
  ADD CONSTRAINT expenses_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES categories (id);
-- ============================================================
-- PASSO 8: Configurar BIGSERIAL (default da sequência)
-- ============================================================
ALTER TABLE categories
  ALTER COLUMN id SET DEFAULT nextval('categories_id_seq');
COMMIT;
