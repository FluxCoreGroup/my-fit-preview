import { useState, useEffect } from "react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Apple } from "lucide-react";
import { ChatInterface } from "@/components/coach/ChatInterface";
import { ConversationList } from "@/components/coach/ConversationList";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatSkeleton } from "@/components/LoadingSkeleton";
import { useConversations } from "@/hooks/useConversations";
import { useAutoDeleteEmptyConversations } from "@/hooks/useAutoDeleteEmptyConversations";
import { useIsMobile } from "@/hooks/use-mobile";

const CoachJulie = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isConversationListOpen, setIsConversationListOpen] = useState(false);
  const { conversations, createConversation } = useConversations();

  // Auto-delete empty conversations when switching
  useAutoDeleteEmptyConversations(activeConversationId);

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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-semibold">
                  J
                </div>
                <h1 className="text-lg font-semibold">Julie - Nutritionniste</h1>
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
          )}

          {/* Chat Interface */}
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
    </div>
  );
};

export default CoachJulie;
