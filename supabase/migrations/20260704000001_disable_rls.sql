-- Desabilitar RLS em todas as tabelas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE recurrence_rules DISABLE ROW LEVEL SECURITY;
-- Remover todas as políticas RLS
DROP POLICY IF EXISTS users_allow_anonymous_signup ON users;
DROP POLICY IF EXISTS users_authenticated_read ON users;
DROP POLICY IF EXISTS users_authenticated_update ON users;
DROP POLICY IF EXISTS categories_public_read ON categories;
DROP POLICY IF EXISTS categories_authenticated_create ON categories;
DROP POLICY IF EXISTS categories_authenticated_update ON categories;
DROP POLICY IF EXISTS categories_authenticated_delete ON categories;
DROP POLICY IF EXISTS expenses_authenticated_all ON expenses;
DROP POLICY IF EXISTS expenses_authenticated_read ON expenses;
DROP POLICY IF EXISTS expenses_authenticated_create ON expenses;
DROP POLICY IF EXISTS expenses_authenticated_update ON expenses;
DROP POLICY IF EXISTS expenses_authenticated_delete ON expenses;
DROP POLICY IF EXISTS recurrence_rules_authenticated_all ON recurrence_rules;
-- Remover trigger de sync auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
