import { useEffect, useRef, useCallback } from "react";
import { useChatMessages } from "./useChatMessages";
import { supabase } from "@/integrations/supabase/client";

export const useAutoDeleteEmptyConversations = (
  currentConversationId: string | null,
  coachType: 'alex' | 'julie'
) => {
  const previousConversationId = useRef<string | null>(null);
  const { messages } = useChatMessages(previousConversationId.current);
  const deletionInProgress = useRef(false);

  const checkAndDelete = useCallback(async (conversationId: string) => {
    if (deletionInProgress.current) return;
    
    deletionInProgress.current = true;
    
    try {
      // Double-check that conversation is still empty
      const { data: messagesCheck } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .limit(1);

      if (!messagesCheck || messagesCheck.length === 0) {
        console.log("Auto-deleting empty conversation:", conversationId);
        await supabase
          .from("conversations")
          .delete()
          .eq("id", conversationId);
      }
    } catch (error) {
      console.error("Error auto-deleting conversation:", error);
    } finally {
      deletionInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    // When switching conversations, check if previous one was empty
    if (
      previousConversationId.current &&
      previousConversationId.current !== currentConversationId &&
      messages.length === 0
    ) {
      // Add a grace period to avoid race conditions
      const timeoutId = setTimeout(() => {
        checkAndDelete(previousConversationId.current!);
      }, 500);

      previousConversationId.current = currentConversationId;
      return () => clearTimeout(timeoutId);
    }

    previousConversationId.current = currentConversationId;
  }, [currentConversationId, messages.length, checkAndDelete]);
};
