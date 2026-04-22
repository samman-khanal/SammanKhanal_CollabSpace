import { HTTP } from "../constants/httpStatus.constant.js";
//* Function for require role
export const requireRole =
  (roles = []) =>
  (req, res, next) => {
    const userRole = req.user?.role;
    if (!roles.includes(userRole))
      return res.status(HTTP.FORBIDDEN).json({
        message: "Forbidden",
      });
    next();
  };
