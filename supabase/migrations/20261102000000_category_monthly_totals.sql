-- Total mensal de uma categoria, do primeiro lançamento até hoje (fuso de São Paulo).
-- Meses sem gasto dentro do intervalo voltam com total 0.
create or replace function public.category_monthly_totals(
  p_category_id int,
  p_user_id int default null
)
returns table (month text, total numeric, entries int)
language sql
stable
security invoker
as $$
  with base as (
    select date_trunc('month', e.date::date)::date as m, e.amount
    from public.expenses e
    where e.category_id = p_category_id
      and e.is_active
      and e.date::date <= (now() at time zone 'America/Sao_Paulo')::date
      and (p_user_id is null or e.user_id = p_user_id)
  ),
  meses as (
    select generate_series(min(m), max(m), interval '1 month')::date as m
    from base
  )
  select to_char(meses.m, 'YYYY-MM'),
         coalesce(round(sum(base.amount)::numeric, 2), 0),
         count(base.amount)::int
  from meses
  left join base on base.m = meses.m
  group by meses.m
  order by meses.m desc;
$$;
