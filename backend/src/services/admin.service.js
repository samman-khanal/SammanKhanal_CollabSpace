import mongoose from "mongoose";
import User from "../models/User.model.js";
import Subscription from "../models/Subscription.model.js";
import Payment from "../models/Payment.model.js";
import KhaltiPayment from "../models/KhaltiPayment.model.js";
import ContactMessage from "../models/ContactMessage.model.js";
import Workspace from "../models/Workspace.model.js";
import WorkspaceMember from "../models/WorkspaceMember.model.js";
import Board from "../models/Board.model.js";
import Task from "../models/Task.model.js";
import Message from "../models/Message.model.js";
import Comment from "../models/Comment.model.js";
import Channel from "../models/Channel.model.js";
import Notification from "../models/Notification.model.js";
import Attachment from "../models/Attachment.model.js";
import EmailVerification from "../models/EmailVerification.model.js";
import { ROLES } from "../constants/roles.constant.js";
import { PLAN_LIMITS } from "../constants/subscriptionPlans.constant.js";
import { AppError } from "../utils/AppError.util.js";
import { sendEmail } from "../utils/sendEmail.util.js";
import { APP_EVENTS } from "../constants/appEvents.constant.js";

//* Function for list users
export const listUsers = async ({
  page = 1,
  limit = 20,
  search = "",
  role,
  plan,
  isEmailVerified,
}) => {
  const filter = {};
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      {
        fullName: regex,
      },
      {
        email: regex,
      },
    ];
  }
  if (role) filter.role = role;
  if (isEmailVerified !== undefined)
    filter.isEmailVerified = isEmailVerified === "true";
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  //* Function for user ids
  const userIds = users.map((u) => u._id);
  const subs = await Subscription.find({
    user: {
      $in: userIds,
    },
  }).lean();

  const subMap = new Map(subs.map((s) => [String(s.user), s]));

  let enriched = users.map((u) => ({
    ...u,
    subscription: subMap.get(String(u._id)) || null,
  }));
  if (plan) {
    enriched = enriched.filter((u) => u.subscription?.plan === plan);
  }
  return {
    users: enriched,
    total: plan ? enriched.length : total,
    page,
    pages: Math.ceil((plan ? enriched.length : total) / limit),
  };
};

//* Function for get user detail
export const getUserDetail = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash").lean();
  if (!user) throw new AppError("User not found", 404);
  const [subscription, memberships, notifCount] = await Promise.all([
    Subscription.findOne({
      user: userId,
    }).lean(),
    WorkspaceMember.find({
      user: userId,
    })
      .populate("workspace")
      .lean(),
    Notification.countDocuments({
      user: userId,
    }),
  ]);
  return {
    ...user,
    subscription,
    workspaces: memberships
      .filter((m) => m.workspace)
      .map((m) => ({
        ...m.workspace,
        myRole: m.role,
      })),
    notificationCount: notifCount,
  };
};

//* Function for update user role
export const updateUserRole = async (userId, newRole) => {
  if (!Object.values(ROLES).includes(newRole)) {
    throw new AppError("Invalid role", 400);
  }
  const user = await User.findByIdAndUpdate(
    userId,
    {
      role: newRole,
    },
    {
      new: true,
    },
  ).select("-passwordHash");
  if (!user) throw new AppError("User not found", 404);
  return user;
};

//* Function for ban user
export const banUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isEmailVerified: false,
      role: ROLES.USER,
    },
    {
      new: true,
    },
  ).select("-passwordHash");
  if (!user) throw new AppError("User not found", 404);
  return user;
};

//* Function for resend verification
export const resendVerification = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  if (user.isEmailVerified) throw new AppError("User is already verified", 400);
  await EmailVerification.updateMany(
    {
      user: userId,
      used: false,
    },
    {
      used: true,
    },
  );
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  await EmailVerification.create({
    user: userId,
    token: otp,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });
  await sendEmail({
    to: user.email,
    subject: "Your verification code - CollabSpace (Admin resend)",
    html: `<p>Hi ${user.fullName},</p><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`,
  });
  return {
    sent: true,
  };
};

//* Function for reset verification state
export const resetVerificationState = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isEmailVerified: true,
    },
    {
      new: true,
    },
  ).select("-passwordHash");
  if (!user) throw new AppError("User not found", 404);
  await EmailVerification.updateMany(
    {
      user: userId,
      used: false,
    },
    {
      used: true,
    },
  );
  return user;
};

//* Function for get subscription overview
export const getSubscriptionOverview = async () => {
  const planCounts = await Subscription.aggregate([
    {
      $group: {
        _id: "$plan",
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  const statusCounts = await Subscription.aggregate([
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  return {
    planCounts,
    statusCounts,
  };
};

//* Function for list payments
export const listPayments = async ({ page = 1, limit = 20, status }) => {
  const filter = {};
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("user", "fullName email")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
  ]);
  return {
    payments,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

//* Function for list khalti payments
export const listKhaltiPayments = async ({ page = 1, limit = 20, status }) => {
  const filter = {};
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    KhaltiPayment.find(filter)
      .populate("user", "fullName email")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    KhaltiPayment.countDocuments(filter),
  ]);
  return {
    payments,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

//* Function for get revenue metrics
export const getRevenueMetrics = async () => {
  const [totalStripe, failedStripe, totalKhalti, failedKhalti] =
    await Promise.all([
      Payment.aggregate([
        {
          $match: {
            status: "succeeded",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]),
      Payment.countDocuments({
        status: "failed",
      }),
      KhaltiPayment.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]),
      KhaltiPayment.countDocuments({
        status: "failed",
      }),
    ]);
  const activePaid = await Subscription.find({
    plan: {
      $ne: "free",
    },
    status: "active",
  }).lean();
  //* Function for mrr
  const mrr = activePaid.reduce((sum, sub) => {
    const planInfo = PLAN_LIMITS[sub.plan];
    return sum + (planInfo?.price || 0);
  }, 0);
  return {
    stripe: {
      totalRevenue: totalStripe[0]?.total || 0,
      totalPayments: totalStripe[0]?.count || 0,
      failedPayments: failedStripe,
    },
    khalti: {
      totalRevenue: totalKhalti[0]?.total || 0,
      totalPayments: totalKhalti[0]?.count || 0,
      failedPayments: failedKhalti,
    },
    mrr,
  };
};

//* Function for override plan
export const overridePlan = async (userId, newPlan) => {
  if (!PLAN_LIMITS[newPlan]) throw new AppError("Invalid plan", 400);
  let sub = await Subscription.findOne({
    user: userId,
  });
  if (!sub) {
    sub = await Subscription.create({
      user: userId,
      plan: newPlan,
      status: "active",
    });
  } else {
    sub.plan = newPlan;
    sub.status = "active";
    await sub.save();
  }
  return sub;
};
//* Function for list contact messages
export const listContactMessages = async ({ page = 1, limit = 20, isRead }) => {
  const filter = {};
  if (isRead !== undefined) filter.isRead = isRead === "true";
  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    ContactMessage.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    ContactMessage.countDocuments(filter),
  ]);
  return {
    messages,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

//* Function for mark contact read
export const markContactRead = async (messageId) => {
  const msg = await ContactMessage.findByIdAndUpdate(
    messageId,
    {
      isRead: true,
    },
    {
      new: true,
    },
  );
  if (!msg) throw new AppError("Message not found", 404);
  return msg;
};

//* Function for reply to contact
export const replyToContact = async (messageId, replyText) => {
  const msg = await ContactMessage.findById(messageId);
  if (!msg) throw new AppError("Message not found", 404);
  await sendEmail({
    to: msg.email,
    subject: `Re: ${msg.subject} — CollabSpace Support`,
    html: `<p>Hi ${msg.name},</p><p>${replyText}</p><p>— CollabSpace Team</p>`,
  });
  msg.isRead = true;
  await msg.save();
  return {
    sent: true,
  };
};

//* Function for delete contact message
export const deleteContactMessage = async (messageId) => {
  const result = await ContactMessage.deleteOne({
    _id: messageId,
  });
  if (!result.deletedCount) throw new AppError("Message not found", 404);
  return {
    deleted: true,
  };
};

//* Function for list workspaces
export const listWorkspaces = async ({ page = 1, limit = 20, search = "" }) => {
  const filter = {};
  if (search) {
    filter.name = new RegExp(search, "i");
  }
  const skip = (page - 1) * limit;
  const [workspaces, total] = await Promise.all([
    Workspace.find(filter)
      .populate("owner", "fullName email")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Workspace.countDocuments(filter),
  ]);
  //* Function for ws ids
  const wsIds = workspaces.map((w) => w._id);
  const [memberCounts, boardCounts] = await Promise.all([
    WorkspaceMember.aggregate([
      {
        $match: {
          workspace: {
            $in: wsIds,
          },
        },
      },
      {
        $group: {
          _id: "$workspace",
          count: {
            $sum: 1,
          },
        },
      },
    ]),
    Board.aggregate([
      {
        $match: {
          workspace: {
            $in: wsIds,
          },
        },
      },
      {
        $group: {
          _id: "$workspace",
          count: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  const memberMap = new Map(memberCounts.map((c) => [String(c._id), c.count]));

  const boardMap = new Map(boardCounts.map((c) => [String(c._id), c.count]));

  const enriched = workspaces.map((w) => ({
    ...w,
    memberCount: memberMap.get(String(w._id)) || 0,
    boardCount: boardMap.get(String(w._id)) || 0,
  }));
  return {
    workspaces: enriched,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

//* Function for get workspace detail
export const getWorkspaceDetail = async (workspaceId) => {
  const ws = await Workspace.findById(workspaceId)
    .populate("owner", "fullName email")
    .lean();
  if (!ws) throw new AppError("Workspace not found", 404);
  const [members, boards] = await Promise.all([
    WorkspaceMember.find({
      workspace: workspaceId,
    })
      .populate("user", "fullName email avatarUrl")
      .lean(),
    Board.find({
      workspace: workspaceId,
    }).lean(),
  ]);
  return {
    ...ws,
    members,
    boards,
  };
};

//* Function for delete workspace
export const deleteWorkspace = async (workspaceId) => {
  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw new AppError("Workspace not found", 404);
  const boards = await Board.find({
    workspace: workspaceId,
  }).select("_id");
  //* Function for board ids
  const boardIds = boards.map((b) => b._id);
  const channels = await Channel.find({
    workspace: workspaceId,
  }).select("_id");
  //* Function for channel ids
  const channelIds = channels.map((c) => c._id);
  await Promise.all([
    Task.deleteMany({
      board: {
        $in: boardIds,
      },
    }),
    Comment.deleteMany({
      task: {
        $in: await Task.find({
          board: {
            $in: boardIds,
          },
        }).distinct("_id"),
      },
    }),
    Attachment.deleteMany({
      task: {
        $in: await Task.find({
          board: {
            $in: boardIds,
          },
        }).distinct("_id"),
      },
    }),
    Message.deleteMany({
      channel: {
        $in: channelIds,
      },
    }),
    Channel.deleteMany({
      workspace: workspaceId,
    }),
    Board.deleteMany({
      workspace: workspaceId,
    }),
    WorkspaceMember.deleteMany({
      workspace: workspaceId,
    }),
    Workspace.deleteOne({
      _id: workspaceId,
    }),
  ]);
  return {
    deleted: true,
  };
};

//* Function for list messages
export const listMessages = async ({ page = 1, limit = 20, channelId }) => {
  const filter = {
    deletedAt: null,
  };
  if (channelId) filter.channel = channelId;
  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    Message.find(filter)
      .populate("sender", "fullName email avatarUrl")
      .populate("channel", "name workspace")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments(filter),
  ]);
  return {
    messages,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

//* Function for delete message
export const deleteMessage = async (messageId) => {
  const msg = await Message.findByIdAndUpdate(
    messageId,
    {
      deletedAt: new Date(),
      content: "[Removed by admin]",
    },
    {
      new: true,
    },
  );
  if (!msg) throw new AppError("Message not found", 404);
  return msg;
};

//* Function for list comments
export const listComments = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const [comments, total] = await Promise.all([
    Comment.find()
      .populate("author", "fullName email avatarUrl")
      .populate("task", "title board")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(),
  ]);
  return {
    comments,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

//* Function for delete comment
export const deleteComment = async (commentId) => {
  const result = await Comment.deleteOne({
    _id: commentId,
  });
  if (!result.deletedCount) throw new AppError("Comment not found", 404);
  return {
    deleted: true,
  };
};

//* Function for list attachments
export const listAttachments = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const [attachments, total] = await Promise.all([
    Attachment.find()
      .populate("uploadedBy", "fullName email")
      .populate("task", "title")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Attachment.countDocuments(),
  ]);
  return {
    attachments,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

//* Function for list channels
export const listChannels = async ({ page = 1, limit = 20, workspaceId }) => {
  const filter = {};
  if (workspaceId) filter.workspace = workspaceId;
  const skip = (page - 1) * limit;
  const [channels, total] = await Promise.all([
    Channel.find(filter)
      .populate("workspace", "name")
      .populate("createdBy", "fullName email")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Channel.countDocuments(filter),
  ]);
  return {
    channels,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

//* Function for delete channel
export const deleteChannel = async (channelId) => {
  const ch = await Channel.findById(channelId);
  if (!ch) throw new AppError("Channel not found", 404);
  await Promise.all([
    Message.deleteMany({
      channel: channelId,
    }),
    Channel.deleteOne({
      _id: channelId,
    }),
  ]);
  return {
    deleted: true,
  };
};

//* Function for get analytics
export const getAnalytics = async () => {
  const now = new Date();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const [
    totalUsers,
    dailyActiveUsers,
    weeklyActiveUsers,
    totalWorkspaces,
    totalBoards,
    totalTasks,
    totalMessages,
    userGrowth,
    subscriptionBreakdown,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({
      updatedAt: {
        $gte: dayAgo,
      },
    }),
    User.countDocuments({
      updatedAt: {
        $gte: weekAgo,
      },
    }),
    Workspace.countDocuments(),
    Board.countDocuments(),
    Task.countDocuments(),
    Message.countDocuments({
      deletedAt: null,
    }),
    User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1),
          },
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),
    Subscription.aggregate([
      {
        $group: {
          _id: "$plan",
          count: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);
  //* Function for total subs
  const totalSubs = subscriptionBreakdown.reduce((s, b) => s + b.count, 0);
  //* Function for paid subs
  const paidSubs = subscriptionBreakdown
    .filter((b) => b._id !== "free")
    .reduce((s, b) => s + b.count, 0);
  const conversionRate =
    totalSubs > 0 ? ((paidSubs / totalSubs) * 100).toFixed(1) : 0;
  return {
    totalUsers,
    dailyActiveUsers,
    weeklyActiveUsers,
    totalWorkspaces,
    totalBoards,
    totalTasks,
    totalMessages,
    userGrowth,
    subscriptionBreakdown,
    conversionRate: Number(conversionRate),
  };
};

//* Function for broadcast notification
export const broadcastNotification = async ({ message, meta = {}, io }) => {
  const users = await User.find().select("_id").lean();
  //* Function for docs
  const docs = users.map((u) => ({
    user: u._id,
    type: "system_announcement",
    message,
    meta,
    deliveredAt: new Date(),
  }));
  const notifications = await Notification.insertMany(docs);
  if (io) {
    for (const notif of notifications) {
      io.to(`user:${String(notif.user)}`).emit(
        APP_EVENTS.NOTIFICATION_NEW,
        notif,
      );
    }
  }
  return {
    sent: notifications.length,
  };
};

//* Function for get system health
export const getSystemHealth = async () => {
  const recentFailedStripe = await Payment.find({
    status: "failed",
  })
    .populate("user", "fullName email")
    .sort({
      createdAt: -1,
    })
    .limit(20)
    .lean();
  const pendingKhalti = await KhaltiPayment.find({
    status: {
      $in: ["initiated", "pending"],
    },
  })
    .populate("user", "fullName email")
    .sort({
      createdAt: -1,
    })
    .limit(20)
    .lean();
  const subscriptions = await Subscription.find({
    status: "active",
  }).lean();
  const limitWarnings = [];
  for (const sub of subscriptions) {
    const limits = PLAN_LIMITS[sub.plan];
    if (!limits || limits.maxWorkspaces === Infinity) continue;
    const wsCount = await WorkspaceMember.aggregate([
      {
        $match: {
          user: sub.user,
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);
    const count = wsCount[0]?.count || 0;
    if (count >= limits.maxWorkspaces * 0.8) {
      const user = await User.findById(sub.user)
        .select("fullName email")
        .lean();
      limitWarnings.push({
        user,
        plan: sub.plan,
        resource: "workspaces",
        current: count,
        limit: limits.maxWorkspaces,
      });
    }
  }
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return {
    database: dbStatus[dbState] || "unknown",
    recentFailedStripePayments: recentFailedStripe,
    pendingKhaltiVerifications: pendingKhalti,
    usersNearPlanLimits: limitWarnings.slice(0, 20),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  };
};
