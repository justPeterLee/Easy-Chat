import {
  DBChatlist,
  DBTitle,
} from "@/components/page-chatroom/DashboardComponents";
import { db } from "@/lib/redis";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

async function getPublicChatList(
  userId: string | undefined
): Promise<allChatInfo[]> {
  try {
    if (!userId) {
      return [];
    }

    const userChatsList = (await db.zrange(`chatlist:${userId}`, 0, -1)) as {
      code: string;
      id: number;
    }[];

    if (userChatsList.length) {
      const chatInfoList: allChatInfo[] = await Promise.all(
        userChatsList.map(async (chatCodes) => {
          const allChatInfo = await Promise.all([
            (await db.hmget(
              `chat:${chatCodes.id}`,
              "title",
              "privacy",
              "code",
              "image"
            )) as unknown as generalChatInfo,
            (await db.hlen(`chat:members:${chatCodes.id}`)) as number,
            (await db.zrange(
              `chat:messages:${chatCodes.id}`,
              0,
              2
            )) as unknown as chatMessages[],
          ]);

          const allChatInfoObj = {
            id: chatCodes.id,
            chatInfo: allChatInfo[0],
            members: allChatInfo[1],
            messages: allChatInfo[2],
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
  console.log(publicChatList);
  return (
    <>
      <main className="w-screen h-screen bg-neutral-800 p-4 px-10 flex flex-col gap-4">
        <DBTitle />
        <div className="w-full h-auto">
          <section className=" grid grid-cols-[repeat(auto-fill,_minmax(24rem,1fr))] gap-[1.5rem]  w-full h-full">
            <DBChatlist chatlist={publicChatList} />
          </section>
        </div>
      </main>
    </>
  );
}
