CREATE OR REPLACE FUNCTION get_monthly_report(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
  category_id          UUID,
  category_description TEXT,
  total                NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id                AS category_id,
    c.description       AS category_description,
    ROUND(SUM(e.amount)::NUMERIC, 2) AS total
  FROM expenses e
  JOIN categories c ON e.category_id = c.id
  WHERE e.date >= p_start_date
    AND e.date <  p_end_date
    AND e.is_active = true
  GROUP BY c.id, c.description
  ORDER BY total DESC;
$$;
