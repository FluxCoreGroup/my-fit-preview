import { useEffect, useRef } from "react";
import { useChatMessages } from "./useChatMessages";
import { useConversations } from "./useConversations";

export const useAutoGenerateTitle = (conversationId: string | null) => {
  const { messages } = useChatMessages(conversationId);
  const { updateConversation, conversations } = useConversations();
  const hasGeneratedTitle = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;

    // Find current conversation
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    // Skip if already generated for this conversation or not default title
    if (
      hasGeneratedTitle.current.has(conversationId) ||
      conversation.title !== "Nouvelle conversation"
    ) {
      return;
    }

    // Get first user message
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (!firstUserMessage) return;

    // Generate title from first message (first 50 chars)
    const generatedTitle =
      firstUserMessage.content.slice(0, 50) +
      (firstUserMessage.content.length > 50 ? "..." : "");

    // Update conversation title
    updateConversation.mutate({
      id: conversationId,
      updates: { title: generatedTitle },
    });

    hasGeneratedTitle.current.add(conversationId);
  }, [conversationId, messages, conversations, updateConversation]);
};
