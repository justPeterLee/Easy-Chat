import { fetchRedis } from "@/lib/redis";
import { memberArraytoObj } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chatId } = req.query;
    const fetchMembers = await fetchRedis("hgetall", `chat:members:${chatId}`);
    const memebers = memberArraytoObj(fetchMembers);

    return res.status(200).json(memebers);
  } catch (err) {
    return new Response("unable to fetch user", { status: 500 });
  }
}
