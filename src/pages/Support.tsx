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
import { useTranslation } from "react-i18next";
import { z } from "zod";

const Support = () => {
  const { toast } = useToast();
  const { t } = useTranslation("common");
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
      const supportFormSchema = z.object({
        name: z.string().trim().min(1).max(100),
        email: z.string().trim().email().max(255),
        subject: z.string().trim().min(1).max(200),
        message: z.string().trim().min(10).max(2000)
      });

      const validationResult = supportFormSchema.safeParse(formData);
      if (!validationResult.success) {
        toast({ title: t("support.validationError"), description: validationResult.error.errors[0].message, variant: "destructive" });
        setLoading(false);
        return;
      }

      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.functions.invoke('send-support-email', { body: validationResult.data });
      if (error) throw error;

      toast({ title: t("support.sent"), description: t("support.sentDesc") });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error('Error sending support email:', error);
      toast({ title: t("common.error"), description: t("support.sendError"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: t("support.faq.modifyProgram"), a: t("support.faq.modifyProgramAnswer") },
    { q: t("support.faq.cantDoExercise"), a: t("support.faq.cantDoExerciseAnswer") },
    { q: t("support.faq.cancelSubscription"), a: t("support.faq.cancelSubscriptionAnswer") },
    { q: t("support.faq.personalizedPlans"), a: t("support.faq.personalizedPlansAnswer") },
  ];

  return (
    <>
      <Header variant="marketing" />
      <div className="min-h-screen bg-muted/30 py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">{t("support.title")}</h1>
            <p className="text-xl text-muted-foreground">{t("support.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{t("support.faqTitle")}</h2>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="pb-4 border-b last:border-0">
                    <div className="font-semibold mb-1">{faq.q}</div>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold">{t("support.contactTitle")}</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-semibold mb-1">{t("support.email")}</div>
                    <a href="mailto:general@pulse-ai.app" className="text-primary hover:underline">general@pulse-ai.app</a>
                    <p className="text-sm text-muted-foreground mt-1">{t("support.emailResponse")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-semibold mb-1">{t("support.discord")}</div>
                    <a href="https://discord.gg/aqcgwuwy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t("support.joinCommunity")}</a>
                    <p className="text-sm text-muted-foreground mt-1">{t("support.communityHelp")}</p>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t("support.businessHours")}</strong><br />
                    {t("support.weekdays")}<br />
                    {t("support.weekends")}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">{t("support.sendMessage")}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t("support.nameLabel")}</Label>
                  <Input id="name" placeholder="Alex Martin" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-2" required />
                </div>
                <div>
                  <Label htmlFor="email">{t("support.emailLabel")}</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-2" required />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">{t("support.subjectLabel")}</Label>
                <Input id="subject" placeholder={t("support.subjectPlaceholder")} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="mt-2" required />
              </div>
              <div>
                <Label htmlFor="message">{t("support.messageLabel")}</Label>
                <Textarea id="message" placeholder={t("support.messagePlaceholder")} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="mt-2 min-h-[150px]" required />
              </div>
              <Button type="submit" size="lg" variant="default" className="w-full" disabled={loading}>
                {loading ? t("support.sending") : t("support.send")}
              </Button>
            </form>
          </Card>

          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold mb-4">{t("support.resources")}</h3>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
              <Link to="/legal"><Button variant="outline">{t("support.legalNotices")}</Button></Link>
              <Link to="/hub"><Button variant="outline">Hub</Button></Link>
              <Link to="/support"><Button variant="outline">{t("support.helpCenter")}</Button></Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Support;
