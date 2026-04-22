import { HTTP } from "../constants/httpStatus.constant.js";

//* Function for require workspace role
export const requireWorkspaceRole =
  (allowed = []) =>
  (req, res, next) => {
    const role = req.workspaceMember?.role;
    if (!allowed.includes(role))
      return res.status(HTTP.FORBIDDEN).json({
        message: "Forbidden",
      });
    next();
  };
