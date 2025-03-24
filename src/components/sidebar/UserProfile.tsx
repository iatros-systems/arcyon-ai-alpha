
import { cn } from "@/lib/utils";

interface UserProfileProps {
  collapsed: boolean;
}

const UserProfile = ({ collapsed }: UserProfileProps) => {
  return (
    <div className={cn("border-t p-4", collapsed && "p-2")}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-iatros-blue flex items-center justify-center text-white">
          RF
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Dr. Romulo Farias</p>
            <p className="text-xs text-muted-foreground truncate">Emergência</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
