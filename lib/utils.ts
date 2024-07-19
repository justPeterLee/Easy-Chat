import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const bcrypt = require("bcryptjs");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function encrypt(code: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(code, salt);
}

export function decrypt(code: string, storedCode: string) {
  return bcrypt.compareSync(code, storedCode);
}
