
import { ArrowLeft, Edit, Users, FileText, DollarSign, Settings, FolderClosed, BarChart2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface WorkspaceSidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const WorkspaceSidebarItem = ({ icon, label, href, isActive = false, onClick }: WorkspaceSidebarItemProps) => {
  const content = (
    <div 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
        isActive ? "bg-muted" : "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
};

interface WorkspaceSidebarProps {
  activeSection?: string;
}

const WorkspaceSidebar = ({ activeSection = "members" }: WorkspaceSidebarProps) => {
  return (
    <div className="w-60 h-screen border-r flex flex-col bg-background">
      <div className="p-4">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="mb-4 gap-1 text-muted-foreground w-full justify-start"
        >
          <Link to="/chat">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao chat
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-6 mt-8">
          <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <span className="text-xl">A</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Arcyon</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-3 space-y-1 mb-2">
          <WorkspaceSidebarItem 
            icon={<Users className="h-4 w-4" />} 
            label="Membros" 
            href="/workspace/members"
            isActive={activeSection === "members"}
          />
          <WorkspaceSidebarItem 
            icon={<FileText className="h-4 w-4" />} 
            label="Cobrança" 
            href="/workspace/billing"
            isActive={activeSection === "billing"}
          />
          <WorkspaceSidebarItem 
            icon={<DollarSign className="h-4 w-4" />} 
            label="Arcyon AI" 
            href="/workspace/gpt"
            isActive={activeSection === "gpt"}
          />
          <WorkspaceSidebarItem 
            icon={<Settings className="h-4 w-4" />} 
            label="Configuração" 
            href="/workspace/settings"
            isActive={activeSection === "settings"}
          />
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="px-3 space-y-1">
            <WorkspaceSidebarItem 
              icon={<FolderClosed className="h-4 w-4" />} 
              label="Grupos" 
              href="/workspace/groups"
              isActive={activeSection === "groups"}
            />
            <WorkspaceSidebarItem 
              icon={<BarChart2 className="h-4 w-4" />} 
              label="Análises" 
              href="/workspace/analytics"
              isActive={activeSection === "analytics"}
            />
            <WorkspaceSidebarItem 
              icon={<ShieldCheck className="h-4 w-4" />} 
              label="Identidade e provisionamento" 
              href="/workspace/identity"
              isActive={activeSection === "identity"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSidebar;
