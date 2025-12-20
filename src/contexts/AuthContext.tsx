import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, skipEmailConfirm?: boolean) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, 'User:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Initialize auth state (une seule fois au démarrage)
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    })();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, skipEmailConfirm = false) => {
    try {
      const redirectUrl = `${window.location.origin}/auth-callback`;
      
      console.log("📝 SignUp : Création compte", skipEmailConfirm ? "(skip email confirm)" : `avec redirect vers ${redirectUrl}`);
      
      const options: any = {
        data: {
          name,
        },
      };

      // Only add emailRedirectTo if we need email confirmation
      if (!skipEmailConfirm) {
        options.emailRedirectTo = redirectUrl;
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });

      if (error) {
        console.error("❌ Erreur signup:", error);
        toast({
          title: "Erreur d'inscription",
          description: error.message === 'User already registered' 
            ? 'Un compte existe déjà avec cet email.'
            : error.message,
          variant: 'destructive',
        });
      } else {
        console.log("✅ Compte créé", skipEmailConfirm ? "(accès direct)" : `, email envoyé à ${email}`);
      }

      return { error };
    } catch (fetchError) {
      console.error("❌ Erreur réseau signup:", fetchError);
      toast({
        title: "Erreur réseau",
        description: "Impossible de se connecter au serveur. Vérifie ta connexion internet.",
        variant: 'destructive',
      });
      return { error: fetchError };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : error.message,
        variant: 'destructive',
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "À bientôt !",
      description: "Tu as été déconnecté.",
    });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: "Email envoyé !",
        description: "Vérifie ta boîte mail pour réinitialiser ton mot de passe.",
      });
    }

    return { error };
  };

  const resendConfirmationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: "Email renvoyé !",
        description: "Vérifie ta boîte mail.",
      });
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword, resendConfirmationEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
