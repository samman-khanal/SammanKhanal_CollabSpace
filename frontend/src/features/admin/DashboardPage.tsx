import { useEffect, useState } from "react";
import adminService from "../../services/admin.service";
import type { Analytics } from "../../types/admin.types";
import { Users, Building2, LayoutGrid, CheckSquare, MessageSquare, TrendingUp, Activity, RefreshCw } from "lucide-react";
//* Function for donut chart
function DonutChart({
  segments,
  size = 160
}: {
  segments: {
    label: string;
    value: number;
    color: string;
  }[];
  size?: number;
}) {
  //* Function for total
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return null;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const avgValue = Math.round(total / segments.length);
  //* Function for this task
  return <div className="flex flex-col items-center gap-7">
      {}
      <div className="relative flex justify-center">
        <svg width={size} height={size} className="shrink-0 -rotate-90">
          {segments.map(seg => {
          const pct = seg.value / total;
          const dashLen = pct * circumference;
          const dashOffset = -offset;
          offset += dashLen;
          return <circle key={seg.label} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={28} strokeDasharray={`${dashLen} ${circumference - dashLen}`} strokeDashoffset={dashOffset} className="transition-all duration-700" />;
        })}
          {}
          <circle cx={cx} cy={cy} r={r - 12} className="fill-white dark:fill-slate-800" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{avgValue}%</span>
          <span className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">Growth</span>
        </div>
      </div>

      {}
      <div className="w-full flex flex-wrap items-center justify-center gap-6">
        {segments.map(seg => <div key={seg.label} className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{
          backgroundColor: seg.color
        }} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{seg.label}</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">({(seg.value / total * 100).toFixed(0)}%)</span>
          </div>)}
      </div>
    </div>;
}
//* Function for dot plot chart
function DotPlotChart({
  data,
  labels,
  height = 220,
  color = "#6366f1"
}: {
  data: number[];
  labels: string[];
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return <p className="text-sm text-slate-400 py-8 text-center">No data yet</p>;
  const padding = {
    top: 20,
    right: 16,
    bottom: 36,
    left: 42
  };
  const width = 600;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const max = Math.max(...data, 1);
  const slotWidth = chartW / Math.max(data.length, 1);
  const yTicks = 5;
  //* Function for y labels
  const yLabels = Array.from({
    length: yTicks + 1
  }, (_, i) => Math.round(max / yTicks * i));
  //* Function for this task
  return <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {}
      {yLabels.map((val, i) => {
      const y = padding.top + chartH - val / max * chartH;
      return <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="stroke-slate-100 dark:stroke-slate-700/50" strokeWidth={1} />
            <text x={padding.left - 6} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{val}</text>
          </g>;
    })}

      {}
      {data.map((value, i) => {
      const x = padding.left + i * slotWidth + slotWidth / 2;
      const y = padding.top + chartH - value / max * chartH;
      return <g key={i}>
            <line x1={x} y1={padding.top + chartH} x2={x} y2={y} stroke={color} strokeWidth={2} opacity={0.18} strokeDasharray="4 6" />
            <circle cx={x} cy={y} r={12} fill="white" stroke={color} strokeWidth={5} />
            <text x={x} y={y + 4} textAnchor="middle" className="fill-slate-600 text-[10px] font-bold">
              
              {value}
            </text>
          </g>;
    })}

      {}
      {labels.map((l, i) => <text key={i} x={padding.left + i * slotWidth + slotWidth / 2} y={height - 6} textAnchor="middle" className="fill-slate-400 text-[10px]">
        
          {l}
        </text>)}
    </svg>;
}
//* Function for horizontal bars
function HorizontalBars({
  items
}: {
  items: {
    label: string;
    value: number;
    color: string;
  }[];
}) {
  //* Function for max
  const max = Math.max(...items.map(i => i.value), 1);
  //* Function for this task
  return <div className="space-y-4">
      {items.map((item, i) => <div key={item.label} className="admin-fade-up" style={{
      animationDelay: `${i * 80}ms`
    }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.value.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-2.5 overflow-hidden border border-slate-200/80 dark:border-slate-700/70">
            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{
          width: `${item.value / max * 100}%`,
          backgroundColor: item.color
        }} />
          
          </div>
        </div>)}
    </div>;
}
//* Function for dashboard page
export default function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  //* Function for refresh
  const refresh = () => {
    setLoading(true);
    //* Function for refresh
    adminService.getAnalytics().then(setData).finally(() => setLoading(false));
  };
  //* Function for this task
  useEffect(() => {
    refresh();
  }, []);
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-sm text-slate-400">Loading analytics...</span>
        </div>
      </div>;
  }
  if (!data) return <p className="text-red-500 text-center py-12">Failed to load analytics</p>;
  const stats = [{
    label: "Total Users",
    value: data.totalUsers,
    icon: Users,
    color: "text-indigo-600",
    iconBg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30"
  }, {
    label: "Daily Active",
    value: data.dailyActiveUsers,
    icon: Activity,
    color: "text-indigo-600",
    iconBg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30"
  }, {
    label: "Weekly Active",
    value: data.weeklyActiveUsers,
    icon: TrendingUp,
    color: "text-indigo-600",
    iconBg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30"
  }, {
    label: "Workspaces",
    value: data.totalWorkspaces,
    icon: Building2,
    color: "text-indigo-600",
    iconBg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30"
  }, {
    label: "Boards",
    value: data.totalBoards,
    icon: LayoutGrid,
    color: "text-indigo-600",
    iconBg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30"
  }, {
    label: "Tasks",
    value: data.totalTasks,
    icon: CheckSquare,
    color: "text-indigo-600",
    iconBg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30"
  }, {
    label: "Messages",
    value: data.totalMessages,
    icon: MessageSquare,
    color: "text-indigo-600",
    iconBg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30"
  }, {
    label: "Conversion",
    value: `${data.conversionRate}%`,
    icon: TrendingUp,
    color: "text-indigo-600",
    iconBg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30"
  }];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  //* Function for growth labels
  const growthLabels = data.userGrowth.map(g => `${months[g._id.month - 1]}`);
  //* Function for growth data
  const growthData = data.userGrowth.map(g => g.count);
  const subColors: Record<string, string> = {
    free: "#c7d2fe",
    plus: "#818cf8",
    pro: "#4f46e5"
  };
  //* Function for donut segments
  const donutSegments = data.subscriptionBreakdown.map(s => ({
    label: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
    color: subColors[s._id] || "#9ca3af"
  }));
  const platformBars = [{
    label: "Workspaces",
    value: data.totalWorkspaces,
    color: "#4f46e5"
  }, {
    label: "Boards",
    value: data.totalBoards,
    color: "#6366f1"
  }, {
    label: "Tasks",
    value: data.totalTasks,
    color: "#818cf8"
  }, {
    label: "Messages",
    value: data.totalMessages,
    color: "#a5b4fc"
  }];
  //* Function for this task
  return <div className="space-y-6">
      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({
        label,
        value,
        icon: Icon,
        color,
        iconBg
      }, i) => <div key={label} className="group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50/60 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 shadow-sm hover:shadow-md transition-all text-left admin-fade-up" style={{
        animationDelay: `${i * 60}ms`
      }}>
          
            <div className={`w-8 h-8 rounded-lg border ${iconBg} flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-none truncate">{label}</p>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{typeof value === "number" ? value.toLocaleString() : value}</p>
            </div>
          </div>)}
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 admin-scale-in" style={{
        animationDelay: "300ms"
      }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-r from-indigo-50/70 via-violet-50/50 to-transparent dark:from-indigo-900/20 dark:via-violet-900/10 dark:to-transparent" />
          <div className="relative flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 shadow-sm shadow-indigo-600/30 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">User Growth</p>
                <p className="text-[11px] text-slate-400">New registrations over time</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-500">Last 12 months</span>
          </div>
          <div className="relative p-5 sm:p-6">
            <DotPlotChart data={growthData} labels={growthLabels} />
          </div>
        </div>

        {}
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-indigo-200/60 dark:hover:border-indigo-700/60 admin-scale-in" style={{
        animationDelay: "400ms"
      }}>
          <div className="relative px-5 sm:px-6 py-5 border-b border-slate-200/60 dark:border-slate-700/50 bg-white dark:bg-slate-800">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Subscriptions</p>
          </div>
          <div className="relative px-5 sm:px-6 py-8">
            <DonutChart segments={donutSegments} size={160} />
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 admin-fade-up" style={{
        animationDelay: "500ms"
      }}>
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/60 dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-center shrink-0">
                <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Platform Usage</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Content across the platform</p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <HorizontalBars items={platformBars} />
          </div>
        </div>

        {}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 admin-fade-up" style={{
        animationDelay: "600ms"
      }}>
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/60 dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Key Metrics</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Platform performance indicators</p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/20 p-4 text-center admin-scale-in transition-all duration-300 hover:shadow-sm" style={{
              animationDelay: "700ms"
            }}>
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{data.conversionRate}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Conversion Rate</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/20 p-4 text-center admin-scale-in transition-all duration-300 hover:shadow-sm" style={{
              animationDelay: "780ms"
            }}>
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {data.totalUsers > 0 ? (data.dailyActiveUsers / data.totalUsers * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">DAU / Total</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/20 p-4 text-center admin-scale-in transition-all duration-300 hover:shadow-sm" style={{
              animationDelay: "860ms"
            }}>
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {data.totalWorkspaces > 0 ? (data.totalBoards / data.totalWorkspaces).toFixed(1) : 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Boards / Workspace</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/20 p-4 text-center admin-scale-in transition-all duration-300 hover:shadow-sm" style={{
              animationDelay: "940ms"
            }}>
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {data.totalBoards > 0 ? (data.totalTasks / data.totalBoards).toFixed(1) : 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Tasks / Board</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>;
}