import {
  DBChatlist,
  DBTitle,
} from "@/components/pageComponents/DashboardComponents";
import { db, fetchRedis } from "@/lib/redis";
import { chatlistArray } from "@/lib/utils";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

async function getPublicChatList(
  userId: string | undefined
): Promise<AllChatInfo[]> {
  try {
    if (!userId) {
      return [];
    }

    const chatListHash = (await fetchRedis(
      "hgetall",
      `chatlist:${userId}`
    )) as string[];
    const chatList = chatlistArray(chatListHash);

    if (!chatList.length) throw new Error("no chats");

    if (chatList.length) {
      const chatInfoList: AllChatInfo[] = await Promise.all(
        chatList.map(async (chatCodes) => {
          const fetchAllChatInfo = await Promise.all([
            fetchRedis(
              "hmget",
              `chat:${chatCodes.id}`,
              "title",
              "privacy",
              "code",
              "image",
              "owner"
            ) as unknown as string[] | null[],
            db.hlen(`chat:members:${chatCodes.id}`) as unknown as number,
            fetchRedis(
              "zrange",
              `chat:messages:${chatCodes.id}`,
              0,
              2
            ) as unknown as string[],
          ]);

          const key: ["title", "privacy", "code", "image", "owner"] = [
            "title",
            "privacy",
            "code",
            "image",
            "owner",
          ];
          const chatInfoNull = fetchAllChatInfo[0].filter(
            (chatInfo) => chatInfo !== null
          );

          const chatInfo: GeneralChatInfo | null =
            chatInfoNull.length === key.length
              ? { title: "", privacy: false, code: "", image: "", owner: 0 }
              : null;

          if (chatInfo) {
            fetchAllChatInfo[0].forEach((info, index) => {
              const chatKey = key[index];
              let formatInfo;

              if (info === "false" && chatKey === "privacy") {
                formatInfo = false;
                chatInfo[chatKey] = formatInfo;
              } else if (info === "true" && chatKey === "privacy") {
                formatInfo = true;
                chatInfo[chatKey] = formatInfo;
              } else if (!isNaN(Number(info)) && chatKey === "owner") {
                formatInfo = Number(info);
                chatInfo[chatKey] = formatInfo;
              } else {
                formatInfo = info ? info : "";
                if (
                  chatKey === "title" ||
                  chatKey === "code" ||
                  chatKey === "image"
                ) {
                  chatInfo[chatKey] = formatInfo;
                }
              }
            });
          }

          const members = fetchAllChatInfo[1];
          const messages: ChatMessages[] = fetchAllChatInfo[2].map((message) =>
            JSON.parse(message)
          );

          const allChatInfoObj = {
            id: chatCodes.id,
            chatInfo,
            members,
            messages,
          };

          return allChatInfoObj;
        })
      );
      return chatInfoList;
    }

    return [];
  } catch (err) {
    return [];
  }
}
export default async function Dashboard() {
  const session = await getServerSession(authOption);
  const publicChatList = await getPublicChatList(session?.user.id);
  return (
    <>
      <main className="flex-grow h-screen bg-neutral-800 p-4 px-10 flex flex-col gap-4 overflow-x-hidden">
        <DBTitle />
        <div className="w-full h-auto">
          <section className=" grid grid-cols-[repeat(auto-fill,_minmax(24rem,1fr))] gap-[1.5rem]  w-full h-full">
            <DBChatlist chatlist={publicChatList} userId={session?.user.id} />
          </section>
        </div>
      </main>
    </>
  );
}
