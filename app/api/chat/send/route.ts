import { db } from "@/lib/redis";
import { Message, messageValidator } from "@/lib/validator";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { message, chatId } = await req.json();

    const session = await getServerSession(authOption);

    if (!session) return new Response("Unauthorized", { status: 401 });

    // console.log(body);

    // get chat memeber list
    // verify is in chat
    const isMember = await db.sismember(`mem_list:${chatId}`, session.user.id);

    if (!isMember) return new Response("Unauthorized", { status: 401 });

    // fill missing data
    // id
    // sender id
    // chat id
    // text
    // timestamp

    const timeStamp = Date.now();
    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      message: message,
      timestamp: timeStamp,
    };

    // validate final data
    const vaildMessage = messageValidator.parse(messageData);

    // add message to db

    await db.zadd(`chat:messages:${chatId}`, {
      score: timeStamp,
      member: JSON.stringify(vaildMessage),
    });

    return new Response("OK");
  } catch (err) {
    return new Response("unable to create account", { status: 500 });
  }
};