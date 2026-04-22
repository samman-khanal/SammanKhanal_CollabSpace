import { useEffect, useRef, useState } from "react";
import { useParams, useOutletContext, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useWorkspace } from "../workspace/WorkspaceContext";
import KanbanBoard from "../../users/KanbanBoard";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
//* Function for board page
export default function BoardPage() {
  useDocumentTitle("Boards");
  const {
    boardId
  } = useParams<{
    boardId: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const {
    workspaceId,
    members,
    setSidebarBoards
  } = useWorkspace();
  const {
    setIsSidebarOpen
  } = useOutletContext<{
    isSidebarOpen: boolean;
    setIsSidebarOpen: (v: boolean) => void;
  }>();
  const [viewAllKey, setViewAllKey] = useState(0);
  //* Function for this task
  const [showCreate, setShowCreate] = useState(() => {
    return navigationType === "PUSH" && !!(location.state as Record<string, unknown> | null)?.showCreate;
  });
  const clearedRef = useRef(false);
  //* Function for this task
  useEffect(() => {
    if (clearedRef.current) return;
    clearedRef.current = true;
    if ((location.state as Record<string, unknown> | null)?.showCreate) {
      navigate(location.pathname, {
        replace: true,
        state: {}
      });
    }
  }, []);
  //* Function for this task
  useEffect(() => {
    if (!boardId) {
      //* Function for this task
      setViewAllKey(k => k + 1);
    }
  }, [location.key, boardId]);
  //* Function for this task
  return <KanbanBoard workspaceId={workspaceId} members={members} onOpenSidebar={() => setIsSidebarOpen(true)} initialBoardId={boardId || null} showAllKey={boardId ? undefined : viewAllKey} onBoardsChange={boards => setSidebarBoards(boards)} initialShowCreate={showCreate} onCreateHandled={() => setShowCreate(false)} />;
}