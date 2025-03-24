
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const NotificationsSettings = () => {
  const [notificationType, setNotificationType] = useState<string>("push");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Notificações</h2>
      
      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">Tarefas</CardTitle>
              <CardDescription className="text-xs">
                Receba notificações sobre novas tarefas e atualizações do Arcyon
              </CardDescription>
            </div>
            
            <Select
              value={notificationType}
              onValueChange={setNotificationType}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="push">
                  <div className="flex items-center justify-between w-full">
                    <span>Push</span>
                    {notificationType === "push" && (
                      <Check className="h-4 w-4 ml-2" />
                    )}
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center justify-between w-full">
                    <span>Correo electrónico</span>
                    {notificationType === "email" && (
                      <Check className="h-4 w-4 ml-2" />
                    )}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default NotificationsSettings;
