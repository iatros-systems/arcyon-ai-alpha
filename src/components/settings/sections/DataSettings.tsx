
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SharedLinksDialog from "../SharedLinksDialog";

const DataSettings = () => {
  const [sharedLinksOpen, setSharedLinksOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Controles de dados</h2>
      
      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">Melhora o modelo para todos</CardTitle>
              <CardDescription className="text-xs">
                Permitir que o Arcyon use suas conversas para melhorar o modelo para todos
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="improve-model" />
              <Label htmlFor="improve-model" className="text-sm text-muted-foreground">
                Desativado
              </Label>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">Enlaces compartilhados</CardTitle>
              <CardDescription className="text-xs">
                Gerenciar links de conversas do Arcyon que você compartilhou
              </CardDescription>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSharedLinksOpen(true)}
            >
              Administrar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Shared Links Dialog */}
      <SharedLinksDialog open={sharedLinksOpen} onOpenChange={setSharedLinksOpen} />
    </div>
  );
};

export default DataSettings;
