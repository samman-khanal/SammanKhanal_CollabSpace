import { useNavigate, useOutletContext } from "react-router-dom";
import { useWorkspace } from "../workspace/WorkspaceContext";
import UserPreferences from "../../users/UserPreferences";
//* Function for preferences page
export default function PreferencesPage() {
  const navigate = useNavigate();
  const {
    workspaceId
  } = useWorkspace();
  const {
    setIsSidebarOpen
  } = useOutletContext<{
    setIsSidebarOpen: (v: boolean) => void;
  }>();
  //* Function for this task
  return <UserPreferences onBack={() => navigate(`/workspaces/${workspaceId}`)} onOpenSidebar={() => setIsSidebarOpen(true)} />;
}