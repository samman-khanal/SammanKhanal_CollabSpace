import { useEffect, useState, useCallback } from "react";
import adminService from "../../services/admin.service";
import type { AdminUser, AdminUserDetail } from "../../types/admin.types";
import Pagination from "./Pagination";
import { Search, ShieldCheck, ShieldOff, Ban, Mail, CheckCircle, X, Eye, Crown, User } from "lucide-react";
import { toast } from "sonner";
//* Function for users page
export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  //* Function for fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listUsers({
        page,
        search,
        role: roleFilter || undefined,
        plan: planFilter || undefined,
        isEmailVerified: verifiedFilter || undefined
      });
      setUsers(res.users);
      setTotal(res.total);
      setPages(res.pages);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, planFilter, verifiedFilter]);
  //* Function for this task
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  //* Function for handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };
  //* Function for handle promote
  const handlePromote = async (userId: string) => {
    await adminService.updateUserRole(userId, "admin");
    toast.success("User promoted to admin");
    fetchUsers();
  };
  //* Function for handle demote
  const handleDemote = async (userId: string) => {
    await adminService.updateUserRole(userId, "user");
    toast.success("User demoted to user");
    fetchUsers();
  };
  //* Function for handle ban
  const handleBan = async (userId: string) => {
    if (!confirm("Ban this user? This will deactivate their account.")) return;
    await adminService.banUser(userId);
    toast.success("User banned");
    fetchUsers();
  };
  //* Function for handle resend verification
  const handleResendVerification = async (userId: string) => {
    await adminService.resendVerification(userId);
    toast.success("Verification email sent");
  };
  //* Function for handle reset verification
  const handleResetVerification = async (userId: string) => {
    await adminService.resetVerificationState(userId);
    toast.success("Verification state reset — user is now verified");
    fetchUsers();
  };
  //* Function for view user
  const viewUser = async (userId: string) => {
    const d = await adminService.getUserDetail(userId);
    setDetail(d);
  };
  //* Function for plan badge
  const planBadge = (plan: string | undefined) => {
    const colors: Record<string, string> = {
      free: "bg-slate-100 text-slate-700",
      plus: "bg-blue-100 text-blue-700",
      pro: "bg-indigo-100 text-indigo-700"
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[plan || "free"] || colors.free}`}>
        {plan || "free"}
      </span>;
  };
  //* Function for this task
  return <div className="space-y-4">
      {}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm admin-fade-up">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all" />
            
          </div>
          <select value={roleFilter} onChange={e => {
          setRoleFilter(e.target.value);
          setPage(1);
        }} className="px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 text-sm">
            
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select value={planFilter} onChange={e => {
          setPlanFilter(e.target.value);
          setPage(1);
        }} className="px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 text-sm">
            
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="plus">Plus</option>
            <option value="pro">Pro</option>
          </select>
          <select value={verifiedFilter} onChange={e => {
          setVerifiedFilter(e.target.value);
          setPage(1);
        }} className="px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 text-sm">
            
            <option value="">Verified?</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all duration-200">
            
            Search
          </button>
        </form>
      </div>

      {}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm admin-fade-up" style={{
      animationDelay: "100ms"
    }}>
        {loading ? <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-6 h-6 border-3 border-indigo-200 border-t-indigo-600 rounded-full" />
          </div> : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-linear-to-r from-slate-50 to-slate-100/80 dark:from-slate-700/60 dark:to-slate-700/30 text-left">
                <tr>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80 dark:text-slate-400/80">User</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80 dark:text-slate-400/80">Role</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80 dark:text-slate-400/80">Plan</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80 dark:text-slate-400/80">Verified</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80 dark:text-slate-400/80">Joined</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80 dark:text-slate-400/80">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/60">
                {users.map((u, idx) => <tr key={u._id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors duration-200 admin-row-in" style={{
              animationDelay: `${idx * 30}ms`
            }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? <img src={u.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" /> : <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-xs">
                            {u.fullName?.charAt(0)?.toUpperCase()}
                          </div>}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{u.fullName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.role === "admin" ? "text-amber-600" : "text-slate-500"}`}>
                        {u.role === "admin" ? <Crown className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{planBadge(u.subscription?.plan)}</td>
                    <td className="px-4 py-3">
                      {u.isEmailVerified ? <CheckCircle className="w-4.5 h-4.5 text-green-500" /> : <X className="w-4.5 h-4.5 text-red-400" />}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => viewUser(u._id)} title="View detail" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600/50 text-slate-400 hover:text-slate-600 transition-all duration-200">
                      
                          <Eye className="w-4 h-4" />
                        </button>
                        {u.role === "user" ? <button onClick={() => handlePromote(u._id)} title="Promote to admin" className="p-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-all duration-200">
                      
                            <ShieldCheck className="w-4 h-4" />
                          </button> : <button onClick={() => handleDemote(u._id)} title="Demote to user" className="p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition-all duration-200">
                      
                            <ShieldOff className="w-4 h-4" />
                          </button>}
                        {!u.isEmailVerified && <>
                            <button onClick={() => handleResendVerification(u._id)} title="Resend verification" className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-all duration-200">
                        
                              <Mail className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleResetVerification(u._id)} title="Force verify" className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 transition-all duration-200">
                        
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </>}
                        <button onClick={() => handleBan(u._id)} title="Ban user" className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all duration-200">
                      
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
                {users.length === 0 && <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No users found
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>}
        <div className="px-4 pb-3">
          <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
        </div>
      </div>

      {}
      {detail && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 relative border border-slate-200 dark:border-slate-700 admin-scale-in">
            <button onClick={() => setDetail(null)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-5">
              {detail.avatarUrl ? <img src={detail.avatarUrl} className="w-14 h-14 rounded-full object-cover" alt="" /> : <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {detail.fullName?.charAt(0)?.toUpperCase()}
                </div>}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{detail.fullName}</h3>
                <p className="text-sm text-slate-500">{detail.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-5">
              <div className="bg-linear-to-br from-slate-50 to-slate-100/50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-3.5 border border-slate-100 dark:border-slate-700/40">
                <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-medium">Role</p>
                <p className="font-semibold text-slate-900 dark:text-white capitalize">{detail.role}</p>
              </div>
              <div className="bg-linear-to-br from-slate-50 to-slate-100/50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-3.5 border border-slate-100 dark:border-slate-700/40">
                <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-medium">Plan</p>
                <p className="font-semibold text-slate-900 dark:text-white capitalize">
                  {detail.subscription?.plan || "free"} ({detail.subscription?.status || "N/A"})
                </p>
              </div>
              <div className="bg-linear-to-br from-slate-50 to-slate-100/50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-3.5 border border-slate-100 dark:border-slate-700/40">
                <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-medium">Email Verified</p>
                <p className="font-semibold text-slate-900 dark:text-white">{detail.isEmailVerified ? "Yes" : "No"}</p>
              </div>
              <div className="bg-linear-to-br from-slate-50 to-slate-100/50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-3.5 border border-slate-100 dark:border-slate-700/40">
                <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-medium">Notifications</p>
                <p className="font-semibold text-slate-900 dark:text-white">{detail.notificationCount}</p>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Workspaces ({detail.workspaces.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {detail.workspaces.map(ws => <div key={ws._id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
              
                  <span className="text-slate-900 dark:text-white">{ws.name}</span>
                  <span className="text-xs text-slate-400 capitalize">{ws.myRole}</span>
                </div>)}
              {detail.workspaces.length === 0 && <p className="text-sm text-slate-400">No workspaces</p>}
            </div>
          </div>
        </div>}
    </div>;
}