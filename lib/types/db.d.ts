interface PublicChat {
  title: string;
  chatId: number;
}

type ChatList = PublicChat[];

// CHATROOM
// fetch
interface chatInfo {
  title: string;
  code: string;
  description: string;
  password: string;
  privacy: boolean;
  memberId: string;
  messageId: string;
}

interface chatMessages {
  id: string;
  senderId: string;
  chatId: string;
  text: string;
  timestamp: string;
}

// component
interface CRTitle {
  title: string;
  description: string;
}
