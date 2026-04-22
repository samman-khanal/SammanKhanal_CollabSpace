import { verifyToken } from "../utils/jwt.util.js";
import User from "../models/User.model.js";
import { HTTP } from "../constants/httpStatus.constant.js";

//* Function for auth middleware
export default async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token)
      return res.status(HTTP.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user)
      return res.status(HTTP.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    req.user = user;
    next();
  } catch {
    return res.status(HTTP.UNAUTHORIZED).json({
      message: "Invalid token",
    });
  }
}
