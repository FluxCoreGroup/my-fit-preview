import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Dumbbell, Apple } from "lucide-react";
import { ChatInterface } from "@/components/coach/ChatInterface";
import { ConversationList } from "@/components/coach/ConversationList";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatSkeleton } from "@/components/LoadingSkeleton";
import { useConversations } from "@/hooks/useConversations";
import { useAutoDeleteEmptyConversations } from "@/hooks/useAutoDeleteEmptyConversations";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const CoachAI = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeCoach, setActiveCoach] = useState<'alex' | 'julie'>(
    tabFromUrl === 'julie' ? 'julie' : 'alex'
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isConversationListOpen, setIsConversationListOpen] = useState(false);
  const { conversations, createConversation } = useConversations();

  // Auto-delete empty conversations when switching
  useAutoDeleteEmptyConversations(activeConversationId);

  useEffect(() => {
    if (tabFromUrl === 'julie' || tabFromUrl === 'alex') {
      setActiveCoach(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Auto-select first conversation or create one if none exist
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    } else if (conversations.length === 0 && !createConversation.isPending) {
      createConversation.mutateAsync(undefined).then((conv) => {
        setActiveConversationId(conv.id);
      });
    }
  }, [conversations, activeConversationId, createConversation]);

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: trainingPrefs } = useQuery({
    queryKey: ["trainingPrefs", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("training_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const alexContext = {
    goal_type: goals?.goal_type,
    frequency: goals?.frequency,
    experience_level: trainingPrefs?.experience_level,
    equipment: goals?.equipment,
    session_type: trainingPrefs?.session_type,
    limitations: trainingPrefs?.limitations,
  };

  const julieContext = {
    goal_type: goals?.goal_type,
    tdee: goals?.weight && goals?.height && goals?.age ? "calculé" : "non calculé",
    target_calories: "à calculer",
    protein: goals?.weight ? Math.round(goals.weight * 2) : 0,
    fat: goals?.weight ? Math.round(goals.weight * 1) : 0,
    carbs: 0,
    meals_per_day: goals?.meals_per_day,
    restrictions: goals?.restrictions,
    allergies: goals?.allergies,
  };

  const handleCoachSwitch = (coach: 'alex' | 'julie') => {
    setActiveCoach(coach);
    setSearchParams({ tab: coach });
  };

  const conversationListComponent = (
    <ConversationList
      activeConversationId={activeConversationId}
      onSelectConversation={(id) => {
        setActiveConversationId(id);
        if (isMobile) setIsConversationListOpen(false);
      }}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <BackButton to="/hub" label="Retour au Hub" />
      
      <div className="pt-16 flex flex-col md:flex-row h-[calc(100vh-4rem)]">
        {/* Mobile: Hamburger menu for conversations */}
        {isMobile ? (
          <Sheet open={isConversationListOpen} onOpenChange={setIsConversationListOpen}>
            <div className="flex items-center justify-between p-4 border-b">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <h1 className="text-lg font-semibold">Coach IA</h1>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>
            <SheetContent side="left" className="p-0 w-80">
              {conversationListComponent}
            </SheetContent>
          </Sheet>
        ) : (
          /* Desktop: Fixed sidebar */
          conversationListComponent
        )}

        {/* Coach selector - Mobile: tabs, Desktop: side-by-side */}
        <div className="flex-1 flex flex-col">
          {/* Mobile: Horizontal coach tabs */}
          {isMobile && (
            <div className="flex border-b">
              <button
                onClick={() => handleCoachSwitch('alex')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                  activeCoach === 'alex'
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                )}
              >
                <Dumbbell className="w-4 h-4" />
                Alex
              </button>
              <button
                onClick={() => handleCoachSwitch('julie')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                  activeCoach === 'julie'
                    ? "text-secondary border-b-2 border-secondary"
                    : "text-muted-foreground"
                )}
              >
                <Apple className="w-4 h-4" />
                Julie
              </button>
            </div>
          )}

          {/* Desktop: Side-by-side coaches */}
          {!isMobile && (
            <div className="flex-1 grid grid-cols-2 gap-0 divide-x">
              {/* Alex - Coach Sport */}
              <div className="flex flex-col">
                <div className="p-4 border-b bg-primary/5">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                      A
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">Alex</h2>
                      <p className="text-xs text-muted-foreground">Coach Sport</p>
                    </div>
                  </div>
                </div>
                {goalsLoading ? (
                  <div className="p-4">
                    <ChatSkeleton />
                  </div>
                ) : (
                  <ChatInterface
                    conversationId={activeConversationId}
                    functionName="chat-alex"
                    systemPrompt=""
                    shortcuts={[
                      "Simplifier ma séance d'aujourd'hui",
                      "Alternative sans douleur",
                      "Adapter à 30 min",
                    ]}
                    context={alexContext}
                    avatarColor="bg-primary"
                    name="Alex"
                  />
                )}
              </div>

              {/* Julie - Nutritionniste */}
              <div className="flex flex-col">
                <div className="p-4 border-b bg-secondary/5">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-semibold">
                      J
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">Julie</h2>
                      <p className="text-xs text-muted-foreground">Nutritionniste</p>
                    </div>
                  </div>
                </div>
                {goalsLoading ? (
                  <div className="p-4">
                    <ChatSkeleton />
                  </div>
                ) : (
                  <ChatInterface
                    conversationId={activeConversationId}
                    functionName="chat-julie"
                    systemPrompt=""
                    shortcuts={[
                      "Générer une journée-type",
                      "Remplacer ce plat",
                      "Liste de courses rapide",
                    ]}
                    context={julieContext}
                    avatarColor="bg-secondary"
                    name="Julie"
                  />
                )}
              </div>
            </div>
          )}

          {/* Mobile: Single active coach */}
          {isMobile && (
            <div className="flex-1">
              {goalsLoading ? (
                <div className="p-4">
                  <ChatSkeleton />
                </div>
              ) : activeCoach === 'alex' ? (
                <ChatInterface
                  conversationId={activeConversationId}
                  functionName="chat-alex"
                  systemPrompt=""
                  shortcuts={[
                    "Simplifier ma séance d'aujourd'hui",
                    "Alternative sans douleur",
                    "Adapter à 30 min",
                  ]}
                  context={alexContext}
                  avatarColor="bg-primary"
                  name="Alex"
                />
              ) : (
                <ChatInterface
                  conversationId={activeConversationId}
                  functionName="chat-julie"
                  systemPrompt=""
                  shortcuts={[
                    "Générer une journée-type",
                    "Remplacer ce plat",
                    "Liste de courses rapide",
                  ]}
                  context={julieContext}
                  avatarColor="bg-secondary"
                  name="Julie"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachAI;
