import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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

    const body = await req.json();
    const { action, targetUserId, confirm, newRole } = body;

    if (!action || !targetUserId) {
      return new Response(
        JSON.stringify({ error: "action and targetUserId are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Anti-self-action guard (allow reset_password on self)
    if (
      targetUserId === adminUserId &&
      action !== "reset_password" &&
      action !== "send_reset_email"
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Vous ne pouvez pas effectuer cette action sur votre propre compte",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Helper: write audit log
    const writeAudit = async (
      actionName: string,
      details?: Record<string, unknown>
    ) => {
      await supabaseAdmin.from("admin_audit_log").insert({
        admin_user_id: adminUserId,
        target_user_id: targetUserId,
        action: actionName,
        details: details ?? null,
      });
    };

    switch (action) {
      // ── Disable account ───────────────────────────────────────────────────
      case "disable": {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ is_disabled: true })
          .eq("id", targetUserId);
        if (error) throw error;
        await writeAudit("disable_account");
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Enable account ────────────────────────────────────────────────────
      case "enable": {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ is_disabled: false })
          .eq("id", targetUserId);
        if (error) throw error;
        await writeAudit("enable_account");
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Delete account ────────────────────────────────────────────────────
      case "delete": {
        if (confirm !== "DELETE") {
          return new Response(
            JSON.stringify({
              error: 'Saisie de confirmation invalide. Tapez "DELETE".',
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Guard: prevent deleting the last admin
        const { data: adminRoles } = await supabaseAdmin
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");

        if (
          adminRoles &&
          adminRoles.length === 1 &&
          adminRoles[0].user_id === targetUserId
        ) {
          return new Response(
            JSON.stringify({
              error: "Impossible de supprimer le dernier administrateur.",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        await writeAudit("delete_account");

        await Promise.all([
          supabaseAdmin.from("goals").delete().eq("user_id", targetUserId),
          supabaseAdmin.from("sessions").delete().eq("user_id", targetUserId),
          supabaseAdmin.from("feedback").delete().eq("user_id", targetUserId),
          supabaseAdmin
            .from("weekly_programs")
            .delete()
            .eq("user_id", targetUserId),
          supabaseAdmin
            .from("weekly_checkins")
            .delete()
            .eq("user_id", targetUserId),
          supabaseAdmin
            .from("conversations")
            .delete()
            .eq("user_id", targetUserId),
          supabaseAdmin
            .from("training_preferences")
            .delete()
            .eq("user_id", targetUserId),
          supabaseAdmin
            .from("subscriptions")
            .delete()
            .eq("user_id", targetUserId),
          supabaseAdmin
            .from("weight_logs")
            .delete()
            .eq("user_id", targetUserId),
          supabaseAdmin
            .from("nutrition_logs")
            .delete()
            .eq("user_id", targetUserId),
        ]);

        const { error: deleteError } =
          await supabaseAdmin.auth.admin.deleteUser(targetUserId);
        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Reset password (returns link) ──────────────────────────────────────
      case "reset_password": {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .eq("id", targetUserId)
          .maybeSingle();

        if (!profile?.email) {
          return new Response(
            JSON.stringify({ error: "Utilisateur introuvable" }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data: linkData, error: linkError } =
          await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email: profile.email,
          });

        if (linkError) throw linkError;

        await writeAudit("reset_password", { email: profile.email });

        return new Response(
          JSON.stringify({
            success: true,
            link: linkData?.properties?.action_link,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ── Send reset password by email directly (4.1) ────────────────────────
      case "send_reset_email": {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email, name")
          .eq("id", targetUserId)
          .maybeSingle();

        if (!profile?.email) {
          return new Response(
            JSON.stringify({ error: "Utilisateur introuvable" }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data: linkData, error: linkError } =
          await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email: profile.email,
          });

        if (linkError) throw linkError;

        const resetLink = linkData?.properties?.action_link;
        if (!resetLink) throw new Error("Impossible de générer le lien");

        // Send via Resend
        const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
        const { error: emailError } = await resend.emails.send({
          from: "PULSE <noreply@pulse-ai.app>",
          to: profile.email,
          subject: "Réinitialisation de votre mot de passe PULSE",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
              <h2 style="color:#18181b;">Réinitialisation de mot de passe</h2>
              <p>Bonjour${profile.name ? ` ${profile.name}` : ""},</p>
              <p>Un administrateur a demandé la réinitialisation de votre mot de passe.</p>
              <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
              <a href="${resetLink}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                Réinitialiser mon mot de passe
              </a>
              <p style="color:#71717a;font-size:13px;">Ce lien expire dans 24 heures. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
          `,
        });

        if (emailError) throw emailError;

        await writeAudit("send_reset_email", { email: profile.email });

        return new Response(
          JSON.stringify({ success: true, email: profile.email }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ── Set role (3.3) ─────────────────────────────────────────────────────
      case "set_role": {
        if (newRole !== "admin" && newRole !== "member") {
          return new Response(
            JSON.stringify({ error: "Rôle invalide. Utilisez 'admin' ou 'member'." }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Guard: cannot demote yourself
        if (targetUserId === adminUserId && newRole === "member") {
          return new Response(
            JSON.stringify({ error: "Vous ne pouvez pas vous rétrograder vous-même." }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Guard: cannot demote the last admin
        if (newRole === "member") {
          const { data: adminRoles } = await supabaseAdmin
            .from("user_roles")
            .select("user_id")
            .eq("role", "admin");

          if (
            adminRoles &&
            adminRoles.length === 1 &&
            adminRoles[0].user_id === targetUserId
          ) {
            return new Response(
              JSON.stringify({
                error: "Impossible de rétrograder le dernier administrateur.",
              }),
              {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        }

        // Upsert role
        const { error: upsertError } = await supabaseAdmin
          .from("user_roles")
          .upsert(
            { user_id: targetUserId, role: newRole },
            { onConflict: "user_id" }
          );

        if (upsertError) throw upsertError;

        const previousRole = newRole === "admin" ? "member" : "admin";
        await writeAudit("set_role", {
          previous_role: previousRole,
          new_role: newRole,
        });

        return new Response(JSON.stringify({ success: true, role: newRole }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Action inconnue" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("admin-actions error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
