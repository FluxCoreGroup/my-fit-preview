import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const currentWeekISO = getCurrentWeekISO();

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, name");

    if (!profiles) {
      return new Response(
        JSON.stringify({ success: true, emailsSent: 0, errors: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let emailsSent = 0;
    let errors = 0;

    for (const profile of profiles) {
      const { data: checkIn } = await supabase
        .from("weekly_checkins")
        .select("id")
        .eq("user_id", profile.id)
        .eq("week_iso", currentWeekISO)
        .maybeSingle();

      if (checkIn) continue;

      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Pulse.ai <noreply@pulse.ai>",
            to: [profile.email],
            subject: "⏰ Check-in hebdomadaire en attente",
            html: `
              <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #8b5cf6;">Salut ${profile.name || "Champion"} 👋</h1>
                <p style="font-size: 16px; line-height: 1.6;">
                  C'est l'heure de ton check-in hebdomadaire ! 
                  <strong>2 minutes</strong> pour ajuster ton programme et maximiser tes résultats.
                </p>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; margin: 30px 0;">
                  <p style="color: white; margin: 0 0 15px 0; font-size: 14px;">
                    ✅ Poids de la semaine<br />
                    ✅ Adhérence nutrition<br />
                    ✅ Difficulté des entraînements
                  </p>
                  <a href="https://app.pulse.ai/weekly" style="display: inline-block; background: white; color: #667eea; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Faire mon check-in →
                  </a>
                </div>
                <p style="font-size: 14px; color: #666;">
                  💡 Ton programme sera automatiquement ajusté en fonction de tes réponses.
                </p>
              </div>
            `,
          }),
        });

        if (response.ok) {
          emailsSent++;
        } else {
          console.error(`Failed to send to ${profile.email}:`, await response.text());
          errors++;
        }
      } catch (emailError) {
        console.error(`Failed to send to ${profile.email}:`, emailError);
        errors++;
      }
    }

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
