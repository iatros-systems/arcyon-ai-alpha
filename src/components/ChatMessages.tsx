
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

  return (
    <ScrollArea className="flex-1 p-4 h-full">
      <div className="max-w-3xl mx-auto pb-6">
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          <div className="space-y-6 py-2">
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
