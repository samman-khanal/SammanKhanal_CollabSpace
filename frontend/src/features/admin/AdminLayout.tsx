import { useState } from "react";
import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LayoutDashboard, Users, CreditCard, Mail, Building2, Shield, BarChart3, Megaphone, Activity, Menu, X, ShieldCheck } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
const NAV_ITEMS = [{
  to: "/admin",
  icon: LayoutDashboard,
  label: "Dashboard",
  end: true
}, {
  to: "/admin/users",
  icon: Users,
  label: "Users"
}, {
  to: "/admin/billing",
  icon: CreditCard,
  label: "Billing"
}, {
  to: "/admin/contacts",
  icon: Mail,
  label: "Contact Inbox"
}, {
  to: "/admin/workspaces",
  icon: Building2,
  label: "Workspaces"
}, {
  to: "/admin/moderation",
  icon: Shield,
  label: "Moderation"
}, {
  to: "/admin/analytics",
  icon: BarChart3,
  label: "Analytics"
}, {
  to: "/admin/announcements",
  icon: Megaphone,
  label: "Announcements"
}, {
  to: "/admin/health",
  icon: Activity,
  label: "System Health"
}];
const PAGE_DESCRIPTIONS: Record<string, string> = {
  Dashboard: "Platform overview & real-time analytics",
  Users: "Manage accounts, roles & permissions",
  Billing: "Revenue, payments & subscriptions",
  "Contact Inbox": "Support messages & inquiries",
  Workspaces: "All workspace management",
  Moderation: "Review & moderate content",
  Analytics: "Detailed platform analytics",
  Announcements: "Broadcast system notifications",
  "System Health": "Server & application monitoring"
};
//* Function for admin layout
export default function AdminLayout() {
  useDocumentTitle("Admin Panel");
  const {
    user
  } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  //* Function for current item
  const currentItem = NAV_ITEMS.find(item => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to) && item.to !== "/admin") || NAV_ITEMS[0];
  const currentLabel = currentItem.label;
  const CurrentIcon = currentItem.icon;
  const currentDesc = PAGE_DESCRIPTIONS[currentLabel] || "";
  //* Function for this task
  return <div className="flex h-screen bg-slate-50/50 dark:bg-slate-900 overflow-hidden">
      {}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 bg-[#1a1d4d] shadow-2xl transform transition-transform duration-300 flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`} style={{
      width: 305
    }}>
        
        {}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-white to-indigo-100 rounded-xl flex items-center justify-center shadow-lg shadow-white/10 shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#1a1d4d]" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-white text-[15px] truncate">Admin Panel</h1>
                <p className="text-[11px] text-white/40 font-medium tracking-wide">CollabSpace</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">Navigation</p>
          {NAV_ITEMS.map(({
          to,
          icon: Icon,
          label,
          end
        }) => <NavLink key={to} to={to} end={end} onClick={() => setIsSidebarOpen(false)} className={({
          isActive
        }) => `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25" : "text-white/70 hover:bg-white/8 hover:text-white"}`}>
            
              <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {label}
            </NavLink>)}
        </nav>

        {}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/6 backdrop-blur-sm rounded-xl border border-white/6">
            <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden ring-2 ring-white/10">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  {user.fullName?.slice(0, 2).toUpperCase() || "AD"}
                </div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-[13px] truncate">{user.fullName}</p>
              <p className="text-[11px] text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {}
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300" />}

      {}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {}
        <header className="overflow-hidden sticky top-0 z-20 shrink-0 border-b border-white/10" style={{
        background: "linear-gradient(135deg, #1a1d4d 0%, #252980 60%, #1e2160 100%)"
      }}>
          
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 w-20 h-20 rounded-full bg-indigo-400/8 pointer-events-none" />
          <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm items-center justify-center shrink-0 shadow-lg shadow-black/10">
                    <CurrentIcon className="w-7 h-7 text-white/90" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                      {currentLabel}
                    </h1>
                    {currentDesc && <p className="text-sm text-white/50 mt-1 hidden sm:block">{currentDesc}</p>}
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-white/10 text-white/80 rounded-full uppercase tracking-wider border border-white/15 backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </span>
            </div>
          </div>
        </header>

        {}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>;
}