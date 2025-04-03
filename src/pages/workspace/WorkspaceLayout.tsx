
import { Outlet, useLocation } from "react-router-dom";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

interface WorkspaceLayoutProps {
  activeSection?: string;
}

const WorkspaceLayout = ({ activeSection: propActiveSection }: WorkspaceLayoutProps) => {
  const location = useLocation();
  
  // Extrair a seção ativa da rota
  let pathActiveSection = location.pathname.split('/')[2] || 'home';
  const activeSection = propActiveSection || pathActiveSection;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar activeSection={activeSection} />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default WorkspaceLayout;
