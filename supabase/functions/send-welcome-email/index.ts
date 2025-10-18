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

    const { name, email } = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    const resend = new Resend(RESEND_API_KEY);

    // Send welcome email to new user
    const { data, error } = await resend.emails.send({
      from: 'Pulse-AI <bienvenue@notifications.pulse-ai.app>',
      to: [email],
      subject: 'Bienvenue sur Pulse-AI ! 🎯',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #ffffff;
              padding: 40px 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .feature {
              margin: 20px 0;
              padding: 15px;
              background: #f9fafb;
              border-left: 4px solid #667eea;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              padding: 30px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 32px;">🎯 Bienvenue sur Pulse-AI</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Ton coach personnel sport + nutrition</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${name || 'Champion'} ! 👋</h2>
            
            <p>Nous sommes ravis de t'accueillir dans la communauté Pulse-AI ! Tu viens de faire le premier pas vers une transformation complète.</p>
            
            <div class="feature">
              <strong>🎁 Ta première séance est offerte !</strong><br>
              Découvre dès maintenant comment Pulse-AI personnalise ton entraînement en temps réel.
            </div>
            
            <div style="text-align: center;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://nsowlnpntphxwykzbwmc.supabase.co', 'https://pulse-ai.lovable.app') || 'https://pulse-ai.lovable.app'}/dashboard" class="cta-button">
                Commencer mon entraînement 💪
              </a>
            </div>
            
            <h3>Ce qui t'attend :</h3>
            <ul style="line-height: 2;">
              <li>🏋️ Plans d'entraînement 100% personnalisés</li>
              <li>🥗 Programmes nutrition adaptés à tes objectifs</li>
              <li>📊 Suivi de progression en temps réel</li>
              <li>🎯 Ajustements intelligents basés sur tes feedbacks</li>
            </ul>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <strong>💡 Conseil de pro :</strong> Plus tu donnes de feedback après tes séances, plus Pulse-AI affine tes programmes pour maximiser tes résultats !
            </div>
            
            <p>Besoin d'aide ? Notre équipe est là pour toi :</p>
            <ul style="line-height: 2;">
              <li>📧 Email : <a href="mailto:general@pulse-ai.app">general@pulse-ai.app</a></li>
              <li>💬 Support : <a href="https://pulse-ai.lovable.app/support">Centre d'aide</a></li>
            </ul>
          </div>
          
          <div class="footer">
            <p><strong>Pulse-AI</strong> - Ton coach personnel IA<br>
            Sport × Nutrition × Intelligence Artificielle</p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
              Tu reçois cet email car tu viens de créer un compte sur Pulse-AI.
            </p>
          </div>
        </body>
        </html>
      `,
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
