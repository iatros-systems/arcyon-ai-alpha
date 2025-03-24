
import { useState } from "react";
import { Mail, Star, MoreVertical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dados de exemplo para os convites
const inviteData = [
  { 
    id: 1, 
    name: "Geoffrey Porto", 
    email: "geoffreyporto@gmail.com", 
    date: "21/03/2025 às 19:00", 
    status: "Pendente", 
    favorite: false 
  },
  { 
    id: 2, 
    name: "Plivia Porto", 
    email: "geoffreyporto@gmail.com", 
    date: "21/03/2025 às 19:52", 
    status: "Pendente", 
    favorite: false 
  }
];

const InvitesSettings = () => {
  const [invites, setInvites] = useState(inviteData);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar convites com base na busca e na opção de favoritos
  const filteredInvites = invites.filter(invite => {
    const matchesSearch = searchQuery === "" || 
      invite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invite.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFavorite = !showFavoritesOnly || invite.favorite;
    
    return matchesSearch && matchesFavorite;
  });

  // Alternar estado de favorito
  const toggleFavorite = (id: number) => {
    setInvites(invites.map(invite => 
      invite.id === id ? { ...invite, favorite: !invite.favorite } : invite
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Convites para registro</h2>
        <Button className="gap-2">
          <Mail className="h-4 w-4" />
          Novo Convite
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar convites..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox 
            id="favorites" 
            checked={showFavoritesOnly} 
            onCheckedChange={(checked) => setShowFavoritesOnly(checked === true)}
          />
          <label htmlFor="favorites" className="text-sm flex items-center cursor-pointer">
            <Star className="mr-1 h-4 w-4" />
            Favoritos
          </label>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-14">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => toggleFavorite(invite.id)}
                >
                  <Star
                    className={`h-4 w-4 ${invite.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                </Button>
              </TableCell>
              <TableCell>{invite.name}</TableCell>
              <TableCell>{invite.email}</TableCell>
              <TableCell>{invite.date}</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  {invite.status}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Reenviar</DropdownMenuItem>
                    <DropdownMenuItem>Copiar link</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Cancelar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Card className="mt-8 bg-blue-50 border-blue-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Como funciona?</h3>
          <div className="space-y-1 text-sm text-blue-700">
            <p>O fluxo de convites permite adicionar novos usuários ao sistema de forma segura:</p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Crie um convite e o sistema enviará um email com link seguro e código OTP ao usuário</li>
              <li>O usuário recebe o email e clica no link, sendo redirecionado para a página de validação</li>
              <li>Após validar o código OTP, o usuário pode criar sua conta com uma senha segura</li>
              <li>O sistema registra a conta e marca o convite como "usado"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitesSettings;
