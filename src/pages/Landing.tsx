import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dumbbell, Target, Zap, Clock, Check, Star, Users, TrendingUp, Sparkles,
  ShieldCheck, ArrowRight, X, Smartphone, Apple, Heart, MessageSquare, Salad, Bot, HelpCircle,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { SocialProofStats, HeroSocialProof } from "@/components/landing/SocialProofStats";
import { useTranslation } from "react-i18next";
import heroPhone from "@/assets/hero-phone.png";
import questionnairePreview from "@/assets/questionnaire-preview.png";
import programCreationPreview from "@/assets/program-creation-preview.png";
import sessionPreview from "@/assets/session-preview.png";
import coachAlexAvatar from "@/assets/coach-alex-avatar.png";
import coachJulieAvatar from "@/assets/coach-julie-avatar.png";
import davidAvatar from "@/assets/david-avatar.jpeg";
import sophieAvatar from "@/assets/sophie-avatar.png";
import thomasAvatar from "@/assets/thomas-avatar.png";

const Landing = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation("landing");

  if (!loading && user) {
    return <Navigate to="/hub" replace />;
  }

  const testimonials = [
    { name: "David L.", role: t("testimonials.david.role"), avatar: davidAvatar, stars: 4, quote: t("testimonials.david.quote") },
    { name: "Sophie P.", role: t("testimonials.sophie.role"), avatar: sophieAvatar, quote: t("testimonials.sophie.quote") },
    { name: "Thomas K.", role: t("testimonials.thomas.role"), avatar: thomasAvatar, quote: t("testimonials.thomas.quote") },
  ];

  const faqItems = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
    { q: t("faq.q8"), a: t("faq.a8") },
  ];

  const features = [
    t("features.feature1"), t("features.feature2"), t("features.feature3"), t("features.feature4"),
    t("features.feature5"), t("features.feature6"), t("features.feature7"), t("features.feature8"),
  ];

  const comparisonLabels = [
    t("comparison.aiPersonalization"), t("comparison.autoAdjustments"), t("comparison.availability247"),
    t("comparison.nutritionSport"), t("comparison.aiCoach247"), t("comparison.support7d"),
  ];

  const pulseHas = [true, true, true, true, true, true];
  const coachHas = [true, true, false, true, false, true];
  const appsHas = [false, false, true, false, false, false];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero rounded-b-[2.5rem] min-h-screen flex flex-col items-center justify-between px-6 pt-28 md:pt-32 pb-8 md:pb-12 relative overflow-hidden">
          <div className="text-center text-primary-foreground space-y-6 animate-in z-10 max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              {t("hero.title1")}<br />{t("hero.title2")}
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed px-4" dangerouslySetInnerHTML={{ __html: t("hero.subtitle") }} />
            <HeroSocialProof />
          </div>

          <div className="flex justify-center z-10 my-4 flex-shrink">
            <img src={heroPhone} alt={t("hero.heroAlt")} className="w-[clamp(130px,30vw,240px)] max-h-[35vh] object-contain drop-shadow-2xl pointer-events-none select-none" />
          </div>

          <div className="pb-4 md:pb-6 z-10 flex-shrink-0">
            {user ? (
              <Link to="/hub">
                <Button size="lg" className="text-base md:text-lg px-12 py-6 h-auto rounded-full shadow-glow hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-primary-foreground/90 hover:bg-primary-foreground text-primary font-semibold">
                  {t("nav.goToHub", { ns: "common" })}
                </Button>
              </Link>
            ) : (
              <Link to="/start" className="w-full xs:w-auto">
                <Button size="lg" className="w-full xs:w-auto text-sm xs:text-base md:text-lg px-6 xs:px-12 py-6 h-auto rounded-full shadow-glow hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-primary-foreground/90 hover:bg-primary-foreground text-primary font-semibold">
                  {t("nav.takeQuiz", { ns: "common" })}
                  <span className="ml-2 text-xs xs:text-sm opacity-70 hidden xs:inline">{t("hero.quizTime")}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 border-y bg-muted/20">
        <div className="max-w-6xl mx-auto px-4">
          <SocialProofStats />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tm, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar><AvatarImage src={tm.avatar} /><AvatarFallback>{tm.name[0]}</AvatarFallback></Avatar>
                  <div>
                    <div className="font-bold text-sm">{tm.name}</div>
                    <div className="text-xs text-muted-foreground">{tm.role}</div>
                  </div>
                </div>
                <p className="text-sm italic text-muted-foreground">"{tm.quote}"</p>
                <div className="flex gap-1 mt-3">
                  {[...Array(tm.stars || 5)].map((_, j) => (<Star key={j} className="w-3 h-3 fill-primary text-primary" />))}
                </div>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">{t("socialProof.disclaimer")}</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4" id="comment">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="mb-4">{t("howItWorks.title")}</h2>
          <p className="text-xl text-muted-foreground">{t("howItWorks.subtitle")}</p>
        </div>
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 space-y-4">
              <Badge variant="default" className="mb-2">{t("howItWorks.step1Badge")}</Badge>
              <h3 className="text-3xl font-bold">{t("howItWorks.step1Title")}</h3>
              <p className="text-muted-foreground text-lg">{t("howItWorks.step1Desc")}</p>
              <ul className="space-y-3 pt-2">
                {[t("howItWorks.step1Check1"), t("howItWorks.step1Check2"), t("howItWorks.step1Check3")].map((txt, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Check className="w-4 h-4 text-primary" /></div>
                    <span>{txt}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="p-6 order-1 md:order-2 bg-muted/30">
              <div className="aspect-[4/3] rounded-lg overflow-hidden"><img src={questionnairePreview} alt={t("howItWorks.step1ImgAlt")} className="w-full h-full object-cover" /></div>
              <p className="text-center text-sm text-muted-foreground mt-4">{t("howItWorks.step1Caption")}</p>
            </Card>
          </div>
          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="p-6 bg-muted/30">
              <div className="aspect-[4/3] rounded-lg overflow-hidden"><img src={programCreationPreview} alt={t("howItWorks.step2ImgAlt")} className="w-full h-full object-cover" /></div>
              <p className="text-center text-sm text-muted-foreground mt-4">{t("howItWorks.step2Caption")}</p>
            </Card>
            <div className="space-y-4">
              <Badge variant="default" className="mb-2">{t("howItWorks.step2Badge")}</Badge>
              <h3 className="text-3xl font-bold">{t("howItWorks.step2Title")}</h3>
              <p className="text-muted-foreground text-lg">{t("howItWorks.step2Desc")}</p>
              <ul className="space-y-3 pt-2">
                {[t("howItWorks.step2Check1"), t("howItWorks.step2Check2"), t("howItWorks.step2Check3")].map((txt, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Check className="w-4 h-4 text-primary" /></div>
                    <span>{txt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 space-y-4">
              <Badge variant="default" className="mb-2">{t("howItWorks.step3Badge")}</Badge>
              <h3 className="text-3xl font-bold">{t("howItWorks.step3Title")}</h3>
              <p className="text-muted-foreground text-lg">{t("howItWorks.step3Desc")}</p>
              <ul className="space-y-3 pt-2">
                {[t("howItWorks.step3Check1"), t("howItWorks.step3Check2"), t("howItWorks.step3Check3")].map((txt, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Check className="w-4 h-4 text-primary" /></div>
                    <span>{txt}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="p-6 order-1 md:order-2 bg-muted/30">
              <div className="aspect-[4/3] rounded-lg overflow-hidden"><img src={sessionPreview} alt={t("howItWorks.step3ImgAlt")} className="w-full h-full object-cover" /></div>
              <p className="text-center text-sm text-muted-foreground mt-4">{t("howItWorks.step3Caption")}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-muted/30" id="pourquoi">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-12">{t("benefits.title")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"><Zap className="w-6 h-6 text-primary" /></div>
              <h3 className="text-xl font-bold mb-2">{t("benefits.personalized")}</h3>
              <p className="text-muted-foreground">{t("benefits.personalizedDesc")}</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4"><Clock className="w-6 h-6 text-secondary" /></div>
              <h3 className="text-xl font-bold mb-2">{t("benefits.fast")}</h3>
              <p className="text-muted-foreground">{t("benefits.fastDesc")}</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4"><TrendingUp className="w-6 h-6 text-accent" /></div>
              <h3 className="text-xl font-bold mb-2">{t("benefits.tracking")}</h3>
              <p className="text-muted-foreground">{t("benefits.trackingDesc")}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6">{t("features.title")}</h2>
              <ul className="space-y-4">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" /><span>{feature}</span></li>
                ))}
              </ul>
            </div>
            <Card className="p-8 bg-card">
              <Dumbbell className="w-16 h-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">{t("features.homeOrGym")}</h3>
              <p className="text-muted-foreground mb-6">{t("features.homeOrGymDesc")}</p>
              <Link to="/start"><Button variant="default" size="lg" className="w-full">{t("nav.tryNow", { ns: "common" })}</Button></Link>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Coaches */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden" id="coachs-ia">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2"><Bot className="w-4 h-4 mr-2" />{t("coaches.badge")}</Badge>
            <h2 className="mb-4">{t("coaches.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("coaches.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Alex */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/20 bg-gradient-to-br from-card to-primary/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <img src={coachAlexAvatar} alt="Alex" className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/20" />
                  <div><h3 className="text-2xl font-bold">Alex</h3><p className="text-muted-foreground">{t("coaches.alexRole")}</p></div>
                </div>
                <ul className="space-y-3 mb-6">
                  {[t("coaches.alexCheck1"), t("coaches.alexCheck2"), t("coaches.alexCheck3")].map((txt, i) => (
                    <li key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" /><span>{txt}</span></li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {[t("coaches.alexBadge1"), t("coaches.alexBadge2"), t("coaches.alexBadge3")].map((txt, i) => (
                    <Badge key={i} variant="secondary" className="text-xs"><MessageSquare className="w-3 h-3 mr-1" />{txt}</Badge>
                  ))}
                </div>
              </div>
            </Card>
            {/* Julie */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-secondary/20 bg-gradient-to-br from-card to-secondary/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <img src={coachJulieAvatar} alt="Julie" className="w-16 h-16 rounded-full object-cover ring-4 ring-secondary/20" />
                  <div><h3 className="text-2xl font-bold">Julie</h3><p className="text-muted-foreground">{t("coaches.julieRole")}</p></div>
                </div>
                <ul className="space-y-3 mb-6">
                  {[t("coaches.julieCheck1"), t("coaches.julieCheck2"), t("coaches.julieCheck3")].map((txt, i) => (
                    <li key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" /><span>{txt}</span></li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {[t("coaches.julieBadge1"), t("coaches.julieBadge2"), t("coaches.julieBadge3")].map((txt, i) => (
                    <Badge key={i} variant="secondary" className="text-xs"><MessageSquare className="w-3 h-3 mr-1" />{txt}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          <div className="text-center mt-12">
            <Link to="/coachs-ia"><Button size="lg" variant="default">{t("coaches.discoverCTA")}<ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 bg-muted/30" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4">{t("comparison.title")}</h2>
            <p className="text-muted-foreground text-lg">{t("comparison.subtitle")}</p>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-4">
            {/* Pulse.ai */}
            <div className="bg-card rounded-xl border-2 border-primary p-5 relative">
              <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">{t("comparison.recommended")}</div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <h3 className="font-bold text-lg text-primary">Pulse.ai</h3>
                <div className="text-right"><span className="text-xl font-bold text-primary">{t("comparison.pulsePrice")}</span></div>
              </div>
              <div className="space-y-3">
                {comparisonLabels.map((label, i) => (
                  <div key={i} className="flex items-center gap-3"><Check className="w-5 h-5 text-primary shrink-0" /><span className="text-sm">{label}</span></div>
                ))}
              </div>
            </div>
            {/* Coach */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-muted-foreground">{t("comparison.personalCoach")}</h3>
                <div className="text-right"><span className="text-xl font-bold text-muted-foreground">{t("comparison.coachPrice")}</span></div>
              </div>
              <div className="space-y-3">
                {comparisonLabels.map((label, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {coachHas[i] ? <Check className="w-5 h-5 text-muted-foreground shrink-0" /> : <X className="w-5 h-5 text-muted-foreground/50 shrink-0" />}
                    <span className={`text-sm ${!coachHas[i] ? "text-muted-foreground/50" : ""}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Generic */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-muted-foreground">{t("comparison.genericApps")}</h3>
                <div className="text-right"><span className="text-xl font-bold text-muted-foreground">{t("comparison.appsPrice")}</span></div>
              </div>
              <div className="space-y-3">
                {comparisonLabels.map((label, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {appsHas[i] ? <Check className="w-5 h-5 text-muted-foreground shrink-0" /> : <X className="w-5 h-5 text-muted-foreground/50 shrink-0" />}
                    <span className={`text-sm ${!appsHas[i] ? "text-muted-foreground/50" : ""}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-card rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-6 px-3 lg:px-6 font-semibold"></th>
                  <th className="text-center py-6 px-3 lg:px-6 bg-primary/5"><div className="font-bold text-primary text-lg">Pulse.ai</div></th>
                  <th className="text-center py-6 px-3 lg:px-6"><div className="font-semibold text-muted-foreground">{t("comparison.personalCoach")}</div></th>
                  <th className="text-center py-6 px-3 lg:px-6"><div className="font-semibold text-muted-foreground">{t("comparison.genericApps")}</div></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-3 lg:px-6 font-medium">{t("comparison.price")}</td>
                  <td className="text-center py-4 px-3 lg:px-6 bg-primary/5"><span className="font-bold text-primary">{t("comparison.pulsePrice")}</span></td>
                  <td className="text-center py-4 px-3 lg:px-6 text-muted-foreground">{t("comparison.coachPrice")}</td>
                  <td className="text-center py-4 px-3 lg:px-6 text-muted-foreground">{t("comparison.appsPrice")}</td>
                </tr>
                {comparisonLabels.map((label, i) => (
                  <tr key={i} className={i < comparisonLabels.length - 1 ? "border-b" : ""}>
                    <td className="py-4 px-3 lg:px-6 font-medium">{label}</td>
                    <td className="text-center py-4 px-3 lg:px-6 bg-primary/5"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                    <td className="text-center py-4 px-3 lg:px-6">{coachHas[i] ? <Check className="w-5 h-5 text-muted-foreground mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />}</td>
                    <td className="text-center py-4 px-3 lg:px-6">{appsHas[i] ? <Check className="w-5 h-5 text-muted-foreground mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-12 px-4 sm:px-0">
            <Link to="/start" className="w-full sm:w-auto inline-block">
              <Button size="lg" className="w-full sm:w-auto text-sm xs:text-base px-4 xs:px-6">
                {t("comparison.tryFree")}
                <span className="ml-1 xs:ml-2 text-xs xs:text-sm opacity-70 hidden xs:inline">{t("hero.quizTime")}</span>
                <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5 ml-1 xs:ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="mb-4">{t("integrations.title")}</h2>
          <p className="text-muted-foreground text-lg mb-12">{t("integrations.subtitle")}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105"><Apple className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="font-semibold">Apple Health</p></Card>
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105"><Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="font-semibold">Google Fit</p></Card>
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105"><Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="font-semibold">Fitbit</p></Card>
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105"><TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="font-semibold">Strava</p></Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-muted/30" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4"><HelpCircle className="w-3 h-3 mr-1" />FAQ</Badge>
            <h2 className="mb-4">{t("faq.title")}</h2>
            <p className="text-muted-foreground text-lg">{t("faq.subtitle")}</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border rounded-xl px-6 transition-all duration-300 hover:shadow-md data-[state=open]:border-l-4 data-[state=open]:border-l-primary data-[state=open]:shadow-lg">
                <AccordionTrigger className="text-left hover:no-underline py-5 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><HelpCircle className="w-4 h-4 text-primary" /></div>
                    <span className="font-semibold text-base group-hover:text-primary transition-colors">{faq.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 pl-11 text-[15px] leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-12 text-center p-8 bg-card rounded-2xl border shadow-sm">
            <p className="text-muted-foreground mb-4 text-lg">{t("faq.noAnswer")}</p>
            <Link to="/support" className="w-full sm:w-auto inline-block">
              <Button variant="outline" size="lg" className="w-full sm:w-auto group">
                <MessageSquare className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                {t("faq.contactTeam")}
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 text-primary-foreground">
          <h2 className="text-4xl md:text-5xl font-bold">{t("cta.title")}</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: t("cta.subtitle") }} />
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 w-full px-4 sm:px-0">
            <Link to="/start" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm xs:text-base sm:text-lg px-4 xs:px-6 sm:px-8">
                {t("nav.startFree", { ns: "common" })}
                <span className="ml-1 xs:ml-2 text-xs xs:text-sm opacity-70 hidden xs:inline">{t("hero.quizTime")}</span>
                <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5 ml-1 xs:ml-2" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm opacity-80">
            <div className="flex items-center gap-2"><Check className="w-4 h-4" />{t("cta.noCommitment")}</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4" />{t("cta.setup2min")}</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4" />{t("cta.cancel1click")}</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div className="space-y-4 col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 font-bold text-xl"><Dumbbell className="w-6 h-6 text-primary" /><span>Pulse.ai</span></Link>
              <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
              <div className="flex gap-4 pt-2">
                <Badge variant="outline" className="text-xs">{t("footer.securePay")}</Badge>
                <Badge variant="outline" className="text-xs">{t("footer.gdpr")}</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("footer.product")}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#comment" className="hover:text-foreground transition-colors">{t("footer.how")}</a></li>
                <li><a href="#pourquoi" className="hover:text-foreground transition-colors">{t("footer.why")}</a></li>
                <li><a href="#coachs-ia" className="hover:text-foreground transition-colors">{t("footer.aiCoach")}</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">{t("footer.pricing")}</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("footer.resources")}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/support" className="hover:text-foreground transition-colors">{t("nav.support", { ns: "common" })}</Link></li>
                <li><Link to="/feedback" className="hover:text-foreground transition-colors">Feedback</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("footer.legal")}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/legal" className="hover:text-foreground transition-colors">{t("footer.legalNotice")}</Link></li>
                <li><Link to="/legal" className="hover:text-foreground transition-colors">{t("footer.terms")}</Link></li>
                <li><Link to="/legal" className="hover:text-foreground transition-colors">{t("footer.privacy")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>{t("footer.copyright")}</p>
            <div className="flex gap-4"><span>{t("footer.madeWith")}</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
