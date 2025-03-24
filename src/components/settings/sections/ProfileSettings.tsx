
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Box, Globe, Github, Linkedin, Twitter, ExternalLink, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ProfileSettings = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Perfil de construtor</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personaliza tu perfil de constructor para conectarte con usuarios 
          de los GPT. Esta configuración se aplica en los GPT compartidos 
          públicamente.
        </p>
      </div>

      <div className="flex justify-center py-4">
        <div className="text-center">
          <Box className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-medium">SuperArcyon</h3>
          <p className="text-sm text-muted-foreground">Por Geoffrey Moraes Porto</p>
          <div className="mt-2 text-xs text-muted-foreground">Vista previa</div>
        </div>
      </div>

      <Card>
        <CardHeader className="px-4 py-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Nome</CardTitle>
            <Switch 
              checked={isEnabled} 
              onCheckedChange={setIsEnabled} 
              className="ml-auto"
            />
          </div>
        </CardHeader>
        <CardContent className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Seu nome completo" 
              value="Geoffrey Moraes Porto"
              disabled={!isEnabled}
            />
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-base font-medium mb-2">Enlaces</h3>
        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <Select>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleccionar un dominio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Site pessoal</SelectItem>
                    <SelectItem value="company">Site da empresa</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="ml-auto">Agregar</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-muted-foreground" />
                <span>LinkedIn</span>
              </div>
              <Button variant="outline" className="ml-auto">Agregar</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="h-5 w-5 text-muted-foreground" />
                <span>GitHub</span>
              </div>
              <Button variant="outline" className="ml-auto">Agregar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Twitter className="h-5 w-5 text-muted-foreground" />
                <span>X</span>
              </div>
              <Button variant="outline" className="ml-auto">Agregar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
