
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
            {message.role === "user" ? "Médico" : "Arcyon"}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-left">
            {message.role === "assistant" ? (
              <div 
                className="prescription-content text-left"
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
                  table(props) {
                    return (
                      <div className="my-4 overflow-x-auto rounded-md border">
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
                    return <TableHead className="font-semibold bg-muted/50">{props.children}</TableHead>;
                  },
                  td(props) {
                    return <TableCell className="p-2">{props.children}</TableCell>;
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
