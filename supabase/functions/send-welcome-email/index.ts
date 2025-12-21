import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { generateEmailHtml, BRAND, translateGoalType } from '../_shared/email-template.ts';

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
      .select('goal_type, session_duration, location, equipment, frequency')
      .eq('user_id', user_id)
      .single();

    const { data: trainingPrefs } = await supabase
      .from('training_preferences')
      .select('experience_level, priority_zones')
      .eq('user_id', user_id)
      .single();

    // Build personalized content
    const objectif = translateGoalType(goals?.goal_type);
    const dureeEstimee = goals?.session_duration ? `${goals.session_duration} min` : '45-60 min';
    const frequency = goals?.frequency || 3;
    const materiel = goals?.location === 'home' 
      ? (goals?.equipment?.length ? goals.equipment.slice(0, 3).join(', ') : 'poids du corps')
      : 'équipement salle';

    const experienceEmoji = trainingPrefs?.experience_level === 'beginner' ? '🌱' :
                           trainingPrefs?.experience_level === 'intermediate' ? '💪' : '🔥';

    const resend = new Resend(RESEND_API_KEY);

    const emailHtml = generateEmailHtml({
      recipientName: name || 'Champion',
      recipientEmail: email,
      subject: `Bienvenue ${name || ''} — ta 1ère séance est prête`,
      previewText: `Ta 1ère séance (${dureeEstimee}) pour ${objectif} t'attend — on s'adapte à ton matériel.`,
      title: `Bienvenue ${name || 'Champion'} ! 👋`,
      subtitle: `Ton objectif : <strong>${objectif}</strong>. On a tout préparé pour toi.`,
      bodyContent: `
        <div style="background:#F0FDF4;border-radius:16px;padding:20px;margin:16px 0;border-left:4px solid #10B981">
          <p style="margin:0 0 12px;font-weight:700;color:#166534">✨ Ce qui t'attend avec Pulse.ai :</p>
          <ul style="margin:0;padding-left:20px;color:#334155;font-size:14px;line-height:22px">
            <li style="margin-bottom:6px">🎯 <strong>${frequency} séances/semaine</strong> adaptées à ton niveau ${experienceEmoji}</li>
            <li style="margin-bottom:6px">🥗 <strong>Plan nutrition personnalisé</strong> avec macros calculés</li>
            <li style="margin-bottom:6px">🤖 <strong>2 coachs IA</strong> disponibles 24/7 (Alex pour le sport, Julie pour la nutrition)</li>
            <li>📊 <strong>Suivi hebdomadaire</strong> avec ajustements automatiques</li>
          </ul>
        </div>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="margin:20px 0;background:#F8FAFC;border-radius:12px">
          <tr>
            <td align="center" style="padding:16px">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:0 16px;text-align:center">
                    <div style="font-size:24px">⏱️</div>
                    <div style="font-size:13px;font-weight:600;color:#0F172A;margin-top:4px">${dureeEstimee}</div>
                    <div style="font-size:11px;color:#64748B">par séance</div>
                  </td>
                  <td style="padding:0 16px;text-align:center;border-left:1px solid #E2E8F0">
                    <div style="font-size:24px">🏋️</div>
                    <div style="font-size:13px;font-weight:600;color:#0F172A;margin-top:4px">${materiel}</div>
                    <div style="font-size:11px;color:#64748B">matériel</div>
                  </td>
                  <td style="padding:0 16px;text-align:center;border-left:1px solid #E2E8F0">
                    <div style="font-size:24px">📅</div>
                    <div style="font-size:13px;font-weight:600;color:#0F172A;margin-top:4px">${frequency}x/sem</div>
                    <div style="font-size:11px;color:#64748B">fréquence</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0;text-align:center;color:#64748B;font-size:14px">
          Ta 1ère séance est <strong>prête et offerte</strong>. Lance-toi ! 👇
        </p>
      `,
      ctaText: 'Commencer ma 1ère séance',
      ctaUrl: `${BRAND.baseUrl}/training`,
      footerNote: 'Après la séance, un court questionnaire (30s) nous permet d\'ajuster automatiquement la difficulté.'
    });

    // Send welcome email
    const { data, error } = await resend.emails.send({
      from: BRAND.from,
      to: [email],
      subject: `Bienvenue ${name || ''} — ta 1ère séance pour ${objectif} est prête 💪`,
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
