import * as subscriptionService from "../services/subscription.service.js";
import { HTTP } from "../constants/httpStatus.constant.js";

//* Function for build limit check
const buildLimitCheck = (checkFn, label) => async (req, res, next) => {
  try {
    const result = await checkFn(req.user._id);
    if (!result.allowed) {
      return res.status(HTTP.FORBIDDEN).json({
        error: `${label} limit reached`,
        message: result.reason,
        currentCount: result.currentCount,
        limit: result.limit,
        upgradeRequired: true,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};
export const checkWorkspaceLimit = buildLimitCheck(
  subscriptionService.canCreateWorkspace,
  "Workspace",
);
export const checkBoardLimit = buildLimitCheck(
  subscriptionService.canCreateBoard,
  "Board",
);
//* Function for attach subscription
export const attachSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getUserSubscription(
      req.user._id,
    );
    const limits = await subscriptionService.getUserPlanLimits(req.user._id);
    req.subscription = subscription;
    req.planLimits = limits;
    next();
  } catch (err) {
    next(err);
  }
};
