
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LoadingMessage = () => {
  return (
    <div className="message-container p-4 rounded-lg ai">
      <div className="flex gap-2">
        <div className="flex items-start">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src="/lovable-uploads/9c6a7a02-a819-4f62-bfda-f4c27c57306f.png" 
                alt="Arcyon Logo" 
              />
              <AvatarFallback className="bg-sky-100">
                <img 
                  src="/lovable-uploads/9c6a7a02-a819-4f62-bfda-f4c27c57306f.png" 
                  alt="Arcyon Logo" 
                  className="h-4 w-4" 
                />
              </AvatarFallback>
            </Avatar>
            <div className="font-medium">Arcyon</div>
          </div>
        </div>
        <div className="flex-1">
          <div className="typing-indicator text-muted-foreground">Pensando</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
