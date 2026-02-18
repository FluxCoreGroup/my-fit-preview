import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  CheckCircle2,
  XCircle,
  Dumbbell,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_disabled: boolean;
  created_at: string;
  last_activity_at: string | null;
  onboarding_completed: boolean;
  sessions_total: number;
  sessions_completed: number;
  subscription: { status: string; plan_type: string | null } | null;
}

type SortField = "created_at" | "last_activity_at" | "sessions_completed";
type SortDir = "asc" | "desc";

const LIMIT = 50;

// 2.3 — Sort indicator component
function SortIcon({ field, current, dir }: { field: SortField; current: SortField; dir: SortDir }) {
  if (field !== current) return null;
  return dir === "asc" ? <ChevronUp className="w-3 h-3 ml-0.5 inline" /> : <ChevronDown className="w-3 h-3 ml-0.5 inline" />;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [inactiveFilter, setInactiveFilter] = useState(""); // "14" | "30"
  const [subscriptionFilter, setSubscriptionFilter] = useState(""); // "active" | "trialing" | "none"
  const [sortBy, setSortBy] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [exporting, setExporting] = useState(false);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const buildParams = (overrides?: Record<string, string>) => {
    const base: Record<string, string> = {
      page: String(page),
      limit: String(LIMIT),
      sort: sortBy,
      dir: sortDir,
      ...(search && { search }),
      ...(roleFilter && { role: roleFilter }),
      ...(statusFilter && { status: statusFilter }),
      ...(inactiveFilter && { inactive: inactiveFilter }),
      ...(subscriptionFilter && { subscription: subscriptionFilter }),
    };
    return new URLSearchParams({ ...base, ...overrides });
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Non authentifié");
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-users?${buildParams()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur serveur");
      }
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, roleFilter, statusFilter, inactiveFilter, subscriptionFilter, sortBy, sortDir]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  // 2.3 — Column sort toggle
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  // 3.2 — CSV export
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Non authentifié");
      const params = buildParams({ export: "true", limit: "10000", page: "1" });
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-users?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Erreur lors de l'export");
      const data = await res.json();
      const rows: AdminUser[] = data.users ?? [];

      const headers = [
        "Email", "Nom", "Rôle", "Statut", "Inscrit le",
        "Dernière activité", "Séances complétées", "Séances totales",
        "Abonnement", "Plan",
      ];
      const csvRows = rows.map((u) => [
        u.email,
        u.name ?? "",
        u.role,
        u.is_disabled ? "Désactivé" : "Actif",
        format(new Date(u.created_at), "yyyy-MM-dd"),
        u.last_activity_at ? format(new Date(u.last_activity_at), "yyyy-MM-dd") : "",
        u.sessions_completed,
        u.sessions_total,
        u.subscription?.status ?? "Aucun",
        u.subscription?.plan_type ?? "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

      const csv = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${rows.length} utilisateurs exportés`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur export");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const subscriptionBadge = (u: AdminUser) => {
    if (!u.subscription) return null;
    const { status } = u.subscription;
    if (status === "active")
      return <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-green-500/10 text-green-700 dark:text-green-400">Premium</Badge>;
    if (status === "trialing")
      return <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary">Trialing</Badge>;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-4 py-5 text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <div className="flex items-center justify-between mt-3">
            <div>
              <h1 className="text-xl font-bold">Utilisateurs</h1>
              <p className="text-xs text-primary-foreground/70">
                {total} utilisateur{total !== 1 ? "s" : ""} au total
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExportCSV}
                disabled={exporting || loading}
                className="text-primary-foreground hover:bg-primary-foreground/10"
                title="Exporter CSV"
              >
                <Download className={`w-4 h-4 ${exporting ? "animate-pulse" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchUsers}
                disabled={loading}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par email ou nom..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} size="default">
            Rechercher
          </Button>
        </div>

        {/* Filters row 1 — Role & Status */}
        <div className="flex gap-1.5 flex-wrap">
          {(["", "admin", "member"] as const).map((r) => (
            <Button
              key={r}
              variant={roleFilter === r ? "default" : "outline"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => { setRoleFilter(r); setPage(1); }}
            >
              {r === "" ? "Tous rôles" : r === "admin" ? "Admins" : "Membres"}
            </Button>
          ))}
          <div className="w-px bg-border mx-0.5 hidden sm:block" />
          {(["", "active", "disabled"] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s === "" ? "Tous statuts" : s === "active" ? "Actifs" : "Désactivés"}
            </Button>
          ))}
        </div>

        {/* Filters row 2 — Subscription & Inactive (3.1 + 3.4) */}
        <div className="flex gap-1.5 flex-wrap">
          {(["", "active", "trialing", "none"] as const).map((s) => (
            <Button
              key={s}
              variant={subscriptionFilter === s ? "default" : "outline"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => { setSubscriptionFilter(s); setPage(1); }}
            >
              {s === "" ? "Tous abonnements" : s === "active" ? "Premium" : s === "trialing" ? "Trialing" : "Sans abonnement"}
            </Button>
          ))}
          <div className="w-px bg-border mx-0.5 hidden sm:block" />
          {(["", "14", "30"] as const).map((n) => (
            <Button
              key={n}
              variant={inactiveFilter === n ? "default" : "outline"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => { setInactiveFilter(n); setPage(1); }}
            >
              {n === "" ? "Toute activité" : `Inactifs ${n}j`}
            </Button>
          ))}
        </div>

        {/* 2.3 — Sort controls */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="shrink-0">Trier par :</span>
          {([
            { field: "created_at", label: "Inscription" },
            { field: "last_activity_at", label: "Activité" },
            { field: "sessions_completed", label: "Séances" },
          ] as { field: SortField; label: string }[]).map(({ field, label }) => (
            <Button
              key={field}
              variant={sortBy === field ? "secondary" : "ghost"}
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => handleSort(field)}
            >
              {label}
              <SortIcon field={field} current={sortBy} dir={sortDir} />
            </Button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Users list */}
        <div className="space-y-2">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="py-3 px-4">
                    <Skeleton className="h-5 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))
            : users.length === 0
            ? (
              <div className="text-center py-16 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucun utilisateur trouvé</p>
              </div>
            )
            : users.map((u) => (
                <Card
                  key={u.id}
                  className="hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-sm truncate">
                            {u.name ?? u.email}
                          </span>
                          {u.role === "admin" && (
                            <Badge variant="default" className="text-[10px] py-0 px-1.5">
                              <ShieldCheck className="w-3 h-3 mr-0.5" />
                              Admin
                            </Badge>
                          )}
                          {u.is_disabled && (
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                              Désactivé
                            </Badge>
                          )}
                          {subscriptionBadge(u)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{u.email}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Dumbbell className="w-3 h-3" />
                            {u.sessions_completed}/{u.sessions_total} séances
                          </span>
                          <span>
                            Inscrit {format(new Date(u.created_at), "d MMM yy", { locale: fr })}
                          </span>
                          {u.last_activity_at && (
                            <span>
                              Actif {format(new Date(u.last_activity_at), "d MMM yy", { locale: fr })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {u.onboarding_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground/40" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
