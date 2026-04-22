import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { CallModal } from "../../components/ui/CallModal";
import { CommandPalette } from "../../components/ui/CommandPalette";
import { useWebRTCCall } from "../../hooks/useWebRTCCall";
import { useWorkspace, getInitials } from "./WorkspaceContext";
import WorkspaceSidebar from "./WorkspaceSidebar";
//* Function for workspace layout
export default function WorkspaceLayout() {
  const {
    members
  } = useWorkspace();
  const call = useWebRTCCall();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  //* Function for this task
  useEffect(() => {
    //* Function for handler
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        //* Function for handler
        setIsCommandOpen(v => !v);
      }
    };
    document.addEventListener("keydown", handler);
    //* Function for this task
    return () => document.removeEventListener("keydown", handler);
  }, []);
  const SIDEBAR_MIN = 260;
  const SIDEBAR_MAX = 480;
  const SIDEBAR_DEFAULT = 305;
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const isResizing = useRef(false);
  //* Function for handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    //* Function for on mouse move
    const onMouseMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, ev.clientX));
      setSidebarWidth(newWidth);
    };
    //* Function for on mouse up
    const onMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      //* Function for on mouse up
      setSidebarWidth(w => w);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);
  //* Function for call peer name
  const callPeerName = (() => {
    if (!call.peerUserId) return "User";
    //* Function for member
    const member = members.find(m => m.user?._id === call.peerUserId);
    return member?.user?.fullName || "User";
  })();
  const callPeerInitials = getInitials(callPeerName);
  //* Function for handle hangup
  const handleHangup = useCallback(() => {
    if (call.status === "incoming") {
      call.rejectCall("declined");
      return;
    }
    call.endCall("hangup");
  }, [call]);
  //* Function for this task
  return <div className="h-screen bg-white dark:bg-slate-900 flex overflow-hidden">
      {}
      <WorkspaceSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} sidebarWidth={sidebarWidth} onOpenCommandPalette={() => setIsCommandOpen(true)} />

      {}
      <div onMouseDown={handleMouseDown} className="hidden lg:flex w-1 hover:w-1.5 cursor-col-resize items-center justify-center group z-40 shrink-0 transition-all">
        
        <div className="w-0.5 h-8 rounded-full bg-slate-300 dark:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {}
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />}

      {}
      <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
        <Outlet context={{
        isSidebarOpen,
        setIsSidebarOpen,
        call
      }} />
      </div>

      {}
      <CallModal open={call.status !== "idle"} status={call.status} type={call.type} peerName={callPeerName} peerInitials={callPeerInitials} error={call.error} localStream={call.localStream} remoteStream={call.remoteStream} micEnabled={call.micEnabled} camEnabled={call.camEnabled} onAccept={() => call.acceptCall()} onReject={() => call.rejectCall("declined")} onHangup={handleHangup} onToggleMic={() => call.toggleMic()} onToggleCam={() => call.toggleCam()} />

      {}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>;
}