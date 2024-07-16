import { db } from "@/lib/redis";
import { authOption } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { redirect } from "next/dist/server/api-utils";

interface PageProps {
  params: {
    chatId: string;
  };
}

async function validateUser(chatId: string, userId: string) {
  const isValid = await db.sismember(`mem_list:${chatId}`, userId);
  return isValid;
}

export default async function ChatRoom({ params }: PageProps) {
  const session = await getServerSession(authOption);
  if (!session) {
    return <></>;
  }
  const valid = await validateUser(params.chatId, session.user.id);

  if (!valid) {
    return <>no chat</>;
  }

  return (
    <main className="bg-neutral-800 h-screen w-screen p-10 grid grid-cols-[repeat(auto-fill,_minmax(12rem,_0px))] gap-4 auto-rows-[minmax(0,_4rem)]">
      {params.chatId}
    </main>
  );
}
//
