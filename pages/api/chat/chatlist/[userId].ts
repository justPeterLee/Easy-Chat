import { fetchRedis } from "@/lib/redis";
import { chatArrayToObj } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOption } from "../../auth/[...nextauth]";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    // const session = await getServerSession(authOption);
    // if (!session) return new Response("unauthorize", { status: 401 });
    const { userId } = req.query;
    if (typeof userId !== "string")
      return new Response("invalid user", { status: 500 });
    const userChatListFetch = (await fetchRedis(
      "zrange",
      `chatlist:${userId}`,
      0,
      -1
    )) as string[];

    let ownedChats: ChatInfo[] = [];
    let memberChat: ChatInfo[] = [];
    if (userChatListFetch.length) {
      const publicChat: [string | null][] = await Promise.all(
        userChatListFetch.map(async (chatCodes) => {
          const pubChatCodes: {
            code: string;
            id: number;
          } = JSON.parse(chatCodes);

          const pubChat = fetchRedis(
            "hmget",
            `chat:public:${pubChatCodes.code}`,
            "chatId"
          ) as unknown as [string] | [null];
          return pubChat;
        })
      );

      const chatKeys: number[] = [];
      for (let i = 0; i < publicChat.length; i++) {
        const currentVar = publicChat[i][0];
        if (currentVar !== null && !isNaN(Number(currentVar))) {
          chatKeys.push(parseInt(currentVar));
        }
      }

      const chats: string[][] = await Promise.all(
        chatKeys.map(async (chatKey) => {
          const chat = fetchRedis(
            "hgetall",
            `chat:${chatKey}`
          ) as unknown as string[];
          return chat;
        })
      );

      const filteredChats = chats.filter((chats) => chats.length && chats[0]);

      const validChats = filteredChats.map((chatArr) =>
        chatArrayToObj(chatArr)
      );

      for (let i = 0; i < validChats.length; i++) {
        const currChat = validChats[i];
        if (currChat.owner == parseInt(userId)) {
          ownedChats.push(currChat);
        } else {
          memberChat.push(currChat);
        }
      }
      //   ownedChats = validChats.filter((chat) => {
      //     return chat.owner == parseInt(userId);
      //   });
    }

    // console.log(publicChats);

    return res.status(200).json({ owned: ownedChats, joined: memberChat });
  } catch (err) {
    return new Response("unable to fetch chats", { status: 500 });
  }
}
