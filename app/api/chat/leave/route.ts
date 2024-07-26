import { db, fetchRedis } from "@/lib/redis";
import { deleteChatValidator } from "@/lib/validator";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import axios from "axios";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOption);
    if (!session) return new Response("unauthoized", { status: 401 });

    const body = await req.json();
    const validBody = deleteChatValidator.parse(body);

    const DBOwner = (await fetchRedis(
      "hmget",
      `chat:${validBody.chatId}`,
      "owner"
    )) as string[];

    // owner options
    if (session.user.id === DBOwner[0]) {
      // update owner
      if (validBody.newOwner !== null && !validBody.forceDelete) {
        await db.hset(`chat:${validBody.chatId}`, {
          owner: validBody.newOwner.id,
        });
        await db.hset(`chat:members:${validBody.chatId}`, {
          [validBody.newOwner.id]: { ...validBody.newOwner, role: "owner" },
        });
      }
    }

    // delete from chatlist
    await db.zrem(`chatlist:${session.user.id}`, {
      code: body.chatCode,
      id: body.chatId,
    });

    // delete self from chat member list
    await db.hdel(`chat:members:${body.chatId}`, session.user.id);

    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("could not leave chat", { status: 500 });
  }
};
