import bcrypt from "bcryptjs";

//* Function for hash password
export const hashPassword = async (plain) => 
    bcrypt.hash(plain, 10);

//* Function for compare password
export const comparePassword = async (plain, hash) =>
  bcrypt.compare(plain, hash);
