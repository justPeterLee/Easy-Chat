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
  description: string;
  password: string;
  privacy: boolean;
  memberId: string;
  messageId: string;
}

// chat messages
interface chatMessages {
  id: string;
  senderId: string;
  chatId: string;
  message: string;
  timestamp: string;
}

// ----- component -----
interface CRTitle {
  title: string;
  description: string;
}
