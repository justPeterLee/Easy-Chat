import { db } from "@/lib/redis";
import { decrypt } from "@/lib/utils";
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
    const chatId = await db.hget(`chat:public:${validatedCode.code}`, "chatId");
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
    const isMember = await db.sismember(`mem_list:${chatId}`, session.user.id);
    if (isMember) {
      return new Response("already a memeber", { status: 500 });
    }

    // add to memeber list
    await db.sadd(`mem_list:${chatId}`, session.user.id);
    await db.zadd(`chatlist:${session.user.id}`, {
      score: Date.now(),
      member: JSON.stringify({ code: validatedCode.code, id: chatId }),
    });

    return new Response("OK");
  } catch (err) {
    return new Response("unable to join chat", { status: 500 });
  }
};
