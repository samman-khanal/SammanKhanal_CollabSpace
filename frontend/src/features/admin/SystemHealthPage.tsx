import { useEffect, useState, useCallback } from "react";
import adminService from "../../services/admin.service";
import type { SystemHealth } from "../../types/admin.types";
import { Database, CreditCard, AlertTriangle, RefreshCw, Server, Clock, HardDrive } from "lucide-react";
import { toast } from "sonner";
//* Function for format uptime
function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor(seconds % 86400 / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  return `${d}d ${h}h ${m}m`;
}
//* Function for format bytes
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
//* Function for memory gauge
function MemoryGauge({
  used,
  total
}: {
  used: number;
  total: number;
}) {
  const pct = total > 0 ? used / total * 100 : 0;
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dash = pct / 100 * circumference;
  const color = pct > 85 ? "#ef4444" : pct > 60 ? "#f59e0b" : "#6366f1";
  return <div className="flex flex-col items-center">
      <svg width={128} height={128} className="-rotate-90">
        <circle cx={64} cy={64} r={r} fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth={10} />
        <circle cx={64} cy={64} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} className="transition-all duration-700" />
        
      </svg>
      <div className="absolute mt-10 flex flex-col items-center">
        <span className="text-xl font-bold text-slate-900 dark:text-white">{pct.toFixed(0)}%</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">heap used</span>
      </div>
    </div>;
}
//* Function for system health page
export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  //* Function for fetch health
  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemHealth();
      setHealth(data);
    } catch {
      toast.error("Failed to load system health");
    } finally {
      setLoading(false);
    }
  }, []);
  //* Function for this task
  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);
  if (loading || !health) {
    return <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
      </div>;
  }
  const dbConnected = health.database === "connected";
  //* Function for this task
  return <div className="space-y-6">
      {}
      <div className="flex justify-end">
        <button onClick={fetchHealth} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200">
          
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-300/60 hover:bg-gradient-to-br hover:from-indigo-50/60 to-white dark:hover:from-indigo-900/20 dark:hover:to-slate-800 transition-all duration-300 admin-fade-up">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50/80 border border-indigo-200 dark:bg-indigo-900/40 dark:border-indigo-800/50 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Database</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${dbConnected ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">{health.database}</span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-300/60 hover:bg-gradient-to-br hover:from-indigo-50/60 to-white dark:hover:from-indigo-900/20 dark:hover:to-slate-800 transition-all duration-300 admin-fade-up" style={{
        animationDelay: "60ms"
      }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50/80 border border-indigo-200 dark:bg-indigo-900/40 dark:border-indigo-800/50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Uptime</h3>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5">{formatUptime(health.uptime)}</p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-300/60 hover:bg-gradient-to-br hover:from-indigo-50/60 to-white dark:hover:from-indigo-900/20 dark:hover:to-slate-800 transition-all duration-300 admin-fade-up" style={{
        animationDelay: "120ms"
      }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50/80 border border-indigo-200 dark:bg-indigo-900/40 dark:border-indigo-800/50 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Heap Used</h3>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5">{formatBytes(health.memoryUsage.heapUsed)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">of {formatBytes(health.memoryUsage.heapTotal)}</p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-300/60 hover:bg-gradient-to-br hover:from-indigo-50/60 to-white dark:hover:from-indigo-900/20 dark:hover:to-slate-800 transition-all duration-300 admin-fade-up" style={{
        animationDelay: "180ms"
      }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50/80 border border-indigo-200 dark:bg-indigo-900/40 dark:border-indigo-800/50 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">RSS Memory</h3>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5">{formatBytes(health.memoryUsage.rss)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ext: {formatBytes(health.memoryUsage.external)}</p>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:border-indigo-300/60 transition-all duration-300 admin-scale-in" style={{
        animationDelay: "250ms"
      }}>
          <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Heap Utilization</h3>
          <div className="relative flex items-center justify-center">
            <MemoryGauge used={health.memoryUsage.heapUsed} total={health.memoryUsage.heapTotal} />
          </div>
        </div>

        {}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-red-800/50 transition-all duration-300 admin-fade-up" style={{
        animationDelay: "300ms"
      }}>
          <div className="px-5 py-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-red-50/40 to-white dark:from-red-900/20 dark:to-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100/80 dark:bg-red-900/40 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Failed Payments
              <span className="ml-2 text-xs font-normal px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">{health.recentFailedStripePayments.length}</span>
            </h3>
          </div>
          {health.recentFailedStripePayments.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-400">✓ No failed payments</p> : <div className="divide-y divide-slate-100/80 dark:divide-slate-700/60 max-h-72 overflow-y-auto">
              {health.recentFailedStripePayments.map((p, idx) => <div key={p._id} className="px-5 py-3.5 flex justify-between items-center hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors duration-200 admin-row-in" style={{
            animationDelay: `${idx * 30}ms`
          }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{p.user?.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.user?.email}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">${(p.amount / 100).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>)}
            </div>}
        </div>

        {}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all duration-300 admin-fade-up" style={{
        animationDelay: "350ms"
      }}>
          <div className="px-5 py-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-amber-50/40 to-white dark:from-amber-900/20 dark:to-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 dark:bg-amber-900/40 flex items-center justify-center">
              <Server className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Pending Khalti
              <span className="ml-2 text-xs font-normal px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">{health.pendingKhaltiVerifications.length}</span>
            </h3>
          </div>
          {health.pendingKhaltiVerifications.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-400">✓ No pending verifications</p> : <div className="divide-y divide-slate-100/80 dark:divide-slate-700/60 max-h-72 overflow-y-auto">
              {health.pendingKhaltiVerifications.map((k, idx) => <div key={k._id} className="px-5 py-3.5 flex justify-between items-center hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors duration-200 admin-row-in" style={{
            animationDelay: `${idx * 30}ms`
          }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{k.user?.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">pidx: {k.pidx.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Rs. {k.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{new Date(k.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>)}
            </div>}
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-300 admin-fade-up" style={{
      animationDelay: "400ms"
    }}>
        <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-orange-50/40 to-white dark:from-orange-900/20 dark:to-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100/80 dark:bg-orange-900/40 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Users Near Plan Limits
            <span className="ml-2 text-xs font-normal px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">{health.usersNearPlanLimits.length}</span>
          </h3>
        </div>
        {health.usersNearPlanLimits.length === 0 ? <p className="px-6 py-12 text-center text-sm text-slate-400">✓ No users near their plan limits</p> : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50/60 to-white dark:from-slate-700/40 dark:to-slate-800">
                <tr className="border-b border-slate-100/80 dark:border-slate-700/60">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/60">
                {health.usersNearPlanLimits.map((u, i) => <tr key={i} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors duration-200 admin-row-in" style={{
              animationDelay: `${i * 30}ms`
            }}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{u.user.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 capitalize">
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 capitalize font-medium">{u.resource}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all" style={{
                      width: `${Math.min(u.current / u.limit * 100, 100)}%`
                    }} />
                      
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-400 min-w-[50px]">{u.current}/{u.limit}</span>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </div>
    </div>;
}