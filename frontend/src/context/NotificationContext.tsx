import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getSocket, EVENTS } from "../services/socket.service";
import notificationService, { type Notification } from "../services/notification.service";
//* Function for request browser permission
function requestBrowserPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}
//* Function for show browser notification
function showBrowserNotification(title: string, body: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.hasFocus()) return;
  try {
    const n = new window.Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "collabspace-notif"
    });
    //* Function for onclick
    n.onclick = () => {
      window.focus();
      n.close();
    };
    //* Function for this task
    setTimeout(() => n.close(), 6000);
  } catch {}
}
//* Function for notif title
function notifTitle(type: string): string {
  switch (type) {
    case "dm_message":
      return "New Direct Message";
    case "mention":
      return "You were mentioned";
    case "task_assigned":
      return "Task Assigned";
    case "task_comment":
      return "New Comment";
    case "board_created":
      return "New Board";
    case "board_deleted":
      return "Board Deleted";
    case "channel_created":
      return "New Channel";
    case "channel_deleted":
      return "Channel Deleted";
    case "member_joined":
      return "New Member";
    case "member_removed":
      return "Member Removed";
    case "role_changed":
      return "Role Changed";
    default:
      return "Notification";
  }
}
interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearRead: () => Promise<void>;
}
const NotificationCtx = createContext<NotificationContextValue | null>(null);
//* Function for use notifications
export function useNotifications() {
  const ctx = useContext(NotificationCtx);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
//* Function for notification provider
export function NotificationProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const {
    isAuthenticated
  } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const initialLoadDone = useRef(false);
  //* Function for unread count
  const unreadCount = notifications.filter(n => !n.readAt).length;
  //* Function for refresh
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await notificationService.list();
      setNotifications(data);
    } catch {} finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  //* Function for this task
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      initialLoadDone.current = false;
      return;
    }
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      refresh();
    }
  }, [isAuthenticated, refresh]);
  //* Function for this task
  useEffect(() => {
    if (!isAuthenticated) return;
    requestBrowserPermission();
    const socket = getSocket();
    //* Function for on new notif
    const onNewNotif = (notif: Notification) => {
      //* Function for on new notif
      setNotifications(prev => {
        if (prev.some(n => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
      showBrowserNotification(notifTitle(notif.type), notif.message);
    };
    socket.on(EVENTS.NOTIFICATION_NEW, onNewNotif);
    //* Function for this task
    return () => {
      socket.off(EVENTS.NOTIFICATION_NEW, onNewNotif);
    };
  }, [isAuthenticated]);
  //* Function for mark read
  const markRead = useCallback(async (id: string) => {
    //* Function for mark read
    setNotifications(prev => prev.map(n => n._id === id ? {
      ...n,
      readAt: n.readAt ?? new Date().toISOString()
    } : n));
    try {
      await notificationService.markRead(id);
    } catch {
      refresh();
    }
  }, [refresh]);
  //* Function for mark all read
  const markAllRead = useCallback(async () => {
    //* Function for mark all read
    setNotifications(prev => prev.map(n => ({
      ...n,
      readAt: n.readAt ?? new Date().toISOString()
    })));
    try {
      await notificationService.markAllRead();
    } catch {
      refresh();
    }
  }, [refresh]);
  //* Function for remove notification
  const removeNotification = useCallback(async (id: string) => {
    //* Function for remove notification
    setNotifications(prev => prev.filter(n => n._id !== id));
    try {
      await notificationService.remove(id);
    } catch {
      refresh();
    }
  }, [refresh]);
  //* Function for clear read
  const clearRead = useCallback(async () => {
    //* Function for clear read
    setNotifications(prev => prev.filter(n => !n.readAt));
    try {
      await notificationService.removeAllRead();
    } catch {
      refresh();
    }
  }, [refresh]);
  return <NotificationCtx.Provider value={{
    notifications,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
    removeNotification,
    clearRead
  }}>
      
      {children}
    </NotificationCtx.Provider>;
}