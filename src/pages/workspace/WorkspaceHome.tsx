
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const WorkspaceHome = () => {
  const navigate = useNavigate();

  // Redirect to members page by default
  useEffect(() => {
    navigate("/workspace/members");
  }, [navigate]);

  return null;
};

export default WorkspaceHome;
