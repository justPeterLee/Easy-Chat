// "use client";
"use server";
import { Suspense } from "react";
import Image from "next/image";
import { getServerSession } from "next-auth";
import axios from "axios";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { db } from "@/lib/redis";
import { Button } from "../ui/Button";
import { notFound } from "next/navigation";
import { PubChatList, UserTab } from "./SideNavComponents";
// get public chat info
async function getChatPubs(
  userId: string | undefined
): Promise<{ chatId: number; title: string }[]> {
  try {
    if (!userId) return [];

    const sortedList = (await db.zrange(
      `chatlist:${userId}`,
      0,
      -1
    )) as string[];
    console.log(sortedList);
    // get public list keys

    if (sortedList.length) {
      // is valid user / public list key
      // create promise array (parallel data fetch)

      const data: any = await Promise.all(
        sortedList.map(async (pubId) => {
          const pubChat = await db.hgetall(`chat:public:${pubId}`);
          return pubChat;
        })
      ).catch((e) => {
        console.log("error ", e);
        return [];
      });

      console.log(data);
      return data;
    } else {
      // invalid public key list
      console.log("invalid list");
      return [];
    }
  } catch (err) {
    notFound();
  }
  // console.log(list);
  // console.log(res.data);
  // return res;
}

export async function SideNavigation() {
  const session = await getServerSession(authOption);
  const chatList = await getChatPubs(session?.user.id);

  // const chatList = session ? getChats(session.user.id) : [];
  // const { data: session } = useSession();
  // useEffect(() => {
  //   console.log(session);
  // }, [session]);
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
              <p>{session === undefined ? "loading..." : "no user"}</p>
            </div>
          </>
        )}
      </div>
      {session ? (
        <Suspense fallback={<div>Loading...</div>}>
          {/* <Playlists artistID={artist.id} /> */}
          <PubChatList chatList={chatList} />
        </Suspense>
      ) : (
        <>nothing</>
      )}
    </div>
  );
}

// export function

// user

// channels

// recent messages (memebers)
