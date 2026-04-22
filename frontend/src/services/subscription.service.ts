import { api } from "../api/axios";
import type { SubscriptionWithLimits, PlanInfo, CheckoutSession, BillingPortalSession, LimitCheckResult, Payment, Subscription, SubscriptionPlan } from "../types/subscription.types";
const subscriptionService = {
  //* Method for subscription service
  async getMySubscription(): Promise<SubscriptionWithLimits> {
    const {
      data
    } = await api.get<SubscriptionWithLimits>("/subscriptions/me");
    return data;
  },
  //* Method for subscription service
  async getPlans(): Promise<PlanInfo[]> {
    const {
      data
    } = await api.get<PlanInfo[]>("/subscriptions/plans");
    return data;
  },
  //* Method for subscription service
  async createCheckoutSession(planId: Exclude<SubscriptionPlan, "free">, successUrl: string, cancelUrl: string): Promise<CheckoutSession> {
    const {
      data
    } = await api.post<CheckoutSession>("/subscriptions/checkout", {
      planId,
      successUrl,
      cancelUrl
    });
    return data;
  },
  //* Method for subscription service
  async createBillingPortalSession(returnUrl: string): Promise<BillingPortalSession> {
    const {
      data
    } = await api.post<BillingPortalSession>("/subscriptions/billing-portal", {
      returnUrl
    });
    return data;
  },
  //* Method for subscription service
  async cancelSubscription(): Promise<{
    message: string;
    subscription: Subscription;
  }> {
    const {
      data
    } = await api.post<{
      message: string;
      subscription: Subscription;
    }>("/subscriptions/cancel");
    return data;
  },
  //* Method for subscription service
  async resumeSubscription(): Promise<{
    message: string;
    subscription: Subscription;
  }> {
    const {
      data
    } = await api.post<{
      message: string;
      subscription: Subscription;
    }>("/subscriptions/resume");
    return data;
  },
  //* Method for subscription service
  async getPaymentHistory(): Promise<Payment[]> {
    const {
      data
    } = await api.get<Payment[]>("/subscriptions/payments");
    return data;
  },
  //* Method for subscription service
  async checkWorkspaceLimit(): Promise<LimitCheckResult> {
    const {
      data
    } = await api.get<LimitCheckResult>("/subscriptions/limits/workspace");
    return data;
  },
  //* Method for subscription service
  async checkBoardLimit(): Promise<LimitCheckResult> {
    const {
      data
    } = await api.get<LimitCheckResult>("/subscriptions/limits/board");
    return data;
  }
};
export default subscriptionService;