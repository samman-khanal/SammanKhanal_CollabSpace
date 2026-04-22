import { api } from "../api/axios";
import type { KhaltiPaymentInitResponse, KhaltiPaymentVerifyResponse, KhaltiPayment, KhaltiPrices, SubscriptionPlan } from "../types/subscription.types";
const khaltiService = {
  //* Method for khalti service
  async getPrices(): Promise<KhaltiPrices> {
    const {
      data
    } = await api.get<KhaltiPrices>("/khalti/prices");
    return data;
  },
  //* Method for khalti service
  async initiatePayment(planId: Exclude<SubscriptionPlan, "free">, returnUrl: string, websiteUrl: string): Promise<KhaltiPaymentInitResponse> {
    const {
      data
    } = await api.post<KhaltiPaymentInitResponse>("/khalti/initiate", {
      planId,
      returnUrl,
      websiteUrl
    });
    return data;
  },
  //* Method for khalti service
  async verifyPayment(pidx: string): Promise<KhaltiPaymentVerifyResponse> {
    const {
      data
    } = await api.post<KhaltiPaymentVerifyResponse>("/khalti/verify", {
      pidx
    });
    return data;
  },
  //* Method for khalti service
  async handleCallback(params: {
    pidx: string;
    status?: string;
    transaction_id?: string;
    purchase_order_id?: string;
  }): Promise<{
    success: boolean;
    status: string;
    transactionId: string | null;
    planId: SubscriptionPlan;
  }> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const {
      data
    } = await api.get(`/khalti/callback?${queryString}`);
    return data;
  },
  //* Method for khalti service
  async getPaymentHistory(): Promise<KhaltiPayment[]> {
    const {
      data
    } = await api.get<KhaltiPayment[]>("/khalti/payments");
    return data;
  }
};
export default khaltiService;