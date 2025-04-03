
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link, Trash2, MoreHorizontal } from "lucide-react";

interface SharedLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SharedLinksDialog = ({ open, onOpenChange }: SharedLinksDialogProps) => {
  const sharedLinks = [
    { 
      name: "Dor torácica avaliação", 
      type: "Chat", 
      date: "16 de março de 2025" 
    },
    { 
      name: "Benefícios de Governanza de Datos", 
      type: "Chat", 
      date: "20 de noviembre de 2023" 
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Enlaces compartilhados</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Datos compartidos</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sharedLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="flex items-center">
                    <Link className="h-4 w-4 mr-2 text-blue-600" />
                    {link.name}
                  </TableCell>
                  <TableCell>{link.type}</TableCell>
                  <TableCell>{link.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <span className="sr-only">Copiar link</span>
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <span className="sr-only">Excluir</span>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <span className="sr-only">Mais opções</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharedLinksDialog;
