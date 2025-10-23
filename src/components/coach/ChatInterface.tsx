import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAuth } from "@/contexts/AuthContext";
import { DataSourcesPanel } from "./DataSourcesPanel";
import { useAutoGenerateTitle } from "@/hooks/useAutoGenerateTitle";
import { useConversations } from "@/hooks/useConversations";
import { EmptyState } from "@/components/EmptyState";

interface Message {
  role: "user" | "assistant";
  content: string;
  data_sources?: any[];
}

interface ChatInterfaceProps {
  conversationId: string | null;
  functionName: string;
  systemPrompt: string;
  shortcuts: string[];
  context: any;
  avatarColor: string;
  name: string;
  coachType: 'alex' | 'julie';
  onConversationCreated?: (conversationId: string) => void;
}

export const ChatInterface = ({
  conversationId,
  functionName,
  shortcuts,
  context,
  avatarColor,
  name,
  coachType,
  onConversationCreated,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [lastDataSources, setLastDataSources] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedConversationRef = useRef<string | null>(null);
  const { toast } = useToast();
  const { session } = useAuth();
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
  
  const { messages: dbMessages, isLoading: messagesLoading, saveMessage } = useChatMessages(conversationId);
  const { createConversation } = useConversations(coachType);
  
  // Auto-generate title from first message
  useAutoGenerateTitle(conversationId, coachType);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages from DB when conversation changes
  useEffect(() => {
    // Only load if conversation has changed
    if (conversationId !== loadedConversationRef.current) {
      if (dbMessages.length > 0) {
        const loadedMessages = dbMessages.map(m => ({ 
          role: m.role, 
          content: m.content,
          data_sources: m.data_sources 
        }));
        setMessages(loadedMessages);
        
        // Set last data sources from most recent assistant message
        const lastAssistant = [...dbMessages].reverse().find(m => m.role === "assistant");
        if (lastAssistant?.data_sources) {
          setLastDataSources(lastAssistant.data_sources);
        }
      } else {
        setMessages([]);
        setLastDataSources([]);
      }
      
      loadedConversationRef.current = conversationId;
    }
  }, [conversationId, dbMessages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || isCreatingConversation) return;

    // Check auth before creating conversation
    if (!session?.user) {
      toast({
        title: "Non authentifié",
        description: "Connecte-toi pour continuer",
        variant: "destructive",
      });
      return;
    }

    let currentConversationId = conversationId;

    // If no conversation exists, create one first
    if (!currentConversationId) {
      setIsCreatingConversation(true);
      try {
        const newConversation = await createConversation.mutateAsync(undefined);
        currentConversationId = newConversation.id;
        onConversationCreated?.(newConversation.id);
      } catch (error) {
        console.error("Failed to create conversation:", error);
        // Log full error details
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        toast({
          title: "Erreur",
          description: `Impossible de créer la conversation: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
        return;
      } finally {
        setIsCreatingConversation(false);
      }
    }

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message to DB
    await saveMessage.mutateAsync({
      conversation_id: currentConversationId,
      role: "user",
      content: messageText,
    });

    let assistantContent = "";
    let dataSources: any[] = [];
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    // Check session token
    const token = session?.access_token;
    if (!token) {
      toast({
        title: "Session expirée",
        description: "Reconnecte-toi pour continuer",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
      setIsLoading(false);
      return;
    }

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context,
        }),
      });

      // Extract data sources and debug headers
      const dataSourcesHeader = resp.headers.get("X-Data-Sources");
      const debugUserId = resp.headers.get("X-Debug-UserId");
      const debugGoals = resp.headers.get("X-Debug-Goals");

      // Log debug info for diagnostics
      if (debugUserId || debugGoals) {
        console.log("🔍 Debug Info:", { userId: debugUserId, goalsStatus: debugGoals });
      }

      if (dataSourcesHeader) {
        try {
          dataSources = JSON.parse(dataSourcesHeader);
          setLastDataSources(dataSources);
          console.log("📊 Data Sources:", dataSources);
        } catch (e) {
          console.error("Failed to parse data sources:", e);
        }
      } else {
        console.log("⚠️ No data sources used for this response");
        setLastDataSources([]);
      }

      if (!resp.ok) {
        if (resp.status === 401) {
          toast({
            title: "Non authentifié",
            description: "Reconnecte-toi pour continuer",
            variant: "destructive",
          });
          setMessages((prev) => prev.slice(0, -1));
          setIsLoading(false);
          return;
        }

        if (resp.status === 429) {
          toast({
            title: "Trop de requêtes",
            description: "Réessaye dans quelques instants.",
            variant: "destructive",
          });
          setMessages((prev) => prev.slice(0, -1));
          setIsLoading(false);
          return;
        }

        if (resp.status === 402) {
          toast({
            title: "Crédits épuisés",
            description: "Contacte le support pour plus d'infos.",
            variant: "destructive",
          });
          setMessages((prev) => prev.slice(0, -1));
          setIsLoading(false);
          return;
        }

        const errorBody = await resp.text();
        console.error("Edge function error:", resp.status, errorBody);
        throw new Error(`HTTP ${resp.status}: ${errorBody.slice(0, 100)}`);
      }

      if (!resp.body) {
        throw new Error("No response body from edge function");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {}
        }
      }

      // Save assistant message to DB with data sources
      if (assistantContent && currentConversationId) {
        await saveMessage.mutateAsync({
          conversation_id: currentConversationId,
          role: "assistant",
          content: assistantContent,
          data_sources: dataSources.length > 0 ? dataSources : undefined,
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de contacter le coach IA",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (messagesLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
      </div>
    );
  }

  // Show welcome message if no conversation
  if (!conversationId) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] p-4">
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={MessageSquare}
            title={`Discute avec ${name}`}
            description="Commence une nouvelle conversation en envoyant ton premier message"
            action={{
              label: "Commencer",
              onClick: () => {
                const textarea = document.querySelector('textarea');
                textarea?.focus();
              }
            }}
          />
        </div>
        
        {/* Input at bottom even without conversation */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écris ton premier message..."
              className="resize-none rounded-xl"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="rounded-xl"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex flex-1 min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">
              Salut ! Je suis {name}, pose-moi tes questions 👋
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {shortcuts.map((shortcut, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(shortcut)}
                  disabled={isLoading}
                >
                  {shortcut}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0",
                  avatarColor
                )}
              >
                {name[0]}
              </div>
            )}
            <Card
              className={cn(
                "p-3 max-w-[80%]",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/50 backdrop-blur-xl border-white/10"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </Card>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3 justify-start">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm",
                avatarColor
              )}
            >
              {name[0]}
            </div>
            <Card className="p-3 bg-card/50 backdrop-blur-xl border-white/10">
              <Loader2 className="w-4 h-4 animate-spin" />
            </Card>
          </div>
        )}

          <div ref={messagesEndRef} />
        </div>

        {/* Data Sources Panel */}
        <DataSourcesPanel dataSources={lastDataSources} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écris ton message..."
            className="resize-none rounded-xl"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="rounded-xl"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
