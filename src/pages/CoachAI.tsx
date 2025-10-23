import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Apple } from "lucide-react";
import { ChatInterface } from "@/components/coach/ChatInterface";
import { ConversationList } from "@/components/coach/ConversationList";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatSkeleton } from "@/components/LoadingSkeleton";
import { useConversations } from "@/hooks/useConversations";

const CoachAI = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabFromUrl === 'julie' ? 'julie' : 'alex'
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { conversations, createConversation } = useConversations();

  useEffect(() => {
    if (tabFromUrl === 'julie' || tabFromUrl === 'alex') {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Auto-select first conversation or create one if none exist
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    } else if (conversations.length === 0 && !createConversation.isPending) {
      // Create first conversation automatically
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

  return (
    <div className="min-h-screen bg-background">
      <BackButton to="/hub" label="Retour au Hub" />
      
      <div className="pt-16 flex h-[calc(100vh-4rem)]">
        {/* Conversation List Sidebar */}
        <ConversationList
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="alex" className="flex-1">
                <Dumbbell className="w-4 h-4 mr-2" />
                Alex - Coach Sport
              </TabsTrigger>
              <TabsTrigger value="julie" className="flex-1">
                <Apple className="w-4 h-4 mr-2" />
                Julie - Nutritionniste
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alex" className="flex-1 mt-0">
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
            </TabsContent>

            <TabsContent value="julie" className="flex-1 mt-0">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CoachAI;
