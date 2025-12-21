import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageCircle, HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { z } from "zod";

// Validation schema for support form
const supportFormSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string()
    .trim()
    .email("Email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  subject: z.string()
    .trim()
    .min(1, "Le sujet est requis")
    .max(200, "Le sujet ne peut pas dépasser 200 caractères"),
  message: z.string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères")
});

const Support = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs before sending
      const validationResult = supportFormSchema.safeParse(formData);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "Erreur de validation",
          description: firstError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase.functions.invoke('send-support-email', {
        body: validationResult.data
      });

      if (error) throw error;

      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error('Error sending support email:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Réessayez plus tard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header variant="marketing" />
      <div className="min-h-screen bg-muted/30 py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Centre d'aide</h1>
            <p className="text-xl text-muted-foreground">
              On est là pour t'aider ! Pose ta question ou consulte notre FAQ.
            </p>
          </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* FAQ Quick Links */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">FAQ rapide</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Comment modifier mon programme ?",
                  a: "Va dans ton Dashboard > Mettre à jour mon plan"
                },
                {
                  q: "Je ne peux pas faire un exercice",
                  a: "Clique sur 'Alternative' pendant ta séance pour voir d'autres options"
                },
                {
                  q: "Comment annuler mon abonnement ?",
                  a: "Dashboard > Paramètres > Abonnement > Résilier"
                },
                {
                  q: "Les plans sont-ils vraiment personnalisés ?",
                  a: "Oui ! Chaque plan est généré selon tes infos (âge, objectif, matériel, etc.)"
                }
              ].map((faq, i) => (
                <div key={i} className="pb-4 border-b last:border-0">
                  <div className="font-semibold mb-1">{faq.q}</div>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Contact Info */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold">Nous contacter</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <div className="font-semibold mb-1">Email</div>
                  <a
                    href="mailto:general@pulse-ai.app"
                    className="text-primary hover:underline"
                  >
                    general@pulse-ai.app
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Réponse sous 48h (jours ouvrés)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <div className="font-semibold mb-1">Discord</div>
                <a 
                  href="https://discord.gg/aqcgwuwy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Rejoindre la communauté
                </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Entraide entre membres + équipe active
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Heures d'ouverture :</strong>
                  <br />
                  Lun-Ven : 9h-18h (heure de Paris)
                  <br />
                  Sam-Dim : Support limité
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Envoyer un message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom / Prénom</Label>
                <Input
                  id="name"
                  placeholder="Alex Martin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ton@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                placeholder="ex: Problème technique, question sur mon plan..."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Décris ton problème ou ta question en détail..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="mt-2 min-h-[150px]"
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              variant="default"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Envoi..." : "Envoyer le message"}
            </Button>
          </form>
        </Card>

        {/* Additional Resources */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold mb-4">Ressources utiles</h3>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
            <Link to="/legal">
              <Button variant="outline">Mentions légales</Button>
            </Link>
            <Link to="/hub">
              <Button variant="outline">Hub</Button>
            </Link>
            <Link to="/support">
              <Button variant="outline">Centre d'aide</Button>
            </Link>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Support;
