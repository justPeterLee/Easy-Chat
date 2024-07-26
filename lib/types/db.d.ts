// ----- Chat Info -----

// public chat
interface PublicChat {
  title: string;
  chatId: number;
}

type PublicChatList = PublicChat[];

// chat info
interface ChatInfo {
  title: string;
  code: string;
  image: string;
  description: string;
  password: string;
  privacy: boolean;
  memberId: number;
  messageId: number;
  owner: number;
}
interface GeneralChatInfo {
  title: string;
  privacy: boolean;
  code: string;
  image: string;
  owner: number;
}

interface AllChatInfo {
  id: number;
  chatInfo: GeneralChatInfo | null;
  members: number;
  messages: chatMessages[];
}

// chat messages
interface ChatMessages {
  id: string;
  senderId: string;
  chatId: string;
  message: string;
  timestamp: string;
}

// chat members
interface ChatMember {
  id: string;
  username: string;
  image: string;
  isBan: boolean;
  isMute: boolean;
  role: "owner" | "admin" | "member";
  joined: number;
}
// ----- component -----
interface CRTitle {
  title: string;
  description: string;
}
