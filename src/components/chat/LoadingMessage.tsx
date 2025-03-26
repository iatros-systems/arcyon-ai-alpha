import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingMessage = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatar o tempo para exibição
  const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 60) {
      return `${totalSeconds} segundo${totalSeconds !== 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes} minuto${minutes !== 1 ? 's' : ''} e ${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="message-container p-4 rounded-lg mb-4 shadow-sm bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 ai">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sky-100">
              <img src="/logo.svg" alt="Arcyon Logo" className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="font-medium text-xs">
            Arcyon
          </div>
        </div>
        
        <div className="message-content pl-2 overflow-x-auto w-full text-left"> 
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <span className="text-muted-foreground font-medium">Pensando</span>
              <div className="ml-1 flex">
                <span className="animate-pulse mx-[1px] h-1 w-1 rounded-full bg-sky-500 inline-block"></span>
                <span className="animate-pulse mx-[1px] h-1 w-1 rounded-full bg-sky-500 inline-block" style={{ animationDelay: '300ms' }}></span>
                <span className="animate-pulse mx-[1px] h-1 w-1 rounded-full bg-sky-500 inline-block" style={{ animationDelay: '600ms' }}></span>
              </div>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>Tempo decorrido: {formatTime(seconds)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
