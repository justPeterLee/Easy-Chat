import {
  CRSendMessage,
  CRShowMessage,
  CRTitle,
} from "@/components/page-chatroom/CRComponents";
import { db } from "@/lib/redis";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    chatId: string;
  };
}

async function validateUser(chatId: string, userId: string) {
  try {
    // const isValid = await db.sismember(`mem_list:${chatId}`, userId);
    // return isValid;

    const isMember = await db.hmget(`chat:members:${chatId}`, userId);
    return isMember;
  } catch (error) {
    // notFound()
    return false;
  }
}

async function getChatData(chatId: string) {
  try {
    const chat = (await db.hgetall(`chat:${chatId}`)) as chatInfo | null;
    // const members = await db.smembers(`mem_list:${chatId}`);
    const members = await db.hgetall(`chat:members:${chatId}`);
    const dbMessages: chatMessages[] = await db.zrange(
      `chat:messages:${chatId}`,
      0,
      -1
    );

    if (!chat) {
      throw "not able to find chat";
    }
    const parsedMessages = dbMessages.reverse();

    return { chat, members, messages: parsedMessages };
  } catch (err) {
    console.log(err);
    notFound();
  }
}

export default async function ChatRoom({ params }: PageProps) {
  const session = await getServerSession(authOption);
  if (!session) {
    return <></>;
  }
  const valid = await validateUser(params.chatId, session.user.id);

  if (!valid) {
    return <>no chat</>;
  }

  const chatData = await getChatData(params.chatId);
  // console.log(chatData);
  return (
    <main className="flex flex-col gap-2 py-4 text-white bg-neutral-800 h-screen w-full relative overflow-hidden">
      <CRTitle
        title={chatData.chat.title}
        description={chatData.chat.description}
        code={chatData.chat.code}
      />

      {/* {JSON.stringify(chatData)} */}
      <CRShowMessage messages={chatData.messages} />
      <CRSendMessage chatId={params.chatId} />
    </main>
  );
}
//
