import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Header } from "@/components/Header";
import { BackButton } from "@/components/BackButton";
import { 
  MessageSquare, 
  Check, 
  ArrowRight, 
  Dumbbell, 
  Salad, 
  Sparkles,
  Clock,
  Brain,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import coachAlexAvatar from "@/assets/coach-alex-avatar.png";
import coachJulieAvatar from "@/assets/coach-julie-avatar.png";
// Exemple de conversations pour Alex
const alexConversations = [
  {
    user: "J'ai mal au genou droit, je peux quand même faire ma séance jambes ?",
    assistant: "Je comprends ta situation. Pour ta séance jambes d'aujourd'hui, je te propose des alternatives sans impact sur le genou : remplace les squats par du leg press avec amplitude réduite, évite les fentes et privilégie les extensions ischio sur machine. On garde le même volume mais on protège ton articulation. Tu veux que je te génère une séance adaptée ?"
  },
  {
    user: "J'ai que 30 minutes aujourd'hui au lieu d'1h",
    assistant: "Pas de souci ! Je vais condenser ta séance. On garde les 3 exercices principaux (développé couché, rowing, squat) avec 3 séries au lieu de 4, et on réduit les temps de repos à 90 secondes. Tu auras un entraînement efficace en 28 minutes. C'est parti ?"
  },
  {
    user: "Je stagne sur le développé couché depuis 2 semaines",
    assistant: "Stagnation classique ! Voici 3 solutions : 1) Ajoute une pause de 2 secondes en bas du mouvement la semaine prochaine, 2) Essaie le développé incliné comme exercice principal pendant 2 semaines, 3) Augmente le volume : passe de 3x8 à 4x6 avec le même poids. Quelle option te parle le plus ?"
  }
];

// Exemple de conversations pour Julie
const julieConversations = [
  {
    user: "Je suis végétarien, tu peux adapter mon plan nutrition ?",
    assistant: "Bien sûr ! Ton apport en protéines (140g/jour) sera assuré par : tofu, tempeh, légumineuses, oeufs et protéines végétales en poudre. Je remplace le poulet par du tofu mariné, le boeuf par des lentilles, et j'ajoute des associations céréales + légumineuses pour des protéines complètes. Tu veux que je te génère un exemple de journée type ?"
  },
  {
    user: "Je n'aime pas le brocoli, par quoi je peux le remplacer ?",
    assistant: "Aucun problème ! Voici des alternatives équivalentes en fibres et micronutriments : haricots verts, épinards, courgettes, ou chou-fleur. Pour tes 200g de légumes par repas, tu peux alterner ces options. Je mets à jour ton plan avec tes préférences ?"
  },
  {
    user: "Génère-moi ma liste de courses pour la semaine",
    assistant: "Voici ta liste de courses pour 7 jours :\n\n🥩 Protéines : 1kg poulet, 500g saumon, 12 oeufs, 500g boeuf haché 5%\n🥬 Légumes : 1kg brocoli, 500g épinards, 6 courgettes, 2kg tomates\n🍚 Féculents : 1kg riz basmati, 500g flocons avoine, 1kg patates douces\n🥛 Produits laitiers : 1L lait, 6 yaourts grecs 0%\n🥜 Autres : huile olive, amandes, bananes\n\nTotal estimé : 45-55€. Tu veux que j'envoie cette liste par email ?"
  }
];

const CoachsIA = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <BackButton to="/" label="Retour" />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Intelligence Artificielle
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Tes Coachs IA <span className="text-primary">24/7</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Alex et Julie connaissent ton profil, tes objectifs et tes préférences. 
            Pose-leur n'importe quelle question, ils sont là pour toi.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Disponibles 24h/24</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Connaissent ton profil</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Réponses instantanées</span>
            </div>
          </div>
          
          {/* Avatars des coachs */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <Avatar className="w-24 h-24 border-4 border-primary/30 shadow-lg mb-3">
                <AvatarImage src={coachAlexAvatar} alt="Alex - Coach Sport IA" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">A</AvatarFallback>
              </Avatar>
              <p className="font-bold">Alex</p>
              <p className="text-sm text-muted-foreground">Coach Sport</p>
            </div>
            <div className="text-center">
              <Avatar className="w-24 h-24 border-4 border-secondary/30 shadow-lg mb-3">
                <AvatarImage src={coachJulieAvatar} alt="Julie - Nutritionniste IA" />
                <AvatarFallback className="bg-secondary/10 text-secondary text-2xl">J</AvatarFallback>
              </Avatar>
              <p className="font-bold">Julie</p>
              <p className="text-sm text-muted-foreground">Nutritionniste</p>
            </div>
          </div>
        </div>
      </section>

      {/* Coach Alex Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Infos Alex */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20 border-4 border-primary/30 shadow-xl">
                  <AvatarImage src={coachAlexAvatar} alt="Alex - Coach Sport IA" />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl">A</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-3xl font-bold">Alex</h2>
                  <p className="text-lg text-primary font-medium">Coach Sport IA</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-8">
                Alex est ton coach sportif personnel disponible 24h/24. Il connaît ton niveau, 
                ton matériel et tes objectifs. Il adapte tes séances en temps réel et répond 
                à toutes tes questions sur l'entraînement.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Adapte tes séances</h4>
                    <p className="text-sm text-muted-foreground">Selon ta forme, ton temps disponible et tes contraintes du jour</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Propose des alternatives</h4>
                    <p className="text-sm text-muted-foreground">En cas de douleur, fatigue ou manque de matériel</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Répond à tes questions</h4>
                    <p className="text-sm text-muted-foreground">Technique, progression, récupération, stagnation...</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">"Simplifie ma séance"</Badge>
                <Badge variant="outline" className="text-xs">"Alternative sans douleur"</Badge>
                <Badge variant="outline" className="text-xs">"Séance de 30 min"</Badge>
                <Badge variant="outline" className="text-xs">"Je stagne, que faire ?"</Badge>
              </div>
            </div>
            
            {/* Exemples de conversations Alex */}
            <Card className="p-6 bg-muted/30 border-primary/20">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Exemples de conversations
              </h3>
              <div className="space-y-6">
                {alexConversations.map((conv, i) => (
                  <div key={i} className="space-y-3">
                    {/* Message utilisateur */}
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                        <p className="text-sm">{conv.user}</p>
                      </div>
                    </div>
                    {/* Réponse Alex */}
                    <div className="flex gap-2">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={coachAlexAvatar} alt="Alex" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">A</AvatarFallback>
                      </Avatar>
                      <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
                        <p className="text-sm">{conv.assistant}</p>
                      </div>
                    </div>
                    {i < alexConversations.length - 1 && <div className="border-b border-dashed my-4" />}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Coach Julie Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Exemples de conversations Julie */}
            <Card className="p-6 bg-card border-secondary/20 order-2 lg:order-1">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-secondary" />
                Exemples de conversations
              </h3>
              <div className="space-y-6">
                {julieConversations.map((conv, i) => (
                  <div key={i} className="space-y-3">
                    {/* Message utilisateur */}
                    <div className="flex justify-end">
                      <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                        <p className="text-sm">{conv.user}</p>
                      </div>
                    </div>
                    {/* Réponse Julie */}
                    <div className="flex gap-2">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={coachJulieAvatar} alt="Julie" />
                        <AvatarFallback className="bg-secondary/10 text-secondary text-xs">J</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted border rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
                        <p className="text-sm whitespace-pre-line">{conv.assistant}</p>
                      </div>
                    </div>
                    {i < julieConversations.length - 1 && <div className="border-b border-dashed my-4" />}
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Infos Julie */}
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20 border-4 border-secondary/30 shadow-xl">
                  <AvatarImage src={coachJulieAvatar} alt="Julie - Nutritionniste IA" />
                  <AvatarFallback className="bg-secondary/10 text-secondary text-3xl">J</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-3xl font-bold">Julie</h2>
                  <p className="text-lg text-secondary font-medium">Nutritionniste IA</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-8">
                Julie est ta nutritionniste personnelle. Elle connaît tes objectifs caloriques, 
                tes restrictions alimentaires et tes préférences. Elle t'aide à créer des repas 
                adaptés et te génère ta liste de courses.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Salad className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Génère des recettes</h4>
                    <p className="text-sm text-muted-foreground">Personnalisées selon tes goûts et tes macros</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Adapte ton plan</h4>
                    <p className="text-sm text-muted-foreground">Végétarien, sans gluten, allergies, intolérances...</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Crée ta liste de courses</h4>
                    <p className="text-sm text-muted-foreground">Optimisée pour la semaine avec budget estimé</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">"Journée type végétarienne"</Badge>
                <Badge variant="outline" className="text-xs">"Remplace ce plat"</Badge>
                <Badge variant="outline" className="text-xs">"Liste de courses"</Badge>
                <Badge variant="outline" className="text-xs">"Snack 200 kcal"</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Card className="p-10 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex justify-center gap-4 mb-6">
              <Avatar className="w-16 h-16 border-4 border-primary/30">
                <AvatarImage src={coachAlexAvatar} alt="Alex" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar className="w-16 h-16 border-4 border-secondary/30 -ml-4">
                <AvatarImage src={coachJulieAvatar} alt="Julie" />
                <AvatarFallback>J</AvatarFallback>
              </Avatar>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Prêt à rencontrer tes coachs ?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Alex et Julie t'attendent pour t'accompagner dans ta transformation. 
              Commence ton essai gratuit et pose-leur ta première question.
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/coach/alex">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Dumbbell className="w-5 h-5 mr-2" />
                    Parler à Alex
                  </Button>
                </Link>
                <Link to="/coach/julie">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    <Salad className="w-5 h-5 mr-2" />
                    Parler à Julie
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/start">
                <Button size="lg" className="px-8">
                  Commencer mon essai gratuit
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 Pulse.ai - Tous droits réservés</p>
            <div className="flex gap-6">
              <Link to="/tarif" className="hover:text-foreground transition-colors">Tarifs</Link>
              <Link to="/legal" className="hover:text-foreground transition-colors">Mentions légales</Link>
              <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoachsIA;
