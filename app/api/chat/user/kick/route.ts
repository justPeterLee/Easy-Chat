import { db } from "@/lib/redis";
import { userActionValidator } from "@/lib/validator";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOption);
    if (!session) return new Response("unauthorized", { status: 401 });

    // validate body
    const body = await req.json();
    const validUserData = userActionValidator.parse(body);

    // user is owner
    const isOwner = (await db.hmget(
      `chat:members:${validUserData.chatId}`,
      session.user.id
    )) as unknown as { [key: string]: ChatMember };

    if (isOwner[session.user.id].role !== "owner")
      return new Response("unauthorize", { status: 401 });

    // user being kicked is not owner
    if (isOwner[session.user.id].id === validUserData.userId.toString()) {
      return new Response("unable to kick owner", { status: 500 });
    }

    await db.hdel(
      `chat:members:${validUserData.chatId}`,
      validUserData.userId.toString()
    );

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("unable to kick user", { status: 500 });
  }
};
