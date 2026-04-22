import Message from "../models/Message.model.js";
import Subscription from "../models/Subscription.model.js";
import Channel from "../models/Channel.model.js";
import DMConversation from "../models/DMConversation.model.js";
import {
  SUBSCRIPTION_PLANS,
  PLAN_LIMITS,
} from "../constants/subscriptionPlans.constant.js";
//* Function for cleanup free user messages
export const cleanupFreeUserMessages = async () => {
  try {
    const freeSubscriptions = await Subscription.find({
      plan: SUBSCRIPTION_PLANS.FREE,
    }).select("user");
    //* Function for free user ids
    const freeUserIds = freeSubscriptions.map((sub) => sub.user);
    if (freeUserIds.length === 0) {
      return {
        deletedCount: 0,
      };
    }
    const retentionDays =
      PLAN_LIMITS[SUBSCRIPTION_PLANS.FREE].messageRetentionDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const result = await Message.deleteMany({
      sender: {
        $in: freeUserIds,
      },
      createdAt: {
        $lt: cutoffDate,
      },
      deletedAt: null,
    });
    return {
      deletedCount: result.deletedCount,
      cutoffDate,
    };
  } catch (error) {
    console.error("[MessageCleanup] Error during cleanup:", error);
    throw error;
  }
};
//* Function for get cleanup stats
export const getCleanupStats = async () => {
  const freeSubscriptions = await Subscription.find({
    plan: SUBSCRIPTION_PLANS.FREE,
  }).select("user");
  //* Function for free user ids
  const freeUserIds = freeSubscriptions.map((sub) => sub.user);
  const retentionDays =
    PLAN_LIMITS[SUBSCRIPTION_PLANS.FREE].messageRetentionDays;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  const count = await Message.countDocuments({
    sender: {
      $in: freeUserIds,
    },
    createdAt: {
      $lt: cutoffDate,
    },
    deletedAt: null,
  });
  return {
    messagesToDelete: count,
    freeUsersCount: freeUserIds.length,
    cutoffDate,
    retentionDays,
  };
};
let cleanupInterval = null;
//* Function for start cleanup job
export const startCleanupJob = (intervalHours = 24) => {
  cleanupFreeUserMessages().catch(console.error);
  const intervalMs = intervalHours * 60 * 60 * 1000;
  //* Function for cleanup interval
  cleanupInterval = setInterval(() => {
    cleanupFreeUserMessages().catch(console.error);
  }, intervalMs);
  return cleanupInterval;
};
//* Function for stop cleanup job
export const stopCleanupJob = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};
export default {
  cleanupFreeUserMessages,
  getCleanupStats,
  startCleanupJob,
  stopCleanupJob,
};
