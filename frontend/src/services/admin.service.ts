import { api } from "../api/axios";
import type { UserListResponse, AdminUserDetail, AdminUser, WorkspaceListResponse, WorkspaceDetail, ContactListResponse, ContactMessage, PaymentListResponse, SubscriptionOverview, RevenueMetrics, MessageListResponse, CommentListResponse, AttachmentListResponse, ChannelListResponse, Analytics, SystemHealth } from "../types/admin.types";
const adminService = {
  //* Method for admin service
  async listUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    plan?: string;
    isEmailVerified?: string;
  }): Promise<UserListResponse> {
    const {
      data
    } = await api.get("/admin/users", {
      params
    });
    return data;
  },
  //* Method for admin service
  async getUserDetail(userId: string): Promise<AdminUserDetail> {
    const {
      data
    } = await api.get(`/admin/users/${userId}`);
    return data;
  },
  //* Method for admin service
  async updateUserRole(userId: string, role: string): Promise<AdminUser> {
    const {
      data
    } = await api.patch(`/admin/users/${userId}/role`, {
      role
    });
    return data;
  },
  //* Method for admin service
  async banUser(userId: string): Promise<AdminUser> {
    const {
      data
    } = await api.post(`/admin/users/${userId}/ban`);
    return data;
  },
  //* Method for admin service
  async resendVerification(userId: string): Promise<{
    sent: boolean;
  }> {
    const {
      data
    } = await api.post(`/admin/users/${userId}/resend-verification`);
    return data;
  },
  //* Method for admin service
  async resetVerificationState(userId: string): Promise<AdminUser> {
    const {
      data
    } = await api.post(`/admin/users/${userId}/reset-verification`);
    return data;
  },
  //* Method for admin service
  async getSubscriptionOverview(): Promise<SubscriptionOverview> {
    const {
      data
    } = await api.get("/admin/subscriptions/overview");
    return data;
  },
  //* Method for admin service
  async listStripePayments(params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaymentListResponse> {
    const {
      data
    } = await api.get("/admin/payments/stripe", {
      params
    });
    return data;
  },
  //* Method for admin service
  async listKhaltiPayments(params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaymentListResponse> {
    const {
      data
    } = await api.get("/admin/payments/khalti", {
      params
    });
    return data;
  },
  //* Method for admin service
  async getRevenueMetrics(): Promise<RevenueMetrics> {
    const {
      data
    } = await api.get("/admin/revenue");
    return data;
  },
  //* Method for admin service
  async overridePlan(userId: string, plan: string): Promise<unknown> {
    const {
      data
    } = await api.patch(`/admin/users/${userId}/plan`, {
      plan
    });
    return data;
  },
  //* Method for admin service
  async listContactMessages(params: {
    page?: number;
    limit?: number;
    isRead?: string;
  }): Promise<ContactListResponse> {
    const {
      data
    } = await api.get("/admin/contacts", {
      params
    });
    return data;
  },
  //* Method for admin service
  async markContactRead(messageId: string): Promise<ContactMessage> {
    const {
      data
    } = await api.patch(`/admin/contacts/${messageId}/read`);
    return data;
  },
  //* Method for admin service
  async replyToContact(messageId: string, reply: string): Promise<{
    sent: boolean;
  }> {
    const {
      data
    } = await api.post(`/admin/contacts/${messageId}/reply`, {
      reply
    });
    return data;
  },
  //* Method for admin service
  async deleteContactMessage(messageId: string): Promise<{
    deleted: boolean;
  }> {
    const {
      data
    } = await api.delete(`/admin/contacts/${messageId}`);
    return data;
  },
  //* Method for admin service
  async listWorkspaces(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<WorkspaceListResponse> {
    const {
      data
    } = await api.get("/admin/workspaces", {
      params
    });
    return data;
  },
  //* Method for admin service
  async getWorkspaceDetail(workspaceId: string): Promise<WorkspaceDetail> {
    const {
      data
    } = await api.get(`/admin/workspaces/${workspaceId}`);
    return data;
  },
  //* Method for admin service
  async deleteWorkspace(workspaceId: string): Promise<{
    deleted: boolean;
  }> {
    const {
      data
    } = await api.delete(`/admin/workspaces/${workspaceId}`);
    return data;
  },
  //* Method for admin service
  async listMessages(params: {
    page?: number;
    limit?: number;
    channelId?: string;
  }): Promise<MessageListResponse> {
    const {
      data
    } = await api.get("/admin/messages", {
      params
    });
    return data;
  },
  //* Method for admin service
  async deleteMessage(messageId: string): Promise<unknown> {
    const {
      data
    } = await api.delete(`/admin/messages/${messageId}`);
    return data;
  },
  //* Method for admin service
  async listComments(params: {
    page?: number;
    limit?: number;
  }): Promise<CommentListResponse> {
    const {
      data
    } = await api.get("/admin/comments", {
      params
    });
    return data;
  },
  //* Method for admin service
  async deleteComment(commentId: string): Promise<{
    deleted: boolean;
  }> {
    const {
      data
    } = await api.delete(`/admin/comments/${commentId}`);
    return data;
  },
  //* Method for admin service
  async listAttachments(params: {
    page?: number;
    limit?: number;
  }): Promise<AttachmentListResponse> {
    const {
      data
    } = await api.get("/admin/attachments", {
      params
    });
    return data;
  },
  //* Method for admin service
  async listChannels(params: {
    page?: number;
    limit?: number;
    workspaceId?: string;
  }): Promise<ChannelListResponse> {
    const {
      data
    } = await api.get("/admin/channels", {
      params
    });
    return data;
  },
  //* Method for admin service
  async deleteChannel(channelId: string): Promise<{
    deleted: boolean;
  }> {
    const {
      data
    } = await api.delete(`/admin/channels/${channelId}`);
    return data;
  },
  //* Method for admin service
  async getAnalytics(): Promise<Analytics> {
    const {
      data
    } = await api.get("/admin/analytics");
    return data;
  },
  //* Method for admin service
  async broadcastNotification(message: string, meta?: Record<string, unknown>): Promise<{
    sent: number;
  }> {
    const {
      data
    } = await api.post("/admin/broadcast", {
      message,
      meta
    });
    return data;
  },
  //* Method for admin service
  async getSystemHealth(): Promise<SystemHealth> {
    const {
      data
    } = await api.get("/admin/health");
    return data;
  }
};
export default adminService;