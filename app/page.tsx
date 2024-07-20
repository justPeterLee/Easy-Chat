import {
  DBChatlist,
  DBTitle,
} from "@/components/page-chatroom/DashboardComponents";
import { db } from "@/lib/redis";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

async function getPublicChatList(
  userId: string | undefined
): Promise<PublicChatList> {
  try {
    if (!userId) {
      return [];
    }

    const sortedList = (await db.zrange(
      `chatlist:${userId}`,
      0,
      -1
    )) as string[];

    if (sortedList.length) {
      const data: any = await Promise.all(
        sortedList.map(async (pubId) => {
          const pubChat = await db.hgetall(`chat:public:${pubId}`);
          return pubChat;
        })
      ).catch((e) => {
        console.log("error ", e);
        return [];
      });

      return data;
    } else {
      console.log("invalid list");
      return [];
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
