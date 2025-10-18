import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const { name, email, user_id } = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    // Initialize Supabase client to fetch user data
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Fetch user goals and training preferences
    const { data: goals } = await supabase
      .from('goals')
      .select('goal_type, session_duration, location, equipment')
      .eq('user_id', user_id)
      .single();

    const { data: trainingPrefs } = await supabase
      .from('training_preferences')
      .select('session_type')
      .eq('user_id', user_id)
      .single();

    // Build variables for email template
    const objectifs = goals?.goal_type === 'lose_weight' 
      ? 'perdre du poids' 
      : goals?.goal_type === 'gain_muscle' 
      ? 'prendre du muscle' 
      : goals?.goal_type === 'maintain' 
      ? 'maintenir ta forme' 
      : 'améliorer ta condition physique';

    const dureeEstimee = goals?.session_duration 
      ? `${goals.session_duration} min` 
      : '45-60 min';

    const materiel = goals?.location === 'home' 
      ? (goals?.equipment?.length ? goals.equipment.join(', ') : 'poids de corps')
      : 'salle de sport';

    const startUrl = `https://pulse-ai.lovable.app/training-setup`;

    const resend = new Resend(RESEND_API_KEY);

    // Build email HTML from template
    const emailHtml = `<!doctype html>
<html lang="fr" style="margin:0;padding:0;">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bienvenue — Pulse.ai</title>
    <style>
      @media (max-width:480px){
        .container{width:100%!important;border-radius:0!important}
        .h1{font-size:26px!important;line-height:34px!important}
        .lead{font-size:15px!important;line-height:22px!important}
        .btn{display:block!important;width:100%!important}
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#0f172a;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
    <div style="display:none;max-height:0;opacity:0;overflow:hidden">
      Ta 1ʳᵉ séance (${dureeEstimee}) est prête — on s'adapte à ton matériel ${materiel}.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background:linear-gradient(135deg,#3B82F6 0%, #1E40AF 100%);">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" class="container" cellspacing="0" cellpadding="0" border="0"
                 style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;
                        box-shadow:0 12px 30px rgba(30,64,175,.25);">
            <tr>
              <td style="padding:28px 28px 10px;background:#ffffff;text-align:center">
                <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
                            font-size:20px;font-weight:800;color:#0f172a;">Pulse.ai</div>
              </td>
            </tr>
            <tr><td style="height:4px;background:linear-gradient(90deg,#60A5FA,#6366F1,#22D3EE)"></td></tr>

            <tr>
              <td style="padding:28px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
                <h1 class="h1" style="margin:0 0 10px;text-align:center;font-size:30px;line-height:38px;font-weight:800">
                  Bienvenue ${name || 'Champion'} 👋
                </h1>
                <p class="lead" style="margin:0 0 18px;text-align:center;color:#334155;font-size:16px;line-height:24px">
                  Ton objectif&nbsp;: <strong>${objectifs}</strong>. On lance ta 1ʳᵉ séance maintenant.
                </p>

                <table role="presentation" width="100%" style="margin:8px 0 4px">
                  <tr><td style="text-align:center;color:#475569;font-size:14px;line-height:22px">
                    <div>• 1ʳᵉ séance offerte, guidée pas à pas</div>
                    <div>• Aperçu nutrition simple (calories & macros)</div>
                    <div>• Suivi & ajustements hebdomadaires</div>
                  </td></tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0"
                       style="margin:18px auto 8px auto;text-align:center">
                  <tr>
                    <td align="center" style="border-radius:14px;background:linear-gradient(135deg,#3B82F6 0%, #1E40AF 100%);">
                      <a class="btn" href="${startUrl}"
                         style="display:inline-block;padding:14px 22px;border-radius:14px;
                                font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
                                font-size:15px;font-weight:700;color:#ffffff;text-decoration:none">
                        Commencer ma 1ʳᵉ séance
                      </a>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" style="margin-top:12px">
                  <tr>
                    <td style="text-align:center;color:#64748b;font-size:13px;line-height:20px">
                      Durée estimée&nbsp;: <strong>${dureeEstimee}</strong> • Matériel&nbsp;: <strong>${materiel}</strong>
                    </td>
                  </tr>
                </table>

                <p style="margin:14px 0 0;text-align:center;color:#94a3b8;font-size:12px;line-height:18px">
                  Après la séance, un court questionnaire (30&nbsp;s) nous permet d'ajuster la difficulté
                  et la diète automatiquement.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#F8FAFC;padding:18px 20px 26px;text-align:center;
                         font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
                         color:#64748b;font-size:12px;line-height:18px">
                Besoin d'aide ? <a href="mailto:general@pulse-ai.app" style="color:#1E40AF;text-decoration:underline">general@pulse-ai.app</a><br>
                © 2025 Pulse.ai — E-mail transactionnel (bien-être, pas d'avis médical).
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    // Send welcome email to new user
    const { data, error } = await resend.emails.send({
      from: 'Pulse-AI <bienvenue@notifications.pulse-ai.app>',
      to: [email],
      subject: `Bienvenue ${name || ''} — ta 1ʳᵉ séance pour ${objectifs} est prête`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send welcome email');
    }

    console.log('Welcome email sent successfully:', { email, id: data?.id });

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-welcome-email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
