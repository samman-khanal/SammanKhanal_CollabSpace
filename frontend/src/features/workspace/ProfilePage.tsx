import { useNavigate, useOutletContext } from "react-router-dom";
import { useWorkspace } from "../workspace/WorkspaceContext";
import UserProfile from "../../users/UserProfile";
//* Function for profile page
export default function ProfilePage() {
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
  return <UserProfile onBack={() => navigate(`/workspaces/${workspaceId}`)} onOpenSidebar={() => setIsSidebarOpen(true)} />;
}