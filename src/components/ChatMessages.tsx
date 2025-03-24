
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types";
import EmptyChat from "./chat/EmptyChat";
import ChatMessage from "./chat/ChatMessage";
import LoadingMessage from "./chat/LoadingMessage";

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
}

const ChatMessages = ({ messages, loading }: ChatMessagesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Find the system message if it exists
  const systemMessage = messages.find(m => m.role === "system");

  return (
    <ScrollArea className="flex-1 p-4 pb-8 h-full">
      <div className="max-w-3xl mx-auto pb-10">
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          <div className="space-y-6 py-2">
            {/* System message debug display - only visible in development */}
            {process.env.NODE_ENV === 'development' && systemMessage && (
              <div className="p-3 text-xs bg-yellow-100 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                <p className="font-medium mb-1">System Prompt (debug):</p>
                <p className="whitespace-pre-wrap opacity-80">{systemMessage.content.substring(0, 100)}...</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {loading && <LoadingMessage />}
            <div ref={scrollRef} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
