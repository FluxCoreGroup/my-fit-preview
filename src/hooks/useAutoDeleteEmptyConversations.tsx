import { useEffect, useRef } from "react";
import { useChatMessages } from "./useChatMessages";
import { useConversations } from "./useConversations";
import { supabase } from "@/integrations/supabase/client";

export const useAutoDeleteEmptyConversations = (
  currentConversationId: string | null
) => {
  const previousConversationId = useRef<string | null>(null);
  const { deleteConversation } = useConversations();
  const { messages } = useChatMessages(previousConversationId.current);

  useEffect(() => {
    // When switching conversations, check if previous one was empty
    if (
      previousConversationId.current &&
      previousConversationId.current !== currentConversationId &&
      messages.length === 0
    ) {
      // Add a grace period to avoid race conditions
      const timeoutId = setTimeout(async () => {
        // Double-check that conversation is still empty
        const { data: messagesCheck } = await supabase
          .from("chat_messages")
          .select("id")
          .eq("conversation_id", previousConversationId.current)
          .limit(1);

        if (!messagesCheck || messagesCheck.length === 0) {
          console.log(
            "Auto-deleting empty conversation:",
            previousConversationId.current
          );
          deleteConversation.mutate(previousConversationId.current);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }

    previousConversationId.current = currentConversationId;
  }, [currentConversationId, messages.length, deleteConversation]);
};
