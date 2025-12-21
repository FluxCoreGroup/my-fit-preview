import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { Resend } from "https://esm.sh/resend@4.0.0";
import { generateEmailHtml, BRAND, translateGoalType, translateExperienceLevel, translatePriorityZones } from '../_shared/email-template.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const resend = new Resend(RESEND_API_KEY);

    // Fetch pending emails that are due
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .limit(50);

    if (fetchError) {
      console.error('Error fetching email queue:', fetchError);
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('No pending emails to process');
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${pendingEmails.length} pending emails`);
    let successCount = 0;
    let errorCount = 0;

    for (const email of pendingEmails) {
      try {
        // Fetch user data
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', email.user_id)
          .single();

        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', email.user_id)
          .single();

        const { data: trainingPrefs } = await supabase
          .from('training_preferences')
          .select('*')
          .eq('user_id', email.user_id)
          .single();

        if (!profile?.email) {
          console.log(`No email found for user ${email.user_id}, marking as failed`);
          await supabase
            .from('email_queue')
            .update({ status: 'failed' })
            .eq('id', email.id);
          errorCount++;
          continue;
        }

        const recipientName = profile.name || 'Champion';
        const goalType = translateGoalType(goals?.goal_type);
        const experienceLevel = translateExperienceLevel(trainingPrefs?.experience_level);
        const priorityZones = translatePriorityZones(trainingPrefs?.priority_zones);
        const frequency = goals?.frequency || 3;

        let emailData;

        // Generate email based on type
        switch (email.email_type) {
          case 'onboarding_day1':
            emailData = generateDay1Email(recipientName, goalType, experienceLevel, frequency);
            break;
          case 'onboarding_day3':
            emailData = generateDay3Email(recipientName, goalType, goals);
            break;
          case 'onboarding_day7':
            // Fetch stats for week 1 review
            const stats = await getWeek1Stats(supabase, email.user_id);
            emailData = generateDay7Email(recipientName, goalType, stats);
            break;
          default:
            console.log(`Unknown email type: ${email.email_type}`);
            await supabase
              .from('email_queue')
              .update({ status: 'failed' })
              .eq('id', email.id);
            errorCount++;
            continue;
        }

        // Send email
        const { error: sendError } = await resend.emails.send({
          from: BRAND.from,
          to: [profile.email],
          subject: emailData.subject,
          html: generateEmailHtml({
            recipientName,
            recipientEmail: profile.email,
            ...emailData
          }),
        });

        if (sendError) {
          console.error(`Failed to send ${email.email_type} to ${profile.email}:`, sendError);
          await supabase
            .from('email_queue')
            .update({ status: 'failed' })
            .eq('id', email.id);
          errorCount++;
        } else {
          console.log(`Sent ${email.email_type} to ${profile.email}`);
          await supabase
            .from('email_queue')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', email.id);
          successCount++;
        }

      } catch (emailError) {
        console.error(`Error processing email ${email.id}:`, emailError);
        await supabase
          .from('email_queue')
          .update({ status: 'failed' })
          .eq('id', email.id);
        errorCount++;
      }
    }

    console.log(`Processed: ${successCount} sent, ${errorCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: pendingEmails.length,
        sent: successCount,
        failed: errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-email-queue:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// J+1: Coach Alex email
function generateDay1Email(name: string, goalType: string, experienceLevel: string, frequency: number) {
  return {
    subject: `${name}, Alex t'a préparé ta semaine 💪`,
    previewText: `Ton coach IA a analysé ton profil et créé un programme sur-mesure`,
    title: `Hey ${name} ! 👋`,
    subtitle: `Alex, ton coach IA, a préparé un programme personnalisé pour ${goalType}.`,
    bodyContent: `
      <div style="background:#F0F9FF;border-radius:12px;padding:20px;margin:16px 0">
        <p style="margin:0 0 12px;font-weight:700;color:#0369A1">🎯 Ce qu'Alex a prévu pour toi :</p>
        <ul style="margin:0;padding-left:20px;color:#334155">
          <li style="margin-bottom:8px"><strong>${frequency} séances/semaine</strong> adaptées à ton niveau ${experienceLevel}</li>
          <li style="margin-bottom:8px"><strong>Progression automatique</strong> basée sur tes retours post-séance</li>
          <li style="margin-bottom:8px"><strong>Alternatives instantanées</strong> si un exercice ne te convient pas</li>
        </ul>
      </div>
      <p style="margin:16px 0;text-align:center;font-size:14px;color:#64748B">
        💡 <em>Astuce : Après chaque séance, donne ton ressenti en 30 secondes pour qu'Alex ajuste la difficulté.</em>
      </p>
    `,
    ctaText: 'Voir mon programme',
    ctaUrl: `${BRAND.baseUrl}/training`,
    footerNote: 'Alex analyse tes performances pour optimiser chaque séance.'
  };
}

// J+3: Coach Julie email
function generateDay3Email(name: string, goalType: string, goals: any) {
  const calories = goals?.weight && goals?.height ? 
    Math.round((10 * goals.weight) + (6.25 * goals.height) - (5 * (goals.age || 30)) + 5) :
    2000;

  return {
    subject: `${name}, Julie a calculé tes macros 🥗`,
    previewText: `Ta coach nutrition IA t'a préparé un plan alimentaire personnalisé`,
    title: `Salut ${name} ! 🥗`,
    subtitle: `Je suis Julie, ta coach nutrition IA. J'ai analysé ton profil pour ${goalType}.`,
    bodyContent: `
      <div style="background:linear-gradient(135deg,#10B981 0%, #059669 100%);border-radius:16px;padding:24px;margin:16px 0;color:white">
        <p style="margin:0 0 16px;font-weight:700;font-size:18px;text-align:center">📊 Tes objectifs quotidiens estimés</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding:8px">
              <div style="font-size:28px;font-weight:800">${calories}</div>
              <div style="font-size:12px;opacity:0.9">CALORIES</div>
            </td>
            <td align="center" style="padding:8px">
              <div style="font-size:28px;font-weight:800">${Math.round(goals?.weight * 1.8 || 120)}g</div>
              <div style="font-size:12px;opacity:0.9">PROTÉINES</div>
            </td>
          </tr>
        </table>
      </div>
      <div style="margin:20px 0">
        <p style="margin:0 0 12px;font-weight:700;color:#0F172A">🍽️ Ce que Julie peut faire pour toi :</p>
        <ul style="margin:0;padding-left:20px;color:#334155">
          <li style="margin-bottom:8px">Générer des <strong>recettes adaptées</strong> à tes restrictions</li>
          <li style="margin-bottom:8px">Répondre à toutes tes <strong>questions nutrition</strong></li>
          <li style="margin-bottom:8px">T'aider à <strong>comprendre les étiquettes</strong> alimentaires</li>
        </ul>
      </div>
      <p style="margin:16px 0;text-align:center;font-size:14px;color:#64748B">
        💬 <em>Pose-moi n'importe quelle question nutrition, je suis là pour t'aider !</em>
      </p>
    `,
    ctaText: 'Parler à Julie',
    ctaUrl: `${BRAND.baseUrl}/coach-julie`,
    secondaryCtaText: 'Voir mon plan nutrition →',
    secondaryCtaUrl: `${BRAND.baseUrl}/nutrition`,
    footerNote: 'Julie adapte ses conseils à tes préférences et allergies.'
  };
}

// J+7: Week 1 Review email
function generateDay7Email(name: string, goalType: string, stats: any) {
  const sessionsCompleted = stats.sessionsCompleted || 0;
  const totalSessions = stats.totalSessions || 3;
  const adherencePercent = totalSessions > 0 ? Math.round((sessionsCompleted / totalSessions) * 100) : 0;

  const encouragement = sessionsCompleted >= totalSessions 
    ? '🏆 Incroyable ! Tu as complété toutes tes séances !'
    : sessionsCompleted >= 1 
    ? '💪 Beau début ! Continue sur cette lancée.'
    : '🚀 La semaine prochaine sera la tienne !';

  return {
    subject: `${name}, ta 1ère semaine en résumé 📊`,
    previewText: `${sessionsCompleted}/${totalSessions} séances complétées - Découvre ton bilan`,
    title: `Ta 1ère semaine, ${name} ! 📊`,
    subtitle: encouragement,
    showStats: true,
    stats: [
      { label: 'Séances', value: `${sessionsCompleted}/${totalSessions}`, emoji: '🏋️' },
      { label: 'Adhérence', value: `${adherencePercent}%`, emoji: '📈' },
      { label: 'Objectif', value: goalType.split(' ')[0], emoji: '🎯' }
    ],
    bodyContent: `
      <div style="background:#FEF3C7;border-radius:12px;padding:20px;margin:16px 0;border-left:4px solid #F59E0B">
        <p style="margin:0;font-weight:600;color:#92400E">
          🔥 La régularité est la clé du succès. Chaque séance compte !
        </p>
      </div>
      <div style="margin:20px 0">
        <p style="margin:0 0 12px;font-weight:700;color:#0F172A">📅 Cette semaine avec Pulse :</p>
        <ul style="margin:0;padding-left:20px;color:#334155">
          <li style="margin-bottom:8px">Tes séances s'<strong>adaptent automatiquement</strong> à tes retours</li>
          <li style="margin-bottom:8px">N'oublie pas ton <strong>check-in hebdomadaire</strong> pour ajuster ton plan</li>
          <li style="margin-bottom:8px">Discute avec <strong>Alex ou Julie</strong> si tu as des questions</li>
        </ul>
      </div>
    `,
    ctaText: 'Voir ma prochaine séance',
    ctaUrl: `${BRAND.baseUrl}/training`,
    secondaryCtaText: 'Faire mon check-in →',
    secondaryCtaUrl: `${BRAND.baseUrl}/training`,
    footerNote: 'On continue ensemble la semaine prochaine 💪'
  };
}

// Helper to get week 1 stats
async function getWeek1Stats(supabase: any, userId: string) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: sessions } = await supabase
    .from('sessions')
    .select('completed')
    .eq('user_id', userId)
    .gte('session_date', oneWeekAgo.toISOString());

  const { data: goals } = await supabase
    .from('goals')
    .select('frequency')
    .eq('user_id', userId)
    .single();

  return {
    sessionsCompleted: sessions?.filter((s: any) => s.completed).length || 0,
    totalSessions: goals?.frequency || 3
  };
}
