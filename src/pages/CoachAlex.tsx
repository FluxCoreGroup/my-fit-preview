import { useState, useEffect } from "react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Dumbbell } from "lucide-react";
import { ChatInterface } from "@/components/coach/ChatInterface";
import { ConversationList } from "@/components/coach/ConversationList";
import { ModuleTour } from "@/components/onboarding/ModuleTour";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatSkeleton } from "@/components/LoadingSkeleton";
import { useConversations } from "@/hooks/useConversations";
import { useAutoDeleteEmptyConversations } from "@/hooks/useAutoDeleteEmptyConversations";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useIsMobile } from "@/hooks/use-mobile";

const CoachAlex = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isConversationListOpen, setIsConversationListOpen] = useState(false);
  const { conversations, deleteConversation } = useConversations('alex');
  const { messages } = useChatMessages(activeConversationId);

  // Auto-delete empty conversations when switching
  useAutoDeleteEmptyConversations(activeConversationId, 'alex');

  // Auto-select first conversation if exists (don't create automatically)
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Cleanup: delete empty conversation on unmount
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

  const conversationListComponent = (
    <ConversationList
      activeConversationId={activeConversationId}
      onSelectConversation={(id) => {
        setActiveConversationId(id);
        if (isMobile) setIsConversationListOpen(false);
      }}
      coachType="alex"
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
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <h1 className="text-lg font-semibold">Alex - Coach Sport</h1>
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
          )}

          {/* Chat Interface */}
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
              coachType="alex"
              onConversationCreated={setActiveConversationId}
            />
          )}
        </div>
      </div>

      {/* Module Tour */}
      <ModuleTour moduleKey="alex" />
    </div>
  );
};

export default CoachAlex;
