import { Resend } from "resend";
let cachedClient = null;

//* Function for get resend client
export const getResendClient = () => {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.RESEND_API_KEY || "";
  if (!apiKey) return null;
  cachedClient = new Resend(apiKey);
  return cachedClient;
};
