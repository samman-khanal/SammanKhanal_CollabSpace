import { useEffect, useState, useCallback } from "react";
import adminService from "../../services/admin.service";
import type { AdminWorkspace, WorkspaceDetail } from "../../types/admin.types";
import Pagination from "./Pagination";
import { Search, Trash2, Eye, Users, LayoutGrid, X } from "lucide-react";
import { toast } from "sonner";
//* Function for workspaces page
export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<AdminWorkspace[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<WorkspaceDetail | null>(null);
  //* Function for fetch ws
  const fetchWs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listWorkspaces({
        page,
        search
      });
      setWorkspaces(res.workspaces);
      setTotal(res.total);
      setPages(res.pages);
    } finally {
      setLoading(false);
    }
  }, [page, search]);
  //* Function for this task
  useEffect(() => {
    fetchWs();
  }, [fetchWs]);
  //* Function for handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchWs();
  };
  //* Function for handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this workspace and all its data? This cannot be undone.")) return;
    await adminService.deleteWorkspace(id);
    toast.success("Workspace deleted");
    if (detail?._id === id) setDetail(null);
    fetchWs();
  };
  //* Function for view detail
  const viewDetail = async (id: string) => {
    const d = await adminService.getWorkspaceDetail(id);
    setDetail(d);
  };
  //* Function for this task
  return <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm admin-fade-up">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search workspaces…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
            
          </div>
          <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all duration-200">
            
            Search
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm admin-fade-up" style={{
      animationDelay: "100ms"
    }}>
        {loading ? <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-6 h-6 border-3 border-indigo-200 border-t-indigo-600 rounded-full" />
          </div> : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-linear-to-r from-slate-50 to-slate-100/80 dark:from-slate-700/60 dark:to-slate-700/30 text-left">
                <tr>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Workspace</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Owner</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Members</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Boards</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Created</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/60">
                {workspaces.map((ws, idx) => <tr key={ws._id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors duration-200 admin-row-in" style={{
              animationDelay: `${idx * 30}ms`
            }}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{ws.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-50">{ws.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700 dark:text-slate-300">{ws.owner?.fullName}</p>
                      <p className="text-xs text-slate-500">{ws.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Users className="w-3.5 h-3.5" /> {ws.memberCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <LayoutGrid className="w-3.5 h-3.5" /> {ws.boardCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(ws.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => viewDetail(ws._id)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600/50 text-slate-400 hover:text-slate-600 transition-all duration-200" title="View detail">
                      
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(ws._id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all duration-200" title="Delete workspace">
                      
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
                {workspaces.length === 0 && <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No workspaces found</td>
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{detail.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{detail.description}</p>

            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Members ({detail.members.length})
            </h4>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {detail.members.map(m => <div key={m._id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    {m.user?.avatarUrl ? <img src={m.user.avatarUrl} className="w-6 h-6 rounded-full" alt="" /> : <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-medium">
                        {m.user?.fullName?.charAt(0)?.toUpperCase()}
                      </div>}
                    <span className="text-slate-900 dark:text-white">{m.user?.fullName}</span>
                  </div>
                  <span className="text-xs text-slate-400 capitalize">{m.role}</span>
                </div>)}
            </div>

            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Boards ({detail.boards.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {detail.boards.map(b => <div key={b._id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-slate-900 dark:text-white">{b.name}</span>
                  <span className="text-xs text-slate-400">{b.methodology}</span>
                </div>)}
              {detail.boards.length === 0 && <p className="text-sm text-slate-400">No boards</p>}
            </div>
          </div>
        </div>}
    </div>;
}