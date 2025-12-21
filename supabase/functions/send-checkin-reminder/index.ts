import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { generateEmailHtml, BRAND } from '../_shared/email-template.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const currentWeekISO = getCurrentWeekISO();

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, name")
      .eq("onboarding_completed", true);

    if (!profiles) {
      return new Response(
        JSON.stringify({ success: true, emailsSent: 0, errors: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let emailsSent = 0;
    let errors = 0;

    for (const profile of profiles) {
      // Check if already completed check-in this week
      const { data: checkIn } = await supabase
        .from("weekly_checkins")
        .select("id")
        .eq("user_id", profile.id)
        .eq("week_iso", currentWeekISO)
        .maybeSingle();

      if (checkIn) continue;

      try {
        const emailHtml = generateEmailHtml({
          recipientName: profile.name || "Champion",
          recipientEmail: profile.email,
          subject: "⏰ Check-in hebdomadaire en attente",
          previewText: "2 minutes pour ajuster ton programme et maximiser tes résultats",
          title: `Hey ${profile.name || "Champion"} ! 👋`,
          subtitle: "C'est l'heure de ton check-in hebdomadaire !",
          bodyContent: `
            <p style="margin:0 0 20px;color:#334155">
              <strong>2 minutes</strong> pour ajuster ton programme et maximiser tes résultats.
            </p>
            
            <div style="background:linear-gradient(135deg,#6366F1 0%, #8B5CF6 100%);border-radius:16px;padding:24px;margin:16px 0">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="color:white;font-size:14px;line-height:22px">
                    <div style="margin-bottom:8px">✅ Poids de la semaine</div>
                    <div style="margin-bottom:8px">✅ Adhérence nutrition</div>
                    <div>✅ Difficulté des entraînements</div>
                  </td>
                </tr>
              </table>
            </div>
            
            <p style="margin:16px 0;text-align:center;font-size:14px;color:#64748B">
              💡 Ton programme sera automatiquement ajusté en fonction de tes réponses.
            </p>
          `,
          ctaText: "Faire mon check-in →",
          ctaUrl: `${BRAND.baseUrl}/training`,
          footerNote: "Le check-in prend moins de 2 minutes et aide Alex à optimiser tes séances."
        });

        const { error: sendError } = await resend.emails.send({
          from: BRAND.from,
          to: [profile.email],
          subject: `⏰ ${profile.name || "Champion"}, ton check-in t'attend !`,
          html: emailHtml,
        });

        if (sendError) {
          console.error(`Failed to send to ${profile.email}:`, sendError);
          errors++;
        } else {
          emailsSent++;
        }
      } catch (emailError) {
        console.error(`Failed to send to ${profile.email}:`, emailError);
        errors++;
      }
    }

    console.log(`Check-in reminders: ${emailsSent} sent, ${errors} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent, 
        errors,
        message: `Sent ${emailsSent} reminders, ${errors} failed`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getCurrentWeekISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const week = getWeekNumber(now);
  return `${year}-W${week.toString().padStart(2, "0")}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
