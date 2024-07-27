import { fetchRedis } from "@/lib/redis";
import { chatArrayToObj, decrypt, memberArraytoObj } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chatId } = req.query;

    if (isNaN(Number(chatId))) throw new Error("invalid request");

    const chatInfoAll = await Promise.all([
      (await fetchRedis("hgetall", `chat:${chatId}`)) as string[],
      (await fetchRedis("hgetall", `chat:members:${chatId}`)) as string[],
    ]).catch(() => {
      throw new Error("failed to retieve chat");
    });

    if (!chatInfoAll[0].length || !chatInfoAll[1].length)
      throw new Error("invalid chat");

    const chatInfo = chatArrayToObj(chatInfoAll[0]);
    const members = memberArraytoObj(chatInfoAll[1]);
    return res.status(200).json({ chatInfo, members });
  } catch (err) {
    return new Response("failed to retrieve Chat", { status: 500 });
  }
}
