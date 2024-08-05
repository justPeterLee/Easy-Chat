// "use client";
"use server";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { db, fetchRedis } from "@/lib/redis";

import { PubChatList, UserTab } from "./SideNavComponents";
// get public chat info
async function getChatPubs(
  userId: string | undefined
): Promise<null[] | PublicChatList> {
  try {
    if (!userId) return [];

    const userChatListFetch = (await fetchRedis(
      "zrange",
      `chatlist:${userId}`,
      0,
      -1
    )) as string[];

    if (userChatListFetch.length) {
      // is valid user / public list key
      // create promise array (parallel data fetch)
      const publicChat: any = await Promise.all(
        userChatListFetch.map(async (chatCodes) => {
          const pubChatCodes: {
            code: string;
            id: number;
          } = JSON.parse(chatCodes);

          const pubChat = (await db.hgetall(
            `chat:public:${pubChatCodes.code}`
          )) as unknown as PublicChatList;
          return pubChat;
        })
      ).catch((e) => {
        console.log("error ", e);
        return [];
      });

      return publicChat;
    } else {
      // invalid public key list
      console.log("invalid list");
      return [];
    }
  } catch (err) {
    return [];
  }
}

export async function SideNavigation() {
  const session = await getServerSession(authOption);
  const chatList = await getChatPubs(session?.user.id);

  return (
    <div className="flex flex-col z-30 bg-[#202020] w-[16rem] h-screen relative">
      <div className="text-neutral-400 m-5 border rounded">title</div>
      <Suspense fallback={<div>Loading...</div>}>
        <PubChatList chatList={chatList} />
      </Suspense>
      {session ? (
        <UserTab />
      ) : (
        <>
          <div className=" flex-1  flex justify-center items-center">
            <div className="w-[60px] h-[60px] rounded-full bg-neutral-500" />
          </div>
          <div className=" w-[60%]  flex  items-center">
            <p>{session === undefined ? "loading..." : "username"}</p>
          </div>
        </>
      )}
    </div>
  );
}
