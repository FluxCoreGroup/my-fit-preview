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

    const adminUserId = claimsData.claims.sub;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // RBAC check
    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    // ── Detail view ──────────────────────────────────────────────────────────
    if (userId) {
      const [profileRes, roleRes, subscriptionRes, sessionsRes, programsRes] =
        await Promise.all([
          supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle(),
          supabaseAdmin
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .maybeSingle(),
          supabaseAdmin
            .from("subscriptions")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabaseAdmin
            .from("sessions")
            .select("id, completed, session_date")
            .eq("user_id", userId)
            .order("session_date", { ascending: false }),
          supabaseAdmin
            .from("weekly_programs")
            .select("id, week_start_date, week_end_date, check_in_completed")
            .eq("user_id", userId)
            .order("week_start_date", { ascending: false })
            .limit(5),
        ]);

      const auditRes = await supabaseAdmin
        .from("admin_audit_log")
        .select("*")
        .eq("target_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      const sessions = sessionsRes.data ?? [];
      const completedSessions = sessions.filter((s) => s.completed).length;

      return new Response(
        JSON.stringify({
          profile: profileRes.data,
          role: roleRes.data?.role ?? "member",
          subscription: subscriptionRes.data,
          sessions_total: sessions.length,
          sessions_completed: completedSessions,
          weekly_programs: programsRes.data ?? [],
          audit_log: auditRes.data ?? [],
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── List view ─────────────────────────────────────────────────────────────
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "50");
    const search = url.searchParams.get("search") ?? "";
    const roleFilter = url.searchParams.get("role") ?? "";
    const statusFilter = url.searchParams.get("status") ?? "";
    const offset = (page - 1) * limit;

    // Fetch profiles with filters
    let profilesQuery = supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      profilesQuery = profilesQuery.ilike("email", `%${search}%`);
    }
    if (statusFilter === "disabled") {
      profilesQuery = profilesQuery.eq("is_disabled", true);
    } else if (statusFilter === "active") {
      profilesQuery = profilesQuery.eq("is_disabled", false);
    }

    const { data: profiles, count: totalCount } = await profilesQuery;

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ users: [], total: 0, page, limit }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const profileIds = profiles.map((p) => p.id);

    // Fetch roles, subscriptions, sessions counts
    const [rolesRes, subscriptionsRes, sessionsCountRes] = await Promise.all([
      supabaseAdmin
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", profileIds),
      supabaseAdmin
        .from("subscriptions")
        .select("user_id, status, plan_type")
        .in("user_id", profileIds)
        .eq("status", "active"),
      supabaseAdmin
        .from("sessions")
        .select("user_id, completed")
        .in("user_id", profileIds),
    ]);

    const rolesMap = new Map(
      (rolesRes.data ?? []).map((r) => [r.user_id, r.role])
    );
    const subscriptionsMap = new Map(
      (subscriptionsRes.data ?? []).map((s) => [s.user_id, s])
    );
    const sessionsMap = new Map<string, { total: number; completed: number }>();
    for (const session of sessionsCountRes.data ?? []) {
      const entry = sessionsMap.get(session.user_id) ?? {
        total: 0,
        completed: 0,
      };
      entry.total++;
      if (session.completed) entry.completed++;
      sessionsMap.set(session.user_id, entry);
    }

    let users = profiles.map((p) => ({
      id: p.id,
      email: p.email,
      name: p.name,
      role: rolesMap.get(p.id) ?? "member",
      is_disabled: p.is_disabled,
      created_at: p.created_at,
      last_activity_at: p.last_activity_at,
      onboarding_completed: p.onboarding_completed,
      sessions_total: sessionsMap.get(p.id)?.total ?? 0,
      sessions_completed: sessionsMap.get(p.id)?.completed ?? 0,
      subscription: subscriptionsMap.get(p.id) ?? null,
    }));

    // Filter by role after join
    if (roleFilter === "admin") {
      users = users.filter((u) => u.role === "admin");
    } else if (roleFilter === "member") {
      users = users.filter((u) => u.role === "member");
    }

    return new Response(
      JSON.stringify({ users, total: totalCount ?? 0, page, limit }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("admin-users error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
