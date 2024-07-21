// ----- Chat Info -----

// public chat
interface PublicChat {
  title: string;
  chatId: number;
}

type PublicChatList = PublicChat[];

// chat info
interface chatInfo {
  title: string;
  code: string;
  image: string;
  description: string;
  password: string;
  privacy: boolean;
  memberId: string;
  messageId: string;
}
interface generalChatInfo {
  title: string;
  privacy: boolean;
  code: string;
  image: string;
}

interface allChatInfo {
  id: number;
  chatInfo: generalChatInfo;
  members: number;
  messages: chatMessages[];
}

// chat messages
interface chatMessages {
  id: string;
  senderId: string;
  chatId: string;
  message: string;
  timestamp: string;
}

// chat members
interface chatMember {
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
