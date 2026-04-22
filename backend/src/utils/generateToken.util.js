import crypto from "crypto";

//* Function for generate token
export const generateToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");
