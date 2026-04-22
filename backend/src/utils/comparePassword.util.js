import bcrypt from "bcryptjs";
//* Function for compare password
export const comparePassword = async (plain, hash) =>
  bcrypt.compare(plain, hash);
