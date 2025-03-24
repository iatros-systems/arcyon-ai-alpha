
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSubmit?: (name: string, email: string) => void;
}

const NewInviteDialog = ({ open, onOpenChange, onInviteSubmit }: NewInviteDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (onInviteSubmit) {
      onInviteSubmit(name, email);
    }
    // Limpar o formulário
    setName("");
    setEmail("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Limpar o formulário
    setName("");
    setEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Convite para Registro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome completo
            </label>
            <Input
              id="name"
              placeholder="Nome do usuário"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            Enviar Convite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewInviteDialog;
