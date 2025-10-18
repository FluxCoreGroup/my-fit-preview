import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

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
function validateInput(name: string, email: string, subject: string, message: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' };
  }
  
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }
  if (email.length > 255) {
    return { valid: false, error: 'Email must be less than 255 characters' };
  }
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
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

    const { name, email, subject, message } = await req.json();

    // Validate inputs
    const validation = validateInput(name, email, subject, message);
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
    const sanitizedName = sanitizeHtml(name.trim());
    const sanitizedEmail = sanitizeHtml(email.trim());
    const sanitizedSubject = sanitizeHtml(subject.trim());
    const sanitizedMessage = sanitizeHtml(message.trim());

    const resend = new Resend(RESEND_API_KEY);

    // Send email to support team
    const { data, error } = await resend.emails.send({
      from: 'Pulse-AI Support <support@notifications.pulse-ai.app>',
      to: ['general@pulse-ai.app'],
      replyTo: email.trim(),
      subject: `[Support] ${sanitizedSubject}`,
      html: `
        <h2>Nouveau message de support</h2>
        <p><strong>De:</strong> ${sanitizedName} (${sanitizedEmail})</p>
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
      to: [email.trim()],
      subject: 'Nous avons bien reçu votre message',
      html: `
        <h2>Bonjour ${sanitizedName},</h2>
        <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
        <p><strong>Votre message:</strong></p>
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
