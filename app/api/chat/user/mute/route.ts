import { db } from "@/lib/redis";
import { userActionValidator } from "@/lib/validator";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
export const POST = async (req: NextRequest) => {
  try {
    // authorize user
    const session = await getServerSession(authOption);
    if (!session) return new Response("unauthorize", { status: 401 });

    // validate body
    const body = await req.json();
    const validUserData = userActionValidator.parse(body);

    // user is owner
    const isOwner = (await db.hmget(
      `chat:members:${validUserData.chatId}`,
      session.user.id
    )) as unknown as { [key: string]: chatMember };
    console.log(isOwner[session.user.id].role);
    if (isOwner[session.user.id].role !== "owner")
      return new Response("unauthorize", { status: 401 });

    // user being mute is not owner
    if (isOwner[session.user.id].id === validUserData.userId.toString()) {
      return new Response("unable to mute owner", { status: 500 });
    }

    // get attacked user info
    const userData = (await db.hmget(
      `chat:members:${validUserData.chatId}`,
      `${validUserData.userId}`
    )) as unknown as { [key: string]: chatMember };

    // create new attacked user info
    const newMuteState = !userData[validUserData.userId].isMute;
    const newUserData: chatMember = {
      ...userData[validUserData.userId],
      isMute: newMuteState,
    };

    await db.hmset(`chat:members:${validUserData.chatId}`, {
      [validUserData.userId]: newUserData,
    });

    return NextResponse.json({ state: newMuteState }, { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("unable to mute user", { status: 500 });
  }
};
