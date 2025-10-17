import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionGuardProps {
  children: ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Vérifier le nombre de feedbacks
        const { count: feedbackCount } = await supabase
          .from('feedback')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (feedbackCount === 0) {
          // Aucune séance terminée → autoriser l'accès (première séance gratuite)
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Vérifier si abonnement actif
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscription) {
          setHasAccess(true);
        } else {
          navigate('/paywall');
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-hero rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de ton abonnement...</p>
        </div>
      </div>
    );
  }

  return hasAccess ? <>{children}</> : null;
};
