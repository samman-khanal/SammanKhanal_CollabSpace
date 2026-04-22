import jwt from "jsonwebtoken";

//* Function for sign access token
export const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

//* Function for verify token
export const verifyToken = (token) => 
  jwt.verify(token, process.env.JWT_SECRET);
