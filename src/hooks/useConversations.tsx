import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  coach_type: 'alex' | 'julie';
  is_pinned: boolean;
  archived: boolean;
  data_consent: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useConversations = (coachType: 'alex' | 'julie') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all conversations (non-archived)
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations", coachType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("archived", false)
        .eq("coach_type", coachType)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    },
  });

  // Create new conversation
  const createConversation = useMutation({
    mutationFn: async (title?: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: userData.user.id,
          title: title || "Nouvelle conversation",
          coach_type: coachType,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error creating conversation:", error);
        throw error;
      }
      return data as Conversation;
    },
    retry: 2, // Retry 2 times in case of network issues
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", coachType] });
    },
    onError: (error) => {
      console.error("Failed to create conversation after retries:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive",
      });
    },
  });

  // Update conversation
  const updateConversation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Conversation, "id" | "user_id" | "created_at">>;
    }) => {
      const { data, error } = await supabase
        .from("conversations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", coachType] });
    },
  });

  // Delete conversation
  const deleteConversation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", coachType] });
      toast({
        title: "Supprimée",
        description: "Conversation supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la conversation",
        variant: "destructive",
      });
    },
  });

  // Archive conversation
  const archiveConversation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("conversations")
        .update({ archived: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", coachType] });
      toast({
        title: "Archivée",
        description: "Conversation archivée avec succès",
      });
    },
  });

  // Toggle pin
  const togglePin = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from("conversations")
        .update({ is_pinned: !isPinned })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", coachType] });
    },
  });

  // Update data consent
  const updateDataConsent = useMutation({
    mutationFn: async ({ id, consent }: { id: string; consent: boolean }) => {
      const { error } = await supabase
        .from("conversations")
        .update({ data_consent: consent })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", coachType] });
    },
  });

  // Separate pinned and regular conversations
  const pinnedConversations = conversations.filter((c) => c.is_pinned);
  const regularConversations = conversations.filter((c) => !c.is_pinned);

  return {
    conversations,
    pinnedConversations,
    regularConversations,
    isLoading,
    createConversation,
    updateConversation,
    deleteConversation,
    archiveConversation,
    togglePin,
    updateDataConsent,
  };
};
