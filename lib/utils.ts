import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
var sortBy = require("lodash.sortby");
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

export function chatArrayToObj(arr: string[]): ChatInfo {
  const chatInfo: ChatInfo = {
    title: "",
    code: "",
    image: "",
    description: "",
    password: "",
    privacy: false,
    memberId: 0,
    messageId: 0,
    owner: 0,
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
      (key === "memberId" || key === "messageId" || key === "owner")
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

export function memberArraytoObj(arr: string[]): { [key: string]: ChatMember } {
  const memberObj: { [key: string]: ChatMember } = {};
  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i];
    const value: string = arr[i + 1];
    let formatValue = JSON.parse(value) as ChatMember;

    memberObj[key] = formatValue;
  }
  return memberObj;
}

export function toPusherKey(key: string) {
  return key.replace(/:/g, "__");
}

export function chatlistArray(arr: string[]): PubChatList {
  let pubChatList: PubChatList = [];

  for (let i = 1; i < arr.length; i += 2) {
    try {
      const value = JSON.parse(arr[i]) as PubChat;
      pubChatList.push(value);
    } catch {
      continue;
    }
  }

  const sortedPubChatList = sortBy(
    pubChatList,
    (chatObj: { joined: any }) => chatObj.joined
  );

  return sortedPubChatList;
}
