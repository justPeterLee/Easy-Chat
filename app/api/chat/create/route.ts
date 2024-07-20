import { NextRequest } from "next/server";
import { db } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import {
  createChatValidator,
  generatedChatDataValidator,
} from "@/lib/validator";
import { encrypt } from "@/lib/utils";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOption);
    if (!session) {
      return new Response("unathorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, privacy, password, code, image } = body;
    const data = createChatValidator.parse({
      title,
      description,
      privacy,
      password,
    });

    const genData = generatedChatDataValidator.parse({ code, image });

    const { id } = session.user;

    // create public info
    const chatId = await db.incr("chat_id");
    await db.hset(`chat:public:${genData.code}`, { title, chatId });

    // create user list
    const memberId = await db.incr("member_id");
    await db.sadd(`mem_list:${memberId}`, id);

    // create message list
    const messageId = await db.incr("message_id");

    // create private info
    await db.hset(`chat:${chatId}`, {
      title: data.title,
      description: data.description,
      privacy: data.privacy,
      password: data.privacy && data.password ? encrypt(data.password) : "",
      code: genData.code,
      image: genData.image,
      memberId,
      messageId,
    });

    // add to chat list
    await db.zadd(`chatlist:${id}`, {
      score: Date.now(),
      member: JSON.stringify({ code: genData.code, id: chatId }),
    });

    return new Response();
  } catch (err) {
    console.log(err);
    return new Response("unable to create account", { status: 500 });
  }
};
