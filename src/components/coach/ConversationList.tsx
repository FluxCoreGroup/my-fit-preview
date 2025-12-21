import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useConversations } from "@/hooks/useConversations";
import { ConversationItem } from "./ConversationItem";
import coachAlexAvatar from "@/assets/coach-alex-avatar.png";
import coachJulieAvatar from "@/assets/coach-julie-avatar.png";

interface ConversationListProps {
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  coachType: 'alex' | 'julie';
}

const coachInfo = {
  alex: {
    name: "Alex",
    role: "Coach Sportif",
    avatar: coachAlexAvatar,
  },
  julie: {
    name: "Julie",
    role: "Nutritionniste",
    avatar: coachJulieAvatar,
  },
};

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

  const coach = coachInfo[coachType];

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

  const totalConversations = pinnedConversations.length + regularConversations.length;

  if (isLoading) {
    return (
      <div className="w-64 border-r bg-card p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-card flex flex-col h-full">
      {/* Coach Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <img
              src={coach.avatar}
              alt={coach.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{coach.name}</h2>
            <p className="text-xs text-muted-foreground">{coach.role}</p>
          </div>
        </div>
        
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

      {/* Conversations count */}
      <div className="px-4 py-2 border-b">
        <p className="text-xs text-muted-foreground">
          {totalConversations} conversation{totalConversations !== 1 ? 's' : ''}
        </p>
      </div>

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
          {totalConversations === 0 && (
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
