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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

const LIMIT = 50;

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-users?${params}`,
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
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

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

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par email..."
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

        <div className="flex gap-2 flex-wrap">
          {/* Role filter */}
          {["", "admin", "member"].map((r) => (
            <Button
              key={r}
              variant={roleFilter === r ? "default" : "outline"}
              size="sm"
              onClick={() => { setRoleFilter(r); setPage(1); }}
            >
              {r === "" ? "Tous les rôles" : r === "admin" ? "Admins" : "Membres"}
            </Button>
          ))}
          <div className="w-px bg-border mx-1 hidden sm:block" />
          {/* Status filter */}
          {["", "active", "disabled"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s === "" ? "Tous statuts" : s === "active" ? "Actifs" : "Désactivés"}
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
                        <div className="flex items-center gap-2 flex-wrap">
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
                          {u.subscription?.status === "active" && (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-green-100 text-green-700">
                              Premium
                            </Badge>
                          )}
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
