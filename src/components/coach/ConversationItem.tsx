import { useState } from "react";
import { MessageCircle, Pin, Archive, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Conversation } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onTogglePin: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const ConversationItem = ({
  conversation,
  isActive,
  onSelect,
  onRename,
  onTogglePin,
  onArchive,
  onDelete,
}: ConversationItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const handleSaveRename = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50"
      )}
      onClick={() => !isEditing && onSelect()}
    >
      {/* Icon */}
      <MessageCircle className="w-4 h-4 flex-shrink-0 text-muted-foreground" />

      {/* Title (editable) */}
      {isEditing ? (
        <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveRename();
              if (e.key === "Escape") handleCancelRename();
            }}
            className="h-7 text-sm"
            autoFocus
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 flex-shrink-0"
            onClick={handleSaveRename}
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 flex-shrink-0"
            onClick={handleCancelRename}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <p className="flex-1 text-sm truncate">{conversation.title}</p>
      )}

      {/* Pin indicator */}
      {conversation.is_pinned && !isEditing && (
        <Pin className="w-3 h-3 text-primary flex-shrink-0" />
      )}

      {/* Actions dropdown */}
      {!isEditing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="sr-only">Actions</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
              >
                <path
                  d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Renommer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onTogglePin}>
              <Pin className="w-4 h-4 mr-2" />
              {conversation.is_pinned ? "Désépingler" : "Épingler"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="w-4 h-4 mr-2" />
              Archiver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
