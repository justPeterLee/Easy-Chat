import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { fetchRedis } from "./redis";
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

export function chatArrayToObj(arr: string[]): chatInfo {
  const chatInfo: chatInfo = {
    title: "",
    code: "",
    image: "",
    description: "",
    password: "",
    privacy: false,
    memberId: 0,
    messageId: 0,
  } as const;
  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i];
    const value: string = arr[i + 1];
    let formatValue: boolean | number | string;

    if (value === "false" && key === "privacy") {
      formatValue = false;
      chatInfo[key] = formatValue;
    } else if (value === "true" && key === "privacy") {
      formatValue = true;
      chatInfo[key] = formatValue;
    } else if (
      !isNaN(Number(value)) &&
      value != "" &&
      (key === "memberId" || key === "messageId")
    ) {
      formatValue = Number(value);
      chatInfo[key] = formatValue;
    } else if (
      key === "title" ||
      key === "code" ||
      key === "image" ||
      key === "description" ||
      key === "password"
    ) {
      formatValue = value;
      chatInfo[key] = formatValue;
    }
  }
  return chatInfo;
}

export function memberArraytoObj(arr: string[]): { [key: string]: chatMember } {
  const memberObj: { [key: string]: chatMember } = {};
  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i];
    const value: string = arr[i + 1];
    let formatValue = JSON.parse(value) as chatMember;

    memberObj[key] = formatValue;
  }
  return memberObj;
}

export async function autoJoin(userId: string, chatId: string) {
  try {
    // already member of chat
    // check if in chat list
    // join if not in chat list
    // const chatList = await fetchRedis("zrange", `chatlist:${userId}`, 0, -1);
    // console.log(chatList);
  } catch (err) {
    console.log(err);
  }
}
