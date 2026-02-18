import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Utiliser le service role pour vérifier has_role (bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setDate(now.getDate() - 30);
    const weekStartOfPeriod = new Date(now);
    weekStartOfPeriod.setDate(now.getDate() - now.getDay() + 1);
    weekStartOfPeriod.setHours(0, 0, 0, 0);

    // Fetch all metrics in parallel
    const [
      totalUsersRes,
      newTodayRes,
      newWeekRes,
      newMonthRes,
      activeWeekRes,
      activeMonthRes,
      sessionsCompletedTotalRes,
      sessionsCompletedWeekRes,
      checkinsRes,
      subscriptionsRes,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString()),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekStart.toISOString()),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart.toISOString()),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("last_activity_at", weekStart.toISOString()),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("last_activity_at", monthStart.toISOString()),
      supabaseAdmin
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("completed", true),
      supabaseAdmin
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("completed", true)
        .gte("session_date", weekStartOfPeriod.toISOString()),
      supabaseAdmin
        .from("weekly_checkins")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart.toISOString()),
      supabaseAdmin
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

    // Checkin rate (checkins this month / total users)
    const totalUsers = totalUsersRes.count ?? 0;
    const checkinsCount = checkinsRes.count ?? 0;
    const checkinRate =
      totalUsers > 0 ? Math.round((checkinsCount / totalUsers) * 100) : 0;

    const stats = {
      total_users: totalUsers,
      new_users_today: newTodayRes.count ?? 0,
      new_users_week: newWeekRes.count ?? 0,
      new_users_month: newMonthRes.count ?? 0,
      active_users_7d: activeWeekRes.count ?? 0,
      active_users_30d: activeMonthRes.count ?? 0,
      completed_sessions_total: sessionsCompletedTotalRes.count ?? 0,
      completed_sessions_week: sessionsCompletedWeekRes.count ?? 0,
      weekly_checkins_month: checkinsCount,
      subscriptions_active: subscriptionsRes.count ?? 0,
      checkin_rate_pct: checkinRate,
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("admin-stats error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
