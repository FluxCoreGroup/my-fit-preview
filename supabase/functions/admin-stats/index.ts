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

    // Build week boundaries for the last 8 weeks
    const weeks: { label: string; start: string; end: string }[] = [];
    for (let i = 7; i >= 0; i--) {
      const wStart = new Date(now);
      wStart.setDate(now.getDate() - now.getDay() + 1 - i * 7);
      wStart.setHours(0, 0, 0, 0);
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 7);
      const label = `S${wStart.getDate()}/${wStart.getMonth() + 1}`;
      weeks.push({ label, start: wStart.toISOString(), end: wEnd.toISOString() });
    }

    const eightWeeksAgo = new Date(now);
    eightWeeksAgo.setDate(now.getDate() - 56);

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
      onboardingCompletedRes,
      // Historical data for charts
      sessionsHistoryRes,
      signupsHistoryRes,
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
      // 1.2 FIX — include trialing in active subscriptions
      supabaseAdmin
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .in("status", ["active", "trialing"]),
      // 4.2 onboarding completed
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("onboarding_completed", true),
      // Historical sessions for chart (2.2)
      supabaseAdmin
        .from("sessions")
        .select("session_date")
        .eq("completed", true)
        .gte("session_date", eightWeeksAgo.toISOString()),
      // Historical signups for chart (2.2)
      supabaseAdmin
        .from("profiles")
        .select("created_at")
        .gte("created_at", eightWeeksAgo.toISOString()),
    ]);

    // Aggregate chart data by week
    const sessions_by_week = weeks.map((w) => ({
      label: w.label,
      count: (sessionsHistoryRes.data ?? []).filter((s) => {
        const d = s.session_date;
        return d >= w.start && d < w.end;
      }).length,
    }));

    const signups_by_week = weeks.map((w) => ({
      label: w.label,
      count: (signupsHistoryRes.data ?? []).filter((p) => {
        const d = p.created_at;
        return d >= w.start && d < w.end;
      }).length,
    }));

    const totalUsers = totalUsersRes.count ?? 0;
    const checkinsCount = checkinsRes.count ?? 0;
    const checkinRate =
      totalUsers > 0 ? Math.round((checkinsCount / totalUsers) * 100) : 0;
    const onboardingCompleted = onboardingCompletedRes.count ?? 0;
    const onboardingRate =
      totalUsers > 0 ? Math.round((onboardingCompleted / totalUsers) * 100) : 0;

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
      onboarding_completed: onboardingCompleted,
      onboarding_rate_pct: onboardingRate,
      // Charts (2.2)
      sessions_by_week,
      signups_by_week,
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
