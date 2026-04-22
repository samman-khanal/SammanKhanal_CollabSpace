import { Check, X } from "lucide-react";
import { PLAN_FEATURES } from "../../constants/planFeatures";
interface PlanFeatureListProps {
  plan: "free" | "plus" | "pro";
  showComparison?: boolean;
}
//* Function for plan feature list
export function PlanFeatureList({
  plan,
  showComparison = false
}: PlanFeatureListProps) {
  //* Function for features
  const features = PLAN_FEATURES.map(feature => ({
    ...feature,
    value: plan === "free" ? feature.free : plan === "plus" ? feature.plus : feature.pro
  }));
  //* Function for this task
  return <div className="space-y-3">
      {features.map((feature, idx) => {
      const isIncluded = feature.value === true || typeof feature.value === "string";
      const displayValue = typeof feature.value === "boolean" ? feature.value ? "Included" : "Not included" : feature.value;
      return <div key={idx} className="flex items-center gap-3">
            {isIncluded ? <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={2.5} />
              </div> : <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                <X className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} />
              </div>}
            <div className="flex-1">
              <span className={`text-sm ${isIncluded ? "text-slate-700" : "text-slate-400"}`}>
                {feature.name}
              </span>
              {showComparison && typeof feature.value === "string" && <span className="ml-2 text-sm font-medium text-slate-900">
                  ({displayValue})
                </span>}
            </div>
          </div>;
    })}
    </div>;
}
interface PlanComparisonTableProps {
  className?: string;
}
//* Function for plan comparison table
export function PlanComparisonTable({
  className = ""
}: PlanComparisonTableProps) {
  //* Function for this task
  return <div className={`overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs ${className}`}>
      <table className="w-full min-w-180 text-xs sm:text-sm sm:min-w-0">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 sm:px-6 sm:py-4 font-semibold text-slate-900">
              Feature
            </th>
            <th className="text-center px-4 py-3 sm:px-6 sm:py-4 font-semibold text-slate-900">
              Free
            </th>
            <th className="text-center px-4 py-3 sm:px-6 sm:py-4 font-semibold text-slate-900">
              Plus
            </th>
            <th className="text-center px-4 py-3 sm:px-6 sm:py-4 font-semibold text-indigo-700">
              Pro
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {PLAN_FEATURES.map((feature, idx) => <tr key={idx} className="bg-white hover:bg-slate-50/70 transition-colors">
            
              <td className="px-4 py-3 sm:px-6 sm:py-4 text-slate-800 font-medium text-xs sm:text-sm">{feature.name}</td>
              <td className="px-4 py-3 sm:px-6 sm:py-4 text-center text-slate-700">
                {typeof feature.free === "boolean" ? feature.free ? <Check className="w-5.5 h-5.5 text-green-600 mx-auto" strokeWidth={2.5} /> : <X className="w-5.5 h-5.5 text-slate-400 mx-auto" strokeWidth={2.5} /> : <span className="font-medium text-slate-700">{feature.free}</span>}
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4 text-center text-slate-700">
                {typeof feature.plus === "boolean" ? feature.plus ? <Check className="w-5.5 h-5.5 text-green-600 mx-auto" strokeWidth={2.5} /> : <X className="w-5.5 h-5.5 text-slate-400 mx-auto" strokeWidth={2.5} /> : <span className="font-medium text-slate-700">{feature.plus}</span>}
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4 text-center bg-indigo-50/30">
                {typeof feature.pro === "boolean" ? feature.pro ? <Check className="w-5.5 h-5.5 text-green-600 mx-auto" strokeWidth={2.5} /> : <X className="w-5.5 h-5.5 text-slate-400 mx-auto" strokeWidth={2.5} /> : <span className="font-semibold text-indigo-700">{feature.pro}</span>}
              </td>
            </tr>)}
        </tbody>
      </table>
    </div>;
}