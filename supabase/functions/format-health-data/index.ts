import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema - accepts both strings and arrays
const healthDataSchema = z.object({
  allergies: z.union([z.string(), z.array(z.string())]).optional(),
  restrictions: z.union([z.string(), z.array(z.string())]).optional(),
  healthConditions: z.union([z.string(), z.array(z.string())]).optional(),
});

// Sanitize inputs to prevent prompt injection - handles both strings and arrays
const sanitize = (input: string | string[] | undefined): string => {
  if (!input) return 'Aucune';
  if (Array.isArray(input)) {
    if (input.length === 0) return 'Aucune';
    return input.map(s => s.replace(/[<>{}]/g, '')).join(', ').substring(0, 500);
  }
  return input.replace(/[<>{}]/g, '').substring(0, 500);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check subscription status (allow first use for free)
    const { count: feedbackCount } = await supabase
      .from('feedback')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (feedbackCount && feedbackCount > 0) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!subscription) {
        console.warn(`Subscription required for user ${user.id} - format-health-data`);
        return new Response(
          JSON.stringify({ error: 'Abonnement requis pour utiliser cette fonctionnalité' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    console.log(`Subscription check passed for user ${user.id}`);

    // Validate input
    const rawBody = await req.json();
    const parseResult = healthDataSchema.safeParse(rawBody);
    if (!parseResult.success) {
      console.error('❌ Validation error:', parseResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Données invalides',
          details: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { allergies, restrictions, healthConditions } = parseResult.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Tu es un assistant nutrition/santé expert. Reformate les informations suivantes de manière claire, professionnelle et DÉTAILLÉE.

DONNÉES À REFORMATER :
- Allergies : "${sanitize(allergies)}"
- Restrictions : "${sanitize(restrictions)}"
- Conditions de santé : "${sanitize(healthConditions)}"

INSTRUCTIONS DE FORMATAGE :

Pour les ALLERGIES :
- Identifie le type (alimentaire, médicamenteuse, respiratoire, de contact)
- Liste précisément les aliments/ingrédients à éviter absolument
- Mentionne les formes cachées possibles (ex: lactose dans certains médicaments)
- Suggère 2-3 alternatives nutritionnelles équivalentes

Pour les RESTRICTIONS :
- Clarifie le régime exact (végétarien, végan, halal, kasher, sans gluten, sans lactose, etc.)
- Liste les catégories d'aliments concernées avec des exemples concrets
- Indique les carences nutritionnelles potentielles à surveiller
- Propose des sources alternatives de nutriments essentiels

Pour les CONDITIONS DE SANTÉ :
- Reformule de manière précise et compréhensible
- Décris les implications nutritionnelles spécifiques
- Liste les nutriments à privilégier et ceux à limiter
- Mentionne les précautions alimentaires importantes

IMPORTANT : Chaque réponse doit faire 2-4 phrases complètes et informatives.

Réponds UNIQUEMENT en JSON avec cette structure exacte :
{
  "allergies": "Description complète et détaillée des allergies avec précautions et alternatives",
  "restrictions": "Description complète des restrictions avec impacts nutritionnels et alternatives",
  "healthConditions": "Description complète des conditions avec recommandations nutritionnelles adaptées"
}

Si un champ est vide ou "Aucune", réponds avec une phrase rassurante :
- allergies: "Aucune allergie alimentaire déclarée. Tu peux profiter d'une alimentation variée sans restriction particulière liée aux allergies."
- restrictions: "Aucune restriction alimentaire spécifique. Ton plan nutritionnel inclura tous les groupes d'aliments pour une alimentation équilibrée et diversifiée."
- healthConditions: "Aucune condition de santé particulière signalée. Ton programme sera basé sur les recommandations nutritionnelles standard pour une personne en bonne santé."`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Formate ces données de santé de manière professionnelle et détaillée.' }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Nettoyer le contenu pour enlever les balises markdown
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const formatted = JSON.parse(cleanContent);

    return new Response(
      JSON.stringify(formatted),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in format-health-data:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur de formatage',
        allergies: "Aucune allergie alimentaire déclarée. Tu peux profiter d'une alimentation variée sans restriction particulière.",
        restrictions: "Aucune restriction alimentaire spécifique. Ton plan inclura tous les groupes d'aliments.",
        healthConditions: "Aucune condition particulière signalée. Programme basé sur les recommandations standard."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
