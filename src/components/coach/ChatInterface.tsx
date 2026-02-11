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
  const [shouldShowConsent, setShouldShowConsent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedConversationRef = useRef<string | null>(null);
  const { toast } = useToast();
  const { session } = useAuth();
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
  
  const { messages: dbMessages, isLoading: messagesLoading, saveMessage } = useChatMessages(conversationId);
  const { createConversation, updateDataConsent } = useConversations(coachType);
  const config = coachConfig[coachType];

  // Debug: Log states on every render
  console.log('🔄 ChatInterface render:', { 
    awaitingConsent, 
    shouldShowConsent, 
    pendingMessage: pendingMessage?.substring(0, 20),
    currentConversationId,
    conversationId 
  });
  
  // Auto-generate title from first message
  useAutoGenerateTitle(conversationId, coachType);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages from DB when conversation changes
  useEffect(() => {
    console.log('📥 Load messages effect:', { 
      conversationId, 
      loadedRef: loadedConversationRef.current, 
      dbMessagesLength: dbMessages.length,
      currentMessagesLength: messages.length,
      messagesLoading
    });
    
    if (conversationId && conversationId !== loadedConversationRef.current) {
      // Wait for messages to finish loading before doing anything
      if (messagesLoading) {
        console.log('📥 Messages still loading, waiting...');
        return;
      }
      
      if (dbMessages.length > 0) {
        const loadedMessages = dbMessages.map(m => ({ 
          role: m.role, 
          content: m.content,
          data_sources: m.data_sources 
        }));
        console.log('📥 Loading messages from DB:', loadedMessages.length);
        setMessages(loadedMessages);
        
        const lastAssistant = [...dbMessages].reverse().find(m => m.role === "assistant");
        if (lastAssistant?.data_sources) {
          setLastDataSources(lastAssistant.data_sources);
        }
        loadedConversationRef.current = conversationId;
      } else if (messages.length === 0) {
        // Only reset to empty if we don't have any local messages
        console.log('📥 No DB messages and no local messages, resetting to empty');
        setMessages([]);
        setLastDataSources([]);
        loadedConversationRef.current = conversationId;
      } else {
        console.log('📥 No DB messages but have local messages - keeping them');
        loadedConversationRef.current = conversationId;
      }
    }
  }, [conversationId, dbMessages.length, messagesLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle showing consent after message is saved
  useEffect(() => {
    console.log('🔁 useEffect running, checking conditions:', { 
      shouldShowConsent, 
      currentConversationId, 
      awaitingConsent,
      allConditionsMet: shouldShowConsent && currentConversationId && pendingMessage
    });
    
    if (shouldShowConsent && currentConversationId && pendingMessage) {
      console.log('🎯 useEffect triggered - showing consent');
      console.log('🎯 About to call setAwaitingConsent(true)');
      setAwaitingConsent(true);
      setShouldShowConsent(false);
      console.log('🎯 setAwaitingConsent(true) and setShouldShowConsent(false) called');
    }
  }, [shouldShowConsent, currentConversationId, pendingMessage]);

  // Call AI with optional data consent
  const callAI = async (messageText: string, dataConsent: boolean | null, convId: string) => {
    console.log('🤖 callAI started:', { messageText, dataConsent, convId, currentMessagesCount: messages.length });
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

    console.log("Call AI STARRRRT", {
          messages: [...messages.filter(m => m.role !== "assistant" || m.content), userMessage],
          context,
          dataConsent,
    })

    const sanitizedContext = context ? {
      goal_type: context.goal_type || undefined,
      tdee: context.tdee ? Number(context.tdee) : undefined,
      target_calories: context.target_calories ? Number(context.target_calories) : undefined,
      protein: context.protein ? Number(context.protein) : undefined,
      fat: context.fat ? Number(context.fat) : undefined,
      carbs: context.carbs ? Number(context.carbs) : undefined,
      meals_per_day: context.meals_per_day ? Number(context.meals_per_day) : undefined,
      restrictions: Array.isArray(context.restrictions) ? context.restrictions : [],
      allergies: Array.isArray(context.allergies) ? context.allergies : [],
    } : undefined;

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
          sanitizedContext,
          dataConsent,
        }),
      });
      console.log('🤖 callAI response:', resp);

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
        let serverMessage = "";
        try {
          const errJson = await resp.clone().json();
          serverMessage = typeof errJson?.error === "string" ? errJson.error : "";
        } catch {
          // ignore
        }

        if (resp.status === 401) {
          toast({ title: "Non authentifié", description: "Reconnecte-toi pour continuer", variant: "destructive" });
        } else if (resp.status === 403) {
          toast({
            title: "Abonnement requis",
            description: serverMessage || "Un abonnement est nécessaire pour continuer à utiliser le coach IA.",
            variant: "destructive",
          });
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
    console.log('🚀 sendMessage called with:', { messageText, conversationId, isLoading, isCreatingConversation, awaitingConsent });
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
      console.log('📝 Creating new conversation...');
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

    // Show user message immediately
    console.log('💬 Adding user message to UI');
    const userMessage: Message = { role: "user", content: messageText };
    console.log('💬 Current messages before adding:', messages.length);
    setMessages((prev) => {
      const updated = [...prev, userMessage];
      console.log('💬 Messages after adding:', updated.length, updated);
      return updated;
    });
    setInput("");

    // Save user message
    console.log('💾 Saving user message to DB...');
    await saveMessage.mutateAsync({
      conversation_id: activeConversationId,
      role: "user",
      content: messageText,
    });
    console.log('✅ User message saved');

    // Check if consent is needed (new conversation or consent is null)
    const existingConsent = conversation?.data_consent;
    const needsConsent = isNewConversation || existingConsent === null || existingConsent === undefined;
    console.log('🔍 Consent check:', { 
      isNewConversation, 
      existingConsent, 
      needsConsent, 
      conversationProp: conversation,
      activeConversationId 
    });

    if (needsConsent) {
      // Show consent request via useEffect
      console.log('⏸️ Needs consent - setting up states for useEffect trigger');
      console.log('⏸️ Setting states:', { 
        pendingMessage: messageText, 
        currentConversationId: activeConversationId,
      });
      setPendingMessage(messageText);
      setCurrentConversationId(activeConversationId);
      setShouldShowConsent(true);
      console.log('⏸️ shouldShowConsent set to true, returning from sendMessage');
      return;
    }

    // Existing conversation with consent already given
    console.log('🤖 Calling AI directly (consent already given):', existingConsent);
    setIsLoading(true);
    await callAI(messageText, existingConsent ?? false, activeConversationId);
  };

  // Handle consent acceptance
  const handleConsentAccept = async () => {
    console.log('✅ User accepted consent');
    if (!currentConversationId && !conversationId) return;
    
    const convId = currentConversationId || conversationId!;
    console.log('📝 Updating consent in DB for conversation:', convId);
    setIsLoading(true);
    
    try {
      await updateDataConsent.mutateAsync({ id: convId, consent: true });
      console.log('✅ Consent updated');
      setAwaitingConsent(false);
      
      if (pendingMessage) {
        console.log('🤖 Calling AI with pending message:', pendingMessage);
        await callAI(pendingMessage, true, convId);
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

  // Handle consent decline
  const handleConsentDecline = async () => {
    console.log('❌ User declined consent');
    if (!currentConversationId && !conversationId) return;
    
    const convId = currentConversationId || conversationId!;
    console.log('📝 Updating consent in DB for conversation:', convId);
    setIsLoading(true);
    
    try {
      await updateDataConsent.mutateAsync({ id: convId, consent: false });
      console.log('✅ Consent updated');
      setAwaitingConsent(false);
      
      if (pendingMessage) {
        console.log('🤖 Calling AI with pending message:', pendingMessage);
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
  // Use currentConversationId if set (for newly created conversations), otherwise conversationId
  const activeConvId = currentConversationId || conversationId;
  const showWelcome = !activeConvId || (messages.length === 0 && !isLoading && !awaitingConsent);
  
  console.log('🎯 showWelcome check:', { 
    activeConvId, 
    currentConversationId, 
    conversationId,
    messagesLength: messages.length, 
    isLoading, 
    awaitingConsent, 
    showWelcome 
  });

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
