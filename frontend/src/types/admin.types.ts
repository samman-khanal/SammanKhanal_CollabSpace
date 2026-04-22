export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  isEmailVerified: boolean;
  avatarUrl: string;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
  subscription: {
    _id: string;
    plan: "free" | "plus" | "pro";
    status: string;
    currentPeriodEnd: string | null;
  } | null;
}
export interface AdminUserDetail extends AdminUser {
  workspaces: {
    _id: string;
    name: string;
    description: string;
    myRole: string;
    createdAt: string;
  }[];
  notificationCount: number;
}
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pages: number;
  [key: string]: T[] | number;
}
export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
}
export interface AdminWorkspace {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    fullName: string;
    email: string;
  };
  memberCount: number;
  boardCount: number;
  createdAt: string;
}
export interface WorkspaceListResponse {
  workspaces: AdminWorkspace[];
  total: number;
  page: number;
  pages: number;
}
export interface WorkspaceDetail extends AdminWorkspace {
  members: {
    _id: string;
    user: {
      _id: string;
      fullName: string;
      email: string;
      avatarUrl: string;
    };
    role: string;
  }[];
  boards: {
    _id: string;
    name: string;
    methodology: string;
    createdAt: string;
  }[];
}
export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
export interface ContactListResponse {
  messages: ContactMessage[];
  total: number;
  page: number;
  pages: number;
}
export interface StripePayment {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  amount: number;
  currency: string;
  status: string;
  receiptUrl: string | null;
  description: string;
  createdAt: string;
}
export interface KhaltiPaymentItem {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  pidx: string;
  transactionId: string | null;
  planId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}
export interface PaymentListResponse {
  payments: StripePayment[] | KhaltiPaymentItem[];
  total: number;
  page: number;
  pages: number;
}
export interface SubscriptionOverview {
  planCounts: {
    _id: string;
    count: number;
  }[];
  statusCounts: {
    _id: string;
    count: number;
  }[];
}
export interface RevenueMetrics {
  stripe: {
    totalRevenue: number;
    totalPayments: number;
    failedPayments: number;
  };
  khalti: {
    totalRevenue: number;
    totalPayments: number;
    failedPayments: number;
  };
  mrr: number;
}
export interface AdminMessage {
  _id: string;
  content: string;
  sender: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl: string;
  };
  channel: {
    _id: string;
    name: string;
    workspace: string;
  } | null;
  createdAt: string;
  deletedAt: string | null;
}
export interface MessageListResponse {
  messages: AdminMessage[];
  total: number;
  page: number;
  pages: number;
}
export interface AdminComment {
  _id: string;
  text: string;
  author: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl: string;
  };
  task: {
    _id: string;
    title: string;
    board: string;
  };
  createdAt: string;
}
export interface CommentListResponse {
  comments: AdminComment[];
  total: number;
  page: number;
  pages: number;
}
export interface AdminAttachment {
  _id: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  task: {
    _id: string;
    title: string;
  };
  createdAt: string;
}
export interface AttachmentListResponse {
  attachments: AdminAttachment[];
  total: number;
  page: number;
  pages: number;
}
export interface AdminChannel {
  _id: string;
  name: string;
  type: "public" | "private";
  workspace: {
    _id: string;
    name: string;
  };
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}
export interface ChannelListResponse {
  channels: AdminChannel[];
  total: number;
  page: number;
  pages: number;
}
export interface Analytics {
  totalUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  totalWorkspaces: number;
  totalBoards: number;
  totalTasks: number;
  totalMessages: number;
  userGrowth: {
    _id: {
      year: number;
      month: number;
    };
    count: number;
  }[];
  subscriptionBreakdown: {
    _id: string;
    count: number;
  }[];
  conversionRate: number;
}
export interface SystemHealth {
  database: string;
  recentFailedStripePayments: (StripePayment & {
    stripePaymentIntentId?: string;
  })[];
  pendingKhaltiVerifications: KhaltiPaymentItem[];
  usersNearPlanLimits: {
    user: {
      _id: string;
      fullName: string;
      email: string;
    };
    plan: string;
    resource: string;
    current: number;
    limit: number;
  }[];
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
}