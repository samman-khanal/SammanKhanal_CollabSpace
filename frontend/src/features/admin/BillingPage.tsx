import { useEffect, useState, useCallback } from "react";
import adminService from "../../services/admin.service";
import type { SubscriptionOverview, RevenueMetrics, StripePayment, KhaltiPaymentItem } from "../../types/admin.types";
import Pagination from "./Pagination";
import { DollarSign, CreditCard, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
//* Function for billing page
export default function BillingPage() {
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [stripePayments, setStripePayments] = useState<StripePayment[]>([]);
  const [stripePage, setStripePage] = useState(1);
  const [stripePages, setStripePages] = useState(1);
  const [stripeTotal, setStripeTotal] = useState(0);
  const [khaltiPayments, setKhaltiPayments] = useState<KhaltiPaymentItem[]>([]);
  const [khaltiPage, setKhaltiPage] = useState(1);
  const [khaltiPages, setKhaltiPages] = useState(1);
  const [khaltiTotal, setKhaltiTotal] = useState(0);
  const [tab, setTab] = useState<"stripe" | "khalti">("stripe");
  const [loading, setLoading] = useState(true);
  const [overrideUserId, setOverrideUserId] = useState("");
  const [overridePlan, setOverridePlan] = useState("pro");
  //* Function for this task
  useEffect(() => {
    //* Function for this task
    Promise.all([adminService.getSubscriptionOverview(), adminService.getRevenueMetrics()]).then(([o, r]) => {
      setOverview(o);
      setRevenue(r);
    }).finally(() => setLoading(false));
  }, []);
  //* Function for fetch stripe
  const fetchStripe = useCallback(async () => {
    const res = await adminService.listStripePayments({
      page: stripePage
    });
    setStripePayments(res.payments as StripePayment[]);
    setStripePages(res.pages);
    setStripeTotal(res.total);
  }, [stripePage]);
  //* Function for fetch khalti
  const fetchKhalti = useCallback(async () => {
    const res = await adminService.listKhaltiPayments({
      page: khaltiPage
    });
    setKhaltiPayments(res.payments as KhaltiPaymentItem[]);
    setKhaltiPages(res.pages);
    setKhaltiTotal(res.total);
  }, [khaltiPage]);
  //* Function for this task
  useEffect(() => {
    fetchStripe();
  }, [fetchStripe]);
  //* Function for this task
  useEffect(() => {
    fetchKhalti();
  }, [fetchKhalti]);
  //* Function for handle override
  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideUserId.trim()) return;
    try {
      await adminService.overridePlan(overrideUserId.trim(), overridePlan);
      toast.success(`Plan overridden to ${overridePlan}`);
      setOverrideUserId("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to override plan");
    }
  };
  //* Function for status color
  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      succeeded: "text-green-600 bg-green-50",
      completed: "text-green-600 bg-green-50",
      failed: "text-red-600 bg-red-50",
      pending: "text-yellow-600 bg-yellow-50",
      initiated: "text-blue-600 bg-blue-50",
      refunded: "text-slate-600 bg-slate-100"
    };
    return map[status] || "text-slate-500 bg-slate-100";
  };
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>;
  }
  //* Function for this task
  return <div className="space-y-6">
      {}
      {revenue && <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/60 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 transition-all duration-300 admin-fade-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-800/30 flex items-center justify-center text-green-600">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">MRR</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white admin-counter">
                  ${(revenue.mrr / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/60 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 transition-all duration-300 admin-fade-up" style={{
        animationDelay: "60ms"
      }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30 flex items-center justify-center text-blue-600">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Stripe Revenue</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white admin-counter" style={{
              animationDelay: "200ms"
            }}>
                  ${(revenue.stripe.totalRevenue / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/60 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 transition-all duration-300 admin-fade-up" style={{
        animationDelay: "120ms"
      }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 border border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/30 flex items-center justify-center text-purple-600">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Khalti Revenue</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white admin-counter" style={{
              animationDelay: "260ms"
            }}>
                  Rs. {revenue.khalti.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/60 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 transition-all duration-300 admin-fade-up" style={{
        animationDelay: "180ms"
      }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-800/30 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Failed Payments</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white admin-counter" style={{
              animationDelay: "320ms"
            }}>
                  {revenue.stripe.failedPayments + revenue.khalti.failedPayments}
                </p>
              </div>
            </div>
          </div>
        </div>}

      {}
      {overview && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm admin-fade-up" style={{
        animationDelay: "200ms"
      }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Users by Plan</p>
            </div>
            <div className="space-y-2.5">
              {overview.planCounts.map((p, i) => <div key={p._id} className="flex justify-between items-center text-sm admin-row-in" style={{
            animationDelay: `${300 + i * 50}ms`
          }}>
                  <span className="capitalize text-slate-600 dark:text-slate-400">{p._id}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{p.count}</span>
                </div>)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm admin-fade-up" style={{
        animationDelay: "260ms"
      }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Override User Plan</p>
            </div>
            <form onSubmit={handleOverride} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 mb-1 block uppercase tracking-wider font-medium">User ID</label>
                <input type="text" value={overrideUserId} onChange={e => setOverrideUserId(e.target.value)} placeholder="Paste user ID…" className="w-full px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
              
              </div>
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block uppercase tracking-wider font-medium">Plan</label>
                <select value={overridePlan} onChange={e => setOverridePlan(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 text-sm">
                
                  <option value="free">Free</option>
                  <option value="plus">Plus</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all duration-200">
              
                Override
              </button>
            </form>
          </div>
        </div>}

      {}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm admin-fade-up" style={{
      animationDelay: "320ms"
    }}>
        <div className="flex border-b border-slate-200/60 dark:border-slate-700/60">
          <button onClick={() => setTab("stripe")} className={`px-6 py-3.5 text-sm font-medium transition-all duration-200 ${tab === "stripe" ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20"}`}>
            
            Stripe Payments
          </button>
          <button onClick={() => setTab("khalti")} className={`px-6 py-3.5 text-sm font-medium transition-all duration-200 ${tab === "khalti" ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20"}`}>
            
            Khalti Payments
          </button>
        </div>

        {tab === "stripe" && <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-linear-to-r from-slate-50 to-slate-100/80 dark:from-slate-700/60 dark:to-slate-700/30 text-left">
                  <tr>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">User</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Amount</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Status</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Date</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/60">
                  {stripePayments.map((p, idx) => <tr key={p._id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors duration-200 admin-row-in" style={{
                animationDelay: `${idx * 30}ms`
              }}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{p.user?.fullName}</p>
                        <p className="text-xs text-slate-500">{p.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        ${(p.amount / 100).toFixed(2)} {p.currency?.toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {p.receiptUrl && <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs">
                            View
                          </a>}
                      </td>
                    </tr>)}
                  {stripePayments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No payments</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-3">
              <Pagination page={stripePage} pages={stripePages} total={stripeTotal} onPageChange={setStripePage} />
            </div>
          </>}

        {tab === "khalti" && <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-linear-to-r from-slate-50 to-slate-100/80 dark:from-slate-700/60 dark:to-slate-700/30 text-left">
                  <tr>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">User</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Plan</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Amount</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Status</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Txn ID</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/60">
                  {khaltiPayments.map((p, idx) => <tr key={p._id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors duration-200 admin-row-in" style={{
                animationDelay: `${idx * 30}ms`
              }}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{p.user?.fullName}</p>
                        <p className="text-xs text-slate-500">{p.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-700 dark:text-slate-300">{p.planId}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        Rs. {p.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">{p.transactionId || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>)}
                  {khaltiPayments.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No payments</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-3">
              <Pagination page={khaltiPage} pages={khaltiPages} total={khaltiTotal} onPageChange={setKhaltiPage} />
            </div>
          </>}
      </div>
    </div>;
}