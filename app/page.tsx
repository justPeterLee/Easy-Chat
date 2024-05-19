"use client";

import { signOut, useSession } from "next-auth/react";

import { CreateGroupChat, GroupChatCard } from "@/components/GroupChat";
import { CreateGroupChatModal } from "@/components/modal/GroupChatModal";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="bg-neutral-800 h-screen w-screen p-10 grid grid-cols-[repeat(auto-fill,_minmax(12rem,_0px))] gap-4 auto-rows-[minmax(0,_4rem)]">
      <CreateGroupChat />
      <GroupChatCard />
      <GroupChatCard />
      <GroupChatCard />
      <GroupChatCard />
      <CreateGroupChatModal />
    </main>
  );
}
