import { useEffect, useRef } from "react";
import { useChatMessages } from "./useChatMessages";
import { useConversations } from "./useConversations";

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
      console.log(
        "Auto-deleting empty conversation:",
        previousConversationId.current
      );
      deleteConversation.mutate(previousConversationId.current);
    }

    previousConversationId.current = currentConversationId;
  }, [currentConversationId, messages.length, deleteConversation]);
};
