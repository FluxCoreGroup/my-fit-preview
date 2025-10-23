import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useConversations } from "@/hooks/useConversations";
import { ConversationItem } from "./ConversationItem";

interface ConversationListProps {
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  coachType: 'alex' | 'julie';
}

export const ConversationList = ({
  activeConversationId,
  onSelectConversation,
  coachType,
}: ConversationListProps) => {
  const {
    pinnedConversations,
    regularConversations,
    isLoading,
    createConversation,
    updateConversation,
    togglePin,
    archiveConversation,
    deleteConversation,
  } = useConversations(coachType);

  const handleCreateNew = async () => {
    const result = await createConversation.mutateAsync(undefined);
    onSelectConversation(result.id);
  };

  const handleRename = (id: string, title: string) => {
    updateConversation.mutate({ id, updates: { title } });
  };

  const handleTogglePin = (id: string, isPinned: boolean) => {
    togglePin.mutate({ id, isPinned });
  };

  const handleArchive = (id: string) => {
    if (id === activeConversationId) {
      // If archiving active conversation, select the first available one
      const remaining = [...pinnedConversations, ...regularConversations].filter(
        (c) => c.id !== id
      );
      if (remaining.length > 0) {
        onSelectConversation(remaining[0].id);
      } else {
        onSelectConversation("");
      }
    }
    archiveConversation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (id === activeConversationId) {
      // If deleting active conversation, select the first available one
      const remaining = [...pinnedConversations, ...regularConversations].filter(
        (c) => c.id !== id
      );
      if (remaining.length > 0) {
        onSelectConversation(remaining[0].id);
      } else {
        onSelectConversation("");
      }
    }
    deleteConversation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="w-64 border-r bg-card p-4">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-3 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
        <Button
          onClick={handleCreateNew}
          disabled={createConversation.isPending}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>

      <Separator />

      {/* Conversations list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {/* Pinned conversations */}
          {pinnedConversations.length > 0 && (
            <>
              <div className="px-3 py-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Épinglées
                </p>
              </div>
              {pinnedConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === activeConversationId}
                  onSelect={() => onSelectConversation(conversation.id)}
                  onRename={(title) => handleRename(conversation.id, title)}
                  onTogglePin={() => handleTogglePin(conversation.id, conversation.is_pinned)}
                  onArchive={() => handleArchive(conversation.id)}
                  onDelete={() => handleDelete(conversation.id)}
                />
              ))}
              {regularConversations.length > 0 && (
                <Separator className="my-2" />
              )}
            </>
          )}

          {/* Regular conversations */}
          {regularConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onSelect={() => onSelectConversation(conversation.id)}
              onRename={(title) => handleRename(conversation.id, title)}
              onTogglePin={() => handleTogglePin(conversation.id, conversation.is_pinned)}
              onArchive={() => handleArchive(conversation.id)}
              onDelete={() => handleDelete(conversation.id)}
            />
          ))}

          {/* Empty state */}
          {pinnedConversations.length === 0 && regularConversations.length === 0 && (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Aucune conversation
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Créez-en une nouvelle pour commencer
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
