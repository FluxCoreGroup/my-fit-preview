import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAuth } from "@/contexts/AuthContext";
import { DataSourcesPanel } from "./DataSourcesPanel";
import { useAutoGenerateTitle } from "@/hooks/useAutoGenerateTitle";
import { useConversations, Conversation } from "@/hooks/useConversations";
import CoachWelcome from "./CoachWelcome";
import TypingIndicator from "./TypingIndicator";
import DataConsentMessage from "./DataConsentMessage";
import coachAlexAvatar from "@/assets/coach-alex-avatar.png";
import coachJulieAvatar from "@/assets/coach-julie-avatar.png";

interface Message {
  role: "user" | "assistant";
  content: string;
  data_sources?: any[];
}

interface ChatInterfaceProps {
  conversationId: string | null;
  conversation?: Conversation | null;
  functionName: string;
  systemPrompt: string;
  shortcuts: string[];
  context: any;
  avatarColor: string;
  name: string;
  coachType: 'alex' | 'julie';
  onConversationCreated?: (conversationId: string) => void;
}

const coachConfig = {
  alex: {
    avatar: coachAlexAvatar,
    role: "Coach Sportif",
    description: "Je vous aide à planifier vos entraînements, adapter vos exercices et atteindre vos objectifs de forme physique.",
    primaryColor: "primary",
  },
  julie: {
    avatar: coachJulieAvatar,
    role: "Nutritionniste",
    description: "Je vous accompagne dans vos choix alimentaires, vos plans repas et votre équilibre nutritionnel.",
    primaryColor: "secondary",
  },
};

export const ChatInterface = ({
  conversationId,
  conversation,
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
  const [awaitingConsent, setAwaitingConsent] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedConversationRef = useRef<string | null>(null);
  const { toast } = useToast();
  const { session } = useAuth();
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
  
  const { messages: dbMessages, isLoading: messagesLoading, saveMessage } = useChatMessages(conversationId);
  const { createConversation, updateDataConsent } = useConversations(coachType);
  const config = coachConfig[coachType];
  
  // Auto-generate title from first message
  useAutoGenerateTitle(conversationId, coachType);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages from DB when conversation changes
  useEffect(() => {
    if (conversationId !== loadedConversationRef.current) {
      if (dbMessages.length > 0) {
        const loadedMessages = dbMessages.map(m => ({ 
          role: m.role, 
          content: m.content,
          data_sources: m.data_sources 
        }));
        setMessages(loadedMessages);
        
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

  // Call AI with optional data consent
  const callAI = async (messageText: string, dataConsent: boolean | null, convId: string) => {
    const userMessage: Message = { role: "user", content: messageText };
    
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

    const token = session?.access_token;
    if (!token) {
      toast({
        title: "Session expirée",
        description: "Reconnecte-toi pour continuer",
        variant: "destructive",
      });
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
          messages: [...messages.filter(m => m.role !== "assistant" || m.content), userMessage],
          context,
          dataConsent,
        }),
      });

      const dataSourcesHeader = resp.headers.get("X-Data-Sources");
      if (dataSourcesHeader) {
        try {
          dataSources = JSON.parse(dataSourcesHeader);
          setLastDataSources(dataSources);
        } catch (e) {
          console.error("Failed to parse data sources:", e);
        }
      } else {
        setLastDataSources([]);
      }

      if (!resp.ok) {
        if (resp.status === 401) {
          toast({ title: "Non authentifié", description: "Reconnecte-toi pour continuer", variant: "destructive" });
        } else if (resp.status === 429) {
          toast({ title: "Trop de requêtes", description: "Réessaye dans quelques instants.", variant: "destructive" });
        } else if (resp.status === 402) {
          toast({ title: "Crédits épuisés", description: "Contacte le support pour plus d'infos.", variant: "destructive" });
        } else {
          throw new Error(`HTTP ${resp.status}`);
        }
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

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

      if (assistantContent && convId) {
        await saveMessage.mutateAsync({
          conversation_id: convId,
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
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || isCreatingConversation || awaitingConsent) return;

    if (!session?.user) {
      toast({
        title: "Non authentifié",
        description: "Connecte-toi pour continuer",
        variant: "destructive",
      });
      return;
    }

    let activeConversationId = conversationId;
    let isNewConversation = false;

    // Create conversation if needed
    if (!activeConversationId) {
      setIsCreatingConversation(true);
      isNewConversation = true;
      try {
        const newConversation = await createConversation.mutateAsync(undefined);
        activeConversationId = newConversation.id;
        setCurrentConversationId(newConversation.id);
        onConversationCreated?.(newConversation.id);
      } catch (error) {
        console.error("Failed to create conversation:", error);
        toast({
          title: "Erreur",
          description: `Impossible de créer la conversation`,
          variant: "destructive",
        });
        return;
      } finally {
        setIsCreatingConversation(false);
      }
    }

    // Show user message immediately
    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Save user message
    await saveMessage.mutateAsync({
      conversation_id: activeConversationId,
      role: "user",
      content: messageText,
    });

    // Check if consent is needed (new conversation or consent is null)
    const existingConsent = conversation?.data_consent;
    const needsConsent = isNewConversation || existingConsent === null || existingConsent === undefined;

    if (needsConsent) {
      // Show consent request
      setPendingMessage(messageText);
      setCurrentConversationId(activeConversationId);
      setAwaitingConsent(true);
      return;
    }

    // Existing conversation with consent already given
    setIsLoading(true);
    await callAI(messageText, existingConsent ?? false, activeConversationId);
  };

  // Handle consent acceptance
  const handleConsentAccept = async () => {
    if (!currentConversationId && !conversationId) return;
    
    const convId = currentConversationId || conversationId!;
    setIsLoading(true);
    
    try {
      await updateDataConsent.mutateAsync({ id: convId, consent: true });
      setAwaitingConsent(false);
      
      if (pendingMessage) {
        await callAI(pendingMessage, true, convId);
        setPendingMessage(null);
      }
    } catch (error) {
      console.error("Failed to update consent:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder ta préférence",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Handle consent decline
  const handleConsentDecline = async () => {
    if (!currentConversationId && !conversationId) return;
    
    const convId = currentConversationId || conversationId!;
    setIsLoading(true);
    
    try {
      await updateDataConsent.mutateAsync({ id: convId, consent: false });
      setAwaitingConsent(false);
      
      if (pendingMessage) {
        await callAI(pendingMessage, false, convId);
        setPendingMessage(null);
      }
    } catch (error) {
      console.error("Failed to update consent:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder ta préférence",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleShortcutClick = (shortcut: string) => {
    sendMessage(shortcut);
  };

  // Loading state
  if (messagesLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
      </div>
    );
  }

  // Show welcome if no conversation or no messages
  const showWelcome = !conversationId || (messages.length === 0 && !isLoading);

  if (showWelcome) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        <CoachWelcome
          name={name}
          avatar={config.avatar}
          role={config.role}
          description={config.description}
          shortcuts={shortcuts}
          onShortcutClick={handleShortcutClick}
          primaryColor={config.primaryColor}
        />
        
        {/* Input at bottom */}
        <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Écris à ${name}...`}
              className="resize-none rounded-xl min-h-[44px] max-h-32"
              rows={1}
              disabled={isLoading || isCreatingConversation}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={isLoading || isCreatingConversation || !input.trim()}
              size="icon"
              className="rounded-xl h-11 w-11"
            >
              {isLoading || isCreatingConversation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
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
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3 animate-fade-in",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <img
                  src={config.avatar}
                  alt={name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
              <Card
                className={cn(
                  "p-3 max-w-[80%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                    : "bg-muted rounded-2xl rounded-tl-sm"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </Card>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
                  {session?.user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
          ))}

          {/* Data consent request */}
          {awaitingConsent && (
            <DataConsentMessage
              onAccept={handleConsentAccept}
              onDecline={handleConsentDecline}
              isLoading={isLoading}
              coachAvatar={config.avatar}
              coachName={name}
            />
          )}

          {/* Typing indicator */}
          {isLoading && !awaitingConsent && messages[messages.length - 1]?.role === "user" && (
            <TypingIndicator avatar={config.avatar} name={name} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Data Sources Panel */}
        <DataSourcesPanel dataSources={lastDataSources} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2 mb-3">
          {shortcuts.map((shortcut, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => handleShortcutClick(shortcut)}
              disabled={isLoading}
              className="text-xs"
            >
              {shortcut}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Écris à ${name}...`}
            className="resize-none rounded-xl min-h-[44px] max-h-32"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="rounded-xl h-11 w-11"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
