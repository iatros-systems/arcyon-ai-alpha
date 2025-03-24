
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const AppsSettings = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Aplicações conectadas</h2>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Cargas de arquivos</CardTitle>
          <CardDescription>
            Estas aplicações te permitirão agregar arquivos às mensagens do Arcyon.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {/* Google Drive */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8">
                  <svg viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Google Drive</h3>
                  <p className="text-sm text-muted-foreground">
                    Carrega arquivos de Google Docs, Sheets, Slides e outros.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                Desconectar
              </Button>
            </div>
            
            {/* Microsoft OneDrive Personal */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M10.5 18.5h2c0 .55-.45 1-1 1s-1-.45-1-1z" fill="#0364b8"/>
                    <path d="M9.236 18.5h7.527l-5.527-3-6 3z" fill="#0078d4"/>
                    <path d="M1.5 15l4.236 3.5 5.764-3v-4z" fill="#1490df"/>
                    <path d="M11.5 8v7.5l6 3 5-3v-7.5z" fill="#28a8ea"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Microsoft OneDrive (pessoal)</h3>
                  <p className="text-sm text-muted-foreground">
                    Carrega arquivos de Microsoft Word, Excel, PowerPoint e outros.
                  </p>
                </div>
              </div>
              <Button variant="outline">
                Conectar
              </Button>
            </div>
            
            {/* Microsoft OneDrive Work */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M10.5 18.5h2c0 .55-.45 1-1 1s-1-.45-1-1z" fill="#0364b8"/>
                    <path d="M9.236 18.5h7.527l-5.527-3-6 3z" fill="#0078d4"/>
                    <path d="M1.5 15l4.236 3.5 5.764-3v-4z" fill="#1490df"/>
                    <path d="M11.5 8v7.5l6 3 5-3v-7.5z" fill="#28a8ea"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Microsoft OneDrive (trabalho/escola)</h3>
                  <p className="text-sm text-muted-foreground">
                    Carrega arquivos de Microsoft Word, Excel, PowerPoint e mais, incluídos arquivos de sites de SharePoint.
                  </p>
                </div>
              </div>
              <Button variant="outline">
                Conectar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppsSettings;
