
import { useState } from "react";
import { ArrowLeft, MoreHorizontal, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Tipo para membros do workspace
interface Member {
  id: string;
  name: string;
  email: string;
  role: "Proprietário" | "Membro";
  isTu?: boolean;
}

const WorkspaceMembers = () => {
  // Estado para os membros
  const [members] = useState<Member[]>([
    {
      id: "1",
      name: "Geoffrey Moraes Porto",
      email: "geoffreyporto@gmail.com",
      role: "Proprietário",
      isTu: true,
    },
    {
      id: "2",
      name: "Plivia Porto",
      email: "pliviaporto@gmail.com",
      role: "Membro",
    },
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container py-4">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="mb-4 gap-1 text-muted-foreground"
          >
            <Link to="/chat">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao chat
            </Link>
          </Button>

          <div className="mt-6 flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Membros</h1>
            <p className="text-muted-foreground">Team · 2 membros</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        <Tabs defaultValue="todos">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <TabsList className="bg-muted rounded-full h-10">
              <TabsTrigger value="todos" className="rounded-full">
                Todos os membros
              </TabsTrigger>
              <TabsTrigger value="pendentes" className="rounded-full">
                Invitações pendentes
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar"
                  className="pl-8 w-full md:w-[200px]"
                />
              </div>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Invitar a un miembro
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <TabsContent value="todos" className="mt-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Correo electrónico</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.name}
                        {member.isTu && (
                          <span className="ml-2 text-xs text-muted-foreground rounded-sm inline-block">
                            (Tú)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Select defaultValue={member.role.toLowerCase()}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="proprietário">Proprietário</SelectItem>
                            <SelectItem value="membro">Membro</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Remover do espaço</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6">
              <Button variant="outline" className="gap-1">
                <Plus className="h-4 w-4" />
                Invitar a un miembro
              </Button>
            </div>

            <div className="mt-8 text-sm text-muted-foreground border-t pt-4">
              <p>
                Aviso: Aunque los nuevos miembros del espacio de trabajo pueden acceder a Arcyon de forma inmediata, pueden pasar hasta 24 horas para que aparezcan en esta lista.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="pendentes" className="mt-0">
            <div className="rounded-md border p-8 text-center">
              <p className="text-muted-foreground">
                Não há convites pendentes no momento.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default WorkspaceMembers;
