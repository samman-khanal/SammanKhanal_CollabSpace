import { HTTP } from "../constants/httpStatus.constant.js";

//* Function for not found
export default function notFound(req, res) {
  res.status(HTTP.NOT_FOUND).json({
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
}
