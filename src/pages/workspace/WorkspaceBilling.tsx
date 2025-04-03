
import { ChevronDown, ExternalLink, CreditCard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const WorkspaceBilling = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Cobrança</h1>
        <p className="text-muted-foreground">Somente os proprietários do espaço de trabalho podem ver e modificar a configuração.</p>
      </div>

      <Separator className="mb-8" />

      <div className="space-y-8">
        {/* Plan Section */}
        <div>
          <h2 className="text-xl font-bold mb-6">Plano</h2>
          
          <div className="space-y-6">
            {/* License Information */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold mb-1">Licença de Time</h3>
                <p className="text-sm text-muted-foreground">Se renova em 14 de abril de 2025</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ChevronDown className="h-4 w-4" />
                    Administrar licença
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Forma de pagamento</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Cronograma de Cobrança</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                    <span>Cancelar assinatura</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Participants Information */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold mb-1">Participantes</h3>
                <p className="text-sm text-muted-foreground">2/2 participantes em uso</p>
                <div className="flex gap-1 mt-2">
                  <div className="h-6 w-6 rounded-full bg-green-500"></div>
                  <div className="h-6 w-6 rounded-full bg-green-500"></div>
                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground">
                    <span className="text-xl">...</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Administrar participantes
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Invoices Section */}
        <div>
          <h2 className="text-xl font-bold mb-6">Faturas</h2>
          
          <div className="space-y-4">
            {/* Each invoice item */}
            <InvoiceItem 
              date="14 de março de 2025" 
              paymentDate="14 de março de 2025" 
            />
            
            <Separator />
            
            <InvoiceItem 
              date="14 de fevereiro de 2025" 
              paymentDate="14 de fevereiro de 2025" 
            />
            
            <Separator />
            
            <InvoiceItem 
              date="14 de janeiro de 2025" 
              paymentDate="14 de janeiro de 2025" 
            />
            
            <Separator />
            
            <InvoiceItem 
              date="14 de dezembro de 2024" 
              paymentDate="14 de dezembro de 2024" 
            />
            
            <Separator />
            
            <InvoiceItem 
              date="14 de novembro de 2024" 
              paymentDate="14 de novembro de 2024" 
            />
            
            <div className="flex justify-end mt-4">
              <Button variant="ghost" size="sm">
                <span>Ver mais</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface InvoiceItemProps {
  date: string;
  paymentDate: string;
}

const InvoiceItem = ({ date, paymentDate }: InvoiceItemProps) => {
  return (
    <div className="flex justify-between items-start py-2">
      <div>
        <h3 className="font-medium">Fatura: {date}</h3>
        <p className="text-sm text-muted-foreground">Pagada: {paymentDate}</p>
      </div>
      <Button variant="ghost" size="sm" className="text-muted-foreground">
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WorkspaceBilling;
