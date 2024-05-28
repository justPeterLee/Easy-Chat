import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/redis";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { title, description, pricacy, password, code } = body;

    const chatId = await db.incr("chat_id");
    const chatByCode = `chat:code:${code}`;

    // create chat public info

    // create chat private info

    console.log(body);

    return new Response();
  } catch (err) {
    console.log(err);
    return new Response("unable to create account", { status: 500 });
  }
};
