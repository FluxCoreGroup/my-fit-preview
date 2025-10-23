import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  data_sources?: any;
  created_at: string;
}

export const useChatMessages = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  // Fetch messages for a conversation
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["chat_messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!conversationId,
  });

  // Save a message
  const saveMessage = useMutation({
    mutationFn: async (message: {
      conversation_id: string;
      role: "user" | "assistant";
      content: string;
      data_sources?: any;
    }) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat_messages", variables.conversation_id],
      });
      // Update conversation's updated_at
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    messages,
    isLoading,
    saveMessage,
  };
};
