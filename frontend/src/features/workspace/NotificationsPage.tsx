import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../workspace/WorkspaceContext";
import Notifications from "../../users/Notifications";
//* Function for notifications page
export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    workspaceId
  } = useWorkspace();
  //* Function for this task
  return <Notifications onBack={() => navigate(`/workspaces/${workspaceId}`)} />;
}