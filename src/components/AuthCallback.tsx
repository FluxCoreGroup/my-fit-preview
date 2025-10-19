import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const hash = location.hash;
      
      // Détecter les tokens dans le hash
      if (hash && hash.includes('access_token') && hash.includes('refresh_token')) {
        const params = new URLSearchParams(hash.slice(1));
        const access_token = params.get('access_token') || '';
        const refresh_token = params.get('refresh_token') || '';
        const error_description = params.get('error_description');

        // Gérer les erreurs Supabase
        if (error_description) {
          toast({
            title: "Erreur de confirmation",
            description: error_description.includes('expired') 
              ? "Ce lien a expiré. Demande un nouveau lien de confirmation."
              : "Ce lien n'est plus valide.",
            variant: 'destructive',
            duration: 8000,
          });
          navigate('/email-confirmation');
          return;
        }

        // Établir la session avec les tokens
        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({ 
            access_token, 
            refresh_token 
          });

          if (error) {
            console.error('setSession error:', error);
            toast({
              title: "Erreur de connexion",
              description: "Impossible de confirmer ton email. Réessaie ou contacte le support.",
              variant: 'destructive',
            });
            navigate('/email-confirmation');
            return;
          }

          // Session établie avec succès
          if (data.session) {
            // Nettoyer l'URL pour retirer les tokens
            window.history.replaceState(
              {}, 
              document.title, 
              location.pathname + location.search
            );

            // Rediriger vers la page de confirmation avec timer
            navigate('/email-verified');
          }
        }
      }
    };

    handleCallback();
  }, [location, navigate, toast]);

  return null; // Ce composant ne rend rien
}
