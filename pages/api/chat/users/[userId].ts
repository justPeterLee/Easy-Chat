import { db } from "@/lib/redis";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;
    console.log(userId);
    const userInfo = await db.hmget(`user:${userId}`, "image", "username");

    return res.status(200).json(userInfo);
  } catch (err) {
    return new Response("unable to fetch user", { status: 500 });
  }
}
