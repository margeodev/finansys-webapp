import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });

// GET /reports?categoryId=8[&userId=2]: total por mês de uma categoria até hoje
async function categoryMonthly(url: URL): Promise<Response> {
  const id = Number(url.searchParams.get("categoryId"));
  const userIdParam = url.searchParams.get("userId");
  const userId = userIdParam ? Number(userIdParam) : null;

  if (!Number.isInteger(id) || id <= 0) {
    return json({ error: "categoryId deve ser um inteiro positivo" }, 400);
  }
  if (userId !== null && (!Number.isInteger(userId) || userId <= 0)) {
    return json({ error: "userId deve ser um inteiro positivo" }, 400);
  }

  const { data: months, error } = await supabase.rpc("category_monthly_totals", {
    p_category_id: id,
    p_user_id: userId,
  });
  if (error) throw error;

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("description")
    .eq("id", id)
    .maybeSingle();
  if (categoryError) throw categoryError;

  const rows = (months || []).map((m: any) => ({
    month: m.month,
    total: Number(m.total),
    entries: m.entries,
  }));
  const total = Math.round(rows.reduce((s: number, m: any) => s + m.total, 0) * 100) / 100;
  // rows vem do mês mais recente para o mais antigo: em empate, fica o mais recente
  const peak = rows.reduce((a: any, b: any) => (b.total > a.total ? b : a), rows[0] ?? null);

  return json({
    categoryId: id,
    categoryDescription: category?.description ?? null,
    total,
    average: rows.length ? Math.round((total / rows.length) * 100) / 100 : 0,
    peak,
    months: rows,
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-user-id, Authorization",
      },
    });
  }

  try {
    const url = new URL(req.url);
    if (url.searchParams.has("categoryId")) {
      return await categoryMonthly(url);
    }

    const monthsBack = parseInt(url.searchParams.get("monthsBack") || "0", 10);

    if (!Number.isFinite(monthsBack) || monthsBack < 0) {
      return new Response(
        JSON.stringify({ error: "monthsBack deve ser um número inteiro >= 0" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() - monthsBack);
    const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    const monthStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;

    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("*")
      .gte("date", startStr)
      .lt("date", endStr)
      .eq("is_active", true);

    if (expensesError) throw expensesError;

    const byCategory: Record<string, number> = {};
    (expenses || []).forEach((expense: any) => {
      const catId = expense.category_id ? String(expense.category_id) : "_sem_categoria";
      const amount = Number(expense.amount);
      if (!Number.isFinite(amount)) return;
      if (!byCategory[catId]) byCategory[catId] = 0;
      byCategory[catId] += amount;
    });

    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*");

    if (categoriesError) throw categoriesError;

    const categoryDescriptions: Record<string, string> = {};
    (categories || []).forEach((cat: any) => {
      categoryDescriptions[cat.id] = cat.description || cat.id;
    });

    const report = Object.entries(byCategory).map(([categoryId, total]) => ({
      id: categoryId === "_sem_categoria" ? undefined : categoryId,
      categoryDescription: categoryDescriptions[categoryId] || categoryId,
      month: monthStr,
      total: Math.round(total as number * 100) / 100,
    }));

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Erro em GET /reports:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
