//* Function for allowed origins
const allowedOrigins = (() => {
  const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "";
  //* Function for allowed origins
  return raw
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
})();

export const corsOptions = {
  //* Function for origin
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0) {
      return cb(new Error("CORS: no allowed origins configured"));
    }
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
};
