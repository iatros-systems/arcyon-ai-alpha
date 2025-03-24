
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/types";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { formatMedicalTable } from "@/utils/tableFormatters";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "message-container p-3 rounded-lg", // Reduced padding from p-4 to p-3
        message.role === "user" ? "user" : "ai"
      )}
    >
      <div className="flex gap-2"> {/* Reduced gap from gap-3 to gap-2 */}
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
          <div className="font-medium mb-0.5 text-xs"> {/* Reduced font size to text-xs */}
            {message.role === "user" ? "Médico" : "Arcyon"}
          </div>
          <div className="prose prose-xs dark:prose-invert max-w-none text-left text-sm">
            {message.role === "assistant" ? (
              <div 
                className="prescription-content text-left text-xs space-y-0" // Removed vertical spacing completely
                dangerouslySetInnerHTML={{ 
                  __html: formatMedicalTable(message.content)
                    .replace(/```(\w*)([\s\S]*?)```/g, (match, lang, code) => {
                      return `<pre><code class="language-${lang || 'text'}">${code}</code></pre>`;
                    })
                    .replace(/\n/g, '<br>')
                }}
              />
            ) : (
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
                        className="rounded-md text-sm"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...rest} className="px-1 py-0.5 rounded bg-muted text-sm">
                        {children}
                      </code>
                    );
                  },
                  table(props) {
                    return (
                      <div className="my-0 overflow-x-auto rounded-md border"> {/* Removed vertical margin */}
                        <Table className="w-full">{props.children}</Table>
                      </div>
                    );
                  },
                  thead(props) {
                    return <TableHeader>{props.children}</TableHeader>;
                  },
                  tbody(props) {
                    return <TableBody>{props.children}</TableBody>;
                  },
                  tr(props) {
                    return <TableRow>{props.children}</TableRow>;
                  },
                  th(props) {
                    return <TableHead className="font-semibold bg-muted/50 text-xs">{props.children}</TableHead>;
                  },
                  td(props) {
                    return <TableCell className="p-2 text-xs">{props.children}</TableCell>;
                  },
                }}
              >
                {message.content}
              </Markdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
