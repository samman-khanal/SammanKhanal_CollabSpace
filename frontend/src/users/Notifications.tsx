import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ArrowLeft, Bell, BellOff, CheckCheck, AtSign, MessageSquare, Hash, Loader2, LayoutDashboard, Users, UserPlus, UserMinus, Shield, ClipboardList, MessageCircle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "../context/NotificationContext";
import type { Notification } from "../services/notification.service";
//* Function for time ago
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}
//* Function for full time
function fullTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
//* Function for get initials
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};
type Category = "messages" | "tasks" | "workspace" | "other";
const TYPE_CONFIG: Record<string, {
  icon: typeof Bell;
  color: string;
  bgColor: string;
  category: Category;
  label: string;
}> = {
  dm_message: {
    icon: MessageSquare,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    category: "messages",
    label: "Direct Message"
  },
  mention: {
    icon: AtSign,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    category: "messages",
    label: "Mention"
  },
  task_assigned: {
    icon: ClipboardList,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    category: "tasks",
    label: "Task Assigned"
  },
  task_comment: {
    icon: MessageCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    category: "tasks",
    label: "Comment"
  },
  board_created: {
    icon: LayoutDashboard,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    category: "workspace",
    label: "Board Created"
  },
  board_deleted: {
    icon: LayoutDashboard,
    color: "text-red-500",
    bgColor: "bg-red-50",
    category: "workspace",
    label: "Board Deleted"
  },
  channel_created: {
    icon: Hash,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    category: "workspace",
    label: "Channel Created"
  },
  channel_deleted: {
    icon: Hash,
    color: "text-red-500",
    bgColor: "bg-red-50",
    category: "workspace",
    label: "Channel Deleted"
  },
  member_joined: {
    icon: UserPlus,
    color: "text-green-600",
    bgColor: "bg-green-50",
    category: "workspace",
    label: "Member Joined"
  },
  member_removed: {
    icon: UserMinus,
    color: "text-red-500",
    bgColor: "bg-red-50",
    category: "workspace",
    label: "Member Removed"
  },
  role_changed: {
    icon: Shield,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    category: "workspace",
    label: "Role Changed"
  }
};
const DEFAULT_CONFIG = {
  icon: Bell,
  color: "text-slate-500",
  bgColor: "bg-slate-50",
  category: "other" as Category,
  label: "Notification"
};
//* Function for get config
function getConfig(type: string) {
  return TYPE_CONFIG[type] || DEFAULT_CONFIG;
}
//* Function for use reveal
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  //* Function for this task
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let observer: IntersectionObserver;
    //* Function for raf
    const raf = requestAnimationFrame(() => {
      //* Function for observer
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      }, {
        threshold
      });
      observer.observe(el);
    });
    //* Function for this task
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [threshold]);
  return {
    ref,
    visible
  };
}
//* Function for reveal
function Reveal({
  children,
  className = "",
  delay = 0,
  from = "bottom"
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "right";
}) {
  const {
    ref,
    visible
  } = useReveal();
  const hidden = from === "left" ? "-translate-x-6" : from === "right" ? "translate-x-6" : "translate-y-6";
  return <div ref={ref} className={`transition-all duration-500 ${visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${hidden}`} ${className}`} style={{
    transitionDelay: `${delay}ms`
  }}>
      
      {children}
    </div>;
}
const CATEGORY_META: {
  key: Category;
  label: string;
  icon: typeof Bell;
}[] = [{
  key: "messages",
  label: "Messages & Mentions",
  icon: MessageSquare
}, {
  key: "tasks",
  label: "Tasks",
  icon: ClipboardList
}, {
  key: "workspace",
  label: "Workspace Activity",
  icon: Users
}, {
  key: "other",
  label: "Other",
  icon: Bell
}];
type Filter = "all" | "unread" | "messages" | "tasks" | "workspace";
interface NotificationsProps {
  onBack: () => void;
}
//* Function for notifications
export default function Notifications({
  onBack
}: NotificationsProps) {
  useDocumentTitle("Notifications");
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    removeNotification,
    clearRead,
    refresh
  } = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [mounted, setMounted] = useState(false);
  //* Function for this task
  useEffect(() => {
    refresh();
    //* Function for t
    const t = setTimeout(() => setMounted(true), 10);
    //* Function for this task
    return () => clearTimeout(t);
  }, [refresh]);
  //* Function for msg count
  const msgCount = notifications.filter(n => getConfig(n.type).category === "messages").length;
  //* Function for task count
  const taskCount = notifications.filter(n => getConfig(n.type).category === "tasks").length;
  //* Function for ws count
  const wsCount = notifications.filter(n => getConfig(n.type).category === "workspace").length;
  //* Function for displayed
  const displayed = useMemo(() => {
    let list = notifications;
    if (filter === "unread") //* Function for list
      list = list.filter(n => !n.readAt);else if (filter === "messages") //* Function for list
      list = list.filter(n => getConfig(n.type).category === "messages");else if (filter === "tasks") //* Function for list
      list = list.filter(n => getConfig(n.type).category === "tasks");else if (filter === "workspace") //* Function for list
      list = list.filter(n => getConfig(n.type).category === "workspace");
    return list;
  }, [notifications, filter]);
  //* Function for grouped
  const grouped = useMemo(() => {
    const map: Record<Category, Notification[]> = {
      messages: [],
      tasks: [],
      workspace: [],
      other: []
    };
    //* Function for grouped
    displayed.forEach(n => map[getConfig(n.type).category].push(n));
    return map;
  }, [displayed]);
  //* Function for handle mark all read
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Couldn't mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };
  //* Function for handle clear read
  const handleClearRead = async () => {
    try {
      await clearRead();
      toast.success("Cleared read notifications");
    } catch {
      toast.error("Failed to clear");
    }
  };
  const filters: {
    key: Filter;
    label: string;
    count?: number;
  }[] = [{
    key: "all",
    label: "All",
    count: notifications.length
  }, {
    key: "unread",
    label: "Unread",
    count: unreadCount
  }, {
    key: "messages",
    label: "Messages",
    count: msgCount
  }, {
    key: "tasks",
    label: "Tasks",
    count: taskCount
  }, {
    key: "workspace",
    label: "Activity",
    count: wsCount
  }];
  //* Function for render card
  const renderCard = (n: Notification, idx: number) => {
    const isUnread = !n.readAt;
    const config = getConfig(n.type);
    const Icon = config.icon;
    const actorName = n.meta?.senderName || n.meta?.actorName || n.meta?.commenterName || n.meta?.userName;
    //* Function for render card
    return <div key={n._id} className={`group relative flex items-start gap-3.5 p-4 rounded-2xl transition-all duration-200 cursor-pointer ${isUnread ? "bg-white dark:bg-slate-800 shadow-sm border border-indigo-100/80 dark:border-indigo-800/40 hover:shadow-md hover:-translate-y-px" : "bg-white/70 dark:bg-slate-800/50 border border-slate-100/80 dark:border-slate-700/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-slate-200 dark:hover:border-slate-600"}`} style={{
      animation: mounted ? `notif-slide-in 0.25s ${idx * 0.03}s cubic-bezier(0.25,0.46,0.45,0.94) both` : undefined
    }} onClick={() => isUnread && markRead(n._id)}>
        {}
        <div className="relative shrink-0">
          {actorName ? <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${n.type === "dm_message" ? "bg-linear-to-br from-emerald-400 to-teal-500" : n.type === "mention" ? "bg-linear-to-br from-violet-400 to-purple-500" : n.type === "task_assigned" ? "bg-linear-to-br from-blue-400 to-blue-600" : n.type === "task_comment" ? "bg-linear-to-br from-amber-400 to-orange-500" : n.type === "member_joined" ? "bg-linear-to-br from-green-400 to-emerald-500" : "bg-linear-to-br from-indigo-400 to-indigo-600"}`}>
              {getInitials(actorName)}
            </div> : <div className={`w-11 h-11 rounded-full ${config.bgColor} shadow-sm flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>}
          {isUnread && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-800 animate-pulse" />}
        </div>

        {}
        <div className="flex-1 min-w-0">
          {}
          <div className="flex items-center gap-2 mb-1.5 min-w-0">
            <span className={`text-sm font-semibold shrink-0 ${isUnread ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
              {actorName || "System"}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0 ${config.bgColor} ${config.color}`}>
              <Icon className="w-2.5 h-2.5" />
              {config.label}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-auto shrink-0">
              {timeAgo(n.createdAt)}
            </span>
          </div>

          {}
          <p className={`text-[13px] leading-relaxed ${isUnread ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}`}>
            {n.message}
          </p>

          {}
          <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            {fullTime(n.createdAt)}
          </p>
        </div>

        {}
        <button onClick={e => {
        e.stopPropagation();
        removeNotification(n._id);
      }} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all" title="Remove notification">
          
          <X className="w-3.5 h-3.5" />
        </button>
      </div>;
  };
  //* Function for render category section
  const renderCategorySection = (cat: Category, items: Notification[]) => {
    if (items.length === 0) return null;
    //* Function for cfg
    const cfg = CATEGORY_META.find(c => c.key === cat)!;
    const CatIcon = cfg.icon;
    //* Function for unread
    const unread = items.filter(n => !n.readAt).length;
    //* Function for cat idx
    const catIdx = CATEGORY_META.findIndex(c => c.key === cat);
    //* Function for render category section
    return <Reveal key={cat} delay={catIdx * 80}>
        {}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <CatIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {cfg.label}
            </span>
          </div>
          <div className="flex-1 h-px bg-slate-200/80 dark:bg-slate-700/80" />
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold shrink-0">
            {items.length}
          </span>
          {unread > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
              {unread} new
            </span>}
        </div>
        {}
        <div className="space-y-2 px-3 pb-3">
          {items.map((n, i) => renderCard(n, i))}
        </div>
      </Reveal>;
  };
  //* Function for this task
  return <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-auto">
      {}
      <div className="sticky top-0 z-10">
        <div className="relative overflow-hidden header-slide-down" style={{
        background: "linear-gradient(135deg, #1a1d4d 0%, #252980 60%, #1e2160 100%)"
      }}>
          
          {}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full" />

          <div className="relative px-1 sm:px-3 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all text-white/70 hover:text-white">
                
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-white leading-tight">
                  Notifications
                </h1>
                <p className="text-sm text-white/60">
                  {notifications.length} total &middot;{" "}
                  <span className={unreadCount > 0 ? "text-indigo-300 font-semibold" : ""}>
                    {unreadCount} unread
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifications.some(n => n.readAt) && <button onClick={handleClearRead} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors" title="Clear read notifications">
                
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear read</span>
                </button>}
              {unreadCount > 0 && <button onClick={handleMarkAllRead} disabled={markingAll} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-400 rounded-lg transition-colors disabled:opacity-50">
                
                  {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Mark all read</span>
                </button>}
            </div>
          </div>

          {}
          <div className="relative px-5 sm:px-8 flex gap-1 -mb-px overflow-x-auto pb-0" style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.4s 0.25s, transform 0.4s 0.25s"
        }}>
            
            {filters.map(f => <button key={f.key} onClick={() => setFilter(f.key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${filter === f.key ? "border-white text-white" : "border-transparent text-white/50 hover:text-white/80"}`}>
              
                {f.label}
                {f.count !== undefined && f.count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === f.key ? "bg-white/20 text-white" : "bg-white/10 text-white/50"}`}>
                
                    {f.count}
                  </span>}
              </button>)}
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 flex flex-col bg-[#f4f5f9] dark:bg-slate-950">
        {loading ? <div className="flex flex-col items-center justify-center h-full min-h-75 gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
            <p className="text-sm text-slate-500">Loading notifications...</p>
          </div> : displayed.length === 0 ? <Reveal className="flex flex-col items-center justify-center h-full min-h-100 text-center px-6">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-5">
              <BellOff className="w-9 h-9 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
              {filter === "unread" ? "You're all caught up!" : filter === "messages" ? "No messages yet" : filter === "tasks" ? "No task notifications" : filter === "workspace" ? "No workspace activity" : "No notifications yet"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {filter === "unread" ? "Great job — no unread notifications right now." : "When something happens in your workspace, it will show up here."}
            </p>
          </Reveal> : <div>
            {filter === "all" ? CATEGORY_META.map(cat => renderCategorySection(cat.key, grouped[cat.key])) : <div className="space-y-2 p-3 sm:p-4">
                {displayed.map((n, i) => renderCard(n, i))}
              </div>}
          </div>}
      </div>
    </div>;
}