import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

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
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      throw new Error('Missing required fields');
    }

    const resend = new Resend(RESEND_API_KEY);

    // Send email to support team
    const { data, error } = await resend.emails.send({
      from: 'Pulse-AI Support <support@notifications.pulse-ai.app>',
      to: ['general@pulse-ai.app'],
      replyTo: email,
      subject: `[Support] ${subject}`,
      html: `
        <h2>Nouveau message de support</h2>
        <p><strong>De:</strong> ${name} (${email})</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send email');
    }

    // Send confirmation to user
    await resend.emails.send({
      from: 'Pulse-AI <noreply@notifications.pulse-ai.app>',
      to: [email],
      subject: 'Nous avons bien reçu votre message',
      html: `
        <h2>Bonjour ${name},</h2>
        <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
        <p><strong>Votre message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>L'équipe Pulse-AI</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-support-email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
