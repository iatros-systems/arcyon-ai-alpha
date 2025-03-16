
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
    <ScrollArea className="flex-1 p-4">
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-iatros-lightblue dark:bg-accent/30 flex items-center justify-center mb-6 animate-pulse-slow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-iatros-blue">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Assistente para Dor Torácica</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Um assistente especializado para auxiliar médicos de urgência e emergência
              a tomar decisões para pacientes com dor torácica.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "message-container p-4 rounded-lg",
                  message.role === "user" ? "user" : "ai"
                )}
              >
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    {message.role === "user" ? (
                      <>
                        <AvatarFallback className="bg-iatros-blue text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="/lovable-uploads/3c10210e-57f5-4e1c-a850-86f3a335d86c.png" />
                        <AvatarFallback className="bg-muted">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className="message-content flex-1 min-w-0">
                    <div className="font-medium mb-1">
                      {message.role === "user" ? "Você" : "IatrosGPT"}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <Markdown
                        components={{
                          code(props) {
                            const { children, className, ...rest } = props;
                            const match = /language-(\w+)/.exec(className || '');
                            return match ? (
                              <SyntaxHighlighter
                                language={match[1]}
                                style={nord}
                                PreTag="div"
                                className="rounded-md"
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code {...rest} className="px-1 py-0.5 rounded bg-muted">
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-container p-4 rounded-lg ai">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/lovable-uploads/3c10210e-57f5-4e1c-a850-86f3a335d86c.png" />
                    <AvatarFallback className="bg-muted">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium mb-1">IatrosGPT</div>
                    <div className="typing-indicator text-muted-foreground">Pensando</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
