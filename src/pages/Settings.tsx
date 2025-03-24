
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Key, MessageSquare, FileText, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiSettingsTab from "@/components/settings/ApiSettingsTab";
import ModelSettingsTab from "@/components/settings/ModelSettingsTab";
import PromptSettingsTab from "@/components/settings/PromptSettingsTab";
import SecuritySettingsTab from "@/components/settings/SecuritySettingsTab";

const Settings = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>
      
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="api">
            <Key className="mr-2 h-4 w-4" />
            API e Conexão
          </TabsTrigger>
          <TabsTrigger value="model">
            <MessageSquare className="mr-2 h-4 w-4" />
            Configurações do Modelo
          </TabsTrigger>
          <TabsTrigger value="prompt">
            <FileText className="mr-2 h-4 w-4" />
            Prompt do Sistema
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api">
          <ApiSettingsTab navigate={navigate} />
        </TabsContent>
        
        <TabsContent value="model">
          <ModelSettingsTab />
        </TabsContent>
        
        <TabsContent value="prompt">
          <PromptSettingsTab />
        </TabsContent>
        
        <TabsContent value="security">
          <SecuritySettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
