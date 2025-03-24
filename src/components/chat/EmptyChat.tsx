
import React from "react";

const EmptyChat = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 rounded-full bg-iatros-lightblue dark:bg-accent/30 flex items-center justify-center mb-6 animate-pulse-slow">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-iatros-blue">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold mb-2">Assistente para Dor Torácica</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Um assistente especializado para auxiliar médicos de urgência e emergência
        a tomar decisões para pacientes com dor torácica.
      </p>
      <div className="p-4 border border-muted rounded-lg bg-muted/20 text-sm max-w-md">
        <p className="mb-2 font-medium">Como começar:</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Forneça os dados do paciente (idade, gênero, histórico)</li>
          <li>Descreva os sintomas e características da dor torácica</li>
          <li>Informe os sinais vitais e resultados de exames</li>
          <li>Receba orientações baseadas em protocolos médicos</li>
        </ol>
      </div>
    </div>
  );
};

export default EmptyChat;
