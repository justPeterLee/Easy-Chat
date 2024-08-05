import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/redis";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { username, session, image } = body;

    // create unique id
    const id = await db.incr("user_id");
    const user_key = `user:${id}`;

    await db.hmset(user_key, {
      username: username,
      session: session,
      image: image,
    });

    return new Response(JSON.stringify({ id, username, session, image }), {
      status: 200,
    });
  } catch (err) {
    console.log(err);
    return new Response("unable to create account", { status: 500 });
  }
};
