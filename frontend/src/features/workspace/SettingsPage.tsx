import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../workspace/WorkspaceContext";
import WorkspaceSettings from "../../users/WorkspaceSettings";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
//* Function for settings page
export default function SettingsPage() {
  useDocumentTitle("Settings");
  const navigate = useNavigate();
  const {
    workspaceId,
    workspace,
    members,
    channels,
    setWorkspace,
    setMembers
  } = useWorkspace();
  //* Function for this task
  return <WorkspaceSettings workspace={workspace} members={members} channels={channels} onClose={() => navigate(`/workspaces/${workspaceId}`)} onWorkspaceUpdate={ws => setWorkspace(ws)} onMembersChange={updated => setMembers(updated)} />;
}