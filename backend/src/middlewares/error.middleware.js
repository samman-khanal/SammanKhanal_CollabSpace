import { HTTP } from "../constants/httpStatus.constant.js";

//* Function for error handler
export default function errorHandler(err, req, res, _next) {
  console.error(err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "File exceeds the 10 MB size limit",
    });
  }
  const status = err.statusCode || HTTP.SERVER_ERROR;
  res.status(status).json({
    message: err.message || "Server error",
    ...(process.env.NODE_ENV === "development"
      ? {
          stack: err.stack,
          ...(err.meta
            ? {
                meta: err.meta,
              }
            : {}),
        }
      : {}),
  });
}
