import { useState, useEffect } from "react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ChatInterface } from "@/components/coach/ChatInterface";
import { ConversationList } from "@/components/coach/ConversationList";
import CoachHeader from "@/components/coach/CoachHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatSkeleton } from "@/components/LoadingSkeleton";
import { useConversations } from "@/hooks/useConversations";
import { useAutoDeleteEmptyConversations } from "@/hooks/useAutoDeleteEmptyConversations";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useIsMobile } from "@/hooks/use-mobile";
import coachJulieAvatar from "@/assets/coach-julie-avatar.png";

const CoachJulie = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isConversationListOpen, setIsConversationListOpen] = useState(false);
  const { conversations, deleteConversation } = useConversations('julie');
  const { messages } = useChatMessages(activeConversationId);

  useAutoDeleteEmptyConversations(activeConversationId, 'julie');

  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  useEffect(() => {
    return () => {
      if (activeConversationId && messages.length === 0) {
        deleteConversation.mutate(activeConversationId);
      }
    };
  }, []);

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

  const conversationListComponent = (
    <ConversationList
      activeConversationId={activeConversationId}
      onSelectConversation={(id) => {
        setActiveConversationId(id);
        if (isMobile) setIsConversationListOpen(false);
      }}
      coachType="julie"
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <BackButton to="/hub" label="Retour au Hub" />
      
      <div className="pt-16 flex flex-col md:flex-row h-[calc(100vh-4rem)]">
        {/* Mobile: Hamburger menu for conversations */}
        {isMobile ? (
          <Sheet open={isConversationListOpen} onOpenChange={setIsConversationListOpen}>
            <div className="flex items-center justify-between p-3 border-b bg-card/50 backdrop-blur-sm">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={coachJulieAvatar}
                    alt="Julie"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold">Julie</h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    En ligne
                  </p>
                </div>
              </div>
              <div className="w-10" />
            </div>
            <SheetContent side="left" className="p-0 w-80">
              {conversationListComponent}
            </SheetContent>
          </Sheet>
        ) : (
          /* Desktop: Fixed sidebar */
          conversationListComponent
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Desktop Header */}
          {!isMobile && (
            <CoachHeader
              name="Julie"
              role="Nutritionniste"
              avatar={coachJulieAvatar}
              isOnline={true}
            />
          )}

          {/* Chat Interface */}
          {goalsLoading ? (
            <div className="p-4">
              <ChatSkeleton />
            </div>
          ) : (
            <ChatInterface
              conversationId={activeConversationId}
              conversation={conversations.find(c => c.id === activeConversationId)}
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
              coachType="julie"
              onConversationCreated={setActiveConversationId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachJulie;
