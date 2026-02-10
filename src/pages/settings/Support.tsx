import { useState, useEffect } from "react";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, HelpCircle, MessageCircle, CheckCircle2 } from "lucide-react";

const Support = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  });
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetchUserInfo();
    fetchTickets();
  }, []);

  const fetchUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      
      setUserInfo({
        name: profile?.name || "Utilisateur",
        email: user.email || ""
      });
    }
  };

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!error && data) {
      setTickets(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Erreur",
        description: "Merci de remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    if (formData.message.length < 10) {
      toast({
        title: "Message trop court",
        description: "Le message doit contenir au moins 10 caractères",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Insert ticket in database
      const { error: dbError } = await supabase
        .from('support_tickets')
        .insert({
          subject: formData.subject.trim(),
          message: formData.message.trim()
        } as any);

      if (dbError) throw dbError;

      // Send email notification
      const { data: { session } } = await supabase.auth.getSession();
      const { error: emailError } = await supabase.functions.invoke('send-support-email', {
        body: {
          subject: formData.subject.trim(),
          message: formData.message.trim()
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't throw, ticket is saved
      }

      toast({
        title: "Message envoyé !",
        description: "Notre équipe te répondra dans les plus brefs délais.",
      });

      // Reset form
      setFormData({ subject: "", message: "" });
      fetchTickets();

    } catch (error: any) {
      console.error('Support error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Réessaie dans quelques instants.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    open: "bg-blue-500/10 text-blue-500",
    in_progress: "bg-yellow-500/10 text-yellow-500",
    resolved: "bg-green-500/10 text-green-500",
    closed: "bg-gray-500/10 text-gray-500"
  };

  const statusLabels = {
    open: "Ouvert",
    in_progress: "En cours",
    resolved: "Résolu",
    closed: "Fermé"
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton to="/hub" />
      <div className="pt-20 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Aide & Support</h1>
              <p className="text-sm text-muted-foreground">
                On est là pour t'aider !
              </p>
            </div>
          </div>

          {/* FAQ rapide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Questions fréquentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Comment modifier mon programme ?</p>
                  <p className="text-sm text-muted-foreground">Va dans Réglages → Programme d'entraînement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Comment annuler mon abonnement ?</p>
                  <p className="text-sm text-muted-foreground">Va dans Réglages → Abonnement → Gérer mon abonnement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Problème technique ?</p>
                  <p className="text-sm text-muted-foreground">Utilise le formulaire ci-dessous pour nous contacter</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Envoyer un message
              </CardTitle>
              <CardDescription>
                Décris ton problème ou ta question, on te répond rapidement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nom et email pré-remplis et disabled */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom</Label>
                    <Input
                      id="name"
                      value={userInfo.name}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={userInfo.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                {/* Sujet */}
                <div>
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    placeholder="ex: Problème technique, question sur mon plan..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Décris ton problème ou ta question en détail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    required
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.message.length}/2000 caractères
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le message"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Historique des tickets */}
          {tickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mes demandes récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {ticket.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${statusColors[ticket.status as keyof typeof statusColors]}`}>
                          {statusLabels[ticket.status as keyof typeof statusLabels]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;
