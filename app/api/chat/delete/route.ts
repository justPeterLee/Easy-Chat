import { db, fetchRedis } from "@/lib/redis";
import { chatArrayToObj } from "@/lib/utils";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    console.log("deleting");
    const session = await getServerSession(authOption);
    if (!session) return new Response("unauthorized", { status: 401 });

    const body = await req.json();

    const fetchChat = (await fetchRedis(
      "hgetall",
      `chat:${body.chatId}`
    )) as string[];

    if (!fetchChat.length)
      return new Response("unable to find chat", { status: 500 });

    const chatInfo = chatArrayToObj(fetchChat);

    // make sure you are owner
    if (chatInfo.owner.toString() !== session.user.id)
      return new Response("unauthorized", { status: 401 });

    await db.del(
      `chat:${body.chatId}`,
      `chat:members:${body.chatId}`,
      `chat:messages:${body.chatId}`,
      `chat:public:${chatInfo.code}`
    );
    // chat id
    // chat members
    // chat messages
    // public

    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("unable to delete chat", { status: 200 });
  }
};
