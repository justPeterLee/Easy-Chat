import { db, fetchRedis } from "@/lib/redis";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;
    const user = await fetchRedis(
      "hmget",
      `user:${userId}`,
      "image",
      "username"
    );
    const userObj = { image: user[0], username: user[1] };

    return res.status(200).json(userObj);
  } catch (err) {
    return new Response("unable to fetch user", { status: 500 });
  }
}
