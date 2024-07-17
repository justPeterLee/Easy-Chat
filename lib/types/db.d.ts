interface PublicChat {
  title: string;
  chatId: number;
}

type ChatList = PublicChat[];

// CHATROOM
interface chatInfo {
  title: string;
  code: string;
  description: string;
  password: string;
  privacy: boolean;
  memberId: string;
  messageId: string;
}

interface CRTitle {
  title: string;
  description: string;
}
