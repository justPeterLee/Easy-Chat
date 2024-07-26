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

          const pubChat = await db.hgetall(`chat:public:${pubChatCodes.code}`);
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
    <div className="flex flex-col z-30 bg-neutral-900 w-[20rem] h-screen">
      <div className="flex  items-center h-[5rem]    text-neutral-300 text-2xl hover:bg-neutral-700  duration-100  cursor-pointer rounded-lg m-3">
        {session ? (
          <UserTab session={session} />
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

      <Suspense fallback={<div>Loading...</div>}>
        <PubChatList chatList={chatList} />
      </Suspense>
    </div>
  );
}
