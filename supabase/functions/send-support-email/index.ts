import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HTML sanitization function to prevent XSS
function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Input validation
function validateInput(subject: string, message: string): { valid: boolean; error?: string } {
  if (!subject || subject.trim().length === 0) {
    return { valid: false, error: 'Subject is required' };
  }
  if (subject.length > 200) {
    return { valid: false, error: 'Subject must be less than 200 characters' };
  }
  
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message is required' };
  }
  if (message.length < 10) {
    return { valid: false, error: 'Message must be at least 10 characters' };
  }
  if (message.length > 2000) {
    return { valid: false, error: 'Message must be less than 2000 characters' };
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user?.email) {
      console.error('User not authenticated:', userError);
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const { subject, message } = await req.json();

    // Validate inputs
    const validation = validateInput(subject, message);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Sanitize inputs to prevent XSS
    const sanitizedSubject = sanitizeHtml(subject.trim());
    const sanitizedMessage = sanitizeHtml(message.trim());

    const resend = new Resend(RESEND_API_KEY);

    // Send email to support team
    const { data, error } = await resend.emails.send({
      from: 'Pulse-AI Support <support@notifications.pulse-ai.app>',
      to: ['general@pulse-ai.app'],
      replyTo: user.email,
      subject: `[Support] ${sanitizedSubject}`,
      html: `
        <h2>Nouveau message de support</h2>
        <p><strong>De:</strong> ${user.email}</p>
        <p><strong>User ID:</strong> ${user.id}</p>
        <p><strong>Sujet:</strong> ${sanitizedSubject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Send confirmation to user
    await resend.emails.send({
      from: 'Pulse-AI <noreply@notifications.pulse-ai.app>',
      to: [user.email],
      subject: 'Nous avons bien reçu ton message',
      html: `
        <h2>Salut !</h2>
        <p>Nous avons bien reçu ton message et nous te répondrons dans les plus brefs délais.</p>
        <p><strong>Ton message:</strong></p>
        <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
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
    // Log full error details server-side only
    console.error('Error in send-support-email:', error);
    
    // Return generic error message to client (don't expose internal details)
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue lors de l\'envoi du message' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
