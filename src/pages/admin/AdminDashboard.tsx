import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Activity,
  CheckSquare,
  CreditCard,
  TrendingUp,
  UserPlus,
  Dumbbell,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/BackButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeekPoint {
  label: string;
  count: number;
}

interface AdminStats {
  total_users: number;
  new_users_today: number;
  new_users_week: number;
  new_users_month: number;
  active_users_7d: number;
  active_users_30d: number;
  completed_sessions_total: number;
  completed_sessions_week: number;
  weekly_checkins_month: number;
  subscriptions_active: number;
  checkin_rate_pct: number;
  onboarding_completed: number;
  onboarding_rate_pct: number;
  sessions_by_week: WeekPoint[];
  signups_by_week: WeekPoint[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/40 bg-primary/5" : ""}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${highlight ? "bg-primary/10" : "bg-muted"}`}>
            <Icon className={`w-5 h-5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniBarChart({
  data,
  title,
  color,
}: {
  data: WeekPoint[];
  title: string;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={data} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => [v, ""]}
              labelFormatter={(l) => l}
            />
            <Bar dataKey="count" fill={color} radius={[3, 3, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur serveur");
      }
      const data = await res.json();
      setStats(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-4 py-5 text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-7 h-7" />
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-xs text-primary-foreground/70">Vue globale de l'application</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchStats}
              disabled={loading}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Quick nav to users */}
        <Link to="/admin/users">
          <Card className="hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold">Gestion des utilisateurs</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        {/* KPIs — Utilisateurs */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Utilisateurs
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-5 pb-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <StatCard
                  icon={Users}
                  label="Total utilisateurs"
                  value={stats?.total_users ?? 0}
                  highlight
                />
                <StatCard
                  icon={UserPlus}
                  label="Nouveaux aujourd'hui"
                  value={stats?.new_users_today ?? 0}
                  sub={`${stats?.new_users_week ?? 0} cette semaine`}
                />
                <StatCard
                  icon={UserPlus}
                  label="Nouveaux (30j)"
                  value={stats?.new_users_month ?? 0}
                />
                <StatCard
                  icon={Activity}
                  label="Actifs (7j)"
                  value={stats?.active_users_7d ?? 0}
                  sub={`${stats?.active_users_30d ?? 0} actifs (30j)`}
                />
                <StatCard
                  icon={GraduationCap}
                  label="Onboarding complété"
                  value={`${stats?.onboarding_rate_pct ?? 0}%`}
                  sub={`${stats?.onboarding_completed ?? 0} utilisateurs`}
                />
              </>
            )}
          </div>
        </div>

        {/* KPIs — Usage */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Usage & Engagement
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-5 pb-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <StatCard
                  icon={Dumbbell}
                  label="Séances complétées"
                  value={stats?.completed_sessions_total ?? 0}
                  sub={`${stats?.completed_sessions_week ?? 0} cette semaine`}
                  highlight
                />
                <StatCard
                  icon={CheckSquare}
                  label="Check-ins (30j)"
                  value={stats?.weekly_checkins_month ?? 0}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Taux check-in"
                  value={`${stats?.checkin_rate_pct ?? 0}%`}
                  sub="check-ins / utilisateurs (30j)"
                />
                <StatCard
                  icon={CreditCard}
                  label="Abonnements actifs"
                  value={stats?.subscriptions_active ?? 0}
                  sub="active + trialing"
                />
              </>
            )}
          </div>
        </div>

        {/* Charts (2.2) */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Tendances (8 semaines)
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 pb-3">
                    <Skeleton className="h-4 w-36 mb-2" />
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <MiniBarChart
                data={stats?.sessions_by_week ?? []}
                title="Séances complétées / semaine"
                color="hsl(var(--primary))"
              />
              <MiniBarChart
                data={stats?.signups_by_week ?? []}
                title="Nouveaux inscrits / semaine"
                color="hsl(var(--primary) / 0.6)"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
