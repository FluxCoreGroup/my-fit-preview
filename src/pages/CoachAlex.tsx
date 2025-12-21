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
import coachAlexAvatar from "@/assets/coach-alex-avatar.png";

const CoachAlex = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isConversationListOpen, setIsConversationListOpen] = useState(false);
  const { conversations, deleteConversation } = useConversations('alex');
  const { messages } = useChatMessages(activeConversationId);

  useAutoDeleteEmptyConversations(activeConversationId, 'alex');

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
    session_duration: goals?.session_duration,
    location: goals?.location,
    equipment: goals?.equipment,
    experience_level: trainingPrefs?.experience_level,
    limitations: trainingPrefs?.limitations,
    priority_zones: trainingPrefs?.priority_zones,
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
            <div className="flex items-center justify-between p-3 border-b bg-card/50 backdrop-blur-sm">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={coachAlexAvatar}
                    alt="Alex"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold">Alex</h1>
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
              name="Alex"
              role="Coach Sportif"
              avatar={coachAlexAvatar}
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
              functionName="chat-alex"
              systemPrompt=""
              shortcuts={[
                "Adapter ma séance",
                "Remplacer un exercice",
                "Conseils récupération",
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
    </div>
  );
};

export default CoachAlex;
