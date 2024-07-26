import {
  CRBanned,
  CRMemberList,
  CRSendMessage,
  CRShowMessage,
  CRTitle,
} from "@/components/page-chatroom/CRComponents";
import { db, fetchRedis } from "@/lib/redis";
import { chatArrayToObj, memberArraytoObj } from "@/lib/utils";
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
    const fetchIsMember = (await fetchRedis(
      `hmget`,
      `chat:members:${chatId}`,
      userId
    )) as string[];

    if (!fetchIsMember[0]) return null;

    const isMember: ChatMember = JSON.parse(fetchIsMember[0]);

    if (isMember.isBan) return "BANNED";

    // auto join
    const fetchChatList = (await fetchRedis(
      "zrange",
      `chatlist:${userId}`,
      0,
      -1
    )) as string[];

    const chatList = fetchChatList.filter((chat: string) => {
      const chatCodes: { code: string; id: number } = JSON.parse(chat);
      return chatCodes.id.toString() === chatId;
    });

    if (!chatList.length) {
      const fetchPubCode = (await fetchRedis(
        "hmget",
        `chat:${chatId}`,
        "code"
      )) as string[];
      const chatlistInput = { code: fetchPubCode[0], id: chatId };
      await db.zadd(`chatlist:${userId}`, {
        score: Date.now(),
        member: JSON.stringify(chatlistInput),
      });
    }

    return isMember;
  } catch (error) {
    return null;
  }
}

async function getChatData(chatId: string) {
  try {
    const fetchChat = (await fetchRedis(
      "hgetall",
      `chat:${chatId}`
    )) as string[];

    if (!fetchChat.length) throw "not able to find chat";

    const chat = chatArrayToObj(fetchChat);

    const fetchMembers = await fetchRedis("hgetall", `chat:members:${chatId}`);
    if (!fetchMembers.length) throw "not able to find members";

    const members = memberArraytoObj(fetchMembers);

    const fetchMessages = (await fetchRedis(
      "zrange",
      `chat:messages:${chatId}`,
      0,
      -1
    )) as string[];

    const messages = fetchMessages
      .map((message) => JSON.parse(message))
      .reverse();

    return { chat, members, messages };
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
    return notFound();
  }

  if (valid === "BANNED") {
    return <CRBanned />;
  }

  const chatData = await getChatData(params.chatId);
  return (
    <main className="flex flex-col flex-grow  text-white bg-neutral-800 h-screen  relative overflow-hidden">
      <CRTitle title={chatData.chat.title} code={chatData.chat.code} />

      {/* {JSON.stringify(chatData)} */}
      <div className="flex flex-grow w-full">
        <div className="flex flex-col flex-grow">
          <CRShowMessage messages={chatData.messages} />
          <CRSendMessage chatId={params.chatId} />
        </div>
        <div className="w-[15rem] bg-[#1f1f1f]">
          {chatData.members && (
            <CRMemberList
              memberList={chatData.members}
              chatId={params.chatId}
            />
          )}
        </div>
      </div>
    </main>
  );
}
//
