import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Stethoscope, Brain, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/types";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { formatMedicalTable } from "@/utils/tableFormatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { isModelThinkingEnabled } from "@/services/messageService";

interface ChatMessageProps {
  message: Message;
  apiUsed?: string;
}

const ChatMessage = ({ message, apiUsed }: ChatMessageProps) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const modelThinkingEnabled = isModelThinkingEnabled();
  const [dummyReasoning, setDummyReasoning] = useState<string | undefined>(undefined);
  
  // Se a API é DeepSeek e o raciocínio está habilitado, mas não há conteúdo de raciocínio,
  // criar um raciocínio de exemplo para permitir que o botão seja exibido
  useEffect(() => {
    if (apiUsed && 
        apiUsed.includes("DeepSeek") && 
        modelThinkingEnabled && 
        !message.reasoningContent && 
        message.role === "assistant") {
      setDummyReasoning(`# Processo de Raciocínio para esta resposta

Este é um exemplo de como o modelo DeepSeek R1 estrutura seu raciocínio interno. 
Normalmente, aqui você veria:

1. **Análise dos Sintomas** apresentados pelo paciente
2. **Avaliação de Fatores de Risco** relevantes para o caso
3. **Interpretação dos Sinais Vitais** e sua relevância clínica
4. **Diagnóstico Diferencial** considerando as possibilidades mais prováveis

## Plano de Tratamento
O plano de tratamento é baseado na análise acima e segue protocolos médicos estabelecidos.

*Nota: Este é apenas um exemplo. Para ver o raciocínio real do modelo, tente enviar uma nova mensagem.*`);
    }
  }, [apiUsed, modelThinkingEnabled, message.reasoningContent, message.role]);
  
  // Determinar se deve mostrar o botão de raciocínio
  const shouldShowReasoningButton = 
    message.role === "assistant" && 
    ((message.reasoningContent || dummyReasoning) && 
    apiUsed && 
    apiUsed.includes("DeepSeek") && 
    modelThinkingEnabled);
  
  return (
    <div
      className={cn(
        "message-container p-4 rounded-lg mb-4 shadow-sm", 
        message.role === "user" ? "bg-muted/40 user" : "bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 ai"
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {message.role === "user" ? (
              <>
                <AvatarFallback className="bg-iatros-blue text-white">
                  <Stethoscope className="h-4 w-4" />
                </AvatarFallback>
              </>
            ) : (
              <>
                <AvatarFallback className="bg-sky-100">
                  <img src="/logo.svg" alt="Arcyon Logo" className="h-5 w-5" />
                </AvatarFallback>
              </>
            )}
          </Avatar>
          <div className="font-medium text-xs">
            {message.role === "user" ? "Médico" : "Arcyon"}
          </div>
          
          {message.role === "assistant" && apiUsed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant={apiUsed.includes("DeepSeek") ? "amber" : "blue"} 
                    className="ml-2 px-2 py-0 h-5 flex items-center gap-1 text-[10px]"
                  >
                    {apiUsed.includes("DeepSeek") && <Brain className="h-2.5 w-2.5" />}
                    {apiUsed}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>API utilizada para gerar esta resposta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {message.role === "assistant" && (
            <>
              {shouldShowReasoningButton ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="ml-auto text-xs flex items-center gap-1"
                >
                  <Brain className="h-3 w-3 text-amber-500" />
                  {showReasoning ? "Ocultar raciocínio" : "Ver raciocínio"}
                </Button>
              ) : (
                apiUsed && apiUsed.includes("DeepSeek") && modelThinkingEnabled === false && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="ml-auto flex items-center">
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>O raciocínio do modelo está desativado nas configurações</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              )}
            </>
          )}
        </div>
        
        {/* Exibir o processo de raciocínio quando disponível e solicitado */}
        {shouldShowReasoningButton && showReasoning && (
          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md mb-3 border border-amber-100 dark:border-amber-900/30">
            <div className="text-xs font-medium mb-2 text-amber-700 dark:text-amber-300 flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Processo de Raciocínio
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
              <Markdown
                components={{
                  h1: ({ children }) => <h1 className="text-lg font-bold my-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold my-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold my-1">{children}</h3>,
                  p: ({ children }) => <p className="my-1">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="ml-1">{children}</li>,
                  code(props) {
                    const { children, className, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md text-xs my-2"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...rest} className="px-1 py-0.5 rounded bg-muted text-xs">
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.reasoningContent || dummyReasoning || ""}
              </Markdown>
            </div>
          </div>
        )}
        
        <div className="message-content pl-2 overflow-x-auto w-full text-left"> 
          {message.role === "assistant" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div 
                className="prescription-content text-sm space-y-3"
                dangerouslySetInnerHTML={{ 
                  __html: formatMedicalTable(message.content)
                  .replace(/```(\w*)([\s\S]*?)```/g, (match, lang, code) => {
                    return `<pre><code class="language-${lang || 'text'}">${code}</code></pre>`;
                  })
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                    .replace(/^- (.+)$/gm, '<li>$1</li>')
                    .replace(/<li>(.+)<\/li>/g, '<ul><li>$1</li></ul>')
                    .replace(/<\/ul>\s*<ul>/g, '')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>')
                    .replace(/^(.+)$/gm, (match, p1) => {
                      if (!p1.startsWith('<') && !p1.endsWith('>')) {
                        return `<p>${p1}</p>`;
                      }
                      return p1;
                    })
                }}
              />
            </div>
          ) : (
            <Markdown
              components={{
                h1: ({ children }) => <h1 className="text-xl font-bold my-3 text-iatros-blue dark:text-sky-300">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold my-2 text-iatros-blue dark:text-sky-300">{children}</h2>,
                h3: ({ children }) => <h3 className="text-md font-bold my-2 text-iatros-blue dark:text-sky-300">{children}</h3>,
                h4: ({ children }) => <h4 className="text-base font-semibold my-2">{children}</h4>,
                strong: ({ children }) => <strong className="font-bold text-iatros-blue dark:text-sky-300">{children}</strong>,
                p: ({ children }) => <p className="my-2">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="ml-2">{children}</li>,
                code(props) {
                  const { children, className, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <SyntaxHighlighter
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md text-sm my-3"
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
                    <div className="my-3 overflow-x-auto rounded-md border"> 
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
                  return <TableHead className="font-semibold bg-sky-50 dark:bg-sky-900/20 text-xs">{props.children}</TableHead>;
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
  );
};

export default ChatMessage;