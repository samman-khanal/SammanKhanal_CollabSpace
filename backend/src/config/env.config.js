import dotenv from "dotenv";
dotenv.config();
const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET", "FRONTEND_URL"];

//* Function for load env
export const loadEnv = () => {
  //* Function for missing variables
  const missing = REQUIRED_VARS.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Error: Missing required environment variables: ${missing.join(", ")}. ` +
        "The server cannot start without them.",
    );
  }
};
