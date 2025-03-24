
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

const LoadingMessage = () => {
  return (
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
  );
};

export default LoadingMessage;
