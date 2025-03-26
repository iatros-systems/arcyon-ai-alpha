import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types";
import EmptyChat from "./chat/EmptyChat";
import ChatMessage from "./chat/ChatMessage";
import LoadingMessage from "./chat/LoadingMessage";
import { Clock } from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  responseTime?: number | null;
}

const ChatMessages = ({ messages, loading, responseTime }: ChatMessagesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <ScrollArea className="flex-1 p-4 pb-8 h-full">
      <div className="max-w-3xl mx-auto pb-10">
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          <div className="space-y-6 py-2">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            
            {loading && <LoadingMessage />}
            
            {!loading && responseTime !== null && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
              <div className="text-xs text-muted-foreground flex items-center justify-end pr-4">
                <Clock className="h-3 w-3 mr-1" />
                <span>Resposta gerada em {responseTime} segundo{responseTime !== 1 ? 's' : ''}</span>
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
