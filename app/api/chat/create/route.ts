import { NextRequest } from "next/server";
import { db } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { createChatValidator } from "@/lib/validator";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOption);
    if (!session) {
      return new Response("unathorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, privacy, password, code } = body;

    const data = createChatValidator.parse({
      title,
      description,
      privacy,
      password,
    });

    const { id } = session.user;
    console.log(id);

    // create user list
    const memeberId = await db.incr("memeber_id");

    await db.sadd(`mem_list:${memeberId}`, id);

    // create message list
    const messageId = await db.incr("message_id");
    // await db.xadd(`mem_list:${memeberId}`,{score:})

    // add to chat list
    await db.zadd(`chatlist:${id}`, {
      score: Date.now(),
      member: code,
    });
    // create public info
    const chatId = await db.incr("chat_id");
    await db.hset(`chat:public:${code}`, { title, chatId });

    // create private info
    await db.hset(`chat:${chatId}`, {
      title,
      description,
      privacy,
      password: password ? password : "",
      code,
      memeberId: memeberId,
      messageId: messageId,
    });

    //

    return new Response();
  } catch (err) {
    console.log(err);
    return new Response("unable to create account", { status: 500 });
  }
};
