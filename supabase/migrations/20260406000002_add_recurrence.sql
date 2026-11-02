-- ============================================================
-- RECURRENCE RULES
-- ============================================================
CREATE TABLE recurrence_rules (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                TEXT NOT NULL CHECK (type IN ('fixed', 'installment')),
  frequency           TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'weekly')),
  total_installments  INT CHECK (total_installments > 0),  -- null = sem fim (fixed)
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ============================================================
-- EXPENSES: novas colunas para recorrência
-- ============================================================
ALTER TABLE expenses
  ADD COLUMN recurrence_rule_id  UUID REFERENCES recurrence_rules (id) ON DELETE SET NULL,
  ADD COLUMN installment_number  INT CHECK (installment_number > 0);
CREATE INDEX idx_expenses_recurrence ON expenses (recurrence_rule_id);
