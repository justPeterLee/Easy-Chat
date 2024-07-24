import {
  CRMemberList,
  CRSendMessage,
  CRShowMessage,
  CRTitle,
} from "@/components/page-chatroom/CRComponents";
import { db, fetchRedis } from "@/lib/redis";
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

    const isMember = (await fetchRedis(
      `hmget`,
      `chat:members:${chatId}`,
      userId
    )) as string[];

    if (!isMember[0]) {
      return null;
    }

    return JSON.parse(isMember[0]);
  } catch (error) {
    // notFound()
    return false;
  }
}

async function isBanned(chatId: string, userId: string) {
  try {
    // check user list
  } catch (err) {
    console.log(err);
  }
}
async function isKicked(chatId: string, userId: string) {
  try {
    // if in chat list and not in member list
  } catch (err) {
    console.log(err);
  }
}
function chatArrayToObj(arr: string[]): chatInfo {
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

function memberArraytoObj(arr: string[]): { [key: string]: chatMember } {
  const memberObj: { [key: string]: chatMember } = {};
  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i];
    const value: string = arr[i + 1];
    let formatValue = JSON.parse(value) as chatMember;

    memberObj[key] = formatValue;
  }
  return memberObj;
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

    const dbMessages: chatMessages[] = await db.zrange(
      `chat:messages:${chatId}`,
      0,
      -1
    );
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
    return <>no chat</>;
  }

  const chatData = await getChatData(params.chatId);
  return (
    <main className="flex flex-col  text-white bg-neutral-800 h-screen w-full relative overflow-hidden">
      <CRTitle
        title={chatData.chat.title}
        description={chatData.chat.description}
        code={chatData.chat.code}
      />

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
