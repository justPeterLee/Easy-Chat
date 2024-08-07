import { pusherServer } from "@/lib/pusher";
import { db } from "@/lib/redis";
import { decrypt, toPusherKey } from "@/lib/utils";
import { CreateChat, joinChatValidator } from "@/lib/validator";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    // is a user
    const session = await getServerSession(authOption);
    if (!session) {
      return new Response("unauthorized", { status: 401 });
    }

    // request is valid
    const body = await req.json();
    const validatedCode = joinChatValidator.parse(body);

    // chat exists
    const chatId = (await db.hget(
      `chat:public:${validatedCode.code}`,
      "chatId"
    )) as string;
    if (!chatId) {
      return new Response("unable to join chat", { status: 500 });
    }

    // get chat info
    const chatInfo = (await db.hgetall(`chat:${chatId}`)) as CreateChat;

    // password check
    if (chatInfo.privacy && chatInfo.password) {
      if (!validatedCode.password)
        return new Response("no password was provided", { status: 500 });
      if (!decrypt(validatedCode.password, chatInfo.password)) {
        return new Response("incorrect password", { status: 500 });
      }
    }

    // check if already in chat

    const isMemberH = await db.hmget(`chat:members:${chatId}`, session.user.id);
    if (isMemberH) {
      return new Response("already a member", { status: 500 });
    }

    // add to memeber list
    // await db.sadd(`mem_list:${chatId}`, session.user.id);

    const newMember: ChatMember = {
      id: session.user.id,
      username: session.user.name,
      image: session.user.image,
      role: "member",
      isBan: false,
      isMute: false,
      joined: Date.now(),
    };

    pusherServer.trigger(
      toPusherKey(`member:list:${chatId}`),
      "revalidate-member-list",
      ""
    );

    pusherServer.trigger(
      toPusherKey(`chatlist:${session.user.id}`),
      "chatlist-revalidate",
      ""
    );
    await db.hset(`chat:members:${chatId}`, { [session.user.id]: newMember });
    await db.hset(`chatlist:${session.user.id}`, {
      [chatId]: { code: validatedCode.code, id: chatId, joined: Date.now() },
    });

    return new Response("OK");
  } catch (err) {
    console.log(err);
    return new Response("unable to join chat", { status: 500 });
  }
};
