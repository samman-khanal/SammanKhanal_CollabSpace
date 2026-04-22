import { Check } from "lucide-react";
import type { PlanInfo, SubscriptionPlan, KhaltiPrices } from "../../types/subscription.types";
import { PLAN_FEATURES } from "../../constants/planFeatures";
interface PlanCardProps {
  plan: PlanInfo;
  currentPlan?: SubscriptionPlan;
  onSelect?: (plan: PlanInfo) => void;
  loading?: boolean;
  recommended?: boolean;
  paymentMethod?: "stripe" | "khalti";
  khaltiPrice?: number;
}
//* Function for plan card
export function PlanCard({
  plan,
  currentPlan,
  onSelect,
  loading = false,
  recommended = false,
  paymentMethod = "stripe",
  khaltiPrice
}: PlanCardProps) {
  const isPro = plan.id === "pro";
  const isPlus = plan.id === "plus";
  const isCurrentPlan = currentPlan === plan.id;
  //* Function for features
  const features = PLAN_FEATURES.filter(f => {
    const value = isPro ? f.pro : isPlus ? f.plus : f.free;
    return value === true || typeof value === "string";
  }).slice(0, 6);
  const showKhaltiPrice = paymentMethod === "khalti" && khaltiPrice !== undefined && plan.price > 0;
  //* Function for this task
  return <div className={`group relative flex flex-col h-full rounded-2xl p-5 sm:p-8 transition-all duration-300 bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200 hover:ring-1 hover:ring-indigo-200 ${isPro ? "bg-indigo-50/40" : ""} ${recommended ? "ring-2 ring-indigo-600 ring-offset-2" : ""}`}>
      
      {}
      {recommended && <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide bg-indigo-600 text-white rounded-full shadow-md">
            Recommended
          </span>
        </div>}

      {}
      {isCurrentPlan && <div className="absolute -top-3 right-4">
          <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide bg-green-500 text-white rounded-full shadow-md">
            Current Plan
          </span>
        </div>}

      {}
      <div className="mb-4">
        <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isPro ? "text-indigo-700" : isPlus ? "text-slate-900" : "text-slate-900"}`}>
          
          {plan.name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed min-h-10">
          {plan.description}
        </p>
      </div>

      {}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          {showKhaltiPrice ? <>
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                रू{khaltiPrice}
              </span>
              <span className="text-sm sm:text-base text-slate-600">/month</span>
            </> : <>
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                {plan.price === 0 ? "Free" : `$${(plan.price / 100).toFixed(2)}`}
              </span>
              {plan.price > 0 && <span className="text-sm sm:text-base text-slate-600">/month</span>}
            </>}
        </div>
        {plan.price === 0 && <p className="text-xs sm:text-sm text-slate-500 mt-1">Forever free</p>}
        {showKhaltiPrice && <p className="text-xs text-slate-500 mt-1">
            ≈ ${(plan.price / 100).toFixed(2)} USD
          </p>}
      </div>

      {}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-slate-50 rounded-xl p-2.5 sm:p-3 text-center border border-slate-100">
          <div className="text-base sm:text-lg font-bold text-slate-900">
            {plan.maxWorkspaces === "Unlimited" ? "∞" : plan.maxWorkspaces}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500">Workspaces</div>
        </div>
        <div className="flex-1 bg-slate-50 rounded-xl p-2.5 sm:p-3 text-center border border-slate-100">
          <div className="text-base sm:text-lg font-bold text-slate-900">
            {plan.maxBoards === "Unlimited" ? "∞" : plan.maxBoards}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500">Boards</div>
        </div>
      </div>

      {}
      <ul className="space-y-3 mb-8 grow">
        {features.map((feature, idx) => {
        const value = isPro ? feature.pro : isPlus ? feature.plus : feature.free;
        return <li key={idx} className="flex items-start gap-3">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0 mt-0.5" />
              <span className="text-[13px] sm:text-sm text-slate-700">
                {feature.name}
                {typeof value === "string" && <span className="text-slate-500 ml-1">({value})</span>}
              </span>
            </li>;
      })}
      </ul>

      {}
      {onSelect && <button onClick={() => !isCurrentPlan && onSelect(plan)} disabled={isCurrentPlan || loading} className={`w-full py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isCurrentPlan ? "bg-slate-100 text-slate-500 cursor-not-allowed" : isPro ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-xl" : isPlus ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-xl" : "bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-200 hover:ring-1 hover:ring-indigo-200"}`}>
        
          {loading ? "Processing..." : isCurrentPlan ? "Current Plan" : isPro ? "Upgrade to Pro" : isPlus ? "Upgrade to Plus" : "Get Started Free"}
        </button>}
    </div>;
}
interface PlanCardsGridProps {
  plans: PlanInfo[];
  currentPlan?: SubscriptionPlan;
  onSelectPlan?: (plan: PlanInfo) => void;
  loadingPlan?: SubscriptionPlan;
  paymentMethod?: "stripe" | "khalti";
  khaltiPrices?: KhaltiPrices;
}
//* Function for plan cards grid
export function PlanCardsGrid({
  plans,
  currentPlan,
  onSelectPlan,
  loadingPlan,
  paymentMethod = "stripe",
  khaltiPrices
}: PlanCardsGridProps) {
  const colsClass = plans.length >= 3 ? "lg:grid-cols-3 md:grid-cols-3" : "md:grid-cols-2";
  //* Function for this task
  return <div className={`grid ${colsClass} gap-6 lg:gap-8 max-w-6xl mx-auto`}>
      {plans.map(plan => <PlanCard key={plan.id} plan={plan} currentPlan={currentPlan} onSelect={onSelectPlan} loading={loadingPlan === plan.id} recommended={plan.id === "pro" && currentPlan === "free"} paymentMethod={paymentMethod} khaltiPrice={khaltiPrices?.[plan.id]?.priceNPR} />)}
    </div>;
}