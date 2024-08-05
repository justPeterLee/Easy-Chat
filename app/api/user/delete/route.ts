import { NextRequest } from "next/server";
import { db, fetchRedis } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { chatArrayToObj } from "@/lib/utils";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOption);
    if (!session) return new Response("unauthoized", { status: 401 });

    const body: {
      newOwners: { [key: string]: ChatMember };
      joinedChatList: ChatInfo[];
      deleteAll: boolean;
    } = await req.json();
    const { newOwners, joinedChatList, deleteAll } = body;

    // leave all joined chat
    if (joinedChatList.length) {
      await Promise.all(
        joinedChatList.map((chat) =>
          leaveChat(parseInt(session.user.id), chat.memberId)
        )
      );
    }

    // delete or change chat
    const ownerKeys = Object.keys(newOwners);
    if (ownerKeys.length) {
      if (deleteAll) {
        await Promise.all(
          ownerKeys.map((key) =>
            deleteChat(parseInt(session.user.id), parseInt(key))
          )
        );
      } else {
        ownerKeys.map(async (key) => {
          const owner = newOwners[key];
          const chatId = parseInt(key);
          const user = parseInt(session.user.id);

          if (owner === null) {
            await deleteChat(user, chatId);
          } else {
            await changeOwner(user, chatId, owner);
          }
        });
      }
    }

    // delete user and chatlist
    await db.del(`chatlist:${session.user.id}`, `user:${session.user.id}`);
    return new Response("Ok", {
      status: 200,
    });
  } catch (err) {
    console.log(err);
    return new Response("unable to create account", { status: 500 });
  }
};

async function deleteChat(userId: number, chatId: number) {
  try {
    // check if owner
    const chat = (await fetchRedis("hgetall", `chat:${chatId}`)) as string[];
    const chatInfo = chatArrayToObj(chat);

    if (chatInfo.owner !== userId) throw new Error("unauthorized");

    db.del(
      `chat:${chatId}`,
      `chat:members:${chatId}`,
      `chat:messages:${chatId}`,
      `chat:public:${chatInfo.code}`
    );
  } catch (err) {
    throw new Error(`could not delete chat: ${err}`);
  }
}

async function changeOwner(
  userId: number,
  chatId: number,
  newOwner: ChatMember
) {
  try {
    // check if owner
    const chat = (await fetchRedis("hgetall", `chat:${chatId}`)) as string[];
    const chatInfo = chatArrayToObj(chat);

    if (chatInfo.owner !== userId) throw new Error("unauthorized");

    const memberFetch = (await fetchRedis(
      "hmget",
      `chat:members:${chatId}`,
      `${newOwner.id}`
    )) as string[];

    const member: ChatMember = JSON.parse(memberFetch[0]);

    member.role = "owner";
    member.isBan = false;
    member.isMute = false;

    await db.hset(`chat:${chatId}`, { owner: newOwner.id });

    await db.hset(`chat:members:${chatId}`, { [newOwner.id]: member });
    await db.hdel(`chat:members:${chatId}`, `${userId}`);

    console.log("changed");
  } catch (err) {
    throw new Error(`could not change owner: ${err}`);
  }
}

async function leaveChat(userId: number, chatId: number) {
  try {
    await db.hdel(`chat:members:${chatId}`, `${userId}`);
  } catch (err) {
    throw new Error(`could not leave chat: ${err}`);
  }
}

// const decoder = new TextDecoder()
