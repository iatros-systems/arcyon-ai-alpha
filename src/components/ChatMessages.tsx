import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types";
import EmptyChat from "./chat/EmptyChat";
import ChatMessage from "./chat/ChatMessage";
import LoadingMessage from "./chat/LoadingMessage";
import { Clock, ClockIcon } from "lucide-react";
import { getActiveApiName } from "@/services/messageService";

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  responseTime?: number | null;
}

const ChatMessages = ({ messages, loading, responseTime }: ChatMessagesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [totalTime, setTotalTime] = useState<number>(0);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Update total time when a new response is generated
  useEffect(() => {
    if (responseTime && !loading && messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      setTotalTime(prevTotal => prevTotal + responseTime);
    }
  }, [responseTime, loading, messages]);

  // Format time in seconds or minutes
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} minuto${minutes !== 1 ? 's' : ''} e ${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;
    }
  };

  // Para fins de debug, vamos registrar as mensagens no console
  useEffect(() => {
    console.log("Messages:", messages);
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4 pb-8 h-full">
      <div className="max-w-3xl mx-auto pb-10">
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          <div className="space-y-6 py-2">
            {messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                message={message} 
                apiUsed={message.role === "assistant" ? (message.apiUsed || getActiveApiName()) : undefined}
              />
            ))}
            
            {loading && <LoadingMessage />}
            
            {!loading && responseTime !== null && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
              <div className="text-xs text-muted-foreground flex flex-col items-end justify-end pr-4 space-y-1">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Resposta gerada em {formatTime(responseTime)}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>Tempo total da conversa: {formatTime(totalTime)}</span>
                </div>
              </div>
            )}
            
            {loading || messages.length > 0 ? <div ref={scrollRef} /> : null}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
