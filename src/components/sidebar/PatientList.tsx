
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface PatientListProps {
  collapsed: boolean;
}

const PatientList = ({ collapsed }: PatientListProps) => {
  return (
    <div className="flex flex-col gap-2 p-4">
      <Button className={cn("w-full justify-start gap-2", collapsed && "justify-center p-2")} variant="outline">
        <FolderPlus className="h-4 w-4" />
        {!collapsed && <span>Adicionar paciente</span>}
      </Button>
      {!collapsed && (
        <>
          <Separator className="my-2" />
          <div className="flex flex-col gap-1 text-center text-muted-foreground text-sm">
            <p>Nenhum paciente cadastrado</p>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientList;
