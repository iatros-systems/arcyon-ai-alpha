
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Stethoscope } from "lucide-react";
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
        "message-container p-3 rounded-lg", 
        message.role === "user" ? "user" : "ai"
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {message.role === "user" ? (
              <>
                <AvatarFallback className="bg-iatros-blue text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </>
            ) : (
              <>
                <AvatarFallback className="bg-sky-100">
                  <Stethoscope className="h-4 w-4" color="#33C3F0" />
                </AvatarFallback>
              </>
            )}
          </Avatar>
          <div className="font-medium text-xs">
            {message.role === "user" ? "Médico" : "Arcyon"}
          </div>
        </div>
        
        <div className="message-content pl-10"> {/* Added left padding to align with avatar */}
          <div className="prose prose-xs dark:prose-invert max-w-none text-left text-sm">
            {message.role === "assistant" ? (
              <div 
                className="prescription-content text-left text-xs space-y-0"
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
