
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";

const WorkspaceGpt = () => {
  const [selectedTab, setSelectedTab] = useState<'espaco-trabalho' | 'atribuir'>('espaco-trabalho');

  // Dados simulados para a tabela
  const gptData = [
    { 
      id: 1, 
      nome: '',  // Vazio para o primeiro item
      constructor: 'Geoffrey Mo...', 
      acesso: 'Solo com convite', 
      chats: 0, 
      criado: 'Mar 16', 
      atualizado: 'Mar 16' 
    },
    { 
      id: 2, 
      nome: 'IatrosGPT', 
      constructor: 'Geoffrey Mo...', 
      acesso: 'Enlace', 
      chats: 10, 
      criado: 'Mar 12', 
      atualizado: 'Mar 12' 
    },
    { 
      id: 3, 
      nome: 'Neuraliza - Humancare', 
      constructor: 'Geoffrey Mo...', 
      acesso: 'Público', 
      chats: 7, 
      criado: 'Nov 20', 
      atualizado: 'Jan 30' 
    },
    { 
      id: 4, 
      nome: 'Neuraliza - Veteraliza.ai', 
      constructor: 'Geoffrey Mo...', 
      acesso: 'Público', 
      chats: 2, 
      criado: 'Nov 20', 
      atualizado: 'Oct 24' 
    },
  ];

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Terceiros</h1>
        <p className="text-muted-foreground">
          Administra se los membros podem usar Arcyon AI criados fora do seu espaço de trabalho.
        </p>

        <div className="w-44">
          <Button variant="outline" className="w-full justify-between">
            Permitir todo
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <h2 className="text-2xl font-bold mt-8">Arcyon AI</h2>
        
        <div className="border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedTab('espaco-trabalho')}
              className={`pb-2 font-medium ${
                selectedTab === 'espaco-trabalho'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Espaço de trabalho
            </button>
            <button
              onClick={() => setSelectedTab('atribuir')}
              className={`pb-2 font-medium ${
                selectedTab === 'atribuir'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Sin asignar
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Constructor</TableHead>
              <TableHead>Acciones personalizadas</TableHead>
              <TableHead>Quién tiene acceso</TableHead>
              <TableHead>Chats</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Actualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gptData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded-md flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">AI</span>
                  </div>
                  {row.nome}
                </TableCell>
                <TableCell>{row.constructor}</TableCell>
                <TableCell></TableCell>
                <TableCell>{row.acesso}</TableCell>
                <TableCell>{row.chats}</TableCell>
                <TableCell>{row.criado}</TableCell>
                <TableCell className="text-right">{row.atualizado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WorkspaceGpt;
