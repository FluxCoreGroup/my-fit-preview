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
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import coachAlexAvatar from "@/assets/coach-alex-avatar.png";
import coachJulieAvatar from "@/assets/coach-julie-avatar.png";

const CoachsIA = () => {
  const { user } = useAuth();
  const { t } = useTranslation("coach");

  const alexConversations = t("coachsPage.alexConversations", { returnObjects: true }) as { user: string; assistant: string }[];
  const julieConversations = t("coachsPage.julieConversations", { returnObjects: true }) as { user: string; assistant: string }[];

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="onboarding" />
      <BackButton to="/" label={t("common:back")} />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            {t("coachsPage.badge")}
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t("coachsPage.title")} <span className="text-primary">{t("coachsPage.titleHighlight")}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("coachsPage.subtitle")}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t("coachsPage.available24")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t("coachsPage.knowProfile")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t("coachsPage.instantResponses")}</span>
            </div>
          </div>
          
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <Avatar className="w-24 h-24 border-4 border-primary/30 shadow-lg mb-3">
                <AvatarImage src={coachAlexAvatar} alt="Alex" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">A</AvatarFallback>
              </Avatar>
              <p className="font-bold">Alex</p>
              <p className="text-sm text-muted-foreground">{t("coachsPage.coachSport")}</p>
            </div>
            <div className="text-center">
              <Avatar className="w-24 h-24 border-4 border-secondary/30 shadow-lg mb-3">
                <AvatarImage src={coachJulieAvatar} alt="Julie" />
                <AvatarFallback className="bg-secondary/10 text-secondary text-2xl">J</AvatarFallback>
              </Avatar>
              <p className="font-bold">Julie</p>
              <p className="text-sm text-muted-foreground">{t("coachsPage.nutritionist")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Coach Alex Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20 border-4 border-primary/30 shadow-xl">
                  <AvatarImage src={coachAlexAvatar} alt="Alex" />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl">A</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-3xl font-bold">Alex</h2>
                  <p className="text-lg text-primary font-medium">{t("coachsPage.coachSport")}</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-8">{t("coachsPage.alexDesc")}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{t("coachsPage.adaptsSessionsTitle")}</h4>
                    <p className="text-sm text-muted-foreground">{t("coachsPage.adaptsSessionsDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{t("coachsPage.alternativesTitle")}</h4>
                    <p className="text-sm text-muted-foreground">{t("coachsPage.alternativesDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{t("coachsPage.answersQuestionsTitle")}</h4>
                    <p className="text-sm text-muted-foreground">{t("coachsPage.answersQuestionsDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="p-6 bg-muted/30 border-primary/20">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {t("coachsPage.conversationExamples")}
              </h3>
              <div className="space-y-6">
                {Array.isArray(alexConversations) && alexConversations.map((conv, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                        <p className="text-sm">{conv.user}</p>
                      </div>
                    </div>
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
            <Card className="p-6 bg-card border-secondary/20 order-2 lg:order-1">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-secondary" />
                {t("coachsPage.conversationExamples")}
              </h3>
              <div className="space-y-6">
                {Array.isArray(julieConversations) && julieConversations.map((conv, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                        <p className="text-sm">{conv.user}</p>
                      </div>
                    </div>
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
            
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20 border-4 border-secondary/30 shadow-xl">
                  <AvatarImage src={coachJulieAvatar} alt="Julie" />
                  <AvatarFallback className="bg-secondary/10 text-secondary text-3xl">J</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-3xl font-bold">Julie</h2>
                  <p className="text-lg text-secondary font-medium">{t("coachsPage.nutritionist")}</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-8">{t("coachsPage.julieDesc")}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Salad className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{t("coachsPage.generatesRecipesTitle")}</h4>
                    <p className="text-sm text-muted-foreground">{t("coachsPage.generatesRecipesDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{t("coachsPage.adaptsPlanTitle")}</h4>
                    <p className="text-sm text-muted-foreground">{t("coachsPage.adaptsPlanDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{t("coachsPage.shoppingListTitle")}</h4>
                    <p className="text-sm text-muted-foreground">{t("coachsPage.shoppingListDesc")}</p>
                  </div>
                </div>
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
            
            <h2 className="text-3xl font-bold mb-4">{t("coachsPage.ctaTitle")}</h2>
            <p className="text-lg text-muted-foreground mb-8">{t("coachsPage.ctaDesc")}</p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/coach/alex">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Dumbbell className="w-5 h-5 mr-2" />
                    {t("coachsPage.talkToAlex")}
                  </Button>
                </Link>
                <Link to="/coach/julie">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    <Salad className="w-5 h-5 mr-2" />
                    {t("coachsPage.talkToJulie")}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/start">
                <Button size="lg" className="px-8">
                  {t("coachsPage.startTrial")}
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
            <p>{t("coachsPage.footer")}</p>
            <div className="flex gap-6">
              <Link to="/tarif" className="hover:text-foreground transition-colors">{t("coachsPage.pricing")}</Link>
              <Link to="/legal" className="hover:text-foreground transition-colors">{t("coachsPage.legal")}</Link>
              <Link to="/" className="hover:text-foreground transition-colors">{t("coachsPage.home")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoachsIA;
