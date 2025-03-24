
import { useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WorkspaceMembers = () => {
  const [members] = useState([
    { id: 1, name: "Dr. Romulo Farias", email: "romulo.farias@neuraliza.com", role: "Proprietário" },
    { id: 2, name: "Livia Porto", email: "livia.porto@neuraliza.com", role: "Membro" },
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Membros do espaço de trabalho</h1>
        <p className="text-muted-foreground">Gerencie quem tem acesso ao seu espaço de trabalho.</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Buscar miembros..." 
            className="pl-9" 
          />
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Invitar miembros
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Nombre</th>
              <th className="text-left py-3 px-4 font-medium">Email</th>
              <th className="text-left py-3 px-4 font-medium">Rol</th>
              <th className="text-left py-3 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t">
                <td className="py-3 px-4">{member.name}</td>
                <td className="py-3 px-4">{member.email}</td>
                <td className="py-3 px-4">{member.role}</td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm">Opciones</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkspaceMembers;
