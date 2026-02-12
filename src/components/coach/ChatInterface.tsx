import { useState, useRef, useEffect, useMemo } from "react";
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
  
  useAutoGenerateTitle(conversationId, coachType);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // On transform les messages pour les faire correspondre à la structure attendue par le composant
  const transformedMessages = useMemo(() => {
    if (!dbMessages.length) return [];
    return dbMessages.map(m => ({ 
      role: m.role, 
      content: m.content,
      data_sources: m.data_sources 
    }));
  }, [dbMessages]);

  // On extrait les data sources de la dernière réponse de l'assistant
  const lastAssistantDataSources = useMemo(() => {
    const lastAssistant = [...dbMessages].reverse().find(m => m.role === "assistant");
    return lastAssistant?.data_sources || [];
  }, [dbMessages]);

  // Quand les messages de la conversation changent, on met à jour les messages locaux
  useEffect(() => {
    if (conversationId === loadedConversationRef.current) return;
    
    if (messagesLoading) return;

    if (!conversationId) return;

    // On met à jour les messages locaux (vide ou avec contenu)
    setMessages(transformedMessages);
    setLastDataSources(lastAssistantDataSources);

    // Mark conversation as loaded
    loadedConversationRef.current = conversationId;
  }, [conversationId, transformedMessages, lastAssistantDataSources, messagesLoading]);

  // Scroll uniquement pour les messages utilisateur
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user") {
      scrollToBottom();
    }
  }, [messages]);

  // Transformation du markdown en HTML
  const formatMarkdown = (text: string): string => {
    return text
      // Gras: **texte** -> <strong>texte</strong>
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Liste niveau 2 (avec indentation) : *   item -> ◦ item
      .replace(/^    \*   (.+)$/gm, '    ◦ $1')
      // Liste niveau 1 : •   item -> • item
      .replace(/^•   (.+)$/gm, '• $1')
      // Liste simple : * item -> • item
      .replace(/^\* (.+)$/gm, '• $1')
      // Italique: *texte* -> <em>texte</em> (mais pas si c'est une liste)
      .replace(/(?<!^)(?<!\s)\*([^\s*][^*]*?)\*(?!\*)/g, '<em>$1</em>');
  };

  // Gestion des erreurs HTTP avec messages appropriés
  const handleHttpError = (status: number, serverMessage: string) => {
    const errorMessages: Record<number, { title: string; description: string }> = {
      401: { title: "Non authentifié", description: "Reconnecte-toi pour continuer" },
      402: { title: "Crédits épuisés", description: "Contacte le support pour plus d'infos." },
      403: { title: "Abonnement requis", description: serverMessage || "Un abonnement est nécessaire pour continuer à utiliser le coach IA." },
      429: { title: "Trop de requêtes", description: "Réessaye dans quelques instants." },
    };

    const error = errorMessages[status];
    if (error) {
      toast({ ...error, variant: "destructive" });
    } else {
      throw new Error(`HTTP ${status}`);
    }
  };

  // Appel à l'IA avec gestion du streaming
  const callAI = async (messageText: string, dataConsent: boolean | null, convId: string) => {
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

    const userMessage: Message = { role: "user", content: messageText };
    let assistantContent = "";
    let dataSources: any[] = [];

    // Optimisation: mise à jour par batch pour réduire les re-renders
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          const updated = [...prev];
          updated[prev.length - 1] = { ...last, content: assistantContent };
          return updated;
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      // Filtrer les messages vides pour optimiser la requête
      const filteredMessages = messages.filter(m => m.content.trim());
      
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: [...filteredMessages, userMessage],
          context,
          dataConsent,
        }),
      });

      // Gestion des erreurs HTTP
      if (!resp.ok) {
        let serverMessage = "";
        try {
          const errJson = await resp.clone().json();
          serverMessage = typeof errJson?.error === "string" ? errJson.error : "";
        } catch {
          // Ignore parsing errors
        }
        handleHttpError(resp.status, serverMessage);
        setIsLoading(false);
        return;
      }

      // Streaming optimisé avec gestion du buffer
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let textBuffer = "";

      const processLine = (line: string) => {
        if (!line || line.startsWith(":") || !line.startsWith("data: ")) return false;
        
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") return true;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) updateAssistant(content);
        } catch {
          // Ignore malformed JSON
        }
        return false;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        const lines = textBuffer.split("\n");
        textBuffer = lines.pop() || ""; // Garde la dernière ligne incomplète

        for (const line of lines) {
          const cleanLine = line.endsWith("\r") ? line.slice(0, -1) : line;
          if (processLine(cleanLine)) break;
        }
      }

      // Traiter le buffer restant
      if (textBuffer.trim()) {
        const cleanLine = textBuffer.endsWith("\r") ? textBuffer.slice(0, -1) : textBuffer;
        processLine(cleanLine);
      }

      // Sauvegarder la réponse de l'assistant
      if (assistantContent && convId) {
        await saveMessage.mutateAsync({
          conversation_id: convId,
          role: "assistant",
          content: assistantContent,
          data_sources: dataSources.length > 0 ? dataSources : undefined,
        });
      }

      // Scroll final après la fin du streaming
      setTimeout(() => scrollToBottom(), 100);
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

    // On créer une nouvelle conversation si nécessaire
    if (!activeConversationId) {
      setIsCreatingConversation(true);
      isNewConversation = true;
      try {
        const newConversation = await createConversation.mutateAsync(undefined);
        activeConversationId = newConversation.id;
        console.log('✅ Conversation created:', activeConversationId);
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

    // On récupère le message de l'utilisateur, on l'ajoute dans le state, puis on le sauvegarde dans la base de données

    const userMessage: Message = { role: "user", content: messageText };

    setMessages((prev) => {
      const updated = [...prev, userMessage];
      return updated;
    });
    setInput("");

    await saveMessage.mutateAsync({
      conversation_id: activeConversationId,
      role: "user",
      content: messageText,
    });

    // On vérifie si l'utilisateur a partagé ses données personnelles
    const existingConsent = conversation?.data_consent;
    const needsConsent = isNewConversation || existingConsent === null || existingConsent === undefined;
    
    // Si le consentement est nécessaire, on met le message en attente

    if (needsConsent) {
      setPendingMessage(messageText);
      setCurrentConversationId(activeConversationId);
      setAwaitingConsent(true);
      return;
    }
    
    // Sinon on appelle l'IA directement
    setIsLoading(true);
    await callAI(messageText, existingConsent ?? false, activeConversationId);
  };

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
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder ta préférence",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleConsentDecline = async () => {
    console.log('❌ User declined consent');
    if (!currentConversationId && !conversationId) return;
    
    const convId = currentConversationId || conversationId!;
    console.log('📝 Updating consent in DB for conversation:', convId);
    setIsLoading(true);
    
    try {
      await updateDataConsent.mutateAsync({ id: convId, consent: false });
      setAwaitingConsent(false);
      
      if (pendingMessage) {
        await callAI(pendingMessage, false, convId);
        setPendingMessage(null);
      } else {
        console.log('⚠️ No pending message found!');
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

  if (messagesLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Chargement de la conversation...</p>
      </div>
    );
  }

  const activeConvId = currentConversationId || conversationId;
  const showWelcome = !activeConvId || (messages.length === 0 && !isLoading && !awaitingConsent);

  // Dans le cas où il n'y a pas de conversationId, de messages et que l'utilisateur n'a pas encore donné son consentement, on affiche la page de bienvenue
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
                {message.role === "assistant" ? (
                  <div 
                    className="text-sm whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </Card>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
                  {session?.user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
          ))}

          {awaitingConsent && (
            <DataConsentMessage
              onAccept={handleConsentAccept}
              onDecline={handleConsentDecline}
              isLoading={isLoading}
              coachAvatar={config.avatar}
              coachName={name}
            />
          )}

          {isLoading && !awaitingConsent && messages[messages.length - 1]?.role === "user" && (
            <TypingIndicator avatar={config.avatar} name={name} />
          )}

          <div ref={messagesEndRef} />
        </div>

        <DataSourcesPanel dataSources={lastDataSources} />
      </div>

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
            className="resize-none rounded-xl min-h-[44px] max-h-32 text-base"
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
