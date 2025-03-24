
import { Outlet } from "react-router-dom";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

interface WorkspaceLayoutProps {
  activeSection?: string;
}

const WorkspaceLayout = ({ activeSection }: WorkspaceLayoutProps) => {
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
