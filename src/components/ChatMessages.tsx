
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
}

// Função para detectar e formatar tabelas de prescrição médica
const formatMedicalTable = (content: string) => {
  // Verificar se o conteúdo contém uma tabela markdown
  if (content.includes('|') && content.includes('---')) {
    const lines = content.split('\n');
    const tableStartIndex = lines.findIndex(line => line.trim().startsWith('|'));
    
    if (tableStartIndex !== -1) {
      // Verificar se é uma tabela de condutas médicas
      const headerLine = lines[tableStartIndex].toLowerCase();
      const isMedicalTable = headerLine.includes('conduta') || 
                             headerLine.includes('dose') || 
                             headerLine.includes('medicamento') || 
                             headerLine.includes('intervalo');
      
      if (isMedicalTable) {
        // Extrair linhas da tabela
        let tableLines = [];
        let i = tableStartIndex;
        
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }
        
        // Remover a tabela original do conteúdo
        const contentBeforeTable = lines.slice(0, tableStartIndex).join('\n');
        const contentAfterTable = lines.slice(i).join('\n');
        
        // Processar cabeçalhos e linhas da tabela
        const headers = tableLines[0].split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
        
        // Pular a linha de separação (---|---)
        const dataRows = tableLines.slice(2).map(line => 
          line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim())
        );
        
        // Criar HTML para a tabela
        const tableHtml = `
        <div class="prescription-table">
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${dataRows.map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell === 'N/A' ? '-' : cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        `;
        
        // Substituir a tabela no conteúdo original
        return `${contentBeforeTable}\n\n${tableHtml}\n\n${contentAfterTable}`;
      }
    }
  }
  
  // Caso não seja uma tabela médica, continue com a detecção de prescrição
  return formatMedicalPrescription(content);
};

// Função original para detectar e formatar conteúdo de prescrição médica
const formatMedicalPrescription = (content: string) => {
  // Detectar padrões como "Condutas Iniciais:" ou listas de prescrições no formato chave: valor
  const conductPattern = /Condutas?\s+Iniciais?:|Condutas?\s*:|Prescrição:|Conduta:\s*([^\n]+)\nDose\/Comp\/Amp:/i;
  
  if (conductPattern.test(content)) {
    // Extrai pares de chave-valor no formato "Chave: Valor"
    const lines = content.split('\n');
    const prescriptionItems = [];
    
    let currentItem: {[key: string]: string} = {};
    let isCollectingPrescription = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Verifica se estamos iniciando uma seção de prescrição
      if (
        line.match(/Condutas?\s+Iniciais?:|Prescrição:|Medicamentos?:/i) || 
        line === '**Condutas Iniciais:**' || 
        line === '**Prescrição:**'
      ) {
        isCollectingPrescription = true;
        continue;
      }
      
      // Se não estamos coletando prescrição, continua
      if (!isCollectingPrescription) continue;
      
      // Verifica se a linha termina a seção de prescrição
      if (line === '' && Object.keys(currentItem).length > 0) {
        prescriptionItems.push({...currentItem});
        currentItem = {};
        continue;
      }
      
      // Se chegamos a outra seção, terminamos de coletar
      if (line.match(/^##|^#\s|^Observações:|^\*\*Observações/i) && i > 0) {
        isCollectingPrescription = false;
        continue;
      }
      
      // Extrai pares chave-valor
      const match = line.match(/^(Conduta|Dose\/Comp\/Amp|Diluição|Via de Administração|Intervalo\/horário):\s*(.+)$/i);
      if (match) {
        const [, key, value] = match;
        currentItem[key] = value;
        
        // Se tivermos todos os campos ou este é o último, adiciona o item
        const hasAllFields = ['Conduta', 'Dose/Comp/Amp', 'Diluição', 'Via de Administração', 'Intervalo/horário']
          .every(field => field in currentItem || field.toLowerCase() in currentItem);
        
        if (hasAllFields || (i === lines.length - 1)) {
          prescriptionItems.push({...currentItem});
          currentItem = {};
        }
      }
    }
    
    // Se tivermos itens de prescrição, renderiza como uma tabela personalizada
    if (prescriptionItems.length > 0) {
      const tableContent = `
        <div class="prescription-table">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="p-2 bg-muted/50 text-left font-medium">Conduta</th>
                <th class="p-2 bg-muted/50 text-left font-medium">Dose/Comp/Amp</th>
                <th class="p-2 bg-muted/50 text-left font-medium">Diluição</th>
                <th class="p-2 bg-muted/50 text-left font-medium">Via de Administração</th>
                <th class="p-2 bg-muted/50 text-left font-medium">Intervalo/horário</th>
              </tr>
            </thead>
            <tbody>
              ${prescriptionItems.map(item => `
                <tr class="border-b">
                  <td class="p-2">${item.Conduta || item.conduta || 'N/A'}</td>
                  <td class="p-2">${item['Dose/Comp/Amp'] || item['dose/comp/amp'] || 'N/A'}</td>
                  <td class="p-2">${item.Diluição || item.diluição || 'N/A'}</td>
                  <td class="p-2">${item['Via de Administração'] || item['via de administração'] || 'N/A'}</td>
                  <td class="p-2">${item['Intervalo/horário'] || item['intervalo/horário'] || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      // Substitui a seção de prescrição pela tabela formatada
      return content.replace(
        new RegExp(`(Condutas?\\s+Iniciais?:|Prescrição:|Medicamentos?:)[\\s\\S]*?(##|#\\s|Observações:|$)`, 'i'),
        (match, prefix, suffix) => {
          return `**Condutas Iniciais:**\n\n${tableContent}\n\n${suffix}`;
        }
      );
    }
  }
  
  return content;
};

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
            <div className="p-4 border border-muted rounded-lg bg-muted/20 text-sm max-w-md">
              <p className="mb-2 font-medium">Como começar:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Forneça os dados do paciente (idade, gênero, histórico)</li>
                <li>Descreva os sintomas e características da dor torácica</li>
                <li>Informe os sinais vitais e resultados de exames</li>
                <li>Receba orientações baseadas em protocolos médicos</li>
              </ol>
            </div>
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
                      {message.role === "user" ? "Médico" : "Arcyon"}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {message.role === "assistant" ? (
                        <div 
                          className="prescription-content"
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
                    <div className="font-medium mb-1">Arcyon</div>
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
