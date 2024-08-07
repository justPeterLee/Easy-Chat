import { pusherServer } from "@/lib/pusher";
import { db } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
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

    // get chat memeber list

    // verify is in chat
    const isMember = (await db.hmget(
      `chat:members:${chatId}`,
      session.user.id
    )) as unknown as { [key: string]: ChatMember };
    if (!isMember) {
      return new Response("unauthorized", { status: 401 });
    }

    // verify no mute
    if (isMember[session.user.id].isMute || isMember[session.user.id].isBan) {
      return new Response("muted", { status: 401 });
    }

    const timeStamp = Date.now();
    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      message: message,
      timestamp: timeStamp,
    };

    // validate final data
    const vaildMessage = messageValidator.parse(messageData);

    // notify connect chat
    pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      "incoming-message",
      vaildMessage
    );

    // add message to db
    await db.zadd(`chat:messages:${chatId}`, {
      score: timeStamp,
      member: JSON.stringify(vaildMessage),
    });

    return new Response("OK");
  } catch (err) {
    return new Response(`unable to send message: ${err}`, { status: 500 });
  }
};
