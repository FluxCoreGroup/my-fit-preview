import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShieldCheck,
  User,
  Dumbbell,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Copy,
  ToggleLeft,
  ToggleRight,
  Trash2,
  KeyRound,
  Clock,
  Lock,
  CheckCircle2,
  KeySquare,
  Mail,
  UserCog,
  UserCheck,
  UserX,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/BackButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserDetail {
  profile: {
    id: string;
    email: string;
    name: string | null;
    created_at: string;
    last_activity_at: string | null;
    onboarding_completed: boolean;
    is_disabled: boolean;
  };
  role: string;
  subscription: {
    status: string;
    plan_type: string | null;
    started_at: string | null;
    ends_at: string | null;
  } | null;
  sessions_total: number;
  sessions_completed: number;
  weekly_programs: Array<{
    id: string;
    week_start_date: string;
    week_end_date: string;
    check_in_completed: boolean;
  }>;
  audit_log: Array<{
    id: string;
    admin_user_id: string;
    action: string;
    details: Record<string, unknown> | null;
    created_at: string;
  }>;
}

// 2.1 — Mapping audit log lisible
const ACTION_MAP: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
  disable_account:  { label: "Compte désactivé",            Icon: Lock,        color: "text-orange-500" },
  enable_account:   { label: "Compte réactivé",             Icon: CheckCircle2, color: "text-green-500" },
  reset_password:   { label: "Lien reset mot de passe généré", Icon: KeySquare,  color: "text-blue-500"  },
  send_reset_email: { label: "Email reset mot de passe envoyé", Icon: Mail,      color: "text-blue-500"  },
  delete_account:   { label: "Compte supprimé",             Icon: Trash2,      color: "text-destructive" },
  set_role:         { label: "Rôle modifié",                Icon: UserCog,     color: "text-purple-500" },
};

function humanizeDetails(action: string, details: Record<string, unknown> | null): string | null {
  if (!details) return null;
  if (action === "reset_password" || action === "send_reset_email") {
    return details.email ? `Envoyé à ${details.email}` : null;
  }
  if (action === "set_role") {
    return `${details.previous_role ?? "?"} → ${details.new_role ?? "?"}`;
  }
  if (action === "delete_account" && details.email) {
    return `Utilisateur : ${details.email}`;
  }
  // Fallback: render key=value pairs in a human readable form
  return Object.entries(details)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
}

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [resetLink, setResetLink] = useState<string | null>(null);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Non authentifié");
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-users?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur serveur");
      }
      setDetail(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDetail();
  }, [userId]);

  const callAction = async (action: string, extra?: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Non authentifié");
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-actions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, targetUserId: userId, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      return data;
    } finally {
      setActionLoading(false);
    }
  };

  // 1.3 — disable/enable are now inside AlertDialog
  const handleDisable = async () => {
    try {
      await callAction(detail?.profile.is_disabled ? "enable" : "disable");
      toast.success(
        detail?.profile.is_disabled ? "Compte réactivé avec succès" : "Compte désactivé avec succès"
      );
      fetchDetail();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error('Veuillez saisir "DELETE" pour confirmer');
      return;
    }
    try {
      await callAction("delete", { confirm: "DELETE" });
      toast.success("Compte supprimé avec succès");
      navigate("/admin/users");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const handleResetPassword = async () => {
    try {
      const data = await callAction("reset_password");
      if (data.link) {
        setResetLink(data.link);
        toast.success("Lien de réinitialisation généré");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  // 4.1 — Send reset email directly
  const handleSendResetEmail = async () => {
    try {
      const data = await callAction("send_reset_email");
      if (data.success) {
        toast.success(`Email de réinitialisation envoyé à ${data.email}`);
        setResetLink(null);
        fetchDetail();
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  // 3.3 — Set role
  const handleSetRole = async (newRole: "admin" | "member") => {
    try {
      await callAction("set_role", { newRole });
      toast.success(
        newRole === "admin" ? "Utilisateur promu administrateur" : "Utilisateur rétrogradé en membre"
      );
      fetchDetail();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const isSelf = adminUser?.id === userId;

  const fmtDate = (d: string | null | undefined) =>
    d ? format(new Date(d), "d MMM yyyy", { locale: fr }) : "—";

const subscriptionBadgeClass = (status: string) => {
    if (status === "active") return "bg-green-500/10 text-green-700 dark:text-green-400";
    if (status === "trialing") return "bg-primary/10 text-primary";
    return "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-4 py-5 text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-bold">
                  {loading ? "..." : detail?.profile.name ?? detail?.profile.email ?? "Utilisateur"}
                </h1>
                <p className="text-xs text-primary-foreground/70">Fiche utilisateur</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchDetail}
              disabled={loading}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Account info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))
            ) : (
              <>
                <Row label="Email" value={detail?.profile.email} copy />
                <Row label="Nom" value={detail?.profile.name ?? "—"} />
                <Row
                  label="Rôle"
                  value={
                    <Badge variant={detail?.role === "admin" ? "default" : "secondary"}>
                      {detail?.role === "admin" ? (
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        "Membre"
                      )}
                    </Badge>
                  }
                />
                <Row
                  label="Statut"
                  value={
                    detail?.profile.is_disabled ? (
                      <Badge variant="destructive">Désactivé</Badge>
                    ) : (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                        Actif
                      </Badge>
                    )
                  }
                />
                <Row
                  label="Onboarding"
                  value={detail?.profile.onboarding_completed ? "Complété ✓" : "Incomplet"}
                />
                <Row label="Inscrit le" value={fmtDate(detail?.profile.created_at)} />
                <Row label="Dernière activité" value={fmtDate(detail?.profile.last_activity_at)} />
                <Row
                  label="ID"
                  value={<span className="font-mono text-xs">{userId}</span>}
                  copy
                  copyValue={userId}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Indicateurs d'usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{detail?.sessions_completed}</p>
                  <p className="text-xs text-muted-foreground">séances complétées</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{detail?.sessions_total}</p>
                  <p className="text-xs text-muted-foreground">séances totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{detail?.weekly_programs.length}</p>
                  <p className="text-xs text-muted-foreground">semaines actives</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {detail?.weekly_programs.filter((p) => p.check_in_completed).length}
                  </p>
                  <p className="text-xs text-muted-foreground">check-ins</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription */}
        {(loading || detail?.subscription) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Abonnement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <>
                  <Row
                    label="Statut"
                    value={
                      <Badge
                        variant="secondary"
                        className={subscriptionBadgeClass(detail?.subscription?.status ?? "")}
                      >
                        {detail?.subscription?.status ?? "—"}
                      </Badge>
                    }
                  />
                  <Row label="Plan" value={detail?.subscription?.plan_type ?? "—"} />
                  <Row label="Démarré le" value={fmtDate(detail?.subscription?.started_at)} />
                  <Row label="Expire le" value={fmtDate(detail?.subscription?.ends_at)} />
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin actions */}
        {!isSelf && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Actions admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">

              {/* 1.3 — Disable/Enable with confirmation dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={actionLoading || loading}
                  >
                    {detail?.profile.is_disabled ? (
                      <>
                        <ToggleLeft className="w-4 h-4 text-green-600 dark:text-green-400" />
                        Réactiver le compte
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-4 h-4 text-amber-500" />
                        Désactiver le compte
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      {detail?.profile.is_disabled ? "Réactiver le compte ?" : "Désactiver le compte ?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {detail?.profile.is_disabled
                        ? `L'utilisateur ${detail?.profile.email} pourra à nouveau se connecter.`
                        : `L'utilisateur ${detail?.profile.email} ne pourra plus se connecter à son compte.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDisable}
                      disabled={actionLoading}
                      className={
                        detail?.profile.is_disabled
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-amber-500 hover:bg-amber-600 text-white"
                      }
                    >
                      {detail?.profile.is_disabled ? "Réactiver" : "Désactiver"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* 3.3 — Change role */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={actionLoading || loading}
                  >
                    {detail?.role === "admin" ? (
                      <>
                        <UserX className="w-4 h-4 text-muted-foreground" />
                        Rétrograder en membre
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 text-primary" />
                        Promouvoir administrateur
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-primary" />
                      {detail?.role === "admin"
                        ? "Rétrograder en membre ?"
                        : "Promouvoir administrateur ?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {detail?.role === "admin"
                        ? `${detail?.profile.email} perdra l'accès à l'espace admin.`
                        : `${detail?.profile.email} aura accès à l'espace admin et à toutes les actions admin.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        handleSetRole(detail?.role === "admin" ? "member" : "admin")
                      }
                      disabled={actionLoading}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {detail?.role === "admin" ? "Rétrograder" : "Promouvoir"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Reset password */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleResetPassword}
                  disabled={actionLoading}
                >
                  <KeyRound className="w-4 h-4 text-primary" />
                  Générer lien reset mot de passe
                </Button>

                {/* 4.1 — Send reset email directly */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleSendResetEmail}
                  disabled={actionLoading}
                >
                  <Mail className="w-4 h-4 text-primary" />
                  Envoyer reset par email directement
                </Button>
              </div>

              {resetLink && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium mb-1">Lien de réinitialisation :</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] break-all flex-1">{resetLink}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(resetLink);
                        toast.success("Lien copié");
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    disabled={actionLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer le compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Supprimer le compte ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Toutes les données de l'utilisateur{" "}
                      <strong>{detail?.profile.email}</strong> seront supprimées définitivement.
                      <br /><br />
                      Tapez <strong>DELETE</strong> pour confirmer :
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder='Tapez "DELETE"'
                    className="mt-2"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirm("")}>
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleteConfirm !== "DELETE" || actionLoading}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}

        {/* 2.1 — Audit log humanisé */}
        {!loading && detail && detail.audit_log.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Historique des actions admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {detail.audit_log.map((entry) => {
                  const mapped = ACTION_MAP[entry.action];
                  const Icon = mapped?.Icon ?? Clock;
                  const label = mapped?.label ?? entry.action;
                  const color = mapped?.color ?? "text-muted-foreground";
                  const humanDetails = humanizeDetails(entry.action, entry.details);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between gap-3 py-2.5 border-b last:border-0"
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{label}</p>
                          {humanDetails && (
                            <p className="text-xs text-muted-foreground truncate">{humanDetails}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {format(new Date(entry.created_at), "d MMM yy HH:mm", { locale: fr })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Small helper component for key-value rows
function Row({
  label,
  value,
  copy,
  copyValue,
}: {
  label: string;
  value: React.ReactNode;
  copy?: boolean;
  copyValue?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-right">{value}</span>
        {copy && (
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => {
              navigator.clipboard.writeText(
                copyValue ?? (typeof value === "string" ? value : "")
              );
              toast.success("Copié !");
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
