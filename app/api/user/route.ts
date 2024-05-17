import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/redis";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { username, session } = body;

    // create unique id
    const id = await db.incr("user_id");
    console.log(id);
    const user_key = `user:${id}`;

    await db.hmset(user_key, { username: username, session: session });

    return new Response(JSON.stringify({ id, username, session }), {
      status: 200,
    });
  } catch (err) {
    console.log(err);
    return new Response("unable to create account", { status: 500 });
  }
};
